import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import type { Types } from 'mongoose';
import { CrawlJobData } from './types/crawles';

export const CRAWLER_QUEUE_NAME = 'crawler-queue';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    @InjectQueue(CRAWLER_QUEUE_NAME) private readonly crawlerQueue: Queue<CrawlJobData>,
  ) {}

  async enqueueCrawlJob(
    siteId: Types.ObjectId,
    snapshotId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    this.logger.log(`Encolando job de crawl para siteId=${siteId}, snapshotId=${snapshotId}`);

    const job = await this.crawlerQueue.add(
      'crawl',
      {
        siteId: siteId.toString(),
        snapshotId: snapshotId.toString(),
        userId: userId.toString(),
      },
      {
        jobId: snapshotId.toString(),
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return job;
  }
}
