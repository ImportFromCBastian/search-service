import { CrawlLogResponseSchema } from '@search-service/shared/schemas/crawl-log.schema';
import { createZodDto } from 'nestjs-zod';

export class CrawlLogResponseDto extends createZodDto(CrawlLogResponseSchema) {}
