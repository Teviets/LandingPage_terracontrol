#!/bin/sh
# Script para facilitar la ejecución de comandos Docker

set -e

COMPOSE_FILE=${1:-docker-compose.prod.yml}
COMMAND=${2:-help}

colors() {
  GREEN='\033[0;32m'
  BLUE='\033[0;34m'
  YELLOW='\033[1;33m'
  RED='\033[0;31m'
  NC='\033[0m'
}

colors

usage() {
  echo -e "${BLUE}Uso: ./docker-cli.sh [archivo-compose] [comando]${NC}"
  echo ""
  echo "Comandos disponibles:"
  echo "  start          - Iniciar contenedores"
  echo "  stop           - Detener contenedores"
  echo "  restart        - Reiniciar contenedores"
  echo "  logs           - Ver logs en tiempo real"
  echo "  logs-api       - Ver logs del API"
  echo "  logs-db        - Ver logs de la BD"
  echo "  logs-nginx     - Ver logs de nginx"
  echo "  migrate        - Ejecutar migraciones"
  echo "  seed           - Ejecutar seeders"
  echo "  ps             - Listar contenedores"
  echo "  shell-api      - Acceso shell al API"
  echo "  shell-db       - Acceso a psql de la BD"
  echo "  rebuild        - Reconstruir imágenes"
  echo "  clean          - Eliminar contenedores y volúmenes"
  echo "  help           - Mostrar esta ayuda"
  echo ""
  echo "Ejemplos:"
  echo "  ./docker-cli.sh docker-compose.prod.yml start"
  echo "  ./docker-cli.sh docker-compose.prod.yml logs-api"
}

case $COMMAND in
  start)
    echo -e "${BLUE}ℹ${NC} Iniciando contenedores..."
    docker-compose -f $COMPOSE_FILE up -d
    echo -e "${GREEN}✓${NC} Contenedores iniciados"
    ;;
  stop)
    echo -e "${BLUE}ℹ${NC} Deteniendo contenedores..."
    docker-compose -f $COMPOSE_FILE down
    echo -e "${GREEN}✓${NC} Contenedores detenidos"
    ;;
  restart)
    echo -e "${BLUE}ℹ${NC} Reiniciando contenedores..."
    docker-compose -f $COMPOSE_FILE restart
    echo -e "${GREEN}✓${NC} Contenedores reiniciados"
    ;;
  logs)
    docker-compose -f $COMPOSE_FILE logs -f
    ;;
  logs-api)
    docker-compose -f $COMPOSE_FILE logs -f api
    ;;
  logs-db)
    docker-compose -f $COMPOSE_FILE logs -f db
    ;;
  logs-nginx)
    docker-compose -f $COMPOSE_FILE logs -f nginx
    ;;
  migrate)
    echo -e "${BLUE}ℹ${NC} Ejecutando migraciones..."
    docker exec terracontrol-api npm run migrate:deploy
    echo -e "${GREEN}✓${NC} Migraciones completadas"
    ;;
  seed)
    echo -e "${BLUE}ℹ${NC} Ejecutando seeders..."
    docker exec terracontrol-api npm run seed
    echo -e "${GREEN}✓${NC} Seeders completados"
    ;;
  ps)
    docker-compose -f $COMPOSE_FILE ps
    ;;
  shell-api)
    echo -e "${BLUE}ℹ${NC} Abriendo shell en API..."
    docker exec -it terracontrol-api sh
    ;;
  shell-db)
    echo -e "${BLUE}ℹ${NC} Conectando a base de datos..."
    docker exec -it terracontrol-db psql -U terra -d terracontrol
    ;;
  rebuild)
    echo -e "${BLUE}ℹ${NC} Reconstruyendo imágenes..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    echo -e "${GREEN}✓${NC} Imágenes reconstruidas"
    ;;
  clean)
    echo -e "${YELLOW}⚠${NC} Esto eliminará todos los contenedores y volúmenes"
    read -p "¿Estás seguro? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
      docker-compose -f $COMPOSE_FILE down -v
      echo -e "${GREEN}✓${NC} Limpieza completada"
    fi
    ;;
  help|*)
    usage
    ;;
esac
