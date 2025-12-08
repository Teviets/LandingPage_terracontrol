FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY scripts ./scripts
RUN npm install

COPY . .

# Recibir argumentos del build
ARG VITE_API_BASE_URL=/api
ARG VITE_GOOGLE_MAPS_API_KEY=

# Pasar como variables de entorno durante el build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}

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
