#!/usr/bin/env python3
"""
CAESTHETIC publish routing — resolve a surface from the real account registry.

SSOT: docs/ssot/SOCIAL_ACCOUNT_CONTROL_PLANE.md
Data: docs/ssot/data/social-account-registry.yaml (DEC-764 / DEC-807, schema v2)

This does not invent routing. `social-account-registry.yaml` is already the
canonical L2 machine registry every agent must resolve accounts through
(Control Plane §0). This script only reads it and reports what it says —
including the parts that block automated posting (`adapter_capabilities`,
`activation_gate`) — rather than a caller assuming those checks pass.

Usage:
  python3 resolve-account.py --contour caesthetic --platform instagram
  python3 resolve-account.py --surface-id valeria-lana-caesthetic-instagram
"""
import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
REGISTRY_PATH = REPO_ROOT / "docs/ssot/data/social-account-registry.yaml"


def load_registry(path=REGISTRY_PATH):
    import yaml
    with open(path, "r", encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def flatten_surfaces(registry):
    """One row per social_accounts[] entry, with its parent account's
    contours/dolphin_profile_id/factory status attached."""
    rows = []
    for account in registry.get("accounts", []):
        for surface in account.get("social_accounts", []) or []:
            rows.append({
                "account_id": account.get("id"),
                "owner_name": account.get("owner_name"),
                "contours": account.get("contours", []),
                "dolphin_profile_id": account.get("dolphin_profile_id"),
                "factory_status": (account.get("factory") or {}).get("status"),
                "surface_account_id": surface.get("surface_account_id"),
                "platform": surface.get("platform"),
                "handle": surface.get("handle"),
                "url": surface.get("url"),
                "status": surface.get("status"),
                "write_mode": surface.get("write_mode"),
                "approval_mode": surface.get("approval_mode"),
                "content_formats": surface.get("content_formats", []),
                "sheet_surface_id": surface.get("sheet_surface_id"),
                "adapter_capabilities": surface.get("adapter_capabilities", (account.get("adapter_capabilities") or {}).get(surface.get("platform"), {})),
                "activation_gate": surface.get("activation_gate", account.get("activation_gate", {})),
            })
    return rows


def resolve(rows, contour=None, platform=None, surface_id=None):
    matches = rows
    if surface_id:
        matches = [r for r in matches if r["surface_account_id"] == surface_id]
    if contour:
        matches = [r for r in matches if contour in (r["contours"] or [])]
    if platform:
        matches = [r for r in matches if r["platform"] == platform]
    return matches


def publish_readiness(row):
    """Every reason a resolved surface is or is not actually postable today.
    Never returns "ready" by omission — callers must check `ready` explicitly."""
    reasons = []
    if row["status"] != "live":
        reasons.append(f"surface status is '{row['status']}', not 'live'")
    if row["write_mode"] not in ("factory", "draft_then_human"):
        reasons.append(f"write_mode '{row['write_mode']}' does not permit automated posting")
    caps = row["adapter_capabilities"] or {}
    if not caps.get("execute"):
        reasons.append("adapter_capabilities.execute is false — no live write adapter exists for this platform/account")
    gate = row["activation_gate"] or {}
    if gate.get("status") != "clear":
        reasons.append(f"activation_gate.status is '{gate.get('status')}', not 'clear'")
    checks = gate.get("checks") or {}
    for check_name, value in checks.items():
        if value is not True:
            reasons.append(f"activation_gate.checks.{check_name} is not satisfied")
    return {"ready": len(reasons) == 0, "blocking_reasons": reasons}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--contour")
    parser.add_argument("--platform")
    parser.add_argument("--surface-id")
    parser.add_argument("--registry", default=str(REGISTRY_PATH))
    args = parser.parse_args()

    if not (args.contour or args.platform or args.surface_id):
        print(json.dumps({"ok": False, "error": "at least one of --contour/--platform/--surface-id is required"}))
        sys.exit(2)

    try:
        registry = load_registry(Path(args.registry))
    except FileNotFoundError:
        print(json.dumps({"ok": False, "error": f"registry_not_found:{args.registry}"}))
        sys.exit(1)

    rows = flatten_surfaces(registry)
    matches = resolve(rows, contour=args.contour, platform=args.platform, surface_id=args.surface_id)
    for row in matches:
        row["publish_readiness"] = publish_readiness(row)

    print(json.dumps({"ok": True, "matches": matches, "count": len(matches)}, indent=2))


if __name__ == "__main__":
    main()
