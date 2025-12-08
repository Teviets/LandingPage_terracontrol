# 🚀 TerraControl - Guía de Despliegue en Producción

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Dominio `terracontrolgt.com` configurado
- Certificado SSL válido (Let's Encrypt o similar)
- Variables de entorno configuradas

## 🔐 Configuración de Certificados SSL

### Opción 1: Let's Encrypt (Recomendado)

```bash
# Crear directorios necesarios
mkdir -p nginx/ssl

# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Generar certificados
sudo certbot certonly --standalone -d terracontrolgt.com -d www.terracontrolgt.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/terracontrolgt.com/fullchain.pem nginx/ssl/terracontrolgt.com.crt
sudo cp /etc/letsencrypt/live/terracontrolgt.com/privkey.pem nginx/ssl/terracontrolgt.com.key

# Ajustar permisos
sudo chown $USER:$USER nginx/ssl/*
chmod 600 nginx/ssl/*
```

### Opción 2: Certificado Autofirmado (para testing)

```bash
mkdir -p nginx/ssl

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/terracontrolgt.com.key \
  -out nginx/ssl/terracontrolgt.com.crt \
  -subj "/C=GT/ST=Guatemala/L=Guatemala/O=TerraControl/CN=terracontrolgt.com"
```

## 📝 Configurar Variables de Entorno

### Crear `.env.production`

```bash
# Base de datos
DATABASE_URL=postgresql://terra:terra@db:5432/terracontrol?schema=public
DB_HOST=db
DB_PORT=5432
DB_USER=terra
DB_PASSWORD=terra
DB_NAME=terracontrol

# API
API_PORT=5174
NODE_ENV=production
API_URL=https://terracontrolgt.com/api

# CORS
CORS_ORIGIN=https://terracontrolgt.com,https://www.terracontrolgt.com

# JWT (si aplica)
JWT_SECRET=tu_jwt_secret_seguro_aqui

# Variables del frontend
VITE_API_BASE_URL=https://terracontrolgt.com/api
VITE_ENV=production
```

## 🚀 Iniciar los Contenedores

### 1. Construir las imágenes

```bash
docker-compose -f docker-compose.prod.yml build
```

### 2. Iniciar los servicios

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Verificar que todo está funcionando

```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar contenedores
docker-compose -f docker-compose.prod.yml ps

# Verificar base de datos
docker exec terracontrol-db psql -U terra -d terracontrol -c "SELECT 1"

# Verificar API
curl http://localhost:5174/health

# Verificar nginx
curl -I https://terracontrolgt.com
```

## 🔄 Inicialización Automática

Cuando levantes los contenedores, el script `docker-entrypoint.sh` ejecutará automáticamente:

1. ✅ Verificar conexión a PostgreSQL
2. ✅ Instalar dependencias de npm
3. ✅ Ejecutar migraciones de Prisma
4. ✅ Ejecutar seeders de base de datos
5. ✅ Iniciar el servidor Node.js

```
════════════════════════════════════════════
  TerraControl - Inicialización del Servidor
════════════════════════════════════════════

ℹ Esperando a que PostgreSQL esté disponible...
✓ PostgreSQL está disponible

✓ Dependencias ya instaladas

ℹ Inicializando base de datos...
✓ Base de datos inicializada correctamente

ℹ Iniciando servidor TerraControl...
✓ Servidor escuchando en puerto 5174
```

## 📊 Estructura de Contenedores

```
┌─────────────────────────────────────────────┐
│         terracontrol-nginx (443)            │
│  (Proxy inverso + SSL + Balanceo)           │
├──────────────────┬──────────────────────────┤
│                  │                          │
│   terracontrol-  │    terracontrol-api      │
│   frontend       │    (Node.js 5174)        │
│   (SPA)          │                          │
│                  │    terracontrol-db       │
│                  │    (PostgreSQL)          │
└──────────────────┴──────────────────────────┘
```

## 🛠️ Comandos Útiles

### Ver logs en tiempo real

```bash
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f db
```

### Ejecutar migraciones manualmente

```bash
docker exec terracontrol-api npm run migrate
```

### Ejecutar seeders manualmente

```bash
docker exec terracontrol-api npm run seed
```

### Reiniciar un servicio específico

```bash
docker-compose -f docker-compose.prod.yml restart api
docker-compose -f docker-compose.prod.yml restart nginx
```

### Detener los contenedores

```bash
docker-compose -f docker-compose.prod.yml down
```

### Limpiar todo (volúmenes incluidos)

```bash
docker-compose -f docker-compose.prod.yml down -v
```

## 🔄 Renovar Certificados Let's Encrypt

```bash
# Renovar
sudo certbot renew --dry-run

# Si todo va bien, renovar sin --dry-run
sudo certbot renew

# Copiar certificados renovados
sudo cp /etc/letsencrypt/live/terracontrolgt.com/fullchain.pem nginx/ssl/terracontrolgt.com.crt
sudo cp /etc/letsencrypt/live/terracontrolgt.com/privkey.pem nginx/ssl/terracontrolgt.com.key

# Recargar nginx
docker exec terracontrol-nginx nginx -s reload
```

## 📈 Monitoreo

### Health checks automáticos

Los servicios tienen health checks configurados:

```bash
# Verificar salud de los servicios
docker-compose -f docker-compose.prod.yml ps

# Ejemplo de salida:
# NAME                       STATE              
# terracontrol-db           Up (healthy)       
# terracontrol-api          Up (running)       
# terracontrol-nginx        Up (running)       
# terracontrol-frontend     Up (running)       
```

### Logs de acceso nginx

```bash
docker exec terracontrol-nginx tail -f /var/log/nginx/terracontrol_access.log
```

## 🚨 Troubleshooting

### Error: "Could not connect to PostgreSQL"

```bash
# Verificar que la BD está corriendo
docker exec terracontrol-db psql -U terra -d terracontrol -c "SELECT 1"

# Si falla, revisar logs
docker logs terracontrol-db
```

### Error: "Certificate not found"

```bash
# Verificar que los certificados existen
ls -la nginx/ssl/

# Si faltan, regenerar con Let's Encrypt
sudo certbot certonly --standalone -d terracontrolgt.com
```

### Error: "API connection refused"

```bash
# Verificar que el API está corriendo
docker ps | grep api

# Ver logs
docker logs terracontrol-api
```

### Nginx devuelve 502 Bad Gateway

```bash
# Verificar conectividad entre contenedores
docker exec terracontrol-nginx curl http://api:5174/health

# Si falla, verificar que están en la misma red
docker network inspect terracontrol-network
```

## 📚 Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

## ✅ Checklist Final

- [ ] Certificados SSL instalados
- [ ] Variables de entorno configuradas
- [ ] Base de datos creada
- [ ] Migraciones ejecutadas
- [ ] Seeders ejecutados
- [ ] DNS configurado
- [ ] Firewall configurado (puertos 80 y 443)
- [ ] CORS configurado correctamente
- [ ] Backups de base de datos configurados
- [ ] Monitoreo activo

---

**¡Tu aplicación está lista para producción!** 🎉
