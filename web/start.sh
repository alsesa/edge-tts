#!/bin/bash
# Quick start script for Edge TTS Web UI

echo "🎙️  Starting Edge TTS Web UI..."
echo ""

source ../.venv/bin/activate

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if dependencies are installed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip3 install -r requirements.txt
    echo ""
fi

# Start the server
echo "✅ Starting server on http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 server.py
