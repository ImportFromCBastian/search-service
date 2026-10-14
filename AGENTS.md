# AGENTS.md — search-service

Guía de orientación para agentes de IA que trabajen en este repositorio.

---

## ¿Qué es esto?

**search-service** es una plataforma de crawling y búsqueda de texto completo.
Los usuarios registran sitios web, definen un extractor de contenido en JavaScript (Cheerio), y el sistema ejecuta *snapshots* (rastreos) de forma manual o programada. Los documentos extraídos en un snapshot publicado quedan disponibles para búsqueda full-text desde el frontend.

---

## Estructura del monorepo

``` txt
search-service/
├── frontend/          # Aplicación Next.js 16 (App Router)
├── packages/
│   └── shared/        # Schemas Zod y enums compartidos (frontend ↔ backend)
├── pnpm-workspace.yaml
└── package.json       # Workspace root
```

**Package manager:** `pnpm` v12 con workspaces. Nunca uses `npm` ni `yarn`.

El backend **no está en este repositorio**. El frontend se comunica con él via HTTP en `BACKEND_URL` (por defecto `http://localhost:4000`).

---

## Stack tecnológico

### `frontend/`

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components) |
| UI | React 19, Tailwind CSS v4, `@base-ui/react`, shadcn-style components |
| Auth | `@auth0/nextjs-auth0` v4 |
| Forms | `react-hook-form` + `@hookform/resolvers` + Zod |
| Estado cliente | Zustand v5 (`useSettingsStore`) |
| Tablas | `@tanstack/react-table` v9 |
| Linter/Formatter | Biome (NO ESLint, NO Prettier) |
| Íconos | `lucide-react` |

### `packages/shared/`

TypeScript puro compilado con `tsc`. Exporta:

- **Zod schemas** en `src/schemas/` → `dist/schemas/`
- **Enums/constantes** en `src/enums/` → `dist/enums/`

---

## Convenciones de código

### Linting y formato

- Usar **Biome** para todo: `pnpm lint` y `pnpm format --write`.
- No introducir ESLint, Prettier ni otras herramientas de formato.
- El único comentario `biome-ignore` permitido es cuando el tipo no puede inferirse sin `any` (pattern: `// biome-ignore lint/suspicious/noExplicitAny: true`).

### TypeScript

- Siempre importar tipos con `import type { ... }` cuando el símbolo solo se usa como tipo.
- Los tipos del dominio se derivan de los schemas Zod en `@search-service/shared`:

  ```ts
  import type { SiteResponse } from '@search-service/shared/schemas/site.schema'
  ```

- No duplicar tipos que ya existan en `shared/`. Si falta alguno, agrégalo ahí.

### Componentes React

- Los **Server Components** son `async` y no llevan `'use client'`.
- Los **Client Components** llevan `'use client'` como primera línea.
- Los **Server Actions** llevan `'use server'` como primera línea y viven en archivos `actions.ts` por ruta.
- No mezclar lógica de servidor y cliente en el mismo componente.

### Comunicación con el backend

Todo pasa por [`fetchJson`](frontend/src/lib/fetchJson.ts):

```ts
const { success, data, error, status } = await fetchJson<T>('/endpoint', { method, body, params })
```

- Siempre destructurar y manejar `!success` antes de usar `data`.
- El helper construye la URL completa desde `BACKEND_URL` si el path no empieza con `http`.
- Para peticiones que no deben cachearse: pasar `cache: 'no-store'`.

### Server Actions

- Siempre devuelven `{ success: boolean, data: T | null, error: string | null }`.
- Después de mutar datos, llamar `revalidatePath(...)` para invalidar la caché de Next.js.
- Manejar errores con `try/catch`; nunca dejar que una acción lance una excepción al cliente.

### Estado del cliente — Zustand

- El store de configuración ([`useSettingsStore`](frontend/src/store/settings-store.ts)) persiste en `localStorage` y sincroniza:
  - Accesibilidad → clases CSS en `<html>` via `applyAccessibilityToDOM`.
  - Paginación → cookies `ss_page_size` y `ss_density` (leídas por Server Components).
- No crear stores adicionales para estado de servidor. Usar URL search params o RSC.

### Routing y páginas

- Toda la app vive bajo `frontend/src/app/` con el App Router de Next.js.
- El middleware de Auth0 está en `frontend/src/proxy.ts` (exportado como `proxy` + `config` para el matcher de Next.js).
- La página raíz `/` es la landing de autenticación. Los usuarios autenticados son redirigidos por Auth0 al destino correspondiente.

---

## API pública de búsqueda

Cada sitio tiene una **API Key** generada en el momento de creación (visible una sola vez en la UI) o al regenerarla. Se usa en el header `x-api-key` para consultar la API pública de búsqueda del backend. El frontend solo muestra el prefijo enmascarado (`sk_live_1234****`); nunca almacena ni transmite la clave completa.

