import * as vm from 'node:vm';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import * as cheerio from 'cheerio';
import { Types } from 'mongoose';
import { CrawlLogService } from '../crawl-log/crawl-log.service';
import { DocumentService } from '../document/document.service';
import { LOG_LEVELS, LogLevel, SNAPSHOT_STATUSES } from '../shared/crawl.enum';
import { SiteService } from '../site/site.service';
import { SnapshotService } from '../snapshot/snapshot.service';
import { CRAWLER_QUEUE_NAME } from './crawler.service';
import {
  CrawlJobData,
  CrawlQueueItem,
  DiscoveredLinks,
  ExtractedData,
  PageResult,
  PersistDocumentData,
} from './types/crawles';

@Processor(CRAWLER_QUEUE_NAME)
export class CrawlerProcessor extends WorkerHost {
  private readonly logger = new Logger(CrawlerProcessor.name);

  constructor(
    private readonly siteService: SiteService,
    private readonly snapshotService: SnapshotService,
    private readonly documentService: DocumentService,
    private readonly crawlLogService: CrawlLogService,
  ) {
    super();
  }

  async process(job: Job<CrawlJobData>): Promise<void> {
    const { siteId, snapshotId, userId } = job.data;
    const siteObjectId = new Types.ObjectId(siteId);
    const snapshotObjectId = new Types.ObjectId(snapshotId);
    const userObjectId = new Types.ObjectId(userId);

    const startedAt = new Date();

    // 1. Marcar snapshot como running a través del servicio de dominio
    const snapshot = await this.snapshotService.markRunning(snapshotObjectId, startedAt);

    if (!snapshot) {
      this.logger.error(`Snapshot ${snapshotId} no encontrado para procesar.`);
      return;
    }

    // 2. Actualizar resumen en el sitio a través del servicio de dominio
    await this.siteService.updateLastSnapshot(siteObjectId, {
      snapshotId: snapshotObjectId,
      status: SNAPSHOT_STATUSES[1],
      at: startedAt,
    });

    await this.log(
      siteObjectId,
      snapshotObjectId,
      LOG_LEVELS[0],
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
        if (!item) break;

        const normalizedUrl = this.normalizeUrl(item.url);
        if (visited.has(normalizedUrl)) continue;
        visited.add(normalizedUrl);

        await this.log(
          siteObjectId,
          snapshotObjectId,
          LOG_LEVELS[0],
          `Visitando URL [Profundidad ${item.depth}]`,
          normalizedUrl,
        );

        // 3. Fetch de la página
        const pageResult = await this.fetchPage(siteObjectId, snapshotObjectId, normalizedUrl);
        if (!pageResult) continue;

        const { html, statusCode, executionTimeMs } = pageResult;
        const $ = cheerio.load(html);

        // 4. Extracción de datos con el extractor del usuario
        const extractedData = await this.extractData(
          $,
          normalizedUrl,
          extractor,
          siteObjectId,
          snapshotObjectId,
        );

        // 5. Descubrimiento y filtrado de enlaces
        const { discoveredRawLinks, linksToQueue } = await this.discoverLinks(
          $,
          initialParsed,
          normalizedUrl,
          pageResolver,
          siteObjectId,
          snapshotObjectId,
        );

        // 6. Persistencia del documento indexado
        await this.persistDocument({
          userId: userObjectId,
          siteId: siteObjectId,
          snapshotId: snapshotObjectId,
          extractedData,
          $,
          normalizedUrl,
          statusCode,
          executionTimeMs,
          depth: item.depth,
          discoveredRawLinks,
        });
        savedDocumentsCount++;

        // 7. Encolar siguiente nivel si la profundidad lo permite
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

      await this.snapshotService.markCompleted(
        snapshotObjectId,
        savedDocumentsCount,
        finishedAt,
        durationMs,
      );

      await this.siteService.updateLastSnapshot(siteObjectId, {
        snapshotId: snapshotObjectId,
        status: SNAPSHOT_STATUSES[2],
        at: finishedAt,
      });

      await this.log(
        siteObjectId,
        snapshotObjectId,
        LOG_LEVELS[0],
        `Crawling finalizado exitosamente. ${savedDocumentsCount} documentos indexados.`,
        undefined,
        { savedDocumentsCount, durationMs },
      );
    } catch (globalErr: unknown) {
      const errMsg = globalErr instanceof Error ? globalErr.message : String(globalErr);
      const finishedAt = new Date();
      const durationMs = finishedAt.getTime() - startedAt.getTime();

      this.logger.error(`Error crítico en job de crawling: ${errMsg}`, globalErr);

      await this.snapshotService.markFailed(snapshotObjectId, errMsg, finishedAt, durationMs);

      await this.siteService.updateLastSnapshot(siteObjectId, {
        snapshotId: snapshotObjectId,
        status: SNAPSHOT_STATUSES[3],
        at: finishedAt,
      });

      await this.log(
        siteObjectId,
        snapshotObjectId,
        LOG_LEVELS[2],
        `Fallo crítico en el crawling: ${errMsg}`,
      );
    }
  }

