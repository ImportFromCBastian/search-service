import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CrawlLogService } from '../crawl-log/crawl-log.service';
import { CrawlerService } from '../crawler/crawler.service';
import { DocumentService } from '../document/document.service';
import {
  ACTIVE_SNAPSHOT_STATUSES,
  SNAPSHOT_STATUSES,
  SNAPSHOT_TRIGGERS,
} from '../shared/crawl.enum';
import type { PaginationDto } from '../shared/dto/pagination.dto';
import { SiteService } from '../site/site.service';
import type { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { Snapshot, type SnapshotDocument } from './entities/snapshot.entity';

@Injectable()
export class SnapshotService {
  constructor(
    @InjectModel(Snapshot.name) private readonly snapshotModel: Model<SnapshotDocument>,
    @Inject(forwardRef(() => SiteService))
    private readonly siteService: SiteService,
    private readonly crawlerService: CrawlerService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    private readonly crawlLogService: CrawlLogService,
  ) {}

  async createInitialForSite(data: {
    siteId: Types.ObjectId;
    userId: Types.ObjectId;
    url: string;
    depth: number;
    frequency: string;
    extractor: string;
    pageResolver?: string;
  }): Promise<SnapshotDocument> {
    const snapshot = new this.snapshotModel({
      siteId: data.siteId,
      userId: data.userId,
      status: SNAPSHOT_STATUSES[0],
      trigger: SNAPSHOT_TRIGGERS[0],
      configUsed: {
        url: data.url,
        depth: data.depth,
        frequency: data.frequency,
        extractor: data.extractor,
        pageResolver: data.pageResolver,
      },
      documentCount: 0,
    });

    await snapshot.save();

    // Encolar el crawler job inicial
    await this.crawlerService.enqueueCrawlJob(data.siteId, snapshot._id, data.userId);

    return snapshot;
  }

  async create(userId: Types.ObjectId, createSnapshotDto: CreateSnapshotDto) {
    const { siteId } = createSnapshotDto;

    const siteObjectId = new Types.ObjectId(siteId);
    const site = await this.siteService.findOne(userId, siteObjectId);

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

    // 3. Actualizar resumen en el sitio a través del servicio de dominio
    await this.siteService.updateLastSnapshot(siteObjectId, {
      snapshotId: snapshot._id,
      status: ACTIVE_SNAPSHOT_STATUSES[0],
      at: new Date(),
    });

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
    await this.siteService.updateLastSnapshot(snapshot.siteId, {
      snapshotId: snapshot._id,
      status: SNAPSHOT_STATUSES[3],
      at: finishedAt,
    });

    return { success: true, message: `Snapshot ${id} cancelado correctamente` };
  }

  async markRunning(snapshotId: Types.ObjectId, startedAt: Date): Promise<SnapshotDocument | null> {
    return await this.snapshotModel.findOneAndUpdate(
      { _id: snapshotId },
      { $set: { status: SNAPSHOT_STATUSES[1], startedAt } },
      { new: true },
    );
  }

  async markCompleted(
    snapshotId: Types.ObjectId,
    documentCount: number,
    finishedAt: Date,
    durationMs: number,
  ): Promise<void> {
    await this.snapshotModel.updateOne(
      { _id: snapshotId },
      {
        $set: {
          status: SNAPSHOT_STATUSES[2],
          documentCount,
          finishedAt,
          durationMs,
        },
      },
    );
  }

  async markFailed(
    snapshotId: Types.ObjectId,
    error: string,
    finishedAt: Date,
    durationMs: number,
  ): Promise<void> {
    await this.snapshotModel.updateOne(
      { _id: snapshotId },
      {
        $set: {
          status: SNAPSHOT_STATUSES[3],
          error,
          finishedAt,
          durationMs,
        },
      },
    );
  }

  async deleteManyBySite(siteId: Types.ObjectId): Promise<void> {
    // Borrado jerárquico: primero documentos y logs hijos de este sitio, luego snapshots
    await Promise.all([
      this.documentService.deleteManyBySite(siteId),
      this.crawlLogService.deleteManyBySite(siteId),
    ]);
    await this.snapshotModel.deleteMany({ siteId }).exec();
  }

  async remove(userId: Types.ObjectId, id: Types.ObjectId) {
    const snapshot = await this.snapshotModel.findOne({ _id: id, userId }).exec();

    if (!snapshot) {
      throw new NotFoundException(`Snapshot con ID ${id} no encontrado`);
    }

    // Borrado jerárquico: documentos y logs del snapshot antes de borrar el snapshot
    await Promise.all([
      this.documentService.deleteManyBySnapshot(id),
      this.crawlLogService.deleteManyBySnapshot(id),
    ]);
    await this.snapshotModel.deleteOne({ _id: id }).exec();

    return { success: true, message: `Snapshot ${id} y sus datos eliminados` };
  }
}
