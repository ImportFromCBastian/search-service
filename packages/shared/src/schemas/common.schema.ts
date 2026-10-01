import { z } from 'zod';

export const objectIdSchema = z.string().refine((val) => /^[a-f\d]{24}$/i.test(val), {
  message: 'Debe ser un ObjectId válido',
});

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
export type PaginationInput = z.infer<typeof PaginationSchema>;

export const DeleteResponseSchema = z.object({
  success: z.boolean().describe('Indica si la operación fue exitosa'),
  message: z.string().describe('Mensaje descriptivo del resultado'),
});
export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;