  /**
   * Realiza el fetch HTTP de una URL.
   * Loguea warns ante errores de red.
   * Retorna null si la página no puede procesarse.
   */
  private async fetchPage(
    siteId: Types.ObjectId,
    snapshotId: Types.ObjectId,
    url: string,
  ): Promise<PageResult | null> {
    const startTime = Date.now();

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'SearchService-Crawler/1.0 (+http://localhost:3000/api)',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(10000),
      });
    } catch (fetchErr: unknown) {
      const errMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      await this.log(
        siteId,
        snapshotId,
        LOG_LEVELS[1],
        `Fallo al descargar página: ${errMsg}`,
        url,
      );
      return null;
    }

    const executionTimeMs = Date.now() - startTime;
    const statusCode = response.status;

    if (!response.ok) {
      await this.log(
        siteId,
        snapshotId,
        LOG_LEVELS[1],
        `Página respondió con código HTTP ${statusCode}`,
        url,
        { statusCode, executionTimeMs },
      );
      return null;
    }

    const html = await response.text();
    return { html, statusCode, executionTimeMs };
  }

  /**
   * Ejecuta el extractor del usuario en un sandbox aislado.
   * Si el sandbox lanza un error, loguea y retorna un fallback con el <title> de la página.
   */
  private async extractData(
    $: cheerio.CheerioAPI,
    url: string,
    extractor: string,
    siteId: Types.ObjectId,
    snapshotId: Types.ObjectId,
  ): Promise<ExtractedData> {
    try {
      return this.executeExtractorSandbox(extractor, $, url);
    } catch (sandboxErr: unknown) {
      const errMsg = sandboxErr instanceof Error ? sandboxErr.message : String(sandboxErr);
      await this.log(
        siteId,
        snapshotId,
        LOG_LEVELS[2],
        `Error en extractor de usuario: ${errMsg}`,
        url,
      );
      return {
        name: $('title').text().trim() || url,
        description: $('meta[name="description"]').attr('content')?.trim() || '',
      };
    }
  }

  /**
   * Recorre todos los enlaces <a[href]> de la página, filtra por mismo dominio
   * y aplica el pageResolver del usuario si está configurado.
   * Retorna tanto los links crudos descubiertos como los links a encolar.
   */
  private async discoverLinks(
    $: cheerio.CheerioAPI,
    initialParsed: URL,
    currentUrl: string,
    pageResolver: string | undefined,
    siteId: Types.ObjectId,
    snapshotId: Types.ObjectId,
  ): Promise<DiscoveredLinks> {
    const discoveredRawLinks: string[] = [];

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const resolved = new URL(href, currentUrl);
          if (
            resolved.protocol.startsWith('http') &&
            resolved.hostname === initialParsed.hostname
          ) {
            resolved.hash = '';
            discoveredRawLinks.push(resolved.href);
          }
        } catch {
          // URL inválida
        }
      }
    });

    let linksToQueue = discoveredRawLinks;

    if (pageResolver && pageResolver.trim().length > 0) {
      try {
        linksToQueue = this.executePageResolverSandbox(
          pageResolver,
          discoveredRawLinks,
          currentUrl,
        );
      } catch (resolverErr: unknown) {
        const errMsg = resolverErr instanceof Error ? resolverErr.message : String(resolverErr);
        await this.log(
          siteId,
          snapshotId,
          LOG_LEVELS[1],
          `Error en pageResolver: ${errMsg}`,
          currentUrl,
        );
      }
    }

    return { discoveredRawLinks, linksToQueue };
  }

  /**
   * Persiste el documento extraído a través del servicio de dominio de Documentos.
   */
  private async persistDocument(data: PersistDocumentData): Promise<void> {
    const {
      userId,
      siteId,
      snapshotId,
      extractedData,
      $,
      normalizedUrl,
      statusCode,
      executionTimeMs,
      depth,
      discoveredRawLinks,
    } = data;

    await this.documentService.createCrawledDocument({
      userId,
      siteId,
      snapshotId,
      name: extractedData.name || $('title').text().trim() || normalizedUrl,
      url: normalizedUrl,
      description: extractedData.description || '',
      extra: extractedData.extra || {},
      depth,
      discoveredLinks: discoveredRawLinks,
      crawl: {
        statusCode,
        executionTimeMs,
        fetchedAt: new Date(),
      },
    });
  }

  private executeExtractorSandbox(code: string, $: cheerio.CheerioAPI, url: string): ExtractedData {
    const sandbox: { $: cheerio.CheerioAPI; url: string; result: ExtractedData | null } = {
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

  private async log(
    siteId: Types.ObjectId,
    snapshotId: Types.ObjectId,
    level: LogLevel,
    message: string,
    url?: string,
    metadata?: Record<string, unknown>,
  ) {
    try {
      await this.crawlLogService.create({ siteId, snapshotId, level, message, url, metadata });
    } catch (err) {
      this.logger.error(`No se pudo guardar el crawl log: ${err}`);
    }
  }
}
