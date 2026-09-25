import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CrawlLog, type CrawlLogDocument } from '../crawl-log/entities/crawl-log.entity';
import { CrawlDocument, type CrawledHydratedDocument } from '../document/entities/document.entity';
import { Snapshot, type SnapshotDocument } from '../snapshot/entities/snapshot.entity';

/**
 * Servicio que centraliza el borrado en cascada de datos relacionados.
 */
@Injectable()
export class CascadeDeleteService {
  constructor(
    @InjectModel(Snapshot.name) private readonly snapshotModel: Model<SnapshotDocument>,
    @InjectModel(CrawlDocument.name) private readonly documentModel: Model<CrawledHydratedDocument>,
    @InjectModel(CrawlLog.name) private readonly logModel: Model<CrawlLogDocument>,
  ) {}

  /**
   * Borra en cascada todos los datos asociados a un sitio:
   */
  async deleteBySite(siteId: Types.ObjectId): Promise<void> {
    await Promise.all([
      this.snapshotModel.deleteMany({ siteId }).exec(),
      this.documentModel.deleteMany({ siteId }).exec(),
      this.logModel.deleteMany({ siteId }).exec(),
    ]);
  }

  /**
   * Borra en cascada todos los datos asociados a un snapshot específico:
   */
  async deleteBySnapshot(snapshotId: Types.ObjectId): Promise<void> {
    await Promise.all([
      this.documentModel.deleteMany({ snapshotId }).exec(),
      this.logModel.deleteMany({ snapshotId }).exec(),
    ]);
  }
}
