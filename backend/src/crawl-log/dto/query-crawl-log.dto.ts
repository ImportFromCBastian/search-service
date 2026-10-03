import { QueryCrawlLogSchema } from '@search-service/shared/schemas/crawl-log.schema';
import { createZodDto } from 'nestjs-zod';

export class QueryCrawlLogDto extends createZodDto(QueryCrawlLogSchema) {}
