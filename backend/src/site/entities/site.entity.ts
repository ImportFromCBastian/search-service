import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import {
  SITE_FREQUENCIES,
  type SiteFrequency,
  SNAPSHOT_STATUSES,
  type SnapshotStatus,
} from '../../shared/crawl.enum';

@Schema({ _id: false })
export class LastSnapshotSummary {
  @Prop({ type: Types.ObjectId, ref: 'Snapshot', required: true })
  snapshotId!: Types.ObjectId;

  @Prop({ type: String, enum: [...SNAPSHOT_STATUSES], required: true })
  status!: SnapshotStatus;

  @Prop({ type: Date, required: true })
  at!: Date;
}
export const LastSnapshotSummarySchema = SchemaFactory.createForClass(LastSnapshotSummary);

@Schema({ collection: 'sites', timestamps: true })
export class Site {
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: String, required: true })
  url!: string;

  @Prop({ type: Number, required: true, min: 1 })
  depth!: number;

  @Prop({ type: String, enum: [...SITE_FREQUENCIES], required: true })
  frequency!: SiteFrequency;

  @Prop({ type: String, required: true })
  extractor!: string;

  @Prop({ type: String })
  pageResolver?: string;

  @Prop({ type: String, required: true })
  apiKeyHash?: string;

  @Prop({ type: String, required: true })
  apiKeyPrefix?: string;

  /** Undefined mientras el sitio no tenga ningún snapshot. */
  @Prop({ type: LastSnapshotSummarySchema })
  lastSnapshot?: LastSnapshotSummary;

  createdAt!: Date;
  updatedAt!: Date;
}

export type SiteDocument = HydratedDocument<Site>;
export const SiteSchema = SchemaFactory.createForClass(Site);

// Indexacion de indices para optimizar consultas frecuentes
SiteSchema.index({ userId: 1, createdAt: -1 });
