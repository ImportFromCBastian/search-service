import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { AppModule } from '../app.module';
import {  type CrawlLogDocument } from '../crawl-log/entities/crawl-log.entity';
import { type CrawledHydratedDocument, CrawlDocument } from '../document/entities/document.entity';
import { DEFAULT_USER_ID } from '../shared/decorators/current-user.decorator';
import { generateApiKey } from '../shared/utils/api-key.util';
import {  type SiteDocument } from '../site/entities/site.entity';
import {  type SnapshotDocument } from '../snapshot/entities/snapshot.entity';

async function run() {
  const shouldReset = process.argv.includes('--reset');
  const shouldSeed = process.argv.includes('--seed') || !shouldReset;

  if (shouldReset && process.env.NODE_ENV === 'production') {
    console.error('✖ No se permite --reset con NODE_ENV=production.');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });

  const siteModel = app.get<Model<SiteDocument>>(getModelToken('Site'));
  const snapshotModel = app.get<Model<SnapshotDocument>>(getModelToken('Snapshot'));
  const documentModel = app.get<Model<CrawledHydratedDocument>>(getModelToken(CrawlDocument.name));
  const crawlLogModel = app.get<Model<CrawlLogDocument>>(getModelToken('CrawlLog'));

  if (shouldReset) {
    await Promise.all([
      siteModel.deleteMany({}),
      snapshotModel.deleteMany({}),
      documentModel.deleteMany({}),
      crawlLogModel.deleteMany({}),
    ]);
    console.log('✓ Colecciones vaciadas (sites, snapshots, documents, crawl_logs).');
  }

  if (shouldSeed) {
    const { rawKey, hash, prefix } = generateApiKey();

    const site = await siteModel.create({
      userId: DEFAULT_USER_ID,
      name: 'Sitio de prueba',
      url: 'https://example.com',
      depth: 2,
      frequency: 'daily',
      extractor:
        "($, url) => ({ name: $('title').text(), url, description: $('meta[name=\"description\"]').attr('content') ?? '' })",
      apiKeyHash: hash,
      apiKeyPrefix: prefix,
    });

    const snapshot = await snapshotModel.create({
      userId: DEFAULT_USER_ID,
      siteId: site._id,
      status: 'completed',
      trigger: 'manual',
      isPublished: true,
      isArchived: false,
    });

    await siteModel.updateOne({ _id: site._id }, { $set: { publishedSnapshotId: snapshot._id } });

    await documentModel.create([
      {
        userId: DEFAULT_USER_ID,
        siteId: site._id,
        snapshotId: snapshot._id,
        name: 'Página de ejemplo',
        url: 'https://example.com/page1',
        description: 'Contenido de prueba para probar el buscador y sus filtros.',
        depth: 0,
        discoveredLinks: [],
        crawl: { statusCode: 200, executionTimeMs: 120, fetchedAt: new Date() },
      },
    ]);

    console.log(`✓ Seed creado. Sitio "${site.name}" — API key: ${rawKey}`);
  }

  await app.close();
}

run().catch((err) => {
  console.error('✖ Error al seedear/resetear:', err);
  process.exit(1);
});