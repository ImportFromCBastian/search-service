import { UpdateSiteSchema } from '@search-service/shared/schemas/site.schema';
import { createZodDto } from 'nestjs-zod';

export class UpdateSiteDto extends createZodDto(UpdateSiteSchema) {}
