import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlLogController } from './crawl-log.controller';
import { CrawlLogService } from './crawl-log.service';
import { CrawlLog, CrawlLogSchema } from './entities/crawl-log.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: CrawlLog.name, schema: CrawlLogSchema }])],
  controllers: [CrawlLogController],
  providers: [CrawlLogService],
  exports: [CrawlLogService],
})
export class CrawlLogModule {}

