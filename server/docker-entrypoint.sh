#!/bin/bash
set -e

echo "════════════════════════════════════════════"
echo "  TerraControl - Inicialización del Servidor"
echo "════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Esperar a que la BD esté lista
echo -e "${BLUE}ℹ${NC} Esperando a que PostgreSQL esté disponible..."
while ! nc -z db 5432; do
  echo "  Reintentando..."
  sleep 2
done
echo -e "${GREEN}✓${NC} PostgreSQL está disponible"
echo ""

# 2. Instalar dependencias si es necesario
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} Dependencias ya instaladas"
else
  echo -e "${BLUE}ℹ${NC} Instalando dependencias..."
  npm install
  echo -e "${GREEN}✓${NC} Dependencias instaladas"
fi
echo ""

# 3. Ejecutar migraciones y seeders
echo -e "${BLUE}ℹ${NC} Inicializando base de datos..."
node scripts/init-db.js

if [ $? -ne 0 ]; then
  echo -e "${RED}✗${NC} Error al inicializar la BD"
  exit 1
fi
echo ""

# 4. Iniciar el servidor
echo -e "${BLUE}ℹ${NC} Iniciando servidor TerraControl..."
echo -e "${GREEN}✓${NC} Servidor escuchando en puerto $PORT"
echo ""

npm start
