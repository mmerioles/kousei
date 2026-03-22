# Kousei

![Version](https://img.shields.io/badge/version-0.1.0-111827?style=flat-square)
![Python](https://img.shields.io/badge/python-3.12-2563eb?style=flat-square)
![CI](https://img.shields.io/badge/ci-not_configured-cbd5e1?style=flat-square)
![Status](https://img.shields.io/badge/status-prototype-f59e0b?style=flat-square)

Kousei is a network configuration history workspace.

The purpose is to have an offline-first application for network config management. Simply deployable on a container or baremetal VM to instantly gain insight on your network.

Homepage - view all site changes at a glance
<img width="1129" height="877" alt="image" src="https://github.com/user-attachments/assets/8fa34cc0-1209-42cf-957a-23010d164559" />

Triage - walk through your config history like git
<img width="1170" height="1178" alt="image" src="https://github.com/user-attachments/assets/74be1883-01ff-4359-9750-439253c34868" />

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
