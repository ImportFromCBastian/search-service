import { DeleteResponseSchema } from '@search-service/shared/schemas/common.schema';
import { createZodDto } from 'nestjs-zod';

export class DeleteResponseDto extends createZodDto(DeleteResponseSchema) {}
