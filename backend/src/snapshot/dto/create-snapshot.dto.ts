import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateSnapshotSchema = z.object({
  siteId: z.string().min(1, 'El siteId es requerido').describe('ID del sitio a rastrear'),
});

export class CreateSnapshotDto extends createZodDto(CreateSnapshotSchema) {}
