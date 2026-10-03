import { QueryDocumentSchema } from '@search-service/shared/schemas/document.schema';
import { createZodDto } from 'nestjs-zod';

export class QueryDocumentDto extends createZodDto(QueryDocumentSchema) {}
