# Edge TTS Web UI - Docker Deployment Guide

Complete guide for deploying Edge TTS Web UI to a remote server using Docker.

## 📋 Prerequisites

### Local Machine
- Docker installed
- Docker Compose installed
- SSH access to remote server
- rsync (for deployment script)

### Remote Server
- Linux server (Ubuntu 20.04+ recommended)
- Docker installed
- Docker Compose installed
- Port 8000 open (or configure different port)
- Minimum 512MB RAM
- SSH access configured

## 🚀 Quick Start

### Option 1: Local Testing

```bash
cd web

# Build the image
./build.sh

# Start with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f

# Access at http://localhost:8000
```

### Option 2: Remote Deployment

```bash
cd web

# Deploy to remote server
REMOTE_HOST=192.168.1.100 ./deploy.sh

# Or with custom user and path
REMOTE_HOST=myserver.com REMOTE_USER=deployer REMOTE_PATH=/opt/edge-tts ./deploy.sh
```

## 📦 Building the Docker Image

### Build Locally

```bash
# Build with default tag (latest)
./build.sh

# Build with custom tag
./build.sh v1.0.0
```

### Manual Build

```bash
docker build -t edge-tts-web:latest .
```

## 🏃 Running the Container

### Using Docker Compose (Recommended)

```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart

# View status
docker-compose ps
```

### Using Docker CLI

```bash
# Run container
docker run -d \
  --name edge-tts-web \
  -p 8000:8000 \
  --restart unless-stopped \
  edge-tts-web:latest

# View logs
docker logs -f edge-tts-web

# Stop container
docker stop edge-tts-web

# Remove container
docker rm edge-tts-web
```

## 🌐 Remote Server Deployment

### Step-by-Step Manual Deployment

#### 1. Install Docker on Remote Server

```bash
# SSH into server
ssh user@your-server.com

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group (optional)
sudo usermod -aG docker $USER
```

#### 2. Copy Files to Server

```bash
# Create deployment directory
ssh user@your-server.com 'mkdir -p /opt/edge-tts'

# Copy files (from local machine)
cd web
rsync -avz --exclude='venv' --exclude='.git' \
  ./ user@your-server.com:/opt/edge-tts/
```

#### 3. Build and Start on Server

```bash
# SSH into server
ssh user@your-server.com

# Navigate to deployment directory
cd /opt/edge-tts

# Build and start
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### Automated Deployment Script

The `deploy.sh` script automates the entire deployment process:

```bash
# Basic usage
REMOTE_HOST=192.168.1.100 ./deploy.sh

# With custom configuration
REMOTE_HOST=myserver.com \
REMOTE_USER=deployer \
REMOTE_PATH=/home/deployer/edge-tts \
./deploy.sh
```

**What the script does:**
1. ✅ Checks SSH connectivity
2. ✅ Creates remote directory
3. ✅ Copies all files to server
4. ✅ Stops existing containers
5. ✅ Builds new Docker image
6. ✅ Starts containers
7. ✅ Shows deployment status

## 🔧 Configuration

### Environment Variables

Create a `.env` file for custom configuration:

```bash
# .env
PYTHONUNBUFFERED=1
# Add other environment variables as needed
```

### Custom Port

To use a different port, edit `docker-compose.yml`:

```yaml
ports:
  - "3000:8000"  # Host:Container
```

### Resource Limits

Add resource limits in `docker-compose.yml`:

```yaml
services:
  edge-tts-web:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## 🔒 Security Best Practices

### 1. Use Non-Root User
The Dockerfile already creates a non-root user (`appuser`)

### 2. Reverse Proxy with SSL

Use Nginx or Traefik as reverse proxy:

**Nginx example:**
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

**With Let's Encrypt SSL:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tts.yourdomain.com
```

### 3. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 4. Docker Socket Security

Don't expose Docker socket unnecessarily. The current setup doesn't require it.

## 📊 Monitoring

### Check Container Status

```bash
# Using docker-compose
docker-compose ps

# Using docker CLI
docker ps
```

### View Logs

```bash
# All logs
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs edge-tts-web
```

### Health Checks

The container includes a health check that runs every 30 seconds:

```bash
# Check health status
docker inspect edge-tts-web --format='{{.State.Health.Status}}'

# View health check logs
docker inspect edge-tts-web --format='{{json .State.Health}}' | jq
```

## 🔄 Updates and Maintenance

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build

# Or use deployment script
REMOTE_HOST=your-server.com ./deploy.sh
```

### Backup and Restore

```bash
# Backup (no persistent data currently)
# If you add persistent data, use Docker volumes

# Create volume backup
docker run --rm -v edge-tts-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/edge-tts-backup.tar.gz /data

# Restore volume
docker run --rm -v edge-tts-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/edge-tts-backup.tar.gz -C /
```

### Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi edge-tts-web:latest

# Clean up unused resources
docker system prune -a
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :8000

# Kill the process or change port in docker-compose.yml
```

### Permission Denied Errors

```bash
# On remote server, add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Health Check Failing

```bash
# Check if app is responding
curl http://localhost:8000/api/health

# Check health status
docker inspect edge-tts-web --format='{{json .State.Health}}' | jq
```

## 📁 File Structure

```
web/
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore          # Files to exclude from image
├── build.sh               # Build script
├── deploy.sh              # Deployment script
├── server.py              # FastAPI server
├── index.html             # Web UI
├── app.js                 # Frontend logic
├── styles.css             # Styling
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
└── requirements.txt       # Python dependencies
```

## 🌟 Production Recommendations

1. **Use a Reverse Proxy**: Nginx or Traefik with SSL/TLS
2. **Set Up Monitoring**: Prometheus + Grafana
3. **Configure Logging**: Centralized logging with ELK or Loki
4. **Auto-Restart**: Use `restart: unless-stopped` in docker-compose
5. **Resource Limits**: Set appropriate CPU and memory limits
6. **Regular Backups**: If you add persistent data
7. **Security Updates**: Keep Docker and base images updated
8. **Domain Name**: Use a proper domain with DNS
9. **CDN**: Consider using a CDN for static assets
10. **Rate Limiting**: Implement rate limiting for API endpoints

## 📞 Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- GitHub Issues: https://github.com/rany2/edge-tts/issues
- Review health checks: `docker inspect edge-tts-web`

## 📝 License

This deployment configuration is part of the Edge TTS project.
