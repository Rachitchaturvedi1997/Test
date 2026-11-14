#!/usr/bin/env bash
# Build the portal and publish it with nginx on an Ubuntu server.
# Usage: ./deploy.sh /path/to/key.pem [user@host] [port]
#   e.g. ./deploy.sh urban.pem ubuntu@3.6.106.238 8080
set -euo pipefail
KEY="${1:?usage: ./deploy.sh /path/to/key.pem [user@host] [port]}"
HOST="${2:-ubuntu@3.6.106.238}"
PORT="${3:-8080}"
[[ "$PORT" =~ ^[0-9]+$ ]] && (( PORT >= 1 && PORT <= 65535 )) || { echo "Invalid port: $PORT"; exit 1; }
SSH="ssh -i $KEY -o StrictHostKeyChecking=accept-new"
chmod 600 "$KEY"
cd "$(dirname "$0")"

npm install
npm run build
tar czf /tmp/portal-dist.tgz -C dist .
scp -i "$KEY" -o StrictHostKeyChecking=accept-new /tmp/portal-dist.tgz "$HOST:/tmp/portal-dist.tgz"

$SSH "$HOST" "PORT=$PORT bash -s" <<'REMOTE'
set -euo pipefail
command -v nginx >/dev/null || { sudo apt-get update -y && sudo apt-get install -y nginx; }
sudo mkdir -p /var/www/portal
sudo rm -rf /var/www/portal/*
sudo tar xzf /tmp/portal-dist.tgz -C /var/www/portal
if sudo ss -ltnp | grep -q ":$PORT " && ! sudo ss -ltnp | grep ":$PORT " | grep -q nginx; then
  echo "Port $PORT is already used by another program on the server. Pick a different port."; exit 1
fi
sudo tee /etc/nginx/sites-available/portal >/dev/null <<NGINX
server {
    listen $PORT;
    listen [::]:$PORT;
    server_name _;
    root /var/www/portal;
    index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
    location /assets/ { expires 30d; add_header Cache-Control "public, immutable"; }
}
NGINX
[ "$PORT" = "80" ] && sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/portal /etc/nginx/sites-enabled/portal
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
command -v ufw >/dev/null && sudo ufw status | grep -q active && sudo ufw allow "$PORT"/tcp || true
REMOTE

if [ "$PORT" = "80" ]; then echo "Deployed: http://${HOST#*@}/"; else echo "Deployed: http://${HOST#*@}:$PORT/"; fi
