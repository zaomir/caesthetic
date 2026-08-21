import importlib.util
from pathlib import Path
import unittest

PATH = Path(__file__).parents[2] / "scripts/caesthetic/cae_wave1_no_write.py"
SPEC = importlib.util.spec_from_file_location("wave", PATH)
wave = importlib.util.module_from_spec(SPEC); SPEC.loader.exec_module(wave)


def row(i, **overrides):
    value = {
        "account_id": f"acct-{i}", "qualification_tier": "B",
        "owner_candidate": "Owner", "signal_class": "new_provider",
        "work_email": "owner@practice.example", "email_verification_status": "verified",
        "suppression_checked": "true",
        "signal_observed_at": "2026-08-20", "opening_narrative": "NEW_PROVIDER",
        "suppressed": "false", "do_not_contact": "false",
        "identity_conflict": "false", "channel_conflict": "false",
        "active_campaign": "", "cap_exceeded": "false", "dm_eligible": "false",
    }
    value.update(overrides); return value


class WaveNoWriteTest(unittest.TestCase):
    def current(self):
        return {"release_id": wave.CANON_RELEASE, "execution_allowed": False, "ready_for_warm": 646}

    def readiness(self):
        return {gate: True for gate in wave.REQUIRED_GLOBAL_GATES}

    def test_clean_40_passes_but_never_enables_execution(self):
        report, selected = wave.build(self.current(), [row(i) for i in range(40)], 40, self.readiness())
        self.assertTrue(report["qa_pass"]); self.assertEqual(len(selected), 40)
        self.assertFalse(report["execution_allowed"]); self.assertEqual(report["cold_ig_dm"], "OFF")

    def test_suppression_conflict_cap_and_dm_fail_closed(self):
        rows = [row(i) for i in range(40)]
        rows[0].update(suppressed="true")
        rows[1].update(identity_conflict="true")
        rows[2].update(cap_exceeded="true")
        rows[3].update(dm_eligible="true")
        report, _ = wave.build(self.current(), rows, 40, self.readiness())
        self.assertFalse(report["qa_pass"])
        reasons = {x for failures in report["rejection_reasons"].values() for x in failures}
        self.assertTrue({"suppressed_or_dnc", "identity_conflict", "cap_exceeded", "cold_ig_dm_must_be_off"} <= reasons)

    def test_wrong_current_fails(self):
        current = self.current(); current["release_id"] = "racing-660"
        report, _ = wave.build(current, [row(i) for i in range(40)], 40, self.readiness())
        self.assertIn("current_release_mismatch", report["global_failures"])

    def test_fresher_signal_wins_after_equal_signal_score(self):
        rows = [row(i, signal_score="80") for i in range(40)]
        rows[0].update(signal_observed_at="2026-08-01")
        rows[1].update(signal_observed_at="2026-08-21")
        report, selected = wave.build(self.current(), rows, 30, self.readiness())
        self.assertTrue(report["qa_pass"])
        self.assertEqual(selected[0]["account_id"], "acct-1")
        self.assertNotIn("acct-0", [item["account_id"] for item in selected])

    def test_email_and_global_gates_fail_closed(self):
        rows = [row(i) for i in range(40)]
        rows[0].update(work_email="")
        readiness = self.readiness(); readiness["sprint_payment_ready"] = False
        report, _ = wave.build(self.current(), rows, 40, readiness)
        self.assertIn("global_gate_not_ready:sprint_payment_ready", report["global_failures"])
        self.assertIn("work_email_missing", report["rejection_reasons"]["acct-0"])


if __name__ == "__main__": unittest.main()
