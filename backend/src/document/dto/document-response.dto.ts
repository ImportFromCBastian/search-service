import { DocumentResponseSchema } from '@search-service/shared/schemas/document.schema';
import { createZodDto } from 'nestjs-zod';

export class DocumentResponseDto extends createZodDto(DocumentResponseSchema) {}
