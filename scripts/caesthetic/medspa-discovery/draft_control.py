"""Configure the versioned NYLA factory draft only; never import or activate."""
import json
import uuid

MANIFEST = "docs/ops/caesthetic-new-medspa-discovery/campaign-20260914-nyla.json"
NAME = "CAESTHETIC | Free Growth Score | EN | Wave 20260914 NYLA"
CONTROLS = {"stop_for_company": True, "stop_on_reply": True,
            "stop_on_auto_reply": True, "insert_unsubscribe_header": True,
            "disable_bounce_protect": False, "open_tracking": False,
            "link_tracking": False, "daily_max_leads": 3}


def _configure_draft(repo, api):
    try:
        doc = json.loads((repo / MANIFEST).read_text())
        cid = str(uuid.UUID(doc["instantly_campaign_id"]))
        if doc.get("campaign_id_internal") != "caesthetic-discovery-20260914-nyla":
            raise ValueError()
    except (OSError, ValueError, KeyError, TypeError):
        return {"ok": False, "error": "factory_manifest_invalid"}
    code, before = api("GET", f"/api/v2/campaigns/{cid}")
    if code != 200 or not isinstance(before, dict):
        return {"ok": False, "error": "draft_read_failed", "http": code}
    if (before.get("id") != cid or before.get("status") != 0 or
            before.get("name") != NAME or before.get("email_list") != ["valerie@caesthetic.co"]):
        return {"ok": False, "error": "draft_identity_or_state_mismatch"}
    # Refuse a modified sequence; this operation cannot approve arbitrary copy.
    if before.get("sequences") != doc.get("provider_sequence_readback"):
        return {"ok": False, "error": "draft_sequence_changed"}
    needs_patch = any(before.get(k) != v for k, v in CONTROLS.items())
    if needs_patch:
        code, _ = api("PATCH", f"/api/v2/campaigns/{cid}", CONTROLS)
        if code != 200:
            return {"ok": False, "error": "draft_controls_patch_uncertain", "http": code}
    code, after = api("GET", f"/api/v2/campaigns/{cid}")
    passed = (code == 200 and isinstance(after, dict) and after.get("id") == cid
              and after.get("status") == 0 and after.get("name") == NAME
              and after.get("email_list") == before.get("email_list")
              and after.get("sequences") == before.get("sequences")
              and all(after.get(k) == v for k, v in CONTROLS.items()))
    return {"ok": passed, "status": "success" if passed else "blocked",
            "error": None if passed else "draft_controls_readback_failed",
            "campaign_id": cid, "version": "factory-draft-controls-v1",
            "patched": needs_patch, "draft_verified": passed,
            "import_attempted": False, "activation_attempted": False}


def configure_draft(repo, api):
    """Do not let provider/client TypeErrors hide the control-plane failure."""
    try:
        return _configure_draft(repo, api)
    except TypeError:
        return {
            "ok": False,
            "status": "blocked",
            "error": "draft_control_provider_type_error",
            "version": "factory-draft-controls-v2",
            "import_attempted": False,
            "activation_attempted": False,
        }


def _lead_items(payload):
    if isinstance(payload, dict) and isinstance(payload.get("items"), list):
        return payload.get("items")
    if isinstance(payload, list):
        return payload
    return None


def _activate_imported_canary(repo, api):
    """Activate exactly one pre-imported NY/LA canary only after full readback."""
    configured = configure_draft(repo, api)
    if not configured.get("ok"):
        return {**configured, "activation_attempted": False}
    cid = configured["campaign_id"]
    code, analytics = api("GET", f"/api/v2/campaigns/analytics?ids={cid}")
    metric = analytics[0] if isinstance(analytics, list) and len(analytics) == 1 else None
    expected = {
        "contacted_count": 0,
        "emails_sent_count": 0,
        "bounced_count": 0,
        "reply_count": 0,
        "unsubscribed_count": 0,
    }
    if code != 200 or not isinstance(metric, dict) or any(metric.get(k) != v for k, v in expected.items()):
        return {
            "ok": False, "status": "blocked", "error": "canary_analytics_not_pristine",
            "campaign_id": cid, "activation_attempted": False, "import_attempted": False,
        }
    # Instantly's aggregate can lag lead-import acceptance. Read the lead list
    # directly, bounded to two records, before allowing a one-lead activation.
    l_code, leads = api("GET", f"/api/v2/leads?campaign_id={cid}&limit=2")
    items = _lead_items(leads)
    if l_code != 200 or not isinstance(items, list) or len(items) != 1:
        l_code, leads = api("POST", "/api/v2/leads/list", {"campaign": cid, "limit": 2})
        items = _lead_items(leads)
    if l_code != 200 or not isinstance(items, list) or len(items) != 1:
        return {
            "ok": False, "status": "blocked", "error": "canary_direct_lead_count_not_one",
            "campaign_id": cid, "activation_attempted": False, "import_attempted": False,
        }
    code, _ = api("POST", f"/api/v2/campaigns/{cid}/activate")
    if code != 200:
        return {
            "ok": False, "status": "blocked", "error": "campaign_activation_uncertain",
            "campaign_id": cid, "http": code, "activation_attempted": True, "import_attempted": False,
        }
    code, after = api("GET", f"/api/v2/campaigns/{cid}")
    passed = (code == 200 and isinstance(after, dict) and after.get("id") == cid
              and after.get("status") == 1 and after.get("name") == NAME
              and after.get("email_list") == ["valerie@caesthetic.co"]
              and after.get("sequences") == json.loads((repo / MANIFEST).read_text()).get("provider_sequence_readback")
              and all(after.get(k) == v for k, v in CONTROLS.items()))
    return {
        "ok": passed, "status": "success" if passed else "blocked",
        "error": None if passed else "campaign_activation_readback_failed",
        "campaign_id": cid, "version": "factory-activate-canary-v1",
        "activation_attempted": True, "activated": passed, "import_attempted": False,
        "expected_pre_activation": {**expected, "analytics_leads_count": (metric or {}).get("leads_count")},
    }


def activate_imported_canary(repo, api):
    """Do not let provider/client TypeErrors hide the activation-plane failure."""
    try:
        return _activate_imported_canary(repo, api)
    except TypeError:
        return {
            "ok": False,
            "status": "blocked",
            "error": "activation_provider_type_error",
            "version": "factory-activate-canary-v2",
            "import_attempted": False,
            "activation_attempted": False,
        }
