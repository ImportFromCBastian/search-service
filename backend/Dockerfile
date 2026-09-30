ARG NODE_VERSION=22-alpine

# Stage 1: Base with pnpm
FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Stage 2: Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile --ignore-scripts

# Stage 3: Build application
FROM deps AS builder
COPY . .
RUN pnpm build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm prune --prod --ignore-scripts

# Stage 4: Production runner
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json ./package.json

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]