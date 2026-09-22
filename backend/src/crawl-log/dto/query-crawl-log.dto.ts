import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LOG_LEVELS } from '../../shared/crawl.enum';
import { PaginationSchema } from '../../shared/dto/pagination.dto';

export const QueryCrawlLogSchema = PaginationSchema.extend({
  snapshotId: z.string().optional().describe('Filtrar logs por ID de snapshot'),
  siteId: z.string().optional().describe('Filtrar logs por ID de sitio'),
  level: z.enum(LOG_LEVELS).optional().describe('Filtrar por severidad de log: info, warn, error'),
});

export class QueryCrawlLogDto extends createZodDto(QueryCrawlLogSchema) {}
