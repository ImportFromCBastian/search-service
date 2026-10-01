import { createZodDto } from 'nestjs-zod';
import { CrawlLogResponseSchema } from '@search-service/shared/schemas/crawl-log.schema';

export class CrawlLogResponseDto extends createZodDto(CrawlLogResponseSchema) {}

