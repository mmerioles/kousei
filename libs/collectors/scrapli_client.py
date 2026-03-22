from pathlib import Path

from scrapli.driver.core import IOSXEDriver

from libs.models.settings import get_settings


class CiscoIosCollector:
    def collect(self, host: str, username: str, password: str) -> str:
        settings = get_settings()
        device = {
            "host": host,
            "auth_username": username,
            "auth_password": password,
            "auth_strict_key": False,
            "timeout_socket": settings.collector_timeout_seconds,
            "timeout_transport": settings.collector_timeout_seconds,
        }
        with IOSXEDriver(**device) as conn:
            response = conn.send_command(settings.cisco_default_command)
            return response.result


class NxosFixtureCollector:
    def __init__(self) -> None:
        self.fixture_dir = Path(__file__).resolve().parents[2] / "fixtures"

    def collect(self, revision_index: int) -> str:
        fixtures = sorted(self.fixture_dir.glob("nxos_*.cfg"))
        if not fixtures:
            raise FileNotFoundError(f"No NX-OS fixtures found in {self.fixture_dir}")

        index = min(max(revision_index, 0), len(fixtures) - 1)
        return fixtures[index].read_text(encoding="utf-8")
