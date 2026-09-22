import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { LOG_LEVELS, type LogLevel } from '../../shared/crawl.enum';

@Schema({ collection: 'crawl_logs', timestamps: { createdAt: true, updatedAt: false } })
export class CrawlLog {
  @Prop({ type: Types.ObjectId, ref: 'Site', required: true })
  siteId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Snapshot', required: true })
  snapshotId!: Types.ObjectId;

  @Prop({ type: String, enum: [...LOG_LEVELS], required: true })
  level!: LogLevel;

  @Prop({ type: String, required: true })
  message!: string;

  @Prop({ type: String })
  url?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, unknown>;

  createdAt!: Date;
}

export type CrawlLogDocument = HydratedDocument<CrawlLog>;
export const CrawlLogSchema = SchemaFactory.createForClass(CrawlLog);

// Consulta de logs de un snapshot ordenados cronológicamente
CrawlLogSchema.index({ snapshotId: 1, createdAt: 1 });
CrawlLogSchema.index({ siteId: 1, createdAt: -1 });

