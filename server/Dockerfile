FROM node:22-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache netcat-openbsd postgresql-client bash

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma

# Instalar dependencias
RUN npm install

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar código fuente
COPY src ./src

# Crear script de inicialización como archivo separado
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 5174

ENTRYPOINT ["/bin/bash", "/app/docker-entrypoint.sh"]



