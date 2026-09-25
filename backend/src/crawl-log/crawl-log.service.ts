import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { LogLevel } from '../shared/crawl.enum';
import type { QueryCrawlLogDto } from './dto/query-crawl-log.dto';
import { CrawlLog, type CrawlLogDocument } from './entities/crawl-log.entity';

@Injectable()
export class CrawlLogService {
  constructor(@InjectModel(CrawlLog.name) private readonly logModel: Model<CrawlLogDocument>) {}

  async create(data: {
    siteId: Types.ObjectId;
    snapshotId: Types.ObjectId;
    level: LogLevel;
    message: string;
    url?: string;
    metadata?: Record<string, unknown>;
  }): Promise<CrawlLogDocument> {
    return await this.logModel.create(data);
  }

  async deleteManyBySite(siteId: Types.ObjectId): Promise<void> {
    await this.logModel.deleteMany({ siteId }).exec();
  }

  async deleteManyBySnapshot(snapshotId: Types.ObjectId): Promise<void> {
    await this.logModel.deleteMany({ snapshotId }).exec();
  }

  async findAll(query: QueryCrawlLogDto) {
    const filter: Record<string, unknown> = {};

    // El formato de snapshotId y siteId ya fue validado por QueryCrawlLogDto (objectIdSchema)
    if (query.snapshotId) {
      filter.snapshotId = new Types.ObjectId(query.snapshotId);
    }

    if (query.siteId) {
      filter.siteId = new Types.ObjectId(query.siteId);
    }

    if (query.level) {
      filter.level = query.level;
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.logModel.find(filter).sort({ createdAt: 1 }).skip(skip).limit(query.limit).lean().exec(),
      this.logModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
