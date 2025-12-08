# 🔧 Configuración de Nginx para TerraControl

## 📋 Archivos en Esta Carpeta

### `nginx.conf`
Configuración principal de Nginx:
- Worker processes automáticos
- Mime types
- Logging
- Compresión gzip
- Rate limiting zones
- Includes de configuración específica

### `conf.d/terracontrol.conf`
Configuración del sitio TerraControl:
- Servidor HTTP (redirecciona a HTTPS)
- Servidor HTTPS con SSL
- Proxy inverso para API
- Servir SPA del frontend
- Headers de seguridad
- Caché de archivos estáticos

### `ssl/` (carpeta gitignore)
Contiene los certificados SSL:
- `terracontrolgt.com.crt` - Certificado público
- `terracontrolgt.com.key` - Clave privada

⚠️ **IMPORTANTE**: Esta carpeta está en `.gitignore` y no debe guardarse en Git

---

## 🔐 Configuración de Certificados

### Let's Encrypt (Recomendado)

```bash
# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Generar certificados
sudo certbot certonly --standalone \
  -d terracontrolgt.com \
  -d www.terracontrolgt.com

# Copiar a nginx/ssl/
sudo cp /etc/letsencrypt/live/terracontrolgt.com/fullchain.pem ssl/terracontrolgt.com.crt
sudo cp /etc/letsencrypt/live/terracontrolgt.com/privkey.pem ssl/terracontrolgt.com.key

# Ajustar permisos
sudo chown $USER:$USER ssl/*
chmod 600 ssl/*
```

### Certificado Autofirmado (Testing)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/terracontrolgt.com.key \
  -out ssl/terracontrolgt.com.crt \
  -subj "/C=GT/ST=Guatemala/L=Guatemala/O=TerraControl/CN=terracontrolgt.com"
```

---

## 🔄 Renovación de Certificados

### Manual

```bash
# Renovar
sudo certbot renew

# Copiar nuevos certificados
sudo cp /etc/letsencrypt/live/terracontrolgt.com/fullchain.pem ssl/terracontrolgt.com.crt
sudo cp /etc/letsencrypt/live/terracontrolgt.com/privkey.pem ssl/terracontrolgt.com.key

# Recargar Nginx
docker exec terracontrol-nginx nginx -s reload
```

### Automático (Cron)

Agregar a crontab:

```bash
# crontab -e
0 12 1 * * certbot renew && \
  cp /etc/letsencrypt/live/terracontrolgt.com/fullchain.pem /ruta/proyecto/nginx/ssl/terracontrolgt.com.crt && \
  cp /etc/letsencrypt/live/terracontrolgt.com/privkey.pem /ruta/proyecto/nginx/ssl/terracontrolgt.com.key && \
  docker exec terracontrol-nginx nginx -s reload
```

---

## 📊 Routing en Nginx

```
Petición a terracontrolgt.com
        │
        ├─ /api/* → proxea a http://api:5174/*
        │   (REST API en Node.js)
        │
        ├─ /* (archivos estáticos: .js, .css, etc) → Caché 30 días
        │   (Archivos compilados de Vite)
        │
        └─ / → index.html (SPA routing)
           (React Router maneja las rutas)
```

---

## 🔒 Headers de Seguridad Configurados

```
Strict-Transport-Security   → HTTPS obligatorio
X-Frame-Options             → Prevenir clickjacking
X-Content-Type-Options      → Prevenir MIME sniffing
X-XSS-Protection            → Protección XSS
Referrer-Policy             → Control de referrer
```

---

## ⚡ Performance Configurado

- **Gzip**: Compresión de contenido
- **Caché**: 30 días para archivos estáticos
- **Keep-Alive**: Reutilización de conexiones
- **Rate Limiting**: 10 req/s general, 30 req/s para API
- **Buffering**: Optimizado para proxying

---

## 🛠️ Comandos Útiles

```bash
# Validar configuración
docker exec terracontrol-nginx nginx -t

# Recargar sin reiniciar
docker exec terracontrol-nginx nginx -s reload

# Ver logs
docker logs terracontrol-nginx -f

# Ver configuración activa
docker exec terracontrol-nginx cat /etc/nginx/nginx.conf

# Acceso al shell
docker exec -it terracontrol-nginx sh
```

---

## 🐛 Troubleshooting

### Error: "Certificate not found"

```bash
# Verificar que existen los archivos
ls -la ssl/

# Si no existen, generarlos
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/terracontrolgt.com.key \
  -out ssl/terracontrolgt.com.crt \
  -subj "/C=GT/ST=Guatemala/L=Guatemala/O=TerraControl/CN=terracontrolgt.com"

# Recargar Nginx
docker exec terracontrol-nginx nginx -s reload
```

### Error: "502 Bad Gateway"

```bash
# Verificar que la API está disponible
docker exec terracontrol-nginx curl http://api:5174/health

# Si falla, revisar logs del API
docker logs terracontrol-api
```

### Error: "Connection refused"

```bash
# Verificar que Nginx está corriendo
docker ps | grep nginx

# Verificar puerto
netstat -tuln | grep 443

# Revisar logs
docker logs terracontrol-nginx
```

---

## 📖 Referencias

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [SSL/TLS Best Practices](https://www.ssl.com/article/ssl-tls-best-practices/)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)

---

**Última actualización**: 7 de diciembre de 2025
