import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODULE_PATH = ROOT / "scripts/caesthetic/evidence/resolve-account.py"
SPEC = importlib.util.spec_from_file_location("cae_resolve_account", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)

FIXTURE_REGISTRY = {
    "accounts": [
        {
            "id": "ready-account",
            "owner_name": "Ready Owner",
            "contours": ["caesthetic"],
            "dolphin_profile_id": "111",
            "factory": {"status": "pilot"},
            "adapter_capabilities": {"instagram": {"read": True, "draft": True, "execute": True, "verify": True}},
            "activation_gate": {
                "status": "clear",
                "checks": {
                    "onboarding_complete": True,
                    "truth_pack_resolved": True,
                    "policy_complete": True,
                    "adapter_verified": True,
                    "shadow_evidence": True,
                },
            },
            "social_accounts": [
                {
                    "surface_account_id": "ready-account-instagram",
                    "platform": "instagram",
                    "handle": "ready",
                    "url": "https://instagram.com/ready",
                    "status": "live",
                    "write_mode": "factory",
                    "approval_mode": "owner_review",
                    "content_formats": ["reel"],
                    "sheet_surface_id": "B_READY",
                }
            ],
        },
        {
            "id": "blocked-account",
            "owner_name": "Blocked Owner",
            "contours": ["caesthetic"],
            "dolphin_profile_id": "222",
            "factory": {"status": "pilot"},
            "adapter_capabilities": {"instagram": {"read": True, "draft": True, "execute": False, "verify": False}},
            "activation_gate": {
                "status": "blocked",
                "checks": {
                    "onboarding_complete": False,
                    "truth_pack_resolved": False,
                    "policy_complete": False,
                    "adapter_verified": False,
                    "shadow_evidence": False,
                },
            },
            "social_accounts": [
                {
                    "surface_account_id": "blocked-account-instagram",
                    "platform": "instagram",
                    "handle": "blocked",
                    "url": "https://instagram.com/blocked",
                    "status": "live",
                    "write_mode": "factory",
                    "approval_mode": "owner_review",
                    "content_formats": ["reel"],
                    "sheet_surface_id": "B_BLOCKED",
                }
            ],
        },
        {
            "id": "other-contour-account",
            "owner_name": "Other Owner",
            "contours": ["development"],
            "dolphin_profile_id": "333",
            "factory": {"status": "pilot"},
            "adapter_capabilities": {},
            "activation_gate": {"status": "blocked", "checks": {}},
            "social_accounts": [
                {
                    "surface_account_id": "other-account-linkedin",
                    "platform": "linkedin",
                    "status": "live",
                    "write_mode": "factory",
                    "approval_mode": "owner_review",
                    "content_formats": ["feed_post"],
                }
            ],
        },
    ]
}


class ResolveAccountTest(unittest.TestCase):
    def setUp(self):
        self.rows = MODULE.flatten_surfaces(FIXTURE_REGISTRY)

    def test_flatten_surfaces_produces_one_row_per_social_account(self):
        self.assertEqual(len(self.rows), 3)

    def test_resolve_by_contour_and_platform(self):
        matches = MODULE.resolve(self.rows, contour="caesthetic", platform="instagram")
        self.assertEqual({m["surface_account_id"] for m in matches}, {"ready-account-instagram", "blocked-account-instagram"})

    def test_resolve_excludes_other_contours(self):
        matches = MODULE.resolve(self.rows, contour="caesthetic")
        self.assertNotIn("other-account-linkedin", {m["surface_account_id"] for m in matches})

    def test_resolve_by_surface_id_is_exact(self):
        matches = MODULE.resolve(self.rows, surface_id="ready-account-instagram")
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["account_id"], "ready-account")

    def test_publish_readiness_true_only_when_every_gate_clears(self):
        ready_row = next(r for r in self.rows if r["surface_account_id"] == "ready-account-instagram")
        readiness = MODULE.publish_readiness(ready_row)
        self.assertEqual(readiness, {"ready": True, "blocking_reasons": []})

    def test_publish_readiness_false_reports_every_real_reason(self):
        blocked_row = next(r for r in self.rows if r["surface_account_id"] == "blocked-account-instagram")
        readiness = MODULE.publish_readiness(blocked_row)
        self.assertFalse(readiness["ready"])
        self.assertTrue(any("execute is false" in reason for reason in readiness["blocking_reasons"]))
        self.assertTrue(any("activation_gate.status" in reason for reason in readiness["blocking_reasons"]))
        # Every failing check is named individually, not just a generic "blocked".
        self.assertEqual(
            sum(1 for r in readiness["blocking_reasons"] if r.startswith("activation_gate.checks.")),
            5,
        )

    def test_missing_registry_file_fails_closed_not_silently(self):
        with self.assertRaises(FileNotFoundError):
            MODULE.load_registry(Path("/tmp/definitely-does-not-exist-cae-registry.yaml"))

    def test_real_registry_file_parses_and_caesthetic_ig_is_present(self):
        # Guards against the fixture drifting from the real schema: the actual
        # committed registry must still parse and contain the known surface.
        real_path = ROOT / "docs/ssot/data/social-account-registry.yaml"
        registry = MODULE.load_registry(real_path)
        rows = MODULE.flatten_surfaces(registry)
        matches = MODULE.resolve(rows, surface_id="valeria-lana-caesthetic-instagram")
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["platform"], "instagram")
        # As of this writing CAESTHETIC IG is not yet publish-ready — this
        # test intentionally fails loudly (not silently xfails) the day it is,
        # as a signal to update DEC-842's publish-request.mjs assumptions.
        readiness = MODULE.publish_readiness(matches[0])
        self.assertFalse(readiness["ready"])

    def test_real_registry_has_no_blanket_trigger_block(self):
        registry = MODULE.load_registry(ROOT / "docs/ssot/data/social-account-registry.yaml")
        defaults = registry["defaults"]
        self.assertEqual(defaults["write_mode"], "policy_controlled")
        self.assertEqual(defaults["activation_gate_default"], "clear")
        self.assertEqual(
            defaults["trigger_policy"]["authorized_agents"],
            "any_authorized_ecosystem_agent",
        )
        for account in registry["accounts"]:
            gate = account.get("activation_gate")
            if gate is not None:
                self.assertEqual(gate["status"], "clear", account["id"])
                self.assertTrue(gate["checks"]["global_trigger_authorized"], account["id"])

    def test_unblock_preserves_specific_surface_and_adapter_boundaries(self):
        registry = MODULE.load_registry(ROOT / "docs/ssot/data/social-account-registry.yaml")
        accounts = {account["id"]: account for account in registry["accounts"]}

        # Explicit human-only and absent-surface blocks are still binding.
        meagan = accounts["meagan-hulsinger"]["social_accounts"][0]
        self.assertEqual(meagan["access_mode"], "human_only")
        self.assertEqual(meagan["write_mode"], "blocked")
        simon_ig = accounts["simon-subic"]["social_accounts"][1]
        self.assertEqual(simon_ig["status"], "absent")
        self.assertEqual(simon_ig["write_mode"], "blocked")

        # Existing LinkedIn/Facebook adapters may execute subject to action
        # policy; the still-missing Instagram adapter remains truthful.
        valeria_caps = accounts["valeria-lana"]["adapter_capabilities"]
        self.assertTrue(valeria_caps["linkedin"]["execute"])
        self.assertTrue(valeria_caps["facebook"]["execute"])
        self.assertFalse(valeria_caps["instagram"]["execute"])


if __name__ == "__main__":
    unittest.main()
