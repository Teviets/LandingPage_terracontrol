#!/bin/bash

set -e

echo "════════════════════════════════════════════════════"
echo "  TerraControl - Script de Despliegue en Producción"
echo "════════════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Detener contenedores actuales
echo -e "${BLUE}ℹ${NC} Deteniendo contenedores actuales..."
docker-compose -f docker-compose.prod.yml down || true
echo -e "${GREEN}✓${NC} Contenedores detenidos"
echo ""

# 2. Construir imágenes
echo -e "${BLUE}ℹ${NC} Reconstruyendo imágenes (esto puede tomar unos minutos)..."
docker-compose -f docker-compose.prod.yml build --no-cache
echo -e "${GREEN}✓${NC} Imágenes construidas"
echo ""

# 3. Iniciar contenedores
echo -e "${BLUE}ℹ${NC} Iniciando contenedores..."
docker-compose -f docker-compose.prod.yml up -d
echo -e "${GREEN}✓${NC} Contenedores iniciados"
echo ""

# 4. Esperar a que estén listos
echo -e "${BLUE}ℹ${NC} Esperando a que los servicios estén listos..."
sleep 15
echo ""

# 5. Ver logs
echo -e "${BLUE}ℹ${NC} Últimos logs del API:"
docker-compose -f docker-compose.prod.yml logs terracontrol-api --tail=30

echo ""
echo -e "${BLUE}ℹ${NC} Últimos logs de nginx:"
docker-compose -f docker-compose.prod.yml logs terracontrol-nginx --tail=20

echo ""
echo "════════════════════════════════════════════════════"
echo -e "${GREEN}✓${NC} Despliegue completado"
echo "════════════════════════════════════════════════════"
echo ""
echo "Estados de los contenedores:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "Para ver logs en tiempo real:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Para ver logs de un servicio específico:"
echo "  docker-compose -f docker-compose.prod.yml logs -f [db|api|frontend|nginx]"
echo ""
