import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LOG_LEVELS } from '../../shared/crawl.enum';
import { PaginationSchema } from '../../shared/dto/pagination.dto';
import { objectIdSchema } from '../../shared/utils/objectId-schema';

export const QueryCrawlLogSchema = PaginationSchema.extend({
  snapshotId: objectIdSchema.optional().describe('Filtrar logs por ID de snapshot'),
  siteId: objectIdSchema.optional().describe('Filtrar logs por ID de sitio'),
  level: z.enum(LOG_LEVELS).optional().describe('Filtrar por severidad de log: info, warn, error'),
});

export class QueryCrawlLogDto extends createZodDto(QueryCrawlLogSchema) {}