---

## Entidades del dominio

``` txt
User (Auth0)
 └── Site
      ├── name, url, depth (1-10), frequency (daily|weekly|monthly)
      ├── extractor       JS: ($) => ({ name, url, description, extra })
      ├── pageResolver    JS opcional: (links, currentUrl) => string[]
      ├── apiKey          hash en backend, prefijo en UI
      ├── publishedSnapshotId  → snapshot activo para búsqueda
      └── Snapshot[]
           ├── status: pending | running | completed | failed
           ├── trigger: manual | scheduled
           ├── isPublished: boolean  ← solo snapshots publicados son buscables
           ├── isArchived: boolean
           ├── configUsed: copia inmutable de la config del sitio al momento del crawl
           └── Document[]
                ├── name, url, description
                ├── extra: Record<string, unknown>  ← metadatos libres del extractor
                └── crawl: { statusCode, executionTimeMs, fetchedAt }
```

---

## Endpoints del backend (inferidos)

| Método | Path | Acción |
| --- | --- | --- |
| `GET` | `/sites` | Listar sitios paginados |
| `POST` | `/sites` | Crear sitio (devuelve `apiKey` en texto plano, solo esta vez) |
| `POST` | `/sites/:id/regenerate-api-key` | Regenerar API Key |
| `GET` | `/sites/:id/snapshot` | Listar snapshots de un sitio |
| `POST` | `/snapshots` | Disparar snapshot manual (`{ siteId }`) |
| `POST` | `/snapshots/:id/publish` | Publicar snapshot |
| `POST` | `/snapshots/:id/unpublish` | Despublicar snapshot |
| `POST` | `/snapshots/:id/cancel` | Cancelar snapshot en curso |
| `POST` | `/snapshots/batch` | Acción en lote (`{ ids, action: archive | unarchive | delete }`) |
| `GET` | `/documents/search` | Búsqueda full-text (`?q=&page=&limit=`) |

Los IDs de recursos son **MongoDB ObjectIds** (24 chars hex). El schema `objectIdSchema` en `shared` los valida.

---

## Schemas compartidos — guía rápida

Todos están en `packages/shared/src/schemas/`. Importar desde el workspace:

```ts
import type { SiteResponse } from '@search-service/shared/schemas/site.schema'
import type { SnapshotResponse } from '@search-service/shared/schemas/snapshot.schema'
import type { SearchResponse } from '@search-service/shared/schemas/document.schema'
import type { PaginationInput } from '@search-service/shared/schemas/common.schema'
import { SNAPSHOT_STATUSES } from '@search-service/shared/enums/crawl.enum'
```

Si modificás schemas en `shared/`, ejecutá `pnpm build` dentro de `packages/shared/` para regenerar `dist/` antes de que el frontend los consuma.

---

## Comandos útiles

```powershell
# Instalar dependencias
pnpm install

# Shared package en modo watch (requerido al editar shared/)
cd packages/shared
pnpm dev        # tsc --watch

# Frontend dev server
cd frontend
pnpm dev        # http://localhost:3000

# Lint (Biome)
cd frontend
pnpm lint       # biome check

# Formato
cd frontend
pnpm format     # biome format --write

# Build de producción
cd frontend
pnpm build
```

---

## Variables de entorno (frontend)

| Variable | Descripción | Default |
| --- | --- | --- |
| `BACKEND_URL` | URL del backend (solo servidor) | `http://localhost:4000` |
| `NEXT_PUBLIC_BACKEND_URL` | URL del backend (cliente) | `http://localhost:4000` |
| `AUTH0_SECRET` | Secreto de sesión Auth0 | — |
| `AUTH0_BASE_URL` | URL base de la app | — |
| `AUTH0_ISSUER_BASE_URL` | Dominio de Auth0 | — |
| `AUTH0_CLIENT_ID` | Client ID de Auth0 | — |
| `AUTH0_CLIENT_SECRET` | Client Secret de Auth0 | — |

---

## Qué NO hacer

- No uses `npm install` ni `yarn add`. Solo `pnpm`.
- No corras `tsc` en la raíz; el frontend usa Next.js para compilar. Solo corras `tsc` dentro de `packages/shared/`.
- No uses ESLint ni Prettier. Biome es el único linter/formatter.
- No dupliques tipos que ya existen en `@search-service/shared`.
- No expongas la API Key completa en ningún componente de servidor ni en logs.
- No uses `useEffect` para datos de servidor; usá RSC (`async` Server Components) o Server Actions.
- No hagas `fetch` directamente en componentes cliente para datos iniciales; usá `fetchJson` en Server Components y pasá los datos como props.
