import * as vm from 'node:vm';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Job } from 'bullmq';
import * as cheerio from 'cheerio';
import { Model, Types } from 'mongoose';
import { CrawlLog, type CrawlLogDocument } from '../crawl-log/entities/crawl-log.entity';
import { CrawlDocument, type CrawlDocumentDocument } from '../document/entities/document.entity';
import { Site, type SiteDocument } from '../site/entities/site.entity';
import { Snapshot, type SnapshotDocument } from '../snapshot/entities/snapshot.entity';
import { CRAWLER_QUEUE_NAME, type CrawlJobData } from './crawler.service';

interface CrawlQueueItem {
  url: string;
  depth: number;
}

interface ExtractedData {
  name?: string;
  description?: string;
  extra?: Record<string, unknown>;
}

@Processor(CRAWLER_QUEUE_NAME)
export class CrawlerProcessor extends WorkerHost {
  private readonly logger = new Logger(CrawlerProcessor.name);

  constructor(
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
    @InjectModel(Snapshot.name) private readonly snapshotModel: Model<SnapshotDocument>,
    @InjectModel(CrawlDocument.name) private readonly documentModel: Model<CrawlDocumentDocument>,
    @InjectModel(CrawlLog.name) private readonly logModel: Model<CrawlLogDocument>,
  ) {
    super();
  }

  async process(job: Job<CrawlJobData>): Promise<void> {
    const { siteId, snapshotId, userId } = job.data;
    const siteObjectId = new Types.ObjectId(siteId);
    const snapshotObjectId = new Types.ObjectId(snapshotId);
    const userObjectId = new Types.ObjectId(userId);

    const startedAt = new Date();

    // 1. Marcar snapshot como running
    const snapshot = await this.snapshotModel.findOneAndUpdate(
      { _id: snapshotObjectId },
      { $set: { status: 'running', startedAt } },
      { new: true },
    );

    if (!snapshot) {
      this.logger.error(`Snapshot ${snapshotId} no encontrado para procesar.`);
      return;
    }

    // 2. Actualizar resumen en el sitio
    await this.siteModel.updateOne(
      { _id: siteObjectId },
      {
        $set: {
          lastSnapshot: {
            snapshotId: snapshotObjectId,
            status: 'running',
            at: startedAt,
          },
        },
      },
    );

    await this.log(
      siteObjectId,
      snapshotObjectId,
      'info',
      'Inicio de crawling job',
      snapshot.configUsed.url,
    );

    try {
      const { url: initialUrl, depth: maxDepth, extractor, pageResolver } = snapshot.configUsed;
      const initialParsed = new URL(initialUrl);

      const visited = new Set<string>();
      const queue: CrawlQueueItem[] = [{ url: initialUrl, depth: 1 }];
      let savedDocumentsCount = 0;

      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) {
          break;
        }

        const normalizedUrl = this.normalizeUrl(item.url);

        if (visited.has(normalizedUrl)) {
          continue;
        }
        visited.add(normalizedUrl);

        await this.log(
          siteObjectId,
          snapshotObjectId,
          'info',
          `Visitando URL [Profundidad ${item.depth}]`,
          normalizedUrl,
        );

        const startTime = Date.now();
        let response: Response;
        try {
          response = await fetch(normalizedUrl, {
            headers: {
              'User-Agent': 'SearchService-Crawler/1.0 (+http://localhost:3000/api)',
              Accept: 'text/html,application/xhtml+xml',
            },
            signal: AbortSignal.timeout(10000),
          });
        } catch (fetchErr: unknown) {
          const errMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
          await this.log(
            siteObjectId,
            snapshotObjectId,
            'warn',
            `Fallo al descargar página: ${errMsg}`,
            normalizedUrl,
          );
          continue;
        }

        const executionTimeMs = Date.now() - startTime;
        const statusCode = response.status;

        if (!response.ok) {
          await this.log(
            siteObjectId,
            snapshotObjectId,
            'warn',
            `Página respondió con código HTTP ${statusCode}`,
            normalizedUrl,
            { statusCode, executionTimeMs },
          );
          continue;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 3. Ejecutar Extractor de usuario en sandbox aislado
        let extractedData: ExtractedData = {};

        try {
          extractedData = this.executeExtractorSandbox(extractor, $, normalizedUrl);
        } catch (sandboxErr: unknown) {
          const errMsg = sandboxErr instanceof Error ? sandboxErr.message : String(sandboxErr);
          await this.log(
            siteObjectId,
            snapshotObjectId,
            'error',
            `Error en extractor de usuario: ${errMsg}`,
            normalizedUrl,
          );
          extractedData = {
            name: $('title').text().trim() || normalizedUrl,
            description: $('meta[name="description"]').attr('content')?.trim() || '',
          };
        }

        // 4. Descubrir enlaces
        const discoveredRawLinks: string[] = [];
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (href) {
            try {
              const resolved = new URL(href, normalizedUrl);
              // Mantenerse en el mismo dominio
              if (
                resolved.protocol.startsWith('http') &&
                resolved.hostname === initialParsed.hostname
              ) {
                resolved.hash = ''; // Descartar anclas
                discoveredRawLinks.push(resolved.href);
              }
            } catch {
              // URL inválida, ignorar
            }
          }
        });

