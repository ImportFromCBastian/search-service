import { createZodDto } from 'nestjs-zod';
import { UpdateSiteSchema } from '@search-service/shared/schemas/site.schema';

export class UpdateSiteDto extends createZodDto(UpdateSiteSchema) {}

