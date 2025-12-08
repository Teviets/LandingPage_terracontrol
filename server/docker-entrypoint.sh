#!/bin/bash
set -e

echo "════════════════════════════════════════════"
echo "  TerraControl - Inicialización del Servidor"
echo "════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Esperar a que PostgreSQL esté lista
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

# 2. Ejecutar migraciones de Prisma
echo -e "${BLUE}ℹ${NC} Ejecutando migraciones..."
npx prisma migrate deploy || true
echo -e "${GREEN}✓${NC} Migraciones completadas"
echo ""

# 3. Ejecutar seeders
echo -e "${BLUE}ℹ${NC} Ejecutando seeders..."
node prisma/seed.js || true
echo -e "${GREEN}✓${NC} Seeders completados"
echo ""

# 4. Iniciar el servidor
echo -e "${BLUE}ℹ${NC} Iniciando servidor TerraControl..."
echo -e "${GREEN}✓${NC} Servidor escuchando en puerto $PORT"
echo ""

npm start
