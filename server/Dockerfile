FROM node:22-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache netcat-openbsd postgresql-client

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma

# Instalar dependencias
RUN npm install

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar código fuente
COPY src ./src

# Crear script de inicialización inline
RUN cat > /app/docker-entrypoint.sh << 'EOF'
#!/bin/bash
set -e

echo "════════════════════════════════════════════"
echo "  TerraControl - Inicialización del Servidor"
echo "════════════════════════════════════════════"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Esperar a que PostgreSQL esté listo
echo -e "${BLUE}ℹ${NC} Esperando a que PostgreSQL esté disponible..."
MAX_ATTEMPTS=30
ATTEMPT=0

while ! psql -h db -U terra -d terracontrol -c "SELECT 1" >/dev/null 2>&1; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    echo -e "${RED}✗${NC} PostgreSQL no está disponible después de $MAX_ATTEMPTS intentos"
    exit 1
  fi
  echo "  Intento $ATTEMPT/$MAX_ATTEMPTS..."
  sleep 2
done

echo -e "${GREEN}✓${NC} PostgreSQL está disponible"
echo ""

# Ejecutar migraciones
echo -e "${BLUE}ℹ${NC} Ejecutando migraciones..."
npx prisma migrate deploy || true

# Ejecutar seeders
echo -e "${BLUE}ℹ${NC} Ejecutando seeders..."
node prisma/seed.js || true

echo -e "${GREEN}✓${NC} Base de datos inicializada"
echo ""

# Iniciar el servidor
echo -e "${BLUE}ℹ${NC} Iniciando servidor TerraControl en puerto $PORT..."
echo ""

npm start
EOF

chmod +x /app/docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 5174

ENTRYPOINT ["/app/docker-entrypoint.sh"]

