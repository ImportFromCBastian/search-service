import { createZodDto } from 'nestjs-zod';
import {
  SiteCreatedResponseSchema,
  SiteResponseSchema,
} from '@search-service/shared/schemas/site.schema';

export class SiteResponseDto extends createZodDto(SiteResponseSchema) {}
export class SiteCreatedResponseDto extends createZodDto(SiteCreatedResponseSchema) {}

