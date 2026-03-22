from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from apps.api.app.routes import demo, devices, diffs, events, overview
from libs.models.logging import configure_logging

configure_logging()

app = FastAPI(title="Kousei API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(overview.router, prefix="/api")
app.include_router(devices.router, prefix="/api")
app.include_router(diffs.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(demo.router, prefix="/api")

UI_DIST = Path(__file__).resolve().parents[2] / "ui" / "dist"
UI_INDEX = UI_DIST / "index.html"

if (UI_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=UI_DIST / "assets"), name="assets")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/{full_path:path}")
def spa(full_path: str):
    if UI_INDEX.exists():
        return FileResponse(UI_INDEX)
    return JSONResponse(
        status_code=503,
        content={"detail": "UI assets are not built. Rebuild the app image."},
    )
