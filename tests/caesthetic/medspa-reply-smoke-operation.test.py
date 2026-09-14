"""Static guard for the non-destructive reply-state smoke operation."""
from pathlib import Path


def test_reply_smoke_has_no_provider_io_and_tests_both_outcomes():
    source = (Path(__file__).resolve().parents[2] / "scripts/caesthetic/medspa-discovery/run.py").read_text()
    assert '"reply_smoke"' in source
    assert 'mode": "isolated_no_provider_io"' in source
    assert '"notify_interested"' in source
    assert '"sync_shared_do_not_contact"' in source
    assert '"provider_inbound_adapter": "not_exercised"' in source
