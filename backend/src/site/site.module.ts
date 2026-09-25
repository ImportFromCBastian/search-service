import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlerModule } from '../crawler/crawler.module';
import { SharedModule } from '../shared/shared.module';
import { Snapshot, SnapshotSchema } from '../snapshot/entities/snapshot.entity';
import { SnapshotModule } from '../snapshot/snapshot.module';
import { Site, SiteSchema } from './entities/site.entity';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: Snapshot.name, schema: SnapshotSchema },
    ]),
    CrawlerModule,
    SharedModule,
    SnapshotModule,
  ],
  controllers: [SiteController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}
