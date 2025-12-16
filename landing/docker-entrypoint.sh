#!/bin/sh
set -e

rm -f /etc/nginx/conf.d/*.conf 2>/dev/null || true

SERVER_NAMES=${SERVER_NAMES:-"terracontrolgt.com www.terracontrolgt.com _"}
API_PROXY_PASS=${API_PROXY_PASS:-http://api:5174/api/}
SSL_CERT_PATH=${SSL_CERT_PATH:-/etc/nginx/ssl/terracontrolgt.com.crt}
SSL_KEY_PATH=${SSL_KEY_PATH:-/etc/nginx/ssl/terracontrolgt.com.key}

APP_SERVER_BLOCK=$(cat <<EOF
  root /usr/share/nginx/html;
  index index.html;

  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
    access_log off;
  }

  location /api/ {
    limit_req zone=api burst=50 nodelay;
    proxy_pass $API_PROXY_PASS;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header X-Forwarded-Host \$server_name;
    proxy_set_header Connection "";
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    proxy_buffering off;
    proxy_request_buffering off;
  }

  location / {
    try_files \$uri \$uri/ /index.html;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
  }

  location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
  }

  location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
  }

  location ~ ~$ {
    deny all;
    access_log off;
    log_not_found off;
  }
EOF
)

if [ -f "$SSL_CERT_PATH" ] && [ -f "$SSL_KEY_PATH" ]; then
  echo "✓ SSL certificates found. Enabling HTTPS."
  cat > /etc/nginx/conf.d/app.conf <<EOF
server {
  listen 80;
  server_name $SERVER_NAMES;
  return 301 https://\$host\$request_uri;
}

server {
  listen 443 ssl http2;
  server_name $SERVER_NAMES;
  ssl_certificate $SSL_CERT_PATH;
  ssl_certificate_key $SSL_KEY_PATH;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
$APP_SERVER_BLOCK
}
EOF
else
  echo "⚠ SSL certificates not found. Serving over HTTP only."
  cat > /etc/nginx/conf.d/app.conf <<EOF
server {
  listen 80;
  server_name $SERVER_NAMES;
$APP_SERVER_BLOCK
}
EOF
fi

echo "Starting nginx..."
exec nginx -g "daemon off;"
