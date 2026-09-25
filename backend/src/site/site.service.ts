import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { PaginationDto } from '../shared/dto/pagination.dto';
import { generateApiKey } from '../shared/utils/api-key.util';
import { SnapshotService } from '../snapshot/snapshot.service';
import type { CreateSiteDto } from './dto/create-site.dto';
import type { UpdateSiteDto } from './dto/update-site.dto';
import { Site, type SiteDocument } from './entities/site.entity';

@Injectable()
export class SiteService {
  constructor(
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
    @Inject(forwardRef(() => SnapshotService))
    private readonly snapshotService: SnapshotService,
  ) {}

  async create(userId: Types.ObjectId, createSiteDto: CreateSiteDto) {
    const { rawKey, hash, prefix } = generateApiKey();
    const siteId = new Types.ObjectId();

    // 1. Crear snapshot inicial a través del servicio de dominio de Snapshot
    const initialSnapshot = await this.snapshotService.createInitialForSite({
      siteId,
      userId,
      url: createSiteDto.url,
      depth: createSiteDto.depth,
      frequency: createSiteDto.frequency,
      extractor: createSiteDto.extractor,
      pageResolver: createSiteDto.pageResolver,
    });

    // 2. Persistir el sitio con su lastSnapshot ya asignado en un solo roundtrip (sin escrituras redundantes)
    const site = new this.siteModel({
      _id: siteId,
      userId,
      ...createSiteDto,
      apiKeyHash: hash,
      apiKeyPrefix: prefix,
      lastSnapshot: {
        snapshotId: initialSnapshot._id,
        status: initialSnapshot.status,
        at: initialSnapshot.createdAt || new Date(),
      },
    });

    await site.save();

    const siteObj = site.toObject();
    return {
      ...siteObj,
      _id: site._id.toString(),
      userId: site.userId.toString(),
      apiKey: rawKey,
    };
  }

  async findAllBySite(userId: Types.ObjectId, siteId: Types.ObjectId, pagination: PaginationDto) {
    // Validar existencia y propiedad del sitio
    await this.findOne(userId, siteId);

    return await this.snapshotService.findAllBySite(userId, siteId, pagination);
  }

  async findById(id: Types.ObjectId): Promise<SiteDocument> {
    const site = await this.siteModel.findById(id).lean().exec();
    if (!site) {
      throw new NotFoundException(`Sitio con id ${id} no encontrado`);
    }
    return site as SiteDocument;
  }

  async findByApiKeyHash(apiKeyHash: string): Promise<SiteDocument | null> {
    return await this.siteModel.findOne({ apiKeyHash }).exec();
  }

  async updateLastSnapshot(
    siteId: Types.ObjectId,
    lastSnapshot: {
      snapshotId: Types.ObjectId;
      status: string;
      at: Date;
    },
  ): Promise<void> {
    await this.siteModel.updateOne({ _id: siteId }, { $set: { lastSnapshot } }).exec();
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

    // Cascada jerárquica de dominio: el servicio de Snapshots limpia snapshots, documentos y logs asociados
    await this.snapshotService.deleteManyBySite(id);

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
