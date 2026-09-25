import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SnapshotModule } from '../snapshot/snapshot.module';
import { Site, SiteSchema } from './entities/site.entity';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Site.name, schema: SiteSchema }]),
    forwardRef(() => SnapshotModule),
  ],
  controllers: [SiteController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}
