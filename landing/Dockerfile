FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY scripts ./scripts
RUN npm install

COPY . .

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine AS production

# Copiar entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copiar configuración base de nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copiar archivos del frontend
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
