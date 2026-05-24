# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

edge-tts is a Python library and CLI that uses Microsoft Edge's online TTS WebSocket API to generate MP3 audio and optional SRT subtitles. It does not require Windows or the Edge browser — it impersonates Edge via crafted headers and DRM tokens.

This is a fork of `github.com/rany2/edge-tts`. The current version is defined in `src/edge_tts/version.py`.

## Common Commands

### Lint (runs in CI on push/PR to master)
```sh
./lint.sh                          # pylint + mypy on src/ and examples/
```

### Format
```sh
./format.sh                        # black + isort on src/ and examples/
```

### Install for development
```sh
pip install -e ".[dev]"
```

### Run a single test
```sh
bash tests/001-long-text.sh        # shell-based; spawns 26 parallel edge-tts processes
```

### Build and publish to PyPI
```sh
./build_and_publish.sh             # sdist + bdist_wheel + twine upload
```

### Web UI (separate FastAPI app)
```sh
cd web && pip install -r requirements.txt && python -m uvicorn server:app
```

## Code Style

- **Formatter**: black (line length 88)
- **Import sorting**: isort (black-compatible profile, configured in `.isort.cfg`)
- **Type checking**: mypy with strict settings (`mypy.ini`)
- **Linting**: pylint (`pylintrc`)
- **Python version**: 3.12 for local dev (`.python-version`); `setup.cfg` declares `>=3.7`

## Architecture

### Core Library (`src/edge_tts/`)

**Data flow**: Text → `Communicate` (escape + split into 4096-byte chunks + wrap in SSML) → WebSocket to `wss://api.msedgeservices.com/tts/cognitiveservices/websocket/v1` → binary MP3 chunks + text boundary events → `TTSChunk` dicts.

Key modules:

- **`communicate.py`** — `Communicate` class is the primary API. Accepts text, voice, rate, volume, pitch, boundary type. Provides `stream()` (async generator), `stream_sync()` (sync via thread pool), `save()`/`save_sync()`. Handles 403 retries with clock skew correction via `drm.py`.
- **`drm.py`** — Generates `Sec-MS-GEC` DRM token (SHA256 of Windows file time rounded to 5 min + trusted client token). Maintains clock skew offset when server rejects with 403.
- **`constants.py`** — WebSocket URL, voice list URL, trusted client token, Chromium version headers (currently 140.0.3485.14), and all HTTP headers for Edge impersonation.
- **`voices.py`** — `list_voices()` async function and `VoicesManager` class with `find(**kwargs)` filtering by Gender, Locale, Language, etc.
- **`data_classes.py`** — `TTSConfig` dataclass validates and normalizes voice names, rate/volume/pitch patterns (e.g., `+0%`, `-50Hz`).
- **`submaker.py`** — `SubMaker` accumulates WordBoundary/SentenceBoundary events → SRT output.
- **`srt_composer.py`** — Standalone SRT composition library (MIT licensed, from `github.com/cdown/srt`).
- **`exceptions.py`** — `EdgeTTSException` → `UnknownResponse`, `UnexpectedResponse`, `NoAudioReceived`, `WebSocketError`, `SkewAdjustmentError`.
- **`typing.py`** — TypedDicts: `TTSChunk`, `Voice`, `VoicesManagerVoice`, `CommunicateState`.

### CLI (`src/edge_tts/__main__.py` → `util.py`)

Entry point `edge-tts` delegates to `util.main()` which uses argparse. Supports `--list-voices`, `--write-media`, `--write-subtitles`, voice/rate/volume/pitch options, and piped stdin.

### Playback Wrapper (`src/edge_playback/`)

Entry point `edge-playback`. Runs `edge-tts` as a subprocess, plays result via `mpv` (Linux/macOS) or MCI/win32 API (Windows).

### Web UI (`web/`)

Separate FastAPI app with vanilla JS frontend (PWA-capable). Endpoints: `/api/voices`, `/api/synthesize`, `/api/synthesize-with-subtitles`. Has its own Dockerfile and docker-compose.yml.

## Packaging

- **Real config**: `setup.cfg` (metadata, entry points, extras) + `setup.py` (dependencies)
- `pyproject.toml` at root is a minimal stub — ignore it for packaging purposes
- Runtime deps: aiohttp, certifi, tabulate, typing-extensions
- Dev deps: black, isort, mypy, pylint, types-tabulate (install via `pip install -e ".[dev]"`)
