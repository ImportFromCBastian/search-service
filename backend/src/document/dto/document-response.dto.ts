import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CrawlInfoResponseSchema = z.object({
  statusCode: z.number().optional().describe('Código HTTP de respuesta obtenido'),
  executionTimeMs: z.number().optional().describe('Tiempo de respuesta de la petición en ms'),
  fetchedAt: z.string().describe('Fecha y hora en que se descargó la página'),
});

export const DocumentResponseSchema = z.object({
  _id: z.string().describe('ID único del documento indexado'),
  userId: z.string().describe('ID del usuario'),
  siteId: z.string().describe('ID del sitio origen'),
  snapshotId: z.string().describe('ID del snapshot que generó el documento'),
  name: z.string().describe('Título o nombre del documento extraído'),
  url: z.string().describe('URL original de la página rastreada'),
  description: z.string().describe('Descripción o contenido resumido'),
  extra: z.record(z.string(), z.unknown()).optional().describe('Metadatos libres extraídos por el usuario'),
  depth: z.number().describe('Nivel de profundidad en el que fue descubierto'),
  discoveredLinks: z.array(z.string()).describe('Enlaces salientes descubiertos en esta página'),
  crawl: CrawlInfoResponseSchema.describe('Detalles técnicos de la extracción'),
  createdAt: z.string().describe('Fecha de indexación'),
});

export class DocumentResponseDto extends createZodDto(DocumentResponseSchema) {}

