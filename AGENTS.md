# MoneyPrinterTurbo — Base44 Dev Environment

## What this app is

MoneyPrinterTurbo is an AI short-video generation tool. It has a **Streamlit WebUI** (`webui/Main.py`) and a **FastAPI backend** (`main.py` → `app/asgi.py`). The WebUI imports `app/services/*` directly — it does **not** call the API server over HTTP. Only the WebUI is needed for the preview.

## How to run it (Base44 sandbox)

```
docker compose -f docker-compose.base44.yml up -d --build
```

The WebUI is served on **host port 3000** (Streamlit internally on 8501).

## Key setup details

- **Runtime image**: `Dockerfile.base44` — a minimal `python:3.11-slim-bullseye` image with `git`, `ffmpeg`, and `uv` pre-installed. No app source is baked in.
- **Source**: bind-mounted at `/MoneyPrinterTurbo`; edits are reflected live.
- **Dependencies**: installed on container startup via `uv sync --frozen` (uses `uv.lock`). The `.venv` is created in the bind-mounted directory (gitignored).
- **Config**: `config.toml` is auto-created from `config.example.toml` on first boot. No external credentials are required to start — all API keys default to empty. Users configure LLM/TTS/video-source keys through the WebUI.
- **Redis**: optional, disabled by default (`enable_redis = false`). The app falls back to in-memory state management.
- **PYTHONPATH**: set to `/MoneyPrinterTurbo` so `import app` resolves.
- **CORS**: `--server.enableCORS=false` is required so Streamlit accepts WebSocket connections from the preview proxy's origin (which differs from the container's address).

## Verifying it works

1. `docker compose -f docker-compose.base44.yml ps` — webui should be healthy.
2. `curl -s http://localhost:3000/_stcore/health` — should return `"ok"`.
3. Open the preview — the Streamlit WebUI should load.

## External credentials (optional)

The app boots without any API keys. To actually generate videos, users need to provide at least one LLM provider key and one video-source key (e.g. Pexels) through the WebUI's configuration panel. These are stored in `config.toml` (gitignored), not environment variables.
