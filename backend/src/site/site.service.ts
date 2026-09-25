import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CrawlerService } from '../crawler/crawler.service';
import { CascadeDeleteService } from '../shared/cascade-delete.service';
import { SNAPSHOT_STATUSES, SNAPSHOT_TRIGGERS } from '../shared/crawl.enum';
import type { PaginationDto } from '../shared/dto/pagination.dto';
import { generateApiKey } from '../shared/utils/api-key.util';
import { Snapshot, type SnapshotDocument } from '../snapshot/entities/snapshot.entity';
import { SnapshotService } from '../snapshot/snapshot.service';
import type { CreateSiteDto } from './dto/create-site.dto';
import type { UpdateSiteDto } from './dto/update-site.dto';
import { Site, type SiteDocument } from './entities/site.entity';

@Injectable()
export class SiteService {
  constructor(
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
    @InjectModel(Snapshot.name) private readonly snapshotModel: Model<SnapshotDocument>,
    private readonly snapshotService: SnapshotService,
    private readonly crawlerService: CrawlerService,
    private readonly cascadeDeleteService: CascadeDeleteService,
  ) {}

  async create(userId: Types.ObjectId, createSiteDto: CreateSiteDto) {
    const { rawKey, hash, prefix } = generateApiKey();

    const site = new this.siteModel({
      userId,
      ...createSiteDto,
      apiKeyHash: hash,
      apiKeyPrefix: prefix,
    });

    await site.save();

    // 1. Crear snapshot inicial automático para el nuevo sitio
    const initialSnapshot = new this.snapshotModel({
      siteId: site._id,
      userId,
      status: SNAPSHOT_STATUSES[0],
      trigger: SNAPSHOT_TRIGGERS[0],
      configUsed: {
        url: site.url,
        depth: site.depth,
        frequency: site.frequency,
        extractor: site.extractor,
        pageResolver: site.pageResolver,
      },
      documentCount: 0,
    });

    await initialSnapshot.save();

    // 2. Asociar el snapshot inicial como lastSnapshot en el sitio
    site.lastSnapshot = {
      snapshotId: initialSnapshot._id,
      status: SNAPSHOT_STATUSES[0],
      at: new Date(),
    };
    await site.save();

    // 3. Encolar el job en BullMQ
    await this.crawlerService.enqueueCrawlJob(site._id, initialSnapshot._id, userId);

    const siteObj = site.toObject();
    return {
      ...siteObj,
      _id: site._id.toString(),
      userId: site.userId.toString(),
      apiKey: rawKey,
    };
  }

  async findAllBySite(userId: Types.ObjectId, siteId: Types.ObjectId, pagination: PaginationDto) {
    try {
      await this.findOne(userId, siteId);
    } catch (_) {
      // Manejado por findOne
    }

    return await this.snapshotModel.(userId, siteId, pagination);
  }

  async findAll(userId: Types.ObjectId, pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    const filter = { userId };

    const [items, total] = await Promise.all([
      this.siteModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean()
        .exec(),
      this.siteModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async findOne(userId: Types.ObjectId, id: Types.ObjectId) {
    const site = await this.siteModel.findOne({ _id: id, userId }).lean().exec();

    if (!site) {
      throw new NotFoundException(`Sitio con id ${id} no encontrado`);
    }

    return site;
  }

  async update(userId: Types.ObjectId, id: Types.ObjectId, updateSiteDto: UpdateSiteDto) {
    const updated = await this.siteModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: updateSiteDto },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Sitio con id ${id} no encontrado`);
    }

    return updated;
  }

  async remove(userId: Types.ObjectId, id: Types.ObjectId) {
    const deleted = await this.siteModel.findOneAndDelete({ _id: id, userId }).exec();

    if (!deleted) {
      throw new NotFoundException(`Sitio con id ${id} no encontrado`);
    }

    // Borrado en cascada
    await this.cascadeDeleteService.deleteBySite(id);

    return { success: true, message: `Sitio ${id} y sus datos relacionados eliminados` };
  }

  async regenerateApiKey(userId: Types.ObjectId, id: Types.ObjectId) {
    const { rawKey, hash, prefix } = generateApiKey();

    const site = await this.siteModel
      .findOneAndUpdate(
        { _id: id, userId },
        { $set: { apiKeyHash: hash, apiKeyPrefix: prefix } },
        { new: true },
      )
      .exec();

    if (!site) {
      throw new NotFoundException(`Sitio con id ${id} no encontrado`);
    }

    return {
      apiKey: rawKey,
      apiKeyPrefix: prefix,
      message: 'Nueva API Key generada. Guárdala en un lugar seguro, no se volverá a mostrar.',
    };
  }
}
