FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY web/package*.json ./web/
RUN cd web && npm ci

FROM deps AS builder
WORKDIR /app

COPY . .

RUN npx prisma generate

RUN npm run build:all

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache dumb-init

COPY --from=deps    /app/node_modules        ./node_modules
COPY --from=builder /app/dist                ./dist
COPY --from=builder /app/web/dist            ./web/dist
COPY --from=builder /app/src/generated       ./src/generated
COPY --from=builder /app/prisma              ./prisma
COPY                package.json             ./

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--", "docker-entrypoint.sh"]