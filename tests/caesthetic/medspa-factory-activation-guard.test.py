"""Static guard: activation has exact preconditions and direct readback."""
from pathlib import Path


def test_activation_is_limited_to_a_pristine_one_lead_canary():
    source = (Path(__file__).resolve().parents[2] / "scripts/caesthetic/medspa-discovery/draft_control.py").read_text()
    assert "def activate_imported_canary" in source
    assert '"/api/v2/leads?campaign_id={cid}&limit=2"' in source
    assert '"/api/v2/leads/list"' in source
    assert "canary_direct_lead_count_not_one" in source
    assert "activation_provider_type_error" in source
    assert '"emails_sent_count": 0' in source
    assert '"/activate"' in source
    assert 'after.get("status") == 1' in source


def test_activation_is_an_explicit_control_action():
    source = (Path(__file__).resolve().parents[2] / "scripts/caesthetic/medspa-discovery/run.py").read_text()
    assert 'params.get("action") == "activate_factory_canary"' in source
