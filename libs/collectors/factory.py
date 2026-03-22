from libs.collectors.scrapli_client import CiscoIosCollector, NxosFixtureCollector
from libs.models.network import Device


def collect_running_config(device: Device, password: str, revision_index: int = 0) -> str:
    vendor = device.vendor.lower()
    if vendor in {"cisco", "cisco_ios", "ios"}:
        return CiscoIosCollector().collect(device.mgmt_ip, device.username, password)
    if vendor in {"nxos", "cisco_nxos", "mock_nxos"}:
        return NxosFixtureCollector().collect(revision_index)
    raise ValueError(f"Unsupported vendor: {device.vendor}")
