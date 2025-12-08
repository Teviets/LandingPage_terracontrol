FROM node:22-alpine AS base

WORKDIR /app

# Instalar netcat para healthchecks
RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY scripts ./scripts
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 5174

ENTRYPOINT ["./docker-entrypoint.sh"]
