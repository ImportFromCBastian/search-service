import { createZodDto } from 'nestjs-zod';
import { DeleteResponseSchema } from '@search-service/shared/schemas/common.schema';

export class DeleteResponseDto extends createZodDto(DeleteResponseSchema) {}

