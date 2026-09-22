import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import {
  SITE_FREQUENCIES,
  type SiteFrequency,
  SNAPSHOT_STATUSES,
  SNAPSHOT_TRIGGERS,
  type SnapshotStatus,
  type SnapshotTrigger,
} from '../../shared/crawl.enum';

/**
 * Copia estática de la configuración con la que se ejecutó el crawling.
 * Permite auditoría y reproducibilidad histórica.
 */
@Schema({ _id: false })
export class SnapshotConfigUsed {
  @Prop({ type: String, required: true })
  url!: string;

  @Prop({ type: Number, required: true })
  depth!: number;

  @Prop({ type: String, enum: [...SITE_FREQUENCIES], required: true })
  frequency!: SiteFrequency;

  @Prop({ type: String, required: true })
  extractor!: string;

  @Prop({ type: String })
  pageResolver?: string;
}
export const SnapshotConfigUsedSchema = SchemaFactory.createForClass(SnapshotConfigUsed);

@Schema({ collection: 'snapshots', timestamps: true })
export class Snapshot {
  @Prop({ type: Types.ObjectId, ref: 'Site', required: true })
  siteId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: [...SNAPSHOT_STATUSES], default: 'pending', required: true })
  status!: SnapshotStatus;

  @Prop({ type: String, enum: [...SNAPSHOT_TRIGGERS], default: 'manual', required: true })
  trigger!: SnapshotTrigger;

  @Prop({ type: SnapshotConfigUsedSchema, required: true })
  configUsed!: SnapshotConfigUsed;

  @Prop({ type: Number, default: 0 })
  documentCount!: number;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  finishedAt?: Date;

  @Prop({ type: Number })
  durationMs?: number;

  @Prop({ type: String })
  error?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export type SnapshotDocument = HydratedDocument<Snapshot>;
export const SnapshotSchema = SchemaFactory.createForClass(Snapshot);
