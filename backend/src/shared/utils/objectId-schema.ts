import z from 'zod';

/**
 * Refinador Zod reutilizable para campos que deben ser un ObjectId de MongoDB válido.
 * Usar en DTOs de body o query params donde el campo llega como string.
 *
 * @example
 *   siteId: objectIdSchema.describe('ID del sitio')
 *   siteId: objectIdSchema.optional().describe('Filtrar por sitio')
 */
export const objectIdSchema = z.string().refine((val) => /^[a-f\d]{24}$/i.test(val), {
  message: 'Debe ser un ObjectId válido (24 caracteres hexadecimales)',
});
