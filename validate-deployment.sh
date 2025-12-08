#!/bin/bash

# Script de validación pre-despliegue
# Verifica que todo esté configurado correctamente

set -e

colors() {
  GREEN='\033[0;32m'
  RED='\033[0;31m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  NC='\033[0m'
}

colors

checks_passed=0
checks_failed=0

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 existe"
    ((checks_passed++))
  else
    echo -e "${RED}✗${NC} $1 NO EXISTE"
    ((checks_failed++))
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 existe"
    ((checks_passed++))
  else
    echo -e "${RED}✗${NC} $1 NO EXISTE"
    ((checks_failed++))
  fi
}

check_command() {
  if command -v "$1" &> /dev/null; then
    echo -e "${GREEN}✓${NC} $1 está instalado"
    ((checks_passed++))
  else
    echo -e "${RED}✗${NC} $1 NO está instalado"
    ((checks_failed++))
  fi
}

check_docker() {
  if docker ps &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker está disponible"
    ((checks_passed++))
  else
    echo -e "${RED}✗${NC} Docker NO está disponible"
    ((checks_failed++))
  fi
}

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  TerraControl - Pre-Deployment Validation${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}1. Verificando archivos principales...${NC}"
check_file "docker-compose.prod.yml"
check_file "Dockerfile"
check_file "server/Dockerfile"
check_file "server/docker-entrypoint.sh"
check_file "server/scripts/init-db.js"
check_file ".gitignore"
echo ""

echo -e "${BLUE}2. Verificando configuración de Nginx...${NC}"
check_file "nginx/nginx.conf"
check_file "nginx/conf.d/terracontrol.conf"
check_dir "nginx/ssl"
echo ""

echo -e "${BLUE}3. Verificando documentación...${NC}"
check_file "DEPLOYMENT.md"
check_file "QUICKSTART.md"
check_file "SETUP_SUMMARY.md"
echo ""

echo -e "${BLUE}4. Verificando comandos disponibles...${NC}"
check_command "docker"
check_command "docker-compose"
echo ""

echo -e "${BLUE}5. Verificando Docker daemon...${NC}"
check_docker
echo ""

echo -e "${BLUE}6. Verificando archivos de configuración...${NC}"
if [ -f ".env.production" ]; then
  echo -e "${GREEN}✓${NC} .env.production configurado"
  ((checks_passed++))
elif [ -f ".env.production.example" ]; then
  echo -e "${YELLOW}⚠${NC} .env.production.example existe, pero necesitas crear .env.production"
  ((checks_failed++))
else
  echo -e "${YELLOW}⚠${NC} Crear .env.production desde .env.production.example"
fi
echo ""

echo -e "${BLUE}7. Verificando certificados SSL...${NC}"
if [ -f "nginx/ssl/terracontrolgt.com.crt" ] && [ -f "nginx/ssl/terracontrolgt.com.key" ]; then
  echo -e "${GREEN}✓${NC} Certificados SSL encontrados"
  ((checks_passed++))
else
  echo -e "${YELLOW}⚠${NC} Certificados SSL no encontrados - Necesitas generarlos antes de desplegar"
  echo -e "   Usa: openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\"
  echo -e "        -keyout nginx/ssl/terracontrolgt.com.key \\"
  echo -e "        -out nginx/ssl/terracontrolgt.com.crt \\"
  echo -e "        -subj \"/C=GT/ST=Guatemala/L=Guatemala/O=TerraControl/CN=terracontrolgt.com\""
  ((checks_failed++))
fi
echo ""

echo -e "${BLUE}8. Verificando permisos...${NC}"
if [ -x "server/docker-entrypoint.sh" ]; then
  echo -e "${GREEN}✓${NC} docker-entrypoint.sh es ejecutable"
  ((checks_passed++))
else
  echo -e "${YELLOW}⚠${NC} docker-entrypoint.sh no es ejecutable - ejecutando chmod +x"
  chmod +x server/docker-entrypoint.sh
  ((checks_passed++))
fi

if [ -x "docker-cli.sh" ]; then
  echo -e "${GREEN}✓${NC} docker-cli.sh es ejecutable"
  ((checks_passed++))
else
  echo -e "${YELLOW}⚠${NC} docker-cli.sh no es ejecutable - ejecutando chmod +x"
  chmod +x docker-cli.sh
  ((checks_passed++))
fi
echo ""

# Resumen
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  RESULTADOS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Pasadas: $checks_passed${NC}"
echo -e "${RED}✗ Fallidas: $checks_failed${NC}"
echo ""

if [ $checks_failed -eq 0 ]; then
  echo -e "${GREEN}✅ ¡TODO LISTO PARA DESPLEGAR!${NC}"
  echo ""
  echo "Próximos pasos:"
  echo "  1. Asegurar que los certificados SSL estén en nginx/ssl/"
  echo "  2. Configurar .env.production"
  echo "  3. Ejecutar: docker-compose -f docker-compose.prod.yml up -d"
  echo ""
  exit 0
else
  echo -e "${RED}❌ ARREGLA LOS PROBLEMAS ANTES DE DESPLEGAR${NC}"
  echo ""
  exit 1
fi
