#!/bin/bash

echo "════════════════════════════════════════════════════"
echo "  Estado de Contenedores de TerraControl"
echo "════════════════════════════════════════════════════"
echo ""

docker-compose -f docker-compose.prod.yml ps

echo ""
echo "════════════════════════════════════════════════════"
echo ""

# Verificar cada servicio
echo "🔍 Verificando servicios..."
echo ""

# Base de datos
echo -n "PostgreSQL: "
if docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U terra > /dev/null 2>&1; then
  echo "✅ OK"
else
  echo "❌ ERROR"
fi

# API
echo -n "API: "
if docker-compose -f docker-compose.prod.yml exec -T api curl -s http://localhost:5174/health > /dev/null 2>&1; then
  echo "✅ OK"
else
  echo "❌ ERROR"
fi

# Nginx
echo -n "Nginx: "
if docker-compose -f docker-compose.prod.yml exec -T nginx curl -s http://localhost/ > /dev/null 2>&1; then
  echo "✅ OK"
else
  echo "❌ ERROR"
fi

echo ""
echo "════════════════════════════════════════════════════"
echo ""
echo "Comandos útiles:"
echo "  Ver logs:           docker-compose -f docker-compose.prod.yml logs -f"
echo "  Ver logs del API:   docker-compose -f docker-compose.prod.yml logs -f terracontrol-api"
echo "  Ver logs nginx:     docker-compose -f docker-compose.prod.yml logs -f terracontrol-nginx"
echo "  Reiniciar API:      docker-compose -f docker-compose.prod.yml restart terracontrol-api"
echo "  Reiniciar nginx:    docker-compose -f docker-compose.prod.yml restart terracontrol-nginx"
echo ""
