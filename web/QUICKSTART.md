# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
cd web
pip install -r requirements.txt
```

### 2. Start the Server

```bash
./start.sh
```

Or manually:
```bash
python3 server.py
```

### 3. Open Your Browser

Visit: **http://localhost:8000**

---

## ✨ Features at a Glance

### Text to Speech
- Enter any text (up to 5000 characters)
- Select from 100+ voices in multiple languages
- Adjust speed, volume, and pitch
- Generate natural-sounding speech

### Voice Selection
- Filter by language and gender
- Preview voice names and locales
- Save your favorite settings

### Audio Controls
- Play audio directly in browser
- Download as MP3 files
- View generation history
- Quick reload from history

### PWA Features
- Install as standalone app
- Offline support with service worker
- Works on desktop and mobile
- Responsive design

---

## 📱 Install as App

### On Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Or look for "Install App" button in the UI
3. App will be added to your applications

### On Mobile (Android)
1. Open in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home screen"
4. App icon will appear on home screen

### On iOS (Safari)
1. Tap the share button
2. Select "Add to Home Screen"
3. Name the app and add to home screen

---

## 🎯 Quick Usage Tips

### Generate Speech
1. Enter or paste text
2. Select a voice (default: English)
3. Adjust speed/volume/pitch if needed
4. Click "Generate Speech"
5. Audio player appears with playback controls

### Download Audio
- Click "Download MP3" button
- File saves with timestamp and text snippet

### Use History
- Recent generations saved automatically
- Click "Load" to restore settings
- Click "Delete" to remove from history

### Filter Voices
- Use language dropdown for specific locales
- Use gender filter for Male/Female voices
- Voice list updates automatically

---

## 🔧 Configuration

### Change Port
```bash
python3 server.py --port 8080
```

### Enable Hot Reload (Development)
```bash
python3 server.py --reload
```

### Bind to Specific Host
```bash
python3 server.py --host 127.0.0.1
```

---

## ⚡ API Usage

### Test with cURL

Get voices:
```bash
curl http://localhost:8000/api/voices
```

Generate speech:
```bash
curl -X POST http://localhost:8000/api/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!",
    "voice": "en-US-EmmaMultilingualNeural",
    "rate": "+0%",
    "volume": "+0%",
    "pitch": "+0Hz"
  }' \
  --output speech.mp3
```

---

## 🎨 Customization

### Update Theme Color

Edit `styles.css`:
```css
:root {
    --primary-color: #2563eb; /* Your color here */
}
```

Update `manifest.json`:
```json
{
  "theme_color": "#2563eb"
}
```

### Replace Icons

Create PNG icons:
- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

Use any image editing tool or online icon generator.

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
python3 server.py --port 8080
```

### Dependencies Not Found
```bash
pip3 install -r requirements.txt
```

### Voices Not Loading
- Check internet connection
- Check server logs for errors
- Try refreshing the page

### Service Worker Issues
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

---

## 📚 More Information

See [README.md](README.md) for detailed documentation including:
- Full API reference
- Deployment guide
- Docker setup
- Production considerations
- Contributing guidelines

---

## 🎉 You're All Set!

Enjoy using Edge TTS Web UI!

For issues or questions, visit: https://github.com/rany2/edge-tts
