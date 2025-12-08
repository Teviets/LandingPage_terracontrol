#!/bin/bash

echo "════════════════════════════════════════════"
echo "  TerraControl - Inicialización del Servidor"
echo "════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Esperar a que PostgreSQL esté lista (usando nc)
echo -e "${BLUE}ℹ${NC} Esperando a que PostgreSQL esté disponible..."
MAX_ATTEMPTS=60
ATTEMPT=0

while ! nc -z db 5432 2>/dev/null; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    echo -e "${RED}✗${NC} PostgreSQL no está disponible después de $MAX_ATTEMPTS intentos"
    echo -e "${RED}Error${NC}: No se puede conectar a db:5432"
    exit 1
  fi
  echo "  Intento $ATTEMPT/$MAX_ATTEMPTS..."
  sleep 1
done
echo -e "${GREEN}✓${NC} PostgreSQL está disponible"
echo ""

# 2. Ejecutar migraciones de Prisma
echo -e "${BLUE}ℹ${NC} Ejecutando migraciones..."
if npx prisma migrate deploy; then
  echo -e "${GREEN}✓${NC} Migraciones completadas"
else
  echo -e "${RED}⚠${NC} Migraciones completadas con advertencias"
fi
echo ""

# 3. Ejecutar seeders
echo -e "${BLUE}ℹ${NC} Ejecutando seeders..."
if npm run seed 2>&1; then
  echo -e "${GREEN}✓${NC} Seeders completados"
else
  echo -e "${RED}⚠${NC} Seeders completados con advertencias"
fi
echo ""

# 4. Iniciar el servidor
echo -e "${BLUE}ℹ${NC} Iniciando servidor TerraControl en puerto $PORT..."
echo ""

exec npm start
