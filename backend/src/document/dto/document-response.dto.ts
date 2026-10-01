import { createZodDto } from 'nestjs-zod';
import { DocumentResponseSchema } from '@search-service/shared/schemas/document.schema';

export class DocumentResponseDto extends createZodDto(DocumentResponseSchema) {}

