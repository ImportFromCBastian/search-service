import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { QueryCrawlLogDto } from './dto/query-crawl-log.dto';
import { CrawlLog, type CrawlLogDocument } from './entities/crawl-log.entity';

@Injectable()
export class CrawlLogService {
  constructor(@InjectModel(CrawlLog.name) private readonly logModel: Model<CrawlLogDocument>) {}

  async findAll(query: QueryCrawlLogDto) {
    const filter: Record<string, unknown> = {};

    if (query.snapshotId && Types.ObjectId.isValid(query.snapshotId)) {
      filter.snapshotId = new Types.ObjectId(query.snapshotId);
    }

    if (query.siteId && Types.ObjectId.isValid(query.siteId)) {
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
