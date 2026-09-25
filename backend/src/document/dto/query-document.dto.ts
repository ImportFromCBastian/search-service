import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationSchema } from '../../shared/dto/pagination.dto';
import { objectIdSchema } from '../../shared/utils/objectId-schema';

export const QueryDocumentSchema = PaginationSchema.extend({
  siteId: objectIdSchema.optional().describe('Filtrar documentos por ID del sitio'),
  snapshotId: objectIdSchema
    .optional()
    .describe('Filtrar documentos por ID de snapshot específico'),
  q: z.string().optional().describe('Término de búsqueda de texto'),
});

export class QueryDocumentDto extends createZodDto(QueryDocumentSchema) {}
