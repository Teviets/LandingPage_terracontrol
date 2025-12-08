# ✅ RESUMEN DE CAMBIOS - ARREGLO DE CONTENEDORES

## 🔧 PROBLEMAS IDENTIFICADOS Y RESUELTOS

### ❌ Problema 1: API se reinicia constantemente
**Error**: `exec ./docker-entrypoint.sh: no such file or directory`

**Causa**: El Dockerfile intentaba copiar un script que no se copiaba correctamente en el contexto de Docker.

**Solución**: 
- Embeber el script de inicialización directamente en el Dockerfile
- El script ahora se crea dentro del contenedor con `cat > /app/docker-entrypoint.sh`
- Incluye lógica para:
  - ✅ Esperar a que PostgreSQL esté listo
  - ✅ Ejecutar migraciones automáticamente
  - ✅ Ejecutar seeders
  - ✅ Iniciar el servidor

**Archivo**: `server/Dockerfile`

---

### ❌ Problema 2: Nginx se reinicia constantemente
**Error**: Espera certificados SSL que no existen

**Causa**: La configuración de nginx requería archivos SSL (`/etc/nginx/ssl/terracontrolgt.com.crt` y `.key`) que no estaban en el servidor.

**Solución**:
- Simplificar configuración a HTTP (puerto 80)
- Eliminar dependencias de SSL por ahora
- Agregar comentarios en nginx.conf para agregar SSL después fácilmente

**Archivo**: `nginx/conf.d/terracontrol.conf`

---

### ❌ Problema 3: Configuración de docker-compose inconsistente
**Causas múltiples**:
- CORS_ORIGIN con https pero sin certificados
- VITE_API_BASE_URL apuntando a https sin SSL configurado
- Falta de healthchecks
- Volumen de SSL no necesario

**Solución**:
- Cambiar CORS_ORIGIN a HTTP
- VITE_API_BASE_URL a `/api` (ruta relativa)
- Agregar healthchecks para todos los servicios
- Remover volumen de SSL innecesario
- Agregar start_period en healthchecks para dar tiempo de inicialización

**Archivo**: `docker-compose.prod.yml`

---

## 📦 ARCHIVOS CREADOS

### 1. `deploy.sh` - Script de despliegue automatizado
```bash
Funcionalidad:
✅ Detiene contenedores actuales
✅ Reconstruye imágenes (sin caché)
✅ Inicia todos los contenedores
✅ Espera a que estén listos
✅ Muestra logs
✅ Muestra estado final
```

**Uso**: 
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

---

### 2. `status.sh` - Verificar estado de servicios
```bash
Funcionalidad:
✅ Muestra estado de cada contenedor
✅ Verifica si PostgreSQL responde
✅ Verifica si API responde
✅ Verifica si Nginx responde
✅ Muestra comandos útiles
```

**Uso**:
```bash
chmod +x status.sh
sudo ./status.sh
```

---

### 3. `logs.sh` - Ver logs en tiempo real
```bash
Funcionalidad:
✅ Muestra logs de todos los servicios
✅ O de un servicio específico
✅ En tiempo real
```

**Uso**:
```bash
chmod +x logs.sh
sudo ./logs.sh              # Ver todos los logs
sudo ./logs.sh api         # Ver logs del API
sudo ./logs.sh nginx       # Ver logs de Nginx
sudo ./logs.sh db          # Ver logs de BD
```

---

### 4. `QUICK_START.md` - Guía rápida
Instrucciones paso a paso para desplegar.

---

### 5. `DEPLOYMENT.md` - Documentación completa
Guía detallada con:
- Troubleshooting
- Comandos útiles
- Backup de BD
- SSL/HTTPS (opcional)
- Monitoreo

---

## 🚀 PASOS PARA DESPLEGAR EN TU SERVIDOR

### Paso 1: Conectar al servidor
```bash
ssh ubuntu@ip-172-31-22-124
cd ~/LandingPage_terracontrol
```

### Paso 2: Actualizar código
```bash
git pull origin main
```

### Paso 3: Hacer ejecutables los scripts
```bash
chmod +x deploy.sh status.sh logs.sh
```

### Paso 4: Ejecutar despliegue
```bash
sudo ./deploy.sh
```

### Paso 5: Verificar estado
```bash
sudo ./status.sh
```

