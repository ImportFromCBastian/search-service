import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlLog, CrawlLogSchema } from '../crawl-log/entities/crawl-log.entity';
import { CrawlDocument, CrawlDocumentSchema } from '../document/entities/document.entity';
import { Site, SiteSchema } from '../site/entities/site.entity';
import { Snapshot, SnapshotSchema } from '../snapshot/entities/snapshot.entity';
import { CrawlerProcessor } from './crawler.processor';
import { CRAWLER_QUEUE_NAME, CrawlerService } from './crawler.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CRAWLER_QUEUE_NAME,
    }),
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: Snapshot.name, schema: SnapshotSchema },
      { name: CrawlDocument.name, schema: CrawlDocumentSchema },
      { name: CrawlLog.name, schema: CrawlLogSchema },
    ]),
  ],
  providers: [CrawlerService, CrawlerProcessor],
  exports: [CrawlerService],
})
export class CrawlerModule {}
