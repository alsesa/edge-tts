# Docker Quick Start Guide

## 🚀 Deploy in 3 Steps

### Step 1: Build
```bash
cd web
./build.sh
```

### Step 2: Deploy to Remote Server
```bash
# Replace with your server IP/hostname
REMOTE_HOST=192.168.1.100 ./deploy.sh
```

### Step 3: Access
```
http://YOUR_SERVER_IP:8000
```

## 📋 Common Commands

### Local Development
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart
```

### Remote Deployment
```bash
# Basic deployment
REMOTE_HOST=192.168.1.100 ./deploy.sh

# Custom user and path
REMOTE_HOST=myserver.com \
REMOTE_USER=deployer \
REMOTE_PATH=/opt/edge-tts \
./deploy.sh
```

### Monitoring
```bash
# Container status
docker-compose ps

# Health check
docker inspect edge-tts-web --format='{{.State.Health.Status}}'

# Resource usage
docker stats edge-tts-web
```

### Troubleshooting
```bash
# View logs
docker-compose logs --tail=100

# Restart container
docker-compose restart

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔧 Configuration

### Change Port
Edit `docker-compose.yml`:
```yaml
ports:
  - "3000:8000"  # Change 3000 to your desired port
```

### Environment Variables
Create `.env` file:
```bash
PYTHONUNBUFFERED=1
# Add your variables here
```

## 🌐 Production Setup

### 1. Use Reverse Proxy (Recommended)

**Nginx:**
```nginx
server {
    listen 80;
    server_name tts.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Install SSL:**
```bash
sudo certbot --nginx -d tts.yourdomain.com
```

### 2. Firewall Setup
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 3. Auto-Updates (Optional)
```bash
# Add to crontab
0 2 * * * cd /opt/edge-tts && docker-compose pull && docker-compose up -d
```

## 📊 Monitoring

### Check Health
```bash
curl http://localhost:8000/api/health
```

### View Metrics
```bash
docker stats edge-tts-web
```

## 🆘 Quick Fixes

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :8000

# Or change port in docker-compose.yml
```

### Permission Denied
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Container Won't Start
```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

## 📁 File Structure
```
web/
├── Dockerfile           # Container definition
├── docker-compose.yml   # Orchestration
├── build.sh            # Build script
├── deploy.sh           # Deploy script
├── server.py           # Backend
└── [web files]         # Frontend
```

## 🔗 Useful Links

- Full Documentation: [DEPLOYMENT.md](DEPLOYMENT.md)
- Edge TTS Project: https://github.com/rany2/edge-tts
- Docker Docs: https://docs.docker.com

## 💡 Tips

1. **Always use reverse proxy in production**
2. **Enable SSL/TLS with Let's Encrypt**
3. **Set up monitoring and logging**
4. **Regular backups if you add persistent data**
5. **Keep Docker and images updated**

---

**Need Help?** Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions!
