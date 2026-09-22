# AGENTS.md - Search Service Backend

Instrucciones y estándares operativos para agentes de inteligencia artificial y desarrolladores que interactúen o modifiquen el código del backend de **Search Service**.

---

## 1. Contexto del Proyecto

El backend de **Search Service** es una API REST y un sistema de procesamiento en segundo plano construido con **NestJS 11**. Su propósito es permitir a usuarios registrar sitios web, definir extractores web con Cheerio y JavaScript, y ejecutar rastreos periódicos o manuales (**Snapshots**) que indexan documentos (**CrawlDocuments**) para su búsqueda en panel y vía API pública.

---

## 2. Stack Tecnológico y Dependencias Clave

| Tecnología | Versión / Detalle | Propósito |
| :--- | :--- | :--- |
| **Framework** | NestJS 11 (`@nestjs/common`, `@nestjs/core` ^11.0.1) | Arquitectura modular de la API |
| **Base de Datos** | MongoDB 7.0 + Mongoose (`mongoose` ^9.10.1, `@nestjs/mongoose` ^12.0.0) | Almacenamiento no relacional y multi-tenant |
| **Colas de Tareas** | Redis 7 + BullMQ (`bullmq` ^6.3.8, `@nestjs/bullmq` ^12.0.0) | Cola de trabajos desacoplada para el crawler |
| **Validación y DTOs** | Zod (`zod` ^4.6.5, `nestjs-zod` ^5.5.0) | Contratos fuertemente tipados y validación |
| **Documentación API** | `@nestjs/swagger` ^11.4.7 con `cleanupOpenApiDoc` | Especificación OpenAPI sincronizada con Zod |
| **Scraping** | `cheerio` ^1.2.0 | Parsing y manipulación de HTML |
| **Aislamiento Seguro** | Nativo `node:vm` | Sandboxing de código JS de usuarios |
| **Linter / Formatter** | Biome 2.5.14 | Reglas centralizadas desde la raíz |

---

## 3. Estructura de Carpetas y Convenciones de Código

### Organización por Módulo (Regla Obligatoria)

Cada módulo funcional reside en `src/{módulo}/` y debe contener:

- `entities/`: Clases anotadas con `@Schema()`, exportando `Class`, `DocumentType` y `ClassSchema`.
- `dto/`: DTOs basados en `nestjs-zod` (`createZodDto`).
- `{módulo}.controller.ts`: Endpoints HTTP con decoradores Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`).
- `{módulo}.service.ts`: Lógica de negocio pura con inyección de modelos `@InjectModel(...)`.
- `{módulo}.module.ts`: Declaración de importaciones, exportaciones y proveedores.

> [!WARNING]
> **NO crear carpetas globales de `types/`**: Los tipos y esquemas pertenecen a sus respectivos módulos o a `src/shared/` si son transversales.

---

## 4. Reglas Críticas de Negocio y Base de Datos

1. **Aislamiento Multi-Tenant Estricto:**
   - En todos los endpoints del panel de usuario, **TODA consulta a la base de datos debe incluir `userId`**.
   - Usa el decorador `@CurrentUser() userId: Types.ObjectId` en los controladores para obtener el usuario autenticado.
2. **Garantía Física de un solo Snapshot Activo:**
   - Nunca intentes eliminar o alterar el índice parcial de MongoDB en `Snapshot`:

     ```ts
     SnapshotSchema.index(
       { siteId: 1 },
       { unique: true, partialFilterExpression: { status: { $in: ['pending', 'running'] } } },
     );
     ```

   - El servicio `SnapshotService` debe validar previamente si hay snapshots en `pending` o `running` y devolver `BadRequestException`.
3. **Criptografía de API Keys:**
   - Nunca almacenes API Keys en texto plano en la base de datos.
   - Solo se persiste `apiKeyHash` (hash SHA-256) y `apiKeyPrefix` (ej. `sk_live_1234...`).
   - La clave cruda solo se retorna al crear el sitio o regenerar la clave.
4. **Sandboxing del Crawler:**
   - **NUNCA utilices `eval()` directo o `Function()` global** para ejecutar el código de `extractor` o `pageResolver` del usuario.
   - Ejecútalo siempre dentro de un contexto aislado `node:vm.createContext()` con un `timeout` estricto (máximo 2000 ms).
5. **Denormalización de Alto Rendimiento:**
   - Al cambiar el estado de un snapshot (`pending`, `running`, `completed`, `failed`), se debe actualizar simultáneamente el subdocumento `Site.lastSnapshot` para mantener la lectura O(1) de la pantalla "Mis Sitios".

---

## 5. Comandos Frecuentes y Flujo de Trabajo

Todos los comandos deben ejecutarse desde el directorio `backend/` usando `pnpm`:

```bash
# Compilar proyecto y verificar TypeScript
pnpm run build

# Ejecutar linter con Biome
pnpm run lint

# Formatear y corregir problemas de código con Biome
pnpm run check

# Iniciar servidor en modo desarrollo con recarga en caliente
pnpm run start:dev

# Levantar infraestructura local (MongoDB y Redis)
docker compose up -d
```

---

## 6. Checklist de No-Regresión para Agentes

Antes de dar por finalizada cualquier tarea en el backend, verifica:

- [ ] `pnpm run build` ejecuta sin ningún error de TypeScript (`code 0`).
- [ ] `pnpm run lint` reporta `0 errors` y `0 warnings`.
- [ ] Todo nuevo DTO está creado con `createZodDto` y anotado para Swagger.
- [ ] Todo nuevo endpoint tiene `@ApiOperation` y `@ApiResponse`.
- [ ] No se introdujeron imports circulares ni rutas relativas frágiles fuera de su módulo o de `src/shared/`.
