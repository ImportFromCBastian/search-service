import { createZodDto } from 'nestjs-zod';
import { QueryCrawlLogSchema } from '@search-service/shared/schemas/crawl-log.schema';

export class QueryCrawlLogDto extends createZodDto(QueryCrawlLogSchema) {}

