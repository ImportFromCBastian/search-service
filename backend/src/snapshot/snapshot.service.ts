import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CrawlerService } from '../crawler/crawler.service';
import { CascadeDeleteService } from '../shared/cascade-delete.service';
import {
  ACTIVE_SNAPSHOT_STATUSES,
  SNAPSHOT_STATUSES,
  SNAPSHOT_TRIGGERS,
} from '../shared/crawl.enum';
import type { PaginationDto } from '../shared/dto/pagination.dto';
import { Site, type SiteDocument } from '../site/entities/site.entity';
import type { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { Snapshot, type SnapshotDocument } from './entities/snapshot.entity';

@Injectable()
export class SnapshotService {
  constructor(
    @InjectModel(Snapshot.name) private readonly snapshotModel: Model<SnapshotDocument>,
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
    private readonly crawlerService: CrawlerService,
    private readonly cascadeDeleteService: CascadeDeleteService,
  ) {}

  async create(userId: Types.ObjectId, createSnapshotDto: CreateSnapshotDto) {
    
    const siteObjectId = new Types.ObjectId(createSnapshotDto.siteId);
    const site = await this.siteModel.findOne({ _id: siteObjectId, userId }).exec();

    if (!site) {
      throw new NotFoundException(`Sitio con ID ${siteId} no encontrado`);
    }

    // 1. Validar que no haya un snapshot en curso o pendiente para este sitio
    const activeSnapshot = await this.snapshotModel
      .findOne({
        siteId: siteObjectId,
        status: { $in: ACTIVE_SNAPSHOT_STATUSES },
      })
      .exec();

    if (activeSnapshot) {
      throw new BadRequestException(
        `Ya existe un snapshot activo (${activeSnapshot.status}) para este sitio. Espera a que termine o cancélalo.`,
      );
    }

    // 2. Crear snapshot
    const snapshot = new this.snapshotModel({
      siteId: siteObjectId,
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

    try {
      await snapshot.save();
    } catch (err: unknown) {
      const isMongoDuplicate =
        err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000;
      if (isMongoDuplicate) {
        throw new BadRequestException(
          'Ya existe un snapshot activo para este sitio (garantía de base de datos).',
        );
      }
      throw err;
    }

    // 3. Actualizar resumen en el sitio
    site.lastSnapshot = {
      snapshotId: snapshot._id,
      status: ACTIVE_SNAPSHOT_STATUSES[0],
      at: new Date(),
    };
    await site.save();

    // 4. Encolar en BullMQ
    await this.crawlerService.enqueueCrawlJob(siteObjectId, snapshot._id, userId);

    return snapshot.toObject();
  }

  async findAllBySite(userId: Types.ObjectId, siteId: Types.ObjectId, pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    const filter = { siteId, userId };

    const [items, total] = await Promise.all([
      this.snapshotModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean()
        .exec(),
      this.snapshotModel.countDocuments(filter).exec(),
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
    const snapshot = await this.snapshotModel.findOne({ _id: id, userId }).lean().exec();

    if (!snapshot) {
      throw new NotFoundException(`Snapshot con ID ${id} no encontrado`);
    }

    return snapshot;
  }

  async cancel(userId: Types.ObjectId, id: Types.ObjectId) {
    const snapshot = await this.snapshotModel.findOne({ _id: id, userId }).exec();

    if (!snapshot) {
      throw new NotFoundException(`Snapshot con ID ${id} no encontrado`);
    }

    if (snapshot.status !== 'pending' && snapshot.status !== SNAPSHOT_STATUSES[1]) {
      throw new BadRequestException(
        `No se puede cancelar un snapshot con estado '${snapshot.status}'`,
      );
    }

    const finishedAt = new Date();
    snapshot.status = SNAPSHOT_STATUSES[3];
    snapshot.error = 'Cancelado manualmente por el usuario';
    snapshot.finishedAt = finishedAt;
    if (snapshot.startedAt) {
      snapshot.durationMs = finishedAt.getTime() - snapshot.startedAt.getTime();
    }
    await snapshot.save();

    // Actualizar site lastSnapshot
    await this.siteModel.updateOne(
      { _id: snapshot.siteId },
      {
        $set: {
          lastSnapshot: {
            snapshotId: snapshot._id,
            status: SNAPSHOT_STATUSES[3],
            at: finishedAt,
          },
        },
      },
    );

    return { success: true, message: `Snapshot ${id} cancelado correctamente` };
  }

  async remove(userId: Types.ObjectId, id: Types.ObjectId) {
    const snapshot = await this.snapshotModel.findOne({ _id: id, userId }).exec();

    if (!snapshot) {
      throw new NotFoundException(`Snapshot con ID ${id} no encontrado`);
    }

    // Borrado en cascada: documentos y logs del snapshot antes de borrar el snapshot
    await this.cascadeDeleteService.deleteBySnapshot(id);
    await this.snapshotModel.deleteOne({ _id: id }).exec();

    return { success: true, message: `Snapshot ${id} y sus datos eliminados` };
  }
}
