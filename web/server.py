#!/usr/bin/env python3
"""
Edge TTS Web API Server

This server provides a REST API for the edge-tts web UI.
"""

import asyncio
import io
import logging
from typing import Optional

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
import uvicorn

# Import edge_tts
import edge_tts
from edge_tts import VoicesManager


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Edge TTS API",
    description="REST API for Microsoft Edge Text-to-Speech service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global voices cache
voices_cache: Optional[list] = None


# Models
class SynthesizeRequest(BaseModel):
    text: str = Field(..., max_length=5000, description="Text to convert to speech")
    voice: str = Field(default="en-US-EmmaMultilingualNeural", description="Voice name")
    rate: str = Field(default="+0%", description="Speech rate (e.g., '+0%', '-50%', '+100%')")
    volume: str = Field(default="+0%", description="Volume (e.g., '+0%', '-50%', '+100%')")
    pitch: str = Field(default="+0Hz", description="Pitch (e.g., '+0Hz', '-500Hz', '+500Hz')")


class VoiceResponse(BaseModel):
    Name: str
    ShortName: str
    Gender: str
    Locale: str
    LocaleName: str
    LocalName: Optional[str] = None
    DisplayName: Optional[str] = None
    Status: Optional[str] = None


# API Routes
@app.get("/")
async def root():
    """Serve the main web page"""
    return FileResponse("index.html")


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "edge-tts-api"}


@app.get("/api/voices")
async def get_voices():
    """
    Get list of all available voices.

    Returns a list of voice objects with their properties.
    """
    global voices_cache

    try:
        # Use cached voices if available
        if voices_cache is None:
            logger.info("Fetching voices from Edge TTS service...")
            voices_cache = await edge_tts.list_voices()
            logger.info(f"Loaded {len(voices_cache)} voices")

        return voices_cache

    except Exception as e:
        logger.error(f"Error fetching voices: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch voices: {str(e)}")


@app.post("/api/synthesize")
async def synthesize_speech(request: SynthesizeRequest):
    """
    Synthesize speech from text.

    Returns an MP3 audio file.
    """
    try:
        logger.info(f"Synthesizing speech: text_length={len(request.text)}, voice={request.voice}")

        # Validate text
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        if len(request.text) > 5000:
            raise HTTPException(status_code=400, detail="Text exceeds maximum length of 5000 characters")

        # Create Communicate instance
        communicate = edge_tts.Communicate(
            text=request.text,
            voice=request.voice,
            rate=request.rate,
            volume=request.volume,
            pitch=request.pitch
        )

        # Generate audio
        audio_data = io.BytesIO()

        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.write(chunk["data"])

        # Check if audio was generated
        audio_data.seek(0)
        if audio_data.getbuffer().nbytes == 0:
            raise HTTPException(status_code=500, detail="No audio was generated")

        logger.info(f"Successfully generated {audio_data.getbuffer().nbytes} bytes of audio")

        # Return audio as MP3
        return Response(
            content=audio_data.getvalue(),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=speech.mp3"
            }
        )

    except edge_tts.exceptions.NoAudioReceived as e:
        logger.error(f"No audio received: {e}")
        raise HTTPException(status_code=400, detail="No audio was generated. Check your parameters.")

    except edge_tts.exceptions.UnknownResponse as e:
        logger.error(f"Unknown response from TTS service: {e}")
        raise HTTPException(status_code=502, detail="Unknown response from TTS service")

    except edge_tts.exceptions.WebSocketError as e:
        logger.error(f"WebSocket error: {e}")
        raise HTTPException(status_code=503, detail="Failed to connect to TTS service")

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Error synthesizing speech: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to synthesize speech: {str(e)}")


@app.post("/api/synthesize-with-subtitles")
async def synthesize_with_subtitles(request: SynthesizeRequest):
    """
    Synthesize speech from text and generate subtitles.

    Returns JSON with audio data (base64) and SRT subtitles.
    """
    try:
        logger.info(f"Synthesizing with subtitles: text_length={len(request.text)}, voice={request.voice}")

        # Validate text
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        # Create Communicate instance
        communicate = edge_tts.Communicate(
            text=request.text,
            voice=request.voice,
            rate=request.rate,
            volume=request.volume,
            pitch=request.pitch
        )

        # Create subtitle maker
        submaker = edge_tts.SubMaker()

        # Generate audio and subtitles
        audio_data = io.BytesIO()

        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.write(chunk["data"])
            elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                submaker.feed(chunk)

        # Get subtitles
        subtitles = submaker.get_srt()

        # Return both audio and subtitles
        import base64
        audio_data.seek(0)
        audio_base64 = base64.b64encode(audio_data.read()).decode('utf-8')

        return {
            "audio": audio_base64,
            "subtitles": subtitles,
            "format": "mp3"
        }

    except Exception as e:
        logger.error(f"Error synthesizing with subtitles: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to synthesize: {str(e)}")


# Mount static files
app.mount("/", StaticFiles(directory=".", html=True), name="static")


def main():
    """Run the server"""
    import argparse

    parser = argparse.ArgumentParser(description="Edge TTS Web API Server")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload")

    args = parser.parse_args()

    logger.info(f"Starting Edge TTS Web Server on {args.host}:{args.port}")
    logger.info(f"Visit http://localhost:{args.port} to use the web interface")

    uvicorn.run(
        "server:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info"
    )


if __name__ == "__main__":
    main()
