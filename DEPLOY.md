# Deployment Guide

This document describes how to provision a basic Ubuntu EC2 instance and deploy the `frontend` (Next.js) and `backend` (Node/Express) apps from this repository. It assumes you are using the GitHub Actions workflow at `.github/workflows/deploy-production.yml` which SCPs build artifacts to the server and runs remote deploy steps.

TL;DR — tasks performed on the server:
- Create `deploy` user (recommended) and upload SSH public key
- Install Node.js, npm, and `pm2`
- Install and configure `nginx` as a reverse proxy (frontend and backend)
- Ensure correct `DEPLOY_PATH` permissions and environment variables
- Extract artifacts, `npm ci`, build frontend, and start/restart services using `pm2`

## Prerequisites (EC2 / Ubuntu 22.04+)
- SSH access to the instance (key-based)
- Sufficient disk space and network access
- Firewall rules allowing SSH (22), HTTP (80), HTTPS (443)

## Recommended user and directory layout
- Deploy user: `deploy` (or reuse `ubuntu`/`ec2-user` if preferred)
- Deployment path (example): `/var/www/learning-tracker`

Example layout once deployed:

```
/var/www/learning-tracker/
├─ frontend/        # extracted frontend app
└─ backend/         # extracted backend app
```

## Server provisioning (example commands)
Run these commands as `ubuntu` or your initial admin user (use `sudo` where required).

1) Create deploy user and allow SSH key login

```bash
# create user and allow sudo without password for convenience (optional)
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG sudo deploy

# on your machine: local_pub_key=$(cat ~/.ssh/id_rsa.pub)
# on server: add the public key
sudo -u deploy mkdir -p /home/deploy/.ssh
sudo sh -c 'echo "<YOUR_PUBLIC_KEY>" > /home/deploy/.ssh/authorized_keys'
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

2) Install Node.js (recommended Node 18+ / Node 20)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
node -v
npm -v
```

3) Install `pm2` and `nginx`

```bash
sudo npm install -g pm2@latest
sudo apt update && sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

4) Open firewall (UFW example) and allow HTTP/HTTPS/SSH

```bash
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # allows 80 and 443
sudo ufw enable
```

## Nginx reverse proxy (example)
Place this in `/etc/nginx/sites-available/learning-tracker` and symlink to `sites-enabled`.

```nginx
server {
  listen 80;
  server_name example.com; # replace with your domain or use server IP

  # Frontend (Next.js running on localhost:3500)
  location / {
    proxy_pass http://127.0.0.1:3500;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # API backend proxied under /api
  location /api/ {
    proxy_pass http://127.0.0.1:5500;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

Enable the site and reload nginx:

```bash
sudo ln -s /etc/nginx/sites-available/learning-tracker /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

For production, secure with TLS (Certbot) or use a managed certificate.

## GitHub Actions secrets used by the workflow
- `SSH_PRIVATE_KEY` — private key used by GitHub Actions to SSH to the EC2 instance
- `SSH_HOST` — EC2 public IP or DNS
- `SSH_USER` — server user (e.g. `deploy`)
- `SSH_PORT` — usually `22`
- `DEPLOY_PATH` — e.g. `/var/www/learning-tracker`

## Manual deploy steps (simulate workflow)
These are the commands the CI uploads and runs remotely. Use them locally to debug before enabling the workflow.

```bash
# on CI: create tarballs
tar -C frontend -czf /tmp/frontend.tar.gz .
tar -C backend -czf /tmp/backend.tar.gz .

# copy to server
scp -P 22 /tmp/frontend.tar.gz deploy@1.2.3.4:/tmp/frontend.tar.gz
scp -P 22 /tmp/backend.tar.gz deploy@1.2.3.4:/tmp/backend.tar.gz

# on server (as deploy or sudo deploy)
DEPLOY_PATH=/var/www/learning-tracker
TARGET_FRONTEND="$DEPLOY_PATH/frontend"
TARGET_BACKEND="$DEPLOY_PATH/backend"

sudo mkdir -p "$TARGET_FRONTEND" "$TARGET_BACKEND"
sudo tar -xzf /tmp/frontend.tar.gz -C "$TARGET_FRONTEND"
sudo tar -xzf /tmp/backend.tar.gz -C "$TARGET_BACKEND"

# install deps and build frontend
cd "$TARGET_FRONTEND"
sudo npm ci --production
sudo npm run build

# backend
cd "$TARGET_BACKEND"
sudo npm ci --production

# start/restart with pm2 (run as deploy user; sudo may be needed depending on paths)
pm2 start npm --name frontend -- start --prefix "$TARGET_FRONTEND" || pm2.restart frontend
pm2 start npm --name backend -- start --prefix "$TARGET_BACKEND" || pm2.restart backend
pm2 save
```

## Rollback
- Keep the last successful tarball on the server (e.g. `/tmp/frontend.prev.tar.gz`) or use git tags for rollbacks.

Example quick rollback (restore previous tarball):

```bash
sudo tar -xzf /tmp/frontend.prev.tar.gz -C /var/www/learning-tracker/frontend
cd /var/www/learning-tracker/frontend
pm2 restart frontend
```

## Logging & health checks
- Tail logs: `pm2 logs frontend` and `pm2 logs backend`.
- Check process status: `pm2 status`.
- For system-level logs: `journalctl -u nginx -f` and `sudo tail -f /var/log/nginx/error.log`.

## Environment variables
- Place runtime environment variables in `/etc/systemd/system/` unit or in a `.env` managed by your deploy user and loaded by `pm2` (e.g., `pm2 start npm --name backend -- start --prefix /path --env production`).
- For secrets, prefer AWS Parameter Store, Secrets Manager, or an environment-only file readable by the `deploy` user.

## Security considerations
- Don't store secrets in the repository.
- Lock down SSH to key-based auth and restrict allowed users.
- Use a minimal IAM role for the EC2 if using other AWS services.

## Alternative: S3 + CloudFront for the frontend
If the frontend can be exported as static assets you may prefer uploading to S3 + CloudFront and using a managed autoscaling service for the backend (ECS / Elastic Beanstalk) for better scalability.

---
If you want, I can:
- Add a `server-setup.sh` script to automate provisioning on a fresh Ubuntu instance, or
- Convert the workflow to deploy the frontend to S3/CloudFront and deploy the backend to ECS (Fargate). Tell me which direction you prefer.
