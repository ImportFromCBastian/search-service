ARG NODE_VERSION=22-alpine

# Stage 1: Base with pnpm
FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
RUN corepack enable
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile --filter @search-service/shared --filter backend --ignore-scripts

# Stage 3: Build application & create deploy bundle
FROM deps AS builder
COPY packages/shared ./packages/shared
RUN pnpm --filter @search-service/shared build
COPY backend ./backend
RUN pnpm --filter backend build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm --filter=backend --prod deploy --legacy /app/deploy && \
  cp -r /app/backend/dist /app/deploy/dist

# Stage 4: Production runner
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app/deploy ./

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]