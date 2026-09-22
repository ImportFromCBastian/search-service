import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { SITE_FREQUENCIES, SNAPSHOT_STATUSES } from '../../shared/crawl.enum';

export const LastSnapshotSummaryResponseSchema = z.object({
  snapshotId: z.string().describe('ID del último snapshot ejecutado'),
  status: z.enum(SNAPSHOT_STATUSES).describe('Estado de finalización del último snapshot'),
  at: z.string().describe('Fecha de ejecución del snapshot'),
});

export const SiteResponseSchema = z.object({
  _id: z.string().describe('ID único del sitio'),
  userId: z.string().describe('ID del usuario propietario'),
  name: z.string().describe('Nombre descriptivo'),
  url: z.string().describe('URL raíz'),
  depth: z.number().describe('Nivel de profundidad'),
  frequency: z.enum(SITE_FREQUENCIES).describe('Frecuencia de rastreo'),
  extractor: z.string().describe('Extractor de contenido'),
  pageResolver: z.string().optional().describe('Filtro de URLs opcional'),
  apiKeyPrefix: z.string().describe('Prefijo enmascarado de la API Key (ej. sk_live_1234****)'),
  lastSnapshot: LastSnapshotSummaryResponseSchema.optional().describe(
    'Resumen del último snapshot',
  ),
  createdAt: z.string().describe('Fecha de creación'),
  updatedAt: z.string().describe('Fecha de última modificación'),
});

export const SiteCreatedResponseSchema = SiteResponseSchema.extend({
  apiKey: z
    .string()
    .describe(
      'API Key secreta en texto plano generada para este sitio. Mostrada ÚNICAMENTE al crear o regenerar.',
    ),
});

export class SiteResponseDto extends createZodDto(SiteResponseSchema) {}
export class SiteCreatedResponseDto extends createZodDto(SiteCreatedResponseSchema) {}
