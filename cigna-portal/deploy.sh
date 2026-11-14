#!/usr/bin/env bash
# Build the portal and publish it with nginx on an Ubuntu server.
# Usage: ./deploy.sh /path/to/key.pem [user@host]
set -euo pipefail
KEY="${1:?usage: ./deploy.sh /path/to/key.pem [user@host]}"
HOST="${2:-ubuntu@3.6.106.238}"
SSH="ssh -i $KEY -o StrictHostKeyChecking=accept-new"
chmod 600 "$KEY"
cd "$(dirname "$0")"

npm install
npm run build
tar czf /tmp/portal-dist.tgz -C dist .
scp -i "$KEY" -o StrictHostKeyChecking=accept-new /tmp/portal-dist.tgz "$HOST:/tmp/portal-dist.tgz"

$SSH "$HOST" 'bash -s' <<'REMOTE'
set -euo pipefail
command -v nginx >/dev/null || { sudo apt-get update -y && sudo apt-get install -y nginx; }
sudo mkdir -p /var/www/portal
sudo rm -rf /var/www/portal/*
sudo tar xzf /tmp/portal-dist.tgz -C /var/www/portal
sudo tee /etc/nginx/sites-available/portal >/dev/null <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root /var/www/portal;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /assets/ { expires 30d; add_header Cache-Control "public, immutable"; }
}
NGINX
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/portal /etc/nginx/sites-enabled/portal
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
command -v ufw >/dev/null && sudo ufw status | grep -q active && sudo ufw allow 80/tcp || true
REMOTE

echo "Deployed: http://${HOST#*@}/"
