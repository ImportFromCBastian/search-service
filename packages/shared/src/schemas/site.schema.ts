import { z } from 'zod';
import { SITE_FREQUENCIES, SNAPSHOT_STATUSES } from '../enums/crawl.enum';

export const CreateSiteSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del sitio es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .describe('Nombre identificador del sitio web'),
  url: z
    .string()
    .url('Debe ser una URL válida con protocolo http o https')
    .describe('URL raíz desde donde iniciará el crawler'),
  depth: z.coerce
    .number()
    .int()
    .min(1, 'La profundidad mínima es 1 (solo la página inicial)')
    .max(10, 'La profundidad máxima permitida es 10')
    .default(1)
    .describe('Nivel de profundidad de enlaces a rastrear'),
  frequency: z
    .enum(SITE_FREQUENCIES)
    .describe('Periodicidad programada para volver a rastrear el sitio'),
  extractor: z
    .string()
    .min(1, 'El código del extractor es requerido')
    .describe(
      'Función JS para extraer campos usando Cheerio: ($) => ({ name, url, description, extra })',
    ),
  pageResolver: z
    .string()
    .optional()
    .describe('Función JS opcional para filtrar URLs a seguir: (links, currentUrl) => string[]'),
});
export type CreateSiteInput = z.infer<typeof CreateSiteSchema>;

export const UpdateSiteSchema = CreateSiteSchema.partial();
export type UpdateSiteInput = z.infer<typeof UpdateSiteSchema>;

export const LastSnapshotSummaryResponseSchema = z.object({
  snapshotId: z.string().describe('ID del último snapshot ejecutado'),
  status: z.enum(SNAPSHOT_STATUSES).describe('Estado de finalización del último snapshot'),
  at: z.string().describe('Fecha de ejecución del snapshot'),
});
export type LastSnapshotSummaryResponse = z.infer<typeof LastSnapshotSummaryResponseSchema>;

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
export type SiteResponse = z.infer<typeof SiteResponseSchema>;

export const SiteCreatedResponseSchema = SiteResponseSchema.extend({
  apiKey: z
    .string()
    .describe(
      'API Key secreta en texto plano generada para este sitio. Mostrada ÚNICAMENTE al crear o regenerar.',
    ),
});
export type SiteCreatedResponse = z.infer<typeof SiteCreatedResponseSchema>;

