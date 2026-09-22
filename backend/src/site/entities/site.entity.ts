import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument, Types } from 'mongoose';
import {
  SITE_FREQUENCIES,
  type SiteFrequency,
  SNAPSHOT_STATUSES,
  type SnapshotStatus,
} from '../../shared/crawl.enum';

/**
 * Resumen del último snapshot, copiado dentro del sitio.
 * Sirve para pintar la tabla "Mis sitios" (fecha y estado) con UNA sola consulta,
 * en vez de consultar los snapshots de cada sitio de la página.
 * Lo actualiza el worker cada vez que un snapshot cambia de estado.
 */
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
  /** Dueño del sitio. TODA consulta debe filtrar por este campo. */
  @Prop({ type: Types.ObjectId, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  name!: string;

  @Prop({ type: String, required: true })
  url!: string;

  /** Niveles de enlaces a seguir desde la URL inicial (1 = solo la página inicial). */
  @Prop({ type: Number, required: true, min: 1 })
  depth!: number;

  @Prop({ type: String, enum: [...SITE_FREQUENCIES], required: true })
  frequency!: SiteFrequency;

  /** Código (o reglas) que define qué documentos se extraen de cada página. */
  @Prop({ type: String, required: true })
  extractor!: string;

  /** Código opcional que decide qué enlaces seguir. Si no existe, se usa el comportamiento por defecto. */
  @Prop({ type: String })
  pageResolver?: string;

  /** Undefined mientras el sitio no tenga ningún snapshot (la UI lo muestra como "Pendiente"). */
  @Prop({ type: LastSnapshotSummarySchema })
  lastSnapshot?: LastSnapshotSummary;

  createdAt!: Date;
  updatedAt!: Date;
}

export type SiteDocument = HydratedDocument<Site>;
export const SiteSchema = SchemaFactory.createForClass(Site);

// Listado "Mis sitios": los del usuario, más nuevos primero
SiteSchema.index({ userId: 1, createdAt: -1 });
