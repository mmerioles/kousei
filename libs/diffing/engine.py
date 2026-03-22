from __future__ import annotations

from difflib import unified_diff


def _extract_named_blocks(config: str, prefixes: tuple[str, ...]) -> set[str]:
    values: set[str] = set()
    for line in config.splitlines():
        for prefix in prefixes:
            if line.startswith(prefix):
                values.add(line.removeprefix(prefix).strip())
    return values


def _extract_interfaces(config: str) -> set[str]:
    return _extract_named_blocks(config, ("interface ",))


def _extract_vlans(config: str) -> set[int]:
    result: set[int] = set()
    for vlan in _extract_named_blocks(config, ("vlan ",)):
        if vlan.isdigit():
            result.add(int(vlan))
    return result


def _extract_acls(config: str) -> set[str]:
    return _extract_named_blocks(config, ("ip access-list ", "ipv6 access-list "))


def build_diff_artifacts(old_config: str, new_config: str) -> tuple[str, dict, str, int]:
    old_lines = old_config.splitlines()
    new_lines = new_config.splitlines()
    raw = "\n".join(
        unified_diff(old_lines, new_lines, fromfile="previous", tofile="current", lineterm="")
    )

    interfaces_changed = sorted(_extract_interfaces(old_config) ^ _extract_interfaces(new_config))
    vlans_added = sorted(_extract_vlans(new_config) - _extract_vlans(old_config))
    vlans_removed = sorted(_extract_vlans(old_config) - _extract_vlans(new_config))
    acl_modified = sorted(_extract_acls(old_config) ^ _extract_acls(new_config))

    semantic = {
        "interfaces_changed": interfaces_changed,
        "vlans_added": vlans_added,
        "vlans_removed": vlans_removed,
        "acl_modified": acl_modified,
    }

    changed_items = (
        len(interfaces_changed) + len(vlans_added) + len(vlans_removed) + len(acl_modified)
    )
    summary_parts = []
    if interfaces_changed:
        summary_parts.append(f"{len(interfaces_changed)} interface changes")
    if vlans_added or vlans_removed:
        summary_parts.append(f"VLAN delta +{len(vlans_added)}/-{len(vlans_removed)}")
    if acl_modified:
        summary_parts.append(f"{len(acl_modified)} ACL changes")
    summary = ", ".join(summary_parts) if summary_parts else "Configuration changed"
    risk_score = min(100, max(5, changed_items * 15))
    return raw, semantic, summary, risk_score

