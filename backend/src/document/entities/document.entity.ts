import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

/** Datos técnicos de la visita a la página. */
@Schema({ _id: false })
export class CrawlInfo {
  @Prop({ type: Number })
  statusCode?: number;

  @Prop({ type: Number })
  executionTimeMs?: number;

  @Prop({ type: Date, required: true })
  fetchedAt!: Date;
}
export const CrawlInfoSchema = SchemaFactory.createForClass(CrawlInfo);

@Schema({ collection: 'documents', timestamps: { createdAt: true, updatedAt: false } })
export class CrawlDocument {
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Site', required: true })
  siteId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Snapshot', required: true })
  snapshotId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true })
  url!: string;

  @Prop({ type: String, default: '' })
  description!: string;

  /** Campos libres que devuelva el extractor (precio, rating, imágenes...). */
  @Prop({ type: MongooseSchema.Types.Mixed })
  extra?: Record<string, unknown>;

  @Prop({ type: Number, default: 0 })
  depth!: number;

  @Prop({ type: [String], default: [] })
  discoveredLinks!: string[];

  @Prop({ type: CrawlInfoSchema, required: true })
  crawl!: CrawlInfo;

  createdAt!: Date;
}

export type CrawledHydratedDocument = HydratedDocument<CrawlDocument>;
export const CrawlDocumentSchema = SchemaFactory.createForClass(CrawlDocument);
