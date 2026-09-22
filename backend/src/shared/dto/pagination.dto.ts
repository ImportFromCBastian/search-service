import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).describe('Número de página (inicia en 1)'),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe('Cantidad de elementos por página'),
});

export class PaginationDto extends createZodDto(PaginationSchema) {}
