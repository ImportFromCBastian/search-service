import { PaginationSchema } from '@search-service/shared/schemas/common.schema';
import { createZodDto } from 'nestjs-zod';

export class PaginationDto extends createZodDto(PaginationSchema) {}
