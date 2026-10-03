import { CreateSnapshotSchema } from '@search-service/shared/schemas/snapshot.schema';
import { createZodDto } from 'nestjs-zod';

export class CreateSnapshotDto extends createZodDto(CreateSnapshotSchema) {}
