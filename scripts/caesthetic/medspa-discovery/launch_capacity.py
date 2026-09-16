"""Size a reviewed launch campaign within the existing sender account limit."""
from urllib.parse import quote
from outreach import resolve_canary_evidence

def configure(store, repo, campaign_id, params, api):
    limit = params.get("campaign_daily_limit")
    if type(limit) is not int or not 1 <= limit <= 15:
        return {"ok": False, "status": "blocked", "error": "invalid_launch_campaign_limit"}
    evidence = resolve_canary_evidence(store, repo, params)
    if not evidence.get("ok"):
        return {"ok": False, "status": "blocked", "error": evidence.get("error")}
    code, campaign = api("GET", "/api/v2/campaigns/" + campaign_id)
    senders = campaign.get("email_list") if isinstance(campaign, dict) else None
    if code != 200 or not isinstance(senders, list) or len(senders) != 1:
        return {"ok": False, "status": "blocked", "error": "launch_sender_scope_unresolved"}
    code, account = api("GET", "/api/v2/accounts/" + quote(senders[0], safe=""))
    if code != 200 or account.get("status") != 1 or account.get("setup_pending") or int(account.get("daily_limit") or 0) < limit:
        return {"ok": False, "status": "blocked", "error": "launch_limit_exceeds_existing_account_capacity"}
    code, _ = api("PATCH", "/api/v2/campaigns/" + campaign_id, {"daily_limit": limit, "daily_max_leads": limit})
    if code != 200:
        return {"ok": False, "status": "error", "error": "campaign_limit_update_failed"}
    code, current = api("GET", "/api/v2/campaigns/" + campaign_id)
    if code != 200 or any(current.get(k) != limit for k in ("daily_limit", "daily_max_leads")):
        return {"ok": False, "status": "blocked", "error": "campaign_limit_readback_failed"}
    return {"ok": True, "campaign_daily_limit": limit, "existing_account_daily_limit": account["daily_limit"], "account_limit_changed": False}
