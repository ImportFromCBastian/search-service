import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { CrawlLogModule } from '../crawl-log/crawl-log.module';
import { DocumentModule } from '../document/document.module';
import { SiteModule } from '../site/site.module';
import { SnapshotModule } from '../snapshot/snapshot.module';
import { CrawlerProcessor } from './crawler.processor';
import { CRAWLER_QUEUE_NAME, CrawlerService } from './crawler.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: CRAWLER_QUEUE_NAME,
    }),
    forwardRef(() => SiteModule),
    forwardRef(() => SnapshotModule),
    DocumentModule,
    CrawlLogModule,
  ],
  providers: [CrawlerService, CrawlerProcessor],
  exports: [CrawlerService],
})
export class CrawlerModule {}
