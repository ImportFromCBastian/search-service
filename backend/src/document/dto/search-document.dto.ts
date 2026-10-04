import { SearchDocumentSchema } from '@search-service/shared/schemas/document.schema';
import { createZodDto } from 'nestjs-zod';

export class SearchDocumentDto extends createZodDto(SearchDocumentSchema) {}
