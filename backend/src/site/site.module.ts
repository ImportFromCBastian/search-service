import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlLog, CrawlLogSchema } from '../crawl-log/entities/crawl-log.entity';
import { CrawlerModule } from '../crawler/crawler.module';
import { CrawlDocument, CrawlDocumentSchema } from '../document/entities/document.entity';
import { Snapshot, SnapshotSchema } from '../snapshot/entities/snapshot.entity';
import { Site, SiteSchema } from './entities/site.entity';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: Snapshot.name, schema: SnapshotSchema },
      { name: CrawlDocument.name, schema: CrawlDocumentSchema },
      { name: CrawlLog.name, schema: CrawlLogSchema },
    ]),
    CrawlerModule,
  ],
  controllers: [SiteController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}
