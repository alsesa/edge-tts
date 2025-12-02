#!/bin/bash
# Build script for Edge TTS Web UI Docker image

set -e  # Exit on error

echo "🏗️  Building Edge TTS Web UI Docker Image"
echo "=========================================="
echo ""

# Configuration
IMAGE_NAME="edge-tts-web"
IMAGE_TAG="${1:-latest}"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image: ${FULL_IMAGE_NAME}"
docker build -t "${FULL_IMAGE_NAME}" .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "Image details:"
    docker images | grep "${IMAGE_NAME}" | head -n 1
    echo ""
    echo "To run the container:"
    echo "  docker run -d -p 8000:8000 --name edge-tts ${FULL_IMAGE_NAME}"
    echo ""
    echo "Or use docker-compose:"
    echo "  docker-compose up -d"
else
    echo "❌ Build failed!"
    exit 1
fi
