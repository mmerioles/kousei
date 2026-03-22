from __future__ import annotations

import re


VOLATILE_PATTERNS = [
    re.compile(r"^! Last configuration change .*", re.IGNORECASE),
    re.compile(r"^! NVRAM config last updated .*", re.IGNORECASE),
    re.compile(r"^!Time: .*", re.IGNORECASE),
    re.compile(r"^!Command: .*", re.IGNORECASE),
    re.compile(r"^ntp clock-period .*", re.IGNORECASE),
    re.compile(r"^Current configuration : .*", re.IGNORECASE),
    re.compile(r"^Building configuration\.\.\.", re.IGNORECASE),
    re.compile(r"^\s*uptime is .*", re.IGNORECASE),
    re.compile(r"^\s*load for .*", re.IGNORECASE),
]


def normalize_config(config: str) -> str:
    cleaned_lines: list[str] = []
    for raw_line in config.splitlines():
        line = raw_line.rstrip()
        if not line.strip():
            continue
        if any(pattern.match(line) for pattern in VOLATILE_PATTERNS):
            continue
        cleaned_lines.append(re.sub(r"\s+", " ", line).strip())
    return "\n".join(cleaned_lines) + ("\n" if cleaned_lines else "")
