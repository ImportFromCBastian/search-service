import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { SITE_FREQUENCIES } from '../../shared/crawl.enum';

export const CreateSiteSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del sitio es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .describe('Nombre identificador del sitio web'),
  url: z
    .string()
    .url('Debe ser una URL válida con protocolo http o https')
    .describe('URL raíz desde donde iniciará el crawler'),
  depth: z.coerce
    .number()
    .int()
    .min(1, 'La profundidad mínima es 1 (solo la página inicial)')
    .max(10, 'La profundidad máxima permitida es 10')
    .default(1)
    .describe('Nivel de profundidad de enlaces a rastrear'),
  frequency: z
    .enum(SITE_FREQUENCIES)
    .describe('Periodicidad programada para volver a rastrear el sitio'),
  extractor: z
    .string()
    .min(1, 'El código del extractor es requerido')
    .describe(
      'Función JS para extraer campos usando Cheerio: ($) => ({ name, url, description, extra })',
    ),
  pageResolver: z
    .string()
    .optional()
    .describe('Función JS opcional para filtrar URLs a seguir: (links, currentUrl) => string[]'),
});

export class CreateSiteDto extends createZodDto(CreateSiteSchema) {}
