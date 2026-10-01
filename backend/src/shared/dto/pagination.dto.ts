import { createZodDto } from 'nestjs-zod';
import { PaginationSchema } from '@search-service/shared/schemas/common.schema';

export class PaginationDto extends createZodDto(PaginationSchema) {}

