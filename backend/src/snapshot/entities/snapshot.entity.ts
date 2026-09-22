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
 * Copia de la configuración del sitio EN EL MOMENTO de la ejecución.
 * Si mañana el usuario edita el extractor, este snapshot sigue mostrando
 * con qué configuración se generó (es lo que muestra la pantalla "Ver documento").
 */
@Schema({ _id: false })
export class SnapshotConfig {
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
export const SnapshotConfigSchema = SchemaFactory.createForClass(SnapshotConfig);

@Schema({ collection: 'snapshots', timestamps: true })
export class Snapshot {
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Site', required: true })
  siteId!: Types.ObjectId;

  @Prop({ type: String, enum: [...SNAPSHOT_STATUSES], default: 'pending', required: true })
  status!: SnapshotStatus;

  @Prop({ type: String, enum: [...SNAPSHOT_TRIGGERS], required: true })
  trigger!: SnapshotTrigger;

  /** Se completan cuando el worker empieza / termina. */
  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  finishedAt?: Date;

  @Prop({ type: Number, default: 0 })
  pagesVisited!: number;

  @Prop({ type: Number, default: 0 })
  documentsExtracted!: number;

  /** Mensaje de error si status = 'failed'. */
  @Prop({ type: String })
  errorMessage?: string;

  @Prop({ type: SnapshotConfigSchema, required: true })
  configUsed!: SnapshotConfig;

  /** "Activo para buscador". Solo UNO por sitio (lo garantiza el índice de abajo). */
  @Prop({ type: Boolean, default: false })
  isActive!: boolean;

  @Prop({ type: Boolean, default: false })
  isArchived!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export type SnapshotDocument = HydratedDocument<Snapshot>;
export const SnapshotSchema = SchemaFactory.createForClass(Snapshot);

// Historial de un sitio: más nuevos primero (con filtro por fecha y paginación)
SnapshotSchema.index({ siteId: 1, createdAt: -1 });

// Regla "un solo snapshot activo por sitio", aplicada por la propia base de datos.
// Es un índice único PARCIAL: solo cuenta los documentos con isActive = true,
// así que puede haber muchos inactivos, pero no dos activos del mismo sitio.
SnapshotSchema.index(
  { siteId: 1 },
  { unique: true, partialFilterExpression: { isActive: true }, name: 'one_active_per_site' },
);
