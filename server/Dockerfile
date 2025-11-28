FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

ENV NODE_ENV=production
EXPOSE 5174

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
