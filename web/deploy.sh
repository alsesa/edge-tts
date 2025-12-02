#!/bin/bash
# Deployment script for Edge TTS Web UI to remote server

set -e  # Exit on error

echo "🚀 Edge TTS Web UI - Remote Deployment Script"
echo "=============================================="
echo ""

# Configuration - Edit these values for your server
REMOTE_USER="${REMOTE_USER:-root}"
REMOTE_HOST="${REMOTE_HOST:-your-server.com}"
REMOTE_PATH="${REMOTE_PATH:-/opt/edge-tts}"
IMAGE_NAME="edge-tts-web"
IMAGE_TAG="${1:-latest}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if required variables are set
if [ "$REMOTE_HOST" = "your-server.com" ]; then
    print_warning "Please configure REMOTE_HOST before deployment"
    echo ""
    echo "Usage:"
    echo "  REMOTE_HOST=192.168.1.100 ./deploy.sh"
    echo "  REMOTE_HOST=myserver.com REMOTE_USER=deployer ./deploy.sh"
    echo ""
    exit 1
fi

# Check if SSH key is available
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 "${REMOTE_USER}@${REMOTE_HOST}" exit 2>/dev/null; then
    print_warning "SSH key authentication not configured or server unreachable"
    print_info "You may be prompted for password multiple times"
fi

print_info "Deployment Configuration:"
echo "  Remote Host: ${REMOTE_USER}@${REMOTE_HOST}"
echo "  Remote Path: ${REMOTE_PATH}"
echo "  Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Step 1: Create remote directory
print_info "Creating remote directory..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_PATH}"

# Step 2: Copy files to remote server
print_info "Copying files to remote server..."
rsync -avz --progress \
    --exclude='*.pyc' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='venv' \
    --exclude='.venv' \
    --exclude='*.mp3' \
    --exclude='*.log' \
    ./ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"

# Step 3: Build and start containers on remote server
print_info "Building and starting containers on remote server..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" << EOF
    cd ${REMOTE_PATH}

    # Stop existing containers
    docker-compose down 2>/dev/null || true

    # Build new image
    docker-compose build

    # Start containers
    docker-compose up -d

    # Show status
    echo ""
    echo "Container status:"
    docker-compose ps
EOF

if [ $? -eq 0 ]; then
    print_info "Deployment successful! ✅"
    echo ""
    echo "Access your application at:"
    echo "  http://${REMOTE_HOST}:8000"
    echo ""
    echo "To check logs:"
    echo "  ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_PATH} && docker-compose logs -f'"
else
    print_error "Deployment failed!"
fi
