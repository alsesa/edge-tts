# Edge TTS Web UI

A Progressive Web App (PWA) for converting text to speech using Microsoft Edge's online TTS service.

## Features

- 🎙️ **Text to Speech**: Convert any text to natural-sounding speech
- 🌍 **Multiple Languages**: Support for 100+ voices in various languages
- 🎛️ **Voice Customization**: Adjust speed, volume, and pitch
- 📱 **PWA Support**: Install as an app on any device
- 💾 **Offline Support**: Service worker caching for offline usage
- 📝 **History**: Keep track of recent generations
- ⬇️ **Download**: Save generated audio as MP3 files

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. Navigate to the web directory:
```bash
cd web
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Start the Server

```bash
python server.py
```

Or with custom options:
```bash
python server.py --host 0.0.0.0 --port 8000
```

Options:
- `--host`: Host to bind to (default: 0.0.0.0)
- `--port`: Port to bind to (default: 8000)
- `--reload`: Enable auto-reload for development

### Access the Web UI

Open your browser and navigate to:
```
http://localhost:8000
```

### Install as PWA

1. Open the web UI in a modern browser (Chrome, Edge, Safari, Firefox)
2. Look for the install prompt or click "Install App" button
3. The app will be added to your home screen/app drawer

## API Endpoints

The server provides the following REST API endpoints:

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "service": "edge-tts-api"
}
```

### GET /api/voices
Get list of all available voices

**Response:**
```json
[
  {
    "Name": "en-US-EmmaMultilingualNeural",
    "ShortName": "en-US-EmmaMultilingualNeural",
    "Gender": "Female",
    "Locale": "en-US",
    "LocaleName": "English (United States)",
    ...
  }
]
```

### POST /api/synthesize
Synthesize speech from text

**Request Body:**
```json
{
  "text": "Hello, world!",
  "voice": "en-US-EmmaMultilingualNeural",
  "rate": "+0%",
  "volume": "+0%",
  "pitch": "+0Hz"
}
```

**Response:**
Returns MP3 audio file

**Parameters:**
- `text` (required): Text to convert (max 5000 characters)
- `voice` (optional): Voice name (default: "en-US-EmmaMultilingualNeural")
- `rate` (optional): Speech rate from -100% to +100% (default: "+0%")
- `volume` (optional): Volume from -100% to +100% (default: "+0%")
- `pitch` (optional): Pitch from -500Hz to +500Hz (default: "+0Hz")

### POST /api/synthesize-with-subtitles
Synthesize speech with subtitle generation

**Request Body:**
Same as /api/synthesize

**Response:**
```json
{
  "audio": "base64_encoded_audio_data",
  "subtitles": "SRT formatted subtitles",
  "format": "mp3"
}
```

## File Structure

```
web/
├── index.html          # Main HTML page
├── styles.css          # Styles and theme
├── app.js             # Client-side JavaScript
├── manifest.json      # PWA manifest
├── sw.js              # Service worker
├── server.py          # FastAPI backend server
├── requirements.txt   # Python dependencies
├── icon-192.png       # App icon (192x192)
├── icon-512.png       # App icon (512x512)
└── README.md          # This file
```

## Development

### Running in Development Mode

```bash
python server.py --reload
```

This enables auto-reload when you modify the code.

### Testing

Test the API endpoints using curl:

```bash
# Get voices
curl http://localhost:8000/api/voices

# Synthesize speech
curl -X POST http://localhost:8000/api/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","voice":"en-US-EmmaMultilingualNeural"}' \
  --output speech.mp3
```

### Customization

#### Update Icons

Replace `icon-192.png` and `icon-512.png` with your own icons.

For best results, create:
- 192x192 PNG for mobile devices
- 512x512 PNG for high-resolution displays

#### Update Theme Color

Edit the `--primary-color` variable in [styles.css](styles.css):

```css
:root {
    --primary-color: #2563eb; /* Change this color */
}
```

Also update `theme_color` in [manifest.json](manifest.json).

## Browser Support

### PWA Features
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Desktop & Android)
- ✅ Samsung Internet

### Service Worker
- ✅ All modern browsers
- ❌ IE11 (not supported)

## Troubleshooting

### Port Already in Use

If port 8000 is already in use:
```bash
python server.py --port 8080
```

### Icons Not Showing

Make sure `icon-192.png` and `icon-512.png` exist in the web directory.

### Voices Not Loading

Check the server logs for errors. The server needs internet connection to fetch voices from Microsoft's API.

### CORS Issues

The server is configured to allow all origins for development. For production, update the CORS settings in [server.py](server.py):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Update this
    ...
)
```

## Deployment

### Production Considerations

1. **Use a production ASGI server**: Uvicorn with multiple workers
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8000 --workers 4
   ```

2. **Use a reverse proxy**: nginx or Apache for SSL/TLS

3. **Set environment variables**:
   ```bash
   export EDGE_TTS_HOST=0.0.0.0
   export EDGE_TTS_PORT=8000
   ```

4. **Update CORS settings**: Restrict to your domain

5. **Enable HTTPS**: Required for PWA installation

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "server.py", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t edge-tts-web .
docker run -p 8000:8000 edge-tts-web
```

## License

This web UI is built on top of [edge-tts](https://github.com/rany2/edge-tts).

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Credits

- **edge-tts**: The underlying TTS library by [@rany2](https://github.com/rany2)
- **Microsoft Edge TTS**: The text-to-speech service
