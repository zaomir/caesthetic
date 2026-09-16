"""Approved catalog types. Category membership is discovery eligibility, not send clearance."""
import json
from pathlib import Path

GEO_PATH = Path(__file__).resolve().parents[3] / "docs/ops/caesthetic-new-medspa-discovery/discovery-geography.json"

def approved_types():
    doc = json.loads(GEO_PATH.read_text(encoding="utf-8"))
    return {str(category).strip().lower()
            for niche in doc.get("niches", [{"enabled": True, "types": ["medical spa"]}])
            if niche.get("enabled")
            for category in niche.get("types", [])}

def validate_types(types):
    allowed = approved_types()
    if not isinstance(types, list) or not types or any(not isinstance(t, str) or t not in allowed for t in types):
        raise ValueError("unapproved_discovery_category")
    return list(dict.fromkeys(types))

def source_category_allowed(value):
    return isinstance(value, str) and value.strip().lower() in approved_types()
