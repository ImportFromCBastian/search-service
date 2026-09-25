import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlLogModule } from '../crawl-log/crawl-log.module';
import { CrawlerModule } from '../crawler/crawler.module';
import { DocumentModule } from '../document/document.module';
import { SiteModule } from '../site/site.module';
import { Snapshot, SnapshotSchema } from './entities/snapshot.entity';
import { SnapshotController } from './snapshot.controller';
import { SnapshotService } from './snapshot.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Snapshot.name, schema: SnapshotSchema }]),
    forwardRef(() => SiteModule),
    forwardRef(() => CrawlerModule),
    forwardRef(() => DocumentModule),
    CrawlLogModule,
  ],
  controllers: [SnapshotController],
  providers: [SnapshotService],
  exports: [SnapshotService],
})
export class SnapshotModule {}
