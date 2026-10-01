import { createZodDto } from 'nestjs-zod';
import { SnapshotResponseSchema } from '@search-service/shared/schemas/snapshot.schema';

export class SnapshotResponseDto extends createZodDto(SnapshotResponseSchema) {}

