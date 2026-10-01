import { z } from 'zod';
import { SITE_FREQUENCIES, SNAPSHOT_STATUSES, SNAPSHOT_TRIGGERS } from '../enums/crawl.enum';
import { objectIdSchema } from './common.schema';

export const CreateSnapshotSchema = z.object({
  siteId: objectIdSchema.describe('ID del sitio a rastrear'),
});
export type CreateSnapshotInput = z.infer<typeof CreateSnapshotSchema>;

export const SnapshotConfigUsedResponseSchema = z.object({
  url: z.string().describe('URL raíz utilizada en el rastreo'),
  depth: z.number().describe('Profundidad de rastreo'),
  frequency: z.enum(SITE_FREQUENCIES).describe('Frecuencia del sitio al momento de la ejecución'),
  extractor: z.string().describe('Código del extractor utilizado'),
  pageResolver: z.string().optional().describe('Código del resolutor de páginas utilizado'),
});
export type SnapshotConfigUsedResponse = z.infer<typeof SnapshotConfigUsedResponseSchema>;

export const SnapshotResponseSchema = z.object({
  _id: z.string().describe('ID único del snapshot'),
  siteId: z.string().describe('ID del sitio asociado'),
  userId: z.string().describe('ID del usuario propietario'),
  status: z.enum(SNAPSHOT_STATUSES).describe('Estado de la ejecución del snapshot'),
  trigger: z.enum(SNAPSHOT_TRIGGERS).describe('Modo de disparo: manual o programado'),
  configUsed: SnapshotConfigUsedResponseSchema.describe(
    'Copia estática de la configuración ejecutada',
  ),
  documentCount: z.number().describe('Cantidad de documentos extraídos'),
  startedAt: z.string().optional().describe('Fecha/hora de inicio de ejecución'),
  finishedAt: z.string().optional().describe('Fecha/hora de finalización'),
  durationMs: z.number().optional().describe('Duración total en milisegundos'),
  error: z.string().optional().describe('Mensaje de error si la ejecución falló'),
  createdAt: z.string().describe('Fecha de registro'),
  updatedAt: z.string().describe('Fecha de última actualización'),
});
export type SnapshotResponse = z.infer<typeof SnapshotResponseSchema>;

