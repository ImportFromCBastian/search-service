import { SnapshotResponseSchema } from '@search-service/shared/schemas/snapshot.schema';
import { createZodDto } from 'nestjs-zod';

export class SnapshotResponseDto extends createZodDto(SnapshotResponseSchema) {}
