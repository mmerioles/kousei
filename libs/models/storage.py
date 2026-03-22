from __future__ import annotations

from pathlib import Path

from libs.models.settings import get_settings


def ensure_snapshot_dir(device_id: int) -> Path:
    path = get_settings().snapshot_root / str(device_id)
    path.mkdir(parents=True, exist_ok=True)
    return path


def write_snapshot_file(device_id: int, filename: str, content: str) -> str:
    directory = ensure_snapshot_dir(device_id)
    path = directory / filename
    path.write_text(content, encoding="utf-8")
    return str(path)

