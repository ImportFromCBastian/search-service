import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { objectIdSchema } from '../../shared/utils/objectId-schema';

export const CreateSnapshotSchema = z.object({
  siteId: objectIdSchema.describe('ID del sitio a rastrear'),
});

export class CreateSnapshotDto extends createZodDto(CreateSnapshotSchema) {}
