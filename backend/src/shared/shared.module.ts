import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlLog, CrawlLogSchema } from '../crawl-log/entities/crawl-log.entity';
import { CrawlDocument, CrawlDocumentSchema } from '../document/entities/document.entity';
import { Snapshot, SnapshotSchema } from '../snapshot/entities/snapshot.entity';
import { CascadeDeleteService } from './cascade-delete.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Snapshot.name, schema: SnapshotSchema },
      { name: CrawlDocument.name, schema: CrawlDocumentSchema },
      { name: CrawlLog.name, schema: CrawlLogSchema },
    ]),
  ],
  providers: [CascadeDeleteService],
  exports: [CascadeDeleteService],
})
export class SharedModule {}
