"""CAESTHETIC Phase-1 fail-close for student/VOC Phase-0 paths.

SSOT: docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md §12 · DEC-812
Override (OFF by default): CAE_PHASE0_STUDENT_VOC_ALLOW=1
"""
from __future__ import annotations

import os
import sys

OVERRIDE_ENV = "CAE_PHASE0_STUDENT_VOC_ALLOW"
CODE = "PHASE1_FAIL_CLOSE"
CANON = "docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md"


def override_enabled() -> bool:
    return (os.environ.get(OVERRIDE_ENV) or "").strip().lower() in {"1", "true", "yes", "on"}


def refuse(entrypoint: str, *, stream=None) -> int:
    """Print refuse message and return non-zero exit code."""
    out = stream or sys.stderr
    print(
        f"{CODE}: {entrypoint} is fail-closed for CAESTHETIC Phase-1.\n"
        f"  Student/VOC/academy Phase-0 paths must not drive @caesthetic.growth.\n"
        f"  Canon: {CANON} (§12 supersession) · DEC-812\n"
        f"  Founder override (OFF by default): {OVERRIDE_ENV}=1",
        file=out,
    )
    return 78  # EX_CONFIG-style; non-zero for cron/CI


def require_or_exit(entrypoint: str) -> None:
    if override_enabled():
        print(
            f"{CODE}_OVERRIDE: {entrypoint} running with {OVERRIDE_ENV}=1 "
            f"(founder-only; not Phase-1 default)",
            file=sys.stderr,
        )
        return
    raise SystemExit(refuse(entrypoint))
