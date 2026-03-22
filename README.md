# Kousei

![Version](https://img.shields.io/badge/version-0.1.0-111827?style=flat-square)
![Python](https://img.shields.io/badge/python-3.12-2563eb?style=flat-square)
![CI](https://img.shields.io/badge/ci-not_configured-cbd5e1?style=flat-square)
![Status](https://img.shields.io/badge/status-prototype-f59e0b?style=flat-square)

Kousei is a network configuration history workspace.

It stores normalized snapshots, computes inline diffs between revisions, and keeps operator-written change labels alongside the config timeline. The current demo is centered on a single lab device so the product direction stays clear: revision history first, config visibility first, and change intent captured directly with the artifact.

## Runtime

- API: FastAPI
- UI: React + Vite + Tailwind
- Database: PostgreSQL
- Python packaging: `uv`

## Local Development

Install Python dependencies with `uv`:

```bash
uv sync
```

Run the API locally:

```bash
uv run uvicorn apps.api.app.main:app --reload
```

Run the UI locally:

```bash
cd apps/ui
npm install
npm run dev
```

## Docker

Build and start the full stack:

```bash
docker compose up --build
```

Then open:

```text
http://localhost:4172
```

## Demo Data

Bootstrap the demo scenario:

```bash
curl -X POST http://localhost:4172/api/demo/bootstrap
```

This loads one NX-OS device history with three snapshots, two diffs, and related attribution data for the UI.
