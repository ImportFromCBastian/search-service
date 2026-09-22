import { createZodDto } from 'nestjs-zod';
import { CreateSiteSchema } from './create-site.dto';

export const UpdateSiteSchema = CreateSiteSchema.partial();

export class UpdateSiteDto extends createZodDto(UpdateSiteSchema) {}
