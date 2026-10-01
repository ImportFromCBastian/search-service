import { z } from 'zod';
import { LOG_LEVELS } from '../enums/crawl.enum';
import { PaginationSchema, objectIdSchema } from './common.schema';

export const CrawlLogResponseSchema = z.object({
  _id: z.string().describe('ID único del registro de log'),
  siteId: z.string().describe('ID del sitio'),
  snapshotId: z.string().describe('ID del snapshot'),
  level: z.enum(LOG_LEVELS).describe('Nivel de severidad'),
  message: z.string().describe('Mensaje descriptivo del evento'),
  url: z.string().optional().describe('URL sobre la que ocurrió el evento'),
  metadata: z.record(z.string(), z.unknown()).optional().describe('Detalles técnicos adicionales'),
  createdAt: z.string().describe('Fecha y hora del registro'),
});
export type CrawlLogResponse = z.infer<typeof CrawlLogResponseSchema>;

export const QueryCrawlLogSchema = PaginationSchema.extend({
  snapshotId: objectIdSchema.optional().describe('Filtrar logs por ID de snapshot'),
  siteId: objectIdSchema.optional().describe('Filtrar logs por ID de sitio'),
  level: z.enum(LOG_LEVELS).optional().describe('Filtrar por severidad de log: info, warn, error'),
});
export type QueryCrawlLogInput = z.infer<typeof QueryCrawlLogSchema>;

