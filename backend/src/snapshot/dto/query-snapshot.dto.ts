import { QuerySnapshotSchema } from '@search-service/shared/schemas/snapshot.schema';
import { createZodDto } from 'nestjs-zod';

export class QuerySnapshotDto extends createZodDto(QuerySnapshotSchema) {}
