# 🚀 Inicio Rápido - TerraControl Producción

## 📦 Primer Despliegue

### 1. Preparar el servidor

```bash
# Clonar el proyecto
git clone https://github.com/Teviets/LandingPage_terracontrol.git
cd LandingPage_terracontrol

# Crear estructura de certificados
mkdir -p nginx/ssl
```

### 2. Configurar Certificados SSL

```bash
# Opción A: Let's Encrypt (RECOMENDADO)
sudo certbot certonly --standalone -d terracontrolgt.com -d www.terracontrolgt.com
sudo cp /etc/letsencrypt/live/terracontrolgt.com/fullchain.pem nginx/ssl/terracontrolgt.com.crt
sudo cp /etc/letsencrypt/live/terracontrolgt.com/privkey.pem nginx/ssl/terracontrolgt.com.key
sudo chown $USER:$USER nginx/ssl/*
chmod 600 nginx/ssl/*

# Opción B: Certificado autofirmado (testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/terracontrolgt.com.key \
  -out nginx/ssl/terracontrolgt.com.crt \
  -subj "/C=GT/ST=Guatemala/L=Guatemala/O=TerraControl/CN=terracontrolgt.com"
```

### 3. Crear archivo `.env` (opcional, ya tiene defaults)

```bash
# El proyecto usa valores por defecto, pero puedes personalizarlos:
cat > .env.production << EOF
DATABASE_URL=postgresql://terra:terra@db:5432/terracontrol?schema=public
NODE_ENV=production
CORS_ORIGIN=https://terracontrolgt.com,https://www.terracontrolgt.com
EOF
```

### 4. Iniciar los contenedores

```bash
# Opción 1: Con docker-compose directamente
docker-compose -f docker-compose.prod.yml up -d

# Opción 2: Con el script helper
chmod +x docker-cli.sh
./docker-cli.sh docker-compose.prod.yml start
```

### 5. Verificar que todo funciona

```bash
# Ver estado de contenedores
./docker-cli.sh docker-compose.prod.yml ps

# Ver logs
./docker-cli.sh docker-compose.prod.yml logs

# Verificar API
curl http://localhost:5174/health

# Verificar sitio web (si certificados están listos)
curl -k https://terracontrolgt.com
```

## ✅ Lo que ocurre automáticamente

Cuando levantes los contenedores, el sistema ejecutará automáticamente:

1. ✅ Espera a que PostgreSQL esté disponible
2. ✅ Instala dependencias de npm
3. ✅ Ejecuta migraciones de Prisma
4. ✅ Ejecuta seeders (datos iniciales)
5. ✅ Inicia el servidor Node.js
6. ✅ Nginx redirecciona tráfico HTTP→HTTPS
7. ✅ Nginx sirve el frontend SPA
8. ✅ Nginx proxea /api/* al servidor Node.js

## 🛠️ Comandos Útiles

```bash
# Ver logs en tiempo real
./docker-cli.sh docker-compose.prod.yml logs-api

# Reiniciar API
docker-compose -f docker-compose.prod.yml restart api

# Ver logs de nginx
./docker-cli.sh docker-compose.prod.yml logs-nginx

# Acceso a shell del API
./docker-cli.sh docker-compose.prod.yml shell-api

# Conectarse a la BD
./docker-cli.sh docker-compose.prod.yml shell-db

# Ejecutar migraciones manualmente
./docker-cli.sh docker-compose.prod.yml migrate

# Ejecutar seeders manualmente
./docker-cli.sh docker-compose.prod.yml seed

# Detener todo
./docker-cli.sh docker-compose.prod.yml stop

# Limpiar todo (volúmenes incluidos)
./docker-cli.sh docker-compose.prod.yml clean
```

## 🔄 Renovar Certificados (Scheduled)

```bash
# Cron job para renovación automática
# Agregar a crontab: crontab -e

0 12 1 * * certbot renew && \
  cp /etc/letsencrypt/live/terracontrolgt.com/fullchain.pem /ruta/proyecto/nginx/ssl/terracontrolgt.com.crt && \
  cp /etc/letsencrypt/live/terracontrolgt.com/privkey.pem /ruta/proyecto/nginx/ssl/terracontrolgt.com.key && \
  docker exec terracontrol-nginx nginx -s reload
```

## 📊 Estructura de Carpetas Creada

```
LandingPage_terracontrol/
├── nginx/
│   ├── nginx.conf              ← Config principal
│   ├── conf.d/
│   │   └── terracontrol.conf  ← Config de dominio
│   └── ssl/                    ← Certificados (gitignore)
│       ├── terracontrolgt.com.crt
│       └── terracontrolgt.com.key
├── server/
│   ├── scripts/
│   │   └── init-db.js         ← Script inicialización BD
│   ├── docker-entrypoint.sh   ← Script entrada Docker
│   └── Dockerfile             ← Actualizado
├── docker-compose.prod.yml    ← Actualizado
├── docker-cli.sh              ← Script helper
├── DEPLOYMENT.md              ← Guía completa
└── QUICKSTART.md              ← Este archivo
```

## 🚨 Troubleshooting Rápido

### "Connection refused" en API

```bash
# Verificar que el contenedor está corriendo
docker ps | grep api

# Ver logs de error
./docker-cli.sh docker-compose.prod.yml logs-api

# Reiniciar
docker-compose -f docker-compose.prod.yml restart api
```

### "Certificate not found"

```bash
# Verificar archivos
ls -la nginx/ssl/

# Regenerar si faltan
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/terracontrolgt.com.key \
  -out nginx/ssl/terracontrolgt.com.crt \
  -subj "/C=GT/ST=Guatemala/L=Guatemala/O=TerraControl/CN=terracontrolgt.com"

# Recargar nginx
docker exec terracontrol-nginx nginx -s reload
```

### "502 Bad Gateway" desde nginx

```bash
# Verificar que el API está disponible
docker exec terracontrol-nginx curl http://api:5174/health

# Si falla, ver logs del API
./docker-cli.sh docker-compose.prod.yml logs-api
```

### "Could not connect to database"

```bash
# Verificar que la BD está corriendo
docker exec terracontrol-db psql -U terra -d terracontrol -c "SELECT 1"

# Ver logs
./docker-cli.sh docker-compose.prod.yml logs-db
```

## 📈 Monitoreo Continuo

```bash
# Terminal 1: Ver todos los logs
./docker-cli.sh docker-compose.prod.yml logs

# Terminal 2: Ver estado periódicamente
watch -n 5 'docker-compose -f docker-compose.prod.yml ps'

# Terminal 3: Monitorear CPU/Memoria
docker stats --no-stream
```

## ✨ Features Incluidos

- ✅ Migraciones automáticas en startup
- ✅ Seeders automáticos en startup
- ✅ SSL/TLS con HTTPS
- ✅ Redirección HTTP → HTTPS
- ✅ Caché de archivos estáticos
- ✅ Compresión Gzip
- ✅ Headers de seguridad
- ✅ Rate limiting
- ✅ Health checks
- ✅ Logs estructurados
- ✅ Soporte para Let's Encrypt

---

**¿Necesitas ayuda?** Ver `DEPLOYMENT.md` para documentación completa.
