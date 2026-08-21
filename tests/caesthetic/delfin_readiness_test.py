import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "scripts/vps2402/sanitize-delfin-readiness.py"
SPEC = importlib.util.spec_from_file_location("delfin_readiness", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class DelfinReadinessTest(unittest.TestCase):
    def test_every_registered_surface_gets_a_terminal_classification(self):
        registry = yaml.safe_load((ROOT / "docs/ssot/data/social-account-registry.yaml").read_text())
        for account in registry["accounts"]:
            for surface in account.get("social_accounts", []):
                readiness, reason = MODULE.classify_surface(account, surface, None)
                self.assertIn(
                    readiness,
                    {"POLICY_READY", "HUMAN_ONLY_READY", "DRAFT_ONLY_READY", "BLOCKED"},
                )
                self.assertTrue(reason)

    def test_live_executable_surface_requires_runtime_and_action_policy(self):
        account = {
            "activation_gate": {"status": "clear"},
            "adapter_capabilities": {"linkedin": {"execute": True}},
            "limits": {
                "comment_daily": 3,
                "cooldown": {"same_person_substantive_comment_days": 7},
            },
            "autonomy": {"actions": {"comment": "assisted"}},
        }
        surface = {
            "status": "live",
            "platform": "linkedin",
            "access_mode": "dolphin_browser",
            "write_mode": "factory",
        }
        self.assertEqual(MODULE.classify_surface(account, surface, None)[0], "BLOCKED")
        observed = {"status": "PASS", "session_state": "session_and_surface_verified"}
        self.assertEqual(
            MODULE.classify_surface(account, surface, observed),
            ("AUTOMATION_READY", "runtime_and_policy_verified"),
        )

    def test_assisted_action_with_null_limit_fails_closed(self):
        account = {
            "activation_gate": {"status": "clear"},
            "adapter_capabilities": {"linkedin": {"execute": True}},
            "limits": {"comment_daily": None, "cooldown": None},
            "autonomy": {"actions": {"comment": "assisted"}},
        }
        surface = {
            "status": "live",
            "platform": "linkedin",
            "access_mode": "dolphin_browser",
            "write_mode": "factory",
        }
        observed = {"status": "PASS", "session_state": "session_and_surface_verified"}
        self.assertEqual(
            MODULE.classify_surface(account, surface, observed),
            ("BLOCKED", "action_policy_incomplete"),
        )

    def test_observe_only_surface_is_policy_ready_after_runtime_pass(self):
        account = {
            "activation_gate": {"status": "clear"},
            "adapter_capabilities": {"linkedin": {"execute": True}},
            "limits": {},
            "autonomy": {"actions": {"read": "observe", "comment": "observe"}},
        }
        surface = {
            "status": "live",
            "platform": "linkedin",
            "access_mode": "dolphin_browser",
            "write_mode": "factory",
        }
        observed = {"status": "PASS", "session_state": "session_and_surface_verified"}
        self.assertEqual(
            MODULE.classify_surface(account, surface, observed),
            ("POLICY_READY", "observe_only_canon"),
        )

    def test_human_only_and_missing_adapter_are_not_false_blockers(self):
        human_account = {"activation_gate": {"status": "clear"}}
        human_surface = {
            "status": "live",
            "platform": "linkedin",
            "access_mode": "human_only",
            "write_mode": "blocked",
        }
        self.assertEqual(
            MODULE.classify_surface(human_account, human_surface, None),
            ("HUMAN_ONLY_READY", "human_only_canon"),
        )
        draft_account = {
            "activation_gate": {"status": "clear"},
            "adapter_capabilities": {"instagram": {"draft": True, "execute": False}},
        }
        draft_surface = {
            "status": "live",
            "platform": "instagram",
            "access_mode": "agent_browser",
            "write_mode": "draft_then_human",
        }
        observed = {"status": "PASS", "session_state": "session_and_surface_verified"}
        self.assertEqual(
            MODULE.classify_surface(draft_account, draft_surface, observed),
            ("DRAFT_ONLY_READY", "execute_adapter_unavailable"),
        )

    def test_unbound_human_publish_and_retired_inventory_are_policy_terminal(self):
        account = {
            "activation_gate": {"status": "clear"},
            "adapter_capabilities": {"instagram": {"draft": True, "execute": False}},
        }
        live_draft = {
            "status": "live",
            "platform": "instagram",
            "access_mode": "none",
            "write_mode": "draft_then_human",
        }
        retired = {
            "status": "blocked",
            "platform": "instagram",
            "access_mode": "none",
            "write_mode": "blocked",
        }
        self.assertEqual(
            MODULE.classify_surface(account, live_draft, None),
            ("DRAFT_ONLY_READY", "human_publish_unbound"),
        )
        self.assertEqual(
            MODULE.classify_surface(account, retired, None),
            ("POLICY_READY", "surface_blocked_by_canon"),
        )

    def test_audit_script_contains_every_dolphin_profile_and_fixed_output_path(self):
        source = (ROOT / "services/social-browser-operator/scripts/run-delfin-account-audit.mjs").read_text()
        for profile_id in ("833304152", "830274558", "716127845", "715028646", "701185900"):
            self.assertIn(f'profile_id: "{profile_id}"', source)
        self.assertIn("const tmp = `${outPath}.${process.pid}.tmp`;", source)
        self.assertIn("const navigateWithRetry = async", source)
        self.assertIn("[20_000, 30_000, 30_000]", source)
        self.assertIn("for (let attempt = 0; attempt < 3", source)
        self.assertIn("observedHost.endsWith", source)
        self.assertIn("const startOperatorWithRetry = async", source)
        self.assertIn("const recoverPage = async", source)
        self.assertIn("await startOperatorWithRetry(profile.profile_id)", source)
        self.assertIn("let activePlatform = null", source)
        self.assertIn("attempt < 3", source)
        self.assertIn("settledHost", source)
        self.assertIn("operator_recovery_failed", source)
        self.assertIn("release window", source)
        self.assertIn('"dolphin_operator_metadata"', source)
        self.assertIn('"authenticated_self_route"', source)
        self.assertNotIn('surface_id: "B_CAE_LI"', source)
        self.assertNotIn('surface_id: "B_CAE_FB"', source)
        self.assertNotIn('surface_id: "B_TXF_LI"', source)
        self.assertNotIn('surface_id: "B_TXF_FB"', source)
        self.assertNotIn("ouutPath", source)

    def test_deploy_workflow_requires_fresh_post_deploy_audit(self):
        workflow = (ROOT / ".github/workflows/delfin-runtime-readiness-once.yml").read_text()
        self.assertIn("while systemctl is-active --quiet delfin-account-audit.service", workflow)
        self.assertIn("systemctl stop valeriia-factory.service", workflow)
        self.assertIn("systemctl start valeriia-factory.service", workflow)
        self.assertIn("audit_marker=", workflow)
        self.assertIn('-newer "$audit_marker"', workflow)


if __name__ == "__main__":
    unittest.main()
