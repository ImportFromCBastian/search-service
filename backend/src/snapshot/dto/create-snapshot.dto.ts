import { createZodDto } from 'nestjs-zod';
import { CreateSnapshotSchema } from '@search-service/shared/schemas/snapshot.schema';

export class CreateSnapshotDto extends createZodDto(CreateSnapshotSchema) {}

