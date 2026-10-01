import { createZodDto } from 'nestjs-zod';
import { QueryDocumentSchema } from '@search-service/shared/schemas/document.schema';

export class QueryDocumentDto extends createZodDto(QueryDocumentSchema) {}

