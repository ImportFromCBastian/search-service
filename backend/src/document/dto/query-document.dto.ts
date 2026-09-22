import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationSchema } from '../../shared/dto/pagination.dto';

export const QueryDocumentSchema = PaginationSchema.extend({
  siteId: z.string().optional().describe('Filtrar documentos por ID del sitio'),
  snapshotId: z.string().optional().describe('Filtrar documentos por ID de snapshot específico'),
  q: z.string().optional().describe('Término de búsqueda de texto'),
});

export class QueryDocumentDto extends createZodDto(QueryDocumentSchema) {}

