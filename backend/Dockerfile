ARG NODE_VERSION=22

# ---------- Base: Node + pnpm ----------
FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
ENV HUSKY=0
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile --ignore-scripts

# ---------- Build ----------
FROM deps AS build
COPY . .
RUN pnpm build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm prune --prod --ignore-scripts

# ---------- Runtime ----------
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]