import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { normalizeQuery } from '../shared/utils/normalize-query';
import { SiteService } from '../site/site.service';
import type { QueryDocumentDto } from './dto/query-document.dto';
import { CrawlDocument, type CrawledHydratedDocument } from './entities/document.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(CrawlDocument.name) private readonly documentModel: Model<CrawledHydratedDocument>,
    @Inject(forwardRef(() => SiteService))
    private readonly siteService: SiteService,
  ) {}

  async createCrawledDocument(data: {
    userId: Types.ObjectId;
    siteId: Types.ObjectId;
    snapshotId: Types.ObjectId;
    name: string;
    url: string;
    description: string;
    extra: Record<string, unknown>;
    depth: number;
    discoveredLinks: string[];
    crawl: {
      statusCode: number;
      executionTimeMs: number;
      fetchedAt: Date;
    };
  }): Promise<CrawledHydratedDocument> {
    return await this.documentModel.create(data);
  }

  async deleteManyBySite(siteId: Types.ObjectId): Promise<void> {
    await this.documentModel.deleteMany({ siteId }).exec();
  }

  async deleteManyBySnapshot(snapshotId: Types.ObjectId): Promise<void> {
    await this.documentModel.deleteMany({ snapshotId }).exec();
  }

  async findAll(userId: Types.ObjectId, query: QueryDocumentDto) {
    const filter: Record<string, unknown> = { userId };

    // El formato de siteId y snapshotId ya fue validado por QueryDocumentDto (objectIdSchema)
    if (query.siteId) {
      filter.siteId = new Types.ObjectId(query.siteId);
    }

    if (query.snapshotId) {
      filter.snapshotId = new Types.ObjectId(query.snapshotId);
    }

    if (query.q && query.q.trim().length > 0) {
      const escaped = normalizeQuery(query.q);
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ name: regex }, { description: regex }, { url: regex }];
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.documentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean()
        .exec(),
      this.documentModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async findOne(userId: Types.ObjectId, id: Types.ObjectId) {
    const doc = await this.documentModel.findOne({ _id: id, userId }).lean().exec();

    if (!doc) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    return doc;
  }

  /**
   * Búsqueda de keyphrases a través de las snapshot activas.
   */
  async searchPublic(siteId: Types.ObjectId, query: QueryDocumentDto) {
    const site = await this.siteService.findById(siteId);

    // Por defecto consulta el último snapshot completado del sitio
    const filter: Record<string, unknown> = { siteId };

    // El formato de snapshotId ya fue validado por QueryDocumentDto (objectIdSchema)
    if (query.snapshotId) {
      filter.snapshotId = new Types.ObjectId(query.snapshotId);
    } else if (site.lastSnapshot?.snapshotId) {
      filter.snapshotId = site.lastSnapshot.snapshotId;
    }

    if (query.q && query.q.trim().length > 0) {
      const regex = new RegExp(normalizeQuery(query.q), 'i');
      filter.$or = [{ name: regex }, { description: regex }, { url: regex }];
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.documentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean()
        .exec(),
      this.documentModel.countDocuments(filter).exec(),
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
