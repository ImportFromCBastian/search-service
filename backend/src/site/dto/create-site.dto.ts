import { createZodDto } from 'nestjs-zod';
import { CreateSiteSchema } from '@search-service/shared/schemas/site.schema';

export class CreateSiteDto extends createZodDto(CreateSiteSchema) {}

