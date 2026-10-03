import { BatchActionSchema } from '@search-service/shared/schemas/snapshot.schema';
import { createZodDto } from 'nestjs-zod';

export class BatchActionDto extends createZodDto(BatchActionSchema) {}