### Resultado esperado:
```
CONTAINER ID   IMAGE              STATUS
xxx            terracontrol-db    Up X seconds (healthy)
xxx            terracontrol-api   Up X seconds (healthy)
xxx            terracontrol-frontend  Up X seconds
xxx            terracontrol-nginx Up X seconds (healthy)

✅ PostgreSQL: OK
✅ API: OK
✅ Nginx: OK
```

---

## 📊 FLUJO DE INICIALIZACIÓN (Automático)

```
1. Docker inicia contenedor de API
   ↓
2. Script docker-entrypoint.sh se ejecuta
   ↓
3. Espera a que PostgreSQL esté listo
   ↓
4. Ejecuta: npx prisma migrate deploy
   (Crea/actualiza tablas)
   ↓
5. Ejecuta: node prisma/seed.js
   (Llena datos iniciales)
   ↓
6. Ejecuta: npm start
   (Inicia el servidor)
   ↓
7. Nginx proxy hacia http://api:5174
   ↓
8. Frontend accede a /api/...
```

---

## 🧪 CÓMO PROBAR QUE FUNCIONA

### Prueba 1: Ver que los contenedores están corriendo
```bash
sudo docker-compose -f docker-compose.prod.yml ps
```

### Prueba 2: Ver que BD tiene datos
```bash
sudo docker-compose -f docker-compose.prod.yml exec db psql -U terra -d terracontrol -c "SELECT COUNT(*) FROM usuario"
```

### Prueba 3: Ver que API responde
```bash
sudo docker-compose -f docker-compose.prod.yml exec api curl http://localhost:5174/health
```

### Prueba 4: Acceder desde navegador
```
http://ip-del-servidor
```

Deberías ver:
- Frontend cargando correctamente
- API comunicándose sin errores
- Datos mostrándose en el dashboard

---

## 🔐 PRÓXIMOS PASOS (Opcional)

### Para agregar HTTPS/SSL:

1. Obtener certificado:
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d terracontrolgt.com
```

2. Copiar certificados:
```bash
sudo cp /etc/letsencrypt/live/terracontrolgt.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/terracontrolgt.com/privkey.pem ./nginx/ssl/
```

3. Descomentar sección SSL en `nginx/conf.d/terracontrol.conf`

4. Reiniciar nginx:
```bash
docker-compose -f docker-compose.prod.yml restart terracontrol-nginx
```

---

## 🆘 TROUBLESHOOTING

### Si API sigue cayendo:
```bash
# Ver logs en tiempo real
sudo docker-compose -f docker-compose.prod.yml logs -f terracontrol-api --tail=100

# Buscar el error específico
# Común: "database is locked" - esperar y reintentar
# Común: "migration already applied" - normal, ignorar
```

### Si Nginx no responde:
```bash
# Ver logs
sudo docker-compose -f docker-compose.prod.yml logs terracontrol-nginx --tail=50

# Verificar que el archivo de config es válido
sudo docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Reiniciar
sudo docker-compose -f docker-compose.prod.yml restart terracontrol-nginx
```

### Si BD no conecta:
```bash
# Verificar estado
sudo docker-compose -f docker-compose.prod.yml exec db psql -U terra -c "SELECT 1"

# Ver logs
sudo docker-compose -f docker-compose.prod.yml logs terracontrol-db --tail=50
```

---

## 📝 NOTAS IMPORTANTES

1. **Migraciones se ejecutan automáticamente** en cada inicio del API
2. **Seeders se ejecutan automáticamente** si existen en `prisma/seed.js`
3. **Nginx escucha en puerto 80** (HTTP). Para HTTPS, agregar SSL después
4. **Todos los datos se guardan en volumen `postgres-data`** (persistente)
5. **Los scripts de despliegue requieren sudo** porque Docker necesita permisos de root

---

## 📞 COMANDOS RÁPIDOS DE REFERENCIA

```bash
# Ver todo
sudo ./status.sh

# Ver logs
sudo ./logs.sh api

# Reiniciar un servicio
sudo docker-compose -f docker-compose.prod.yml restart terracontrol-api

# Detener todo
sudo docker-compose -f docker-compose.prod.yml down

# Redeploy completo
sudo ./deploy.sh

# Limpiar recursos
sudo docker system prune -f
```

---

✅ **Estado**: Listo para desplegar en producción
🚀 **Próximo paso**: Ejecutar `sudo ./deploy.sh` en el servidor
