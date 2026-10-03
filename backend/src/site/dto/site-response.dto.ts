import {
  SiteCreatedResponseSchema,
  SiteResponseSchema,
} from '@search-service/shared/schemas/site.schema';
import { createZodDto } from 'nestjs-zod';

export class SiteResponseDto extends createZodDto(SiteResponseSchema) {}
export class SiteCreatedResponseDto extends createZodDto(SiteCreatedResponseSchema) {}
