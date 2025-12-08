#!/bin/sh
set -e

# Remover todos los archivos .conf por defecto
rm -f /etc/nginx/conf.d/*.conf 2>/dev/null || true

# Crear el default.conf
cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://api:5174/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /health {
    return 200 "healthy\n";
    add_header Content-Type text/plain;
  }
}
EOF

echo "Starting nginx..."
exec nginx -g "daemon off;"
