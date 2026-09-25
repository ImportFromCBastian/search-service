import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DeleteResponseSchema = z.object({
  success: z.boolean().describe('Indica si la operación fue exitosa'),
  message: z.string().describe('Mensaje descriptivo del resultado'),
});

export class DeleteResponseDto extends createZodDto(DeleteResponseSchema) {}
