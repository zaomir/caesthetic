#!/usr/bin/env python3
"""Build and validate a CAESTHETIC Wave 1 manifest without channel writes.

Row-level inputs and output are private operational artifacts. This command is
deliberately local-only: it neither talks to Dropbox nor any social/email API.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

CANON_RELEASE = "r20260821T014534Z-qualified-646-contract"
ALLOWED_TIERS = {"A", "B"}
TRUE = {"1", "true", "yes", "y"}
REQUIRED_GLOBAL_GATES = (
    "instantly_access",
    "emailverifier_access",
    "sending_domain_auth",
    "deliverability_accepted",
    "suppression_registry_ready",
    "reply_routing_ready",
    "reply_owner_assigned",
    "score_route_ready",
    "sprint_payment_ready",
)


def norm(value: object) -> str:
    return str(value or "").strip()


def truthy(value: object) -> bool:
    return norm(value).lower() in TRUE


def identity(row: dict[str, str]) -> str:
    return norm(row.get("account_id") or row.get("username")).lower().lstrip("@")


def reason(row: dict[str, str]) -> list[str]:
    failures: list[str] = []
    if norm(row.get("qualification_tier")).upper() not in ALLOWED_TIERS:
        failures.append("tier_not_a_or_b")
    if not identity(row):
        failures.append("identity_missing")
    if not norm(row.get("owner_candidate") or row.get("decision_maker")):
        failures.append("decision_maker_missing")
    if not norm(row.get("work_email") or row.get("email") or row.get("public_work_email")):
        failures.append("work_email_missing")
    if norm(row.get("email_verification_status")).lower() not in {"valid", "verified"}:
        failures.append("email_not_verified")
    if not truthy(row.get("suppression_checked")):
        failures.append("suppression_not_checked")
    if not norm(row.get("signal_class") or row.get("verified_signal")):
        failures.append("signal_missing")
    if not norm(row.get("signal_observed_at") or row.get("observed_at")):
        failures.append("signal_timing_missing")
    if not norm(row.get("opening_narrative")):
        failures.append("opening_narrative_missing")
    if truthy(row.get("suppressed")) or truthy(row.get("do_not_contact")):
        failures.append("suppressed_or_dnc")
    if truthy(row.get("identity_conflict")):
        failures.append("identity_conflict")
    if truthy(row.get("channel_conflict")) or norm(row.get("active_campaign")):
        failures.append("channel_conflict")
    if truthy(row.get("cap_exceeded")):
        failures.append("cap_exceeded")
    if truthy(row.get("dm_eligible")):
        failures.append("cold_ig_dm_must_be_off")
    return failures


def build(current: dict, rows: list[dict[str, str]], size: int, readiness: dict | None = None) -> tuple[dict, list[dict[str, str]]]:
    global_failures: list[str] = []
    readiness = readiness or {}
    if current.get("release_id") != CANON_RELEASE:
        global_failures.append("current_release_mismatch")
    if current.get("execution_allowed") is not False:
        global_failures.append("current_must_remain_execution_disallowed")
    if current.get("ready_for_warm") != 646:
        global_failures.append("current_ready_count_mismatch")
    for gate in REQUIRED_GLOBAL_GATES:
        if readiness.get(gate) is not True:
            global_failures.append(f"global_gate_not_ready:{gate}")
    seen: set[str] = set()
    eligible: list[dict[str, str]] = []
    rejected: dict[str, list[str]] = {}
    for row in rows:
        key = identity(row)
        failures = reason(row)
        if key in seen:
            failures.append("duplicate_identity")
        seen.add(key)
        if failures:
            rejected[key or f"row-{len(rejected)+1}"] = failures
        else:
            eligible.append(row)
    # Stable sorts keep tier as the primary key, then strength and freshness.
    eligible.sort(key=identity)
    eligible.sort(key=lambda r: norm(r.get("signal_observed_at") or r.get("observed_at")), reverse=True)
    eligible.sort(key=lambda r: float(norm(r.get("signal_score")) or 0), reverse=True)
    eligible.sort(key=lambda r: 0 if norm(r.get("qualification_tier")).upper() == "A" else 1)
    selected = eligible[:size]
    if not 30 <= size <= 50:
        global_failures.append("wave_size_request_out_of_range")
    if len(selected) != size:
        global_failures.append("insufficient_qa_clean_accounts")
    report = {
        "schema": "caesthetic-wave-no-write/v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "release_id": current.get("release_id"),
        "requested": size,
        "selected": len(selected),
        "rejected": len(rejected),
        "global_failures": global_failures,
        "rejection_reasons": rejected,
        "qa_pass": not global_failures and len(selected) == size,
        "approved": False,
        "execution_allowed": False,
        "writes_performed": False,
        "cold_ig_dm": "OFF",
        "checks": [
            "owner", "verified_email", "suppression", "identity", "caps",
            "channel_conflict", "deliverability", "score_route", "reply_capacity",
            "sprint_payment",
        ],
        "global_readiness": readiness,
    }
    return report, selected


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--current", type=Path, required=True)
    ap.add_argument("--accounts", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--size", type=int, default=40)
    ap.add_argument("--readiness", type=Path, required=True)
    ap.add_argument("--approve", action="store_true", help="mark manifest approved only after QA passes")
    args = ap.parse_args()
    current = json.loads(args.current.read_text(encoding="utf-8"))
    with args.accounts.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    readiness = json.loads(args.readiness.read_text(encoding="utf-8"))
    report, selected = build(current, rows, args.size, readiness)
    report["approved"] = bool(args.approve and report["qa_pass"])
    report["wave_status"] = "approved_no_write" if report["approved"] else "draft_fail_closed"
    report["selected_sha256"] = hashlib.sha256(
        "\n".join(identity(r) for r in selected).encode()
    ).hexdigest()
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / "manifest.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    if selected:
        with (args.out / "wave.csv").open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(selected[0]))
            writer.writeheader(); writer.writerows(selected)
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if report["qa_pass"] else 2)


if __name__ == "__main__":
    main()
