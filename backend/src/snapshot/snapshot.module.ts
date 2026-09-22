import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlerModule } from '../crawler/crawler.module';
import { Site, SiteSchema } from '../site/entities/site.entity';
import { Snapshot, SnapshotSchema } from './entities/snapshot.entity';
import { SnapshotController } from './snapshot.controller';
import { SnapshotService } from './snapshot.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Snapshot.name, schema: SnapshotSchema },
      { name: Site.name, schema: SiteSchema },
    ]),
    CrawlerModule,
  ],
  controllers: [SnapshotController],
  providers: [SnapshotService],
  exports: [SnapshotService],
})
export class SnapshotModule {}