        // 5. Filtrar con pageResolver si existe
        let linksToQueue = discoveredRawLinks;
        if (pageResolver && pageResolver.trim().length > 0) {
          try {
            linksToQueue = this.executePageResolverSandbox(
              pageResolver,
              discoveredRawLinks,
              normalizedUrl,
            );
          } catch (resolverErr: unknown) {
            const errMsg = resolverErr instanceof Error ? resolverErr.message : String(resolverErr);
            await this.log(
              siteObjectId,
              snapshotObjectId,
              'warn',
              `Error en pageResolver: ${errMsg}`,
              normalizedUrl,
            );
          }
        }

        // 6. Guardar documento extraído
        await this.documentModel.create({
          userId: userObjectId,
          siteId: siteObjectId,
          snapshotId: snapshotObjectId,
          name: extractedData.name || $('title').text().trim() || normalizedUrl,
          url: normalizedUrl,
          description: extractedData.description || '',
          extra: extractedData.extra || {},
          depth: item.depth,
          discoveredLinks: discoveredRawLinks,
          crawl: {
            statusCode,
            executionTimeMs,
            fetchedAt: new Date(),
          },
        });

        savedDocumentsCount++;

        // 7. Encolar siguientes enlaces si la profundidad lo permite
        if (item.depth < maxDepth) {
          for (const nextUrl of linksToQueue) {
            if (!visited.has(this.normalizeUrl(nextUrl))) {
              queue.push({ url: nextUrl, depth: item.depth + 1 });
            }
          }
        }
      }

      // 8. Finalizar exitosamente el snapshot
      const finishedAt = new Date();
      const durationMs = finishedAt.getTime() - startedAt.getTime();

      await this.snapshotModel.updateOne(
        { _id: snapshotObjectId },
        {
          $set: {
            status: 'completed',
            documentCount: savedDocumentsCount,
            finishedAt,
            durationMs,
          },
        },
      );

      await this.siteModel.updateOne(
        { _id: siteObjectId },
        {
          $set: {
            lastSnapshot: {
              snapshotId: snapshotObjectId,
              status: 'completed',
              at: finishedAt,
            },
          },
        },
      );

      await this.log(
        siteObjectId,
        snapshotObjectId,
        'info',
        `Crawling finalizado exitosamente. ${savedDocumentsCount} documentos indexados.`,
        undefined,
        { savedDocumentsCount, durationMs },
      );
    } catch (globalErr: unknown) {
      const errMsg = globalErr instanceof Error ? globalErr.message : String(globalErr);
      const finishedAt = new Date();
      const durationMs = finishedAt.getTime() - startedAt.getTime();

      this.logger.error(`Error crítico en job de crawling: ${errMsg}`, globalErr);

      await this.snapshotModel.updateOne(
        { _id: snapshotObjectId },
        {
          $set: {
            status: 'failed',
            error: errMsg,
            finishedAt,
            durationMs,
          },
        },
      );

      await this.siteModel.updateOne(
        { _id: siteObjectId },
        {
          $set: {
            lastSnapshot: {
              snapshotId: snapshotObjectId,
              status: 'failed',
              at: finishedAt,
            },
          },
        },
      );

      await this.log(
        siteObjectId,
        snapshotObjectId,
        'error',
        `Fallo crítico en el crawling: ${errMsg}`,
      );
    }
  }

  private normalizeUrl(rawUrl: string): string {
    try {
      const u = new URL(rawUrl);
      u.hash = '';
      if (u.pathname.endsWith('/') && u.pathname.length > 1) {
        u.pathname = u.pathname.slice(0, -1);
      }
      return u.href;
    } catch {
      return rawUrl;
    }
  }

  private executeExtractorSandbox(code: string, $: cheerio.CheerioAPI, url: string): ExtractedData {
    const sandbox: { $; url: string; result: ExtractedData | null } = {
      $,
      url,
      result: null,
    };
    const context = vm.createContext(sandbox);

    const script = `
      try {
        let fn = ${code};
        if (typeof fn === 'function') {
          result = fn($, url);
        } else {
          result = fn;
        }
      } catch (err) {
        throw err;
      }
    `;

    vm.runInContext(script, context, { timeout: 2000 });
    return sandbox.result || {};
  }

  private executePageResolverSandbox(code: string, links: string[], currentUrl: string): string[] {
    const sandbox: { links: string[]; currentUrl: string; result: string[] | null } = {
      links,
      currentUrl,
      result: null,
    };
    const context = vm.createContext(sandbox);

    const script = `
      try {
        let fn = ${code};
        if (typeof fn === 'function') {
          result = fn(links, currentUrl);
        } else {
          result = links;
        }
      } catch (err) {
        throw err;
      }
    `;

    vm.runInContext(script, context, { timeout: 2000 });
    return Array.isArray(sandbox.result) ? sandbox.result : links;
  }

  private async log(
    siteId: Types.ObjectId,
    snapshotId: Types.ObjectId,
    level: 'info' | 'warn' | 'error',
    message: string,
    url?: string,
    metadata?: Record<string, unknown>,
  ) {
    try {
      await this.logModel.create({
        siteId,
        snapshotId,
        level,
        message,
        url,
        metadata,
      });
    } catch (err) {
      this.logger.error(`No se pudo guardar el crawl log: ${err}`);
    }
  }
}
