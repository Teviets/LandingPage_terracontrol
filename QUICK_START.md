#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║  🚀 GUÍA RÁPIDA DE DESPLIEGUE - TERRACONTROL PRODUCCIÓN        ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 PASOS PARA DESPLEGAR:"
echo ""

echo "1️⃣  HACER SCRIPTS EJECUTABLES"
echo "   $ chmod +x deploy.sh status.sh logs.sh"
echo ""

echo "2️⃣  EJECUTAR DESPLIEGUE"
echo "   $ sudo ./deploy.sh"
echo ""
echo "   O manualmente:"
echo "   $ docker-compose -f docker-compose.prod.yml build"
echo "   $ docker-compose -f docker-compose.prod.yml up -d"
echo ""

echo "3️⃣  VERIFICAR ESTADO"
echo "   $ sudo ./status.sh"
echo ""
echo "   O ver logs en tiempo real:"
echo "   $ sudo docker-compose -f docker-compose.prod.yml logs -f"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ARCHIVOS MODIFICADOS / CREADOS                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "✅ server/Dockerfile"
echo "   - Incrustó script de inicialización"
echo "   - Ejecuta migraciones automáticamente"
echo "   - Ejecuta seeders"
echo ""

echo "✅ docker-compose.prod.yml"
echo "   - Agregó healthchecks"
echo "   - Mejoró configuración de nginx"
echo "   - Eliminó dependencias de SSL"
echo ""

echo "✅ nginx/conf.d/terracontrol.conf"
echo "   - Configuración HTTP sin SSL (preparada para agregar SSL después)"
echo "   - Proxy correcto hacia API"
echo "   - Headers de seguridad"
echo ""

echo "✅ deploy.sh"
echo "   - Script para desplegar automáticamente"
echo "   - Reconstruye imágenes"
echo "   - Reinicia contenedores"
echo ""

echo "✅ status.sh"
echo "   - Verifica estado de servicios"
echo "   - Muestra estado de cada contenedor"
echo ""

echo "✅ logs.sh"
echo "   - Muestra logs de servicios"
echo "   - Uso: ./logs.sh [api|nginx|db|frontend]"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  PROBLEMAS COMUNES Y SOLUCIONES                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "❌ 'exec ./docker-entrypoint.sh: no such file or directory'"
echo "   ✅ SOLUCIONADO: Script ahora está embebido en el Dockerfile"
echo ""

echo "❌ nginx se reinicia constantemente"
echo "   ✅ SOLUCIONADO: Eliminó dependencias de certificados SSL"
echo ""

echo "❌ API no conecta con base de datos"
echo "   ✅ Verifica que PostgreSQL esté listo con:"
echo "      $ docker-compose -f docker-compose.prod.yml exec db psql -U terra -d terracontrol -c \"SELECT 1\""
echo ""

echo "❌ Nginx no puede conectar con API"
echo "   ✅ Verifica que API esté escuchando:"
echo "      $ docker-compose -f docker-compose.prod.yml exec api curl http://localhost:5174/health"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  DESPUÉS DE QUE TODO FUNCIONE                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "🔒 Para agregar SSL/HTTPS:"
echo "   Ver: DEPLOYMENT.md (sección 🔐 Configuración SSL/HTTPS)"
echo ""

echo "📊 Para monitorear en producción:"
echo "   $ sudo docker-compose -f docker-compose.prod.yml logs -f terracontrol-api"
echo ""

echo "🔄 Para actualizar el código:"
echo "   $ git pull origin main"
echo "   $ sudo ./deploy.sh"
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo ""
echo "¿Necesitas ayuda? Consulta DEPLOYMENT.md para más detalles"
echo ""
