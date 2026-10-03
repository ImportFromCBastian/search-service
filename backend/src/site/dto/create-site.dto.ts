import { CreateSiteSchema } from '@search-service/shared/schemas/site.schema';
import { createZodDto } from 'nestjs-zod';

export class CreateSiteDto extends createZodDto(CreateSiteSchema) {}
