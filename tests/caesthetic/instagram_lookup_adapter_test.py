import csv
import importlib.util
import inspect
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MODULE_PATH = ROOT / "scripts/caesthetic/sync_instagram_lookup_projection.py"
SPEC = importlib.util.spec_from_file_location("cae_lookup_sync", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class InstagramLookupAdapterTest(unittest.TestCase):
    def test_normalization_is_explicit_not_fuzzy(self):
        self.assertEqual(MODULE.normalize_username("@Practice.Name"), "practice.name")
        self.assertEqual(
            MODULE.normalize_username("https://instagram.com/Practice.Name/"),
            "practice.name",
        )
        self.assertEqual(MODULE.normalize_username("practice-name"), "")
        self.assertEqual(MODULE.normalize_username("practice name"), "")

    def test_conflicting_exact_values_fail_closed(self):
        self.assertEqual(MODULE.exact_consensus(["A", "a"]), "A")
        self.assertEqual(MODULE.exact_consensus(["A", "B"]), "")
        self.assertEqual(MODULE.exact_consensus(["", "A"]), "A")

    def test_projection_joins_only_the_exact_normalized_username(self):
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            release = folder / "release.csv"
            master = folder / "master_companies.csv"
            with release.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(
                    handle,
                    fieldnames=["username", "business_name", "city", "state"],
                )
                writer.writeheader()
                writer.writerow(
                    {
                        "username": "Exact.Practice",
                        "business_name": "",
                        "city": "Austin",
                        "state": "TX",
                    }
                )
                writer.writerow(
                    {
                        "username": "missing.fields",
                        "business_name": "Known Name",
                        "city": "",
                        "state": "",
                    }
                )
            with master.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(
                    handle,
                    fieldnames=["instagram", "company_name", "website"],
                )
                writer.writeheader()
                writer.writerow(
                    {
                        "instagram": "@exact.practice",
                        "company_name": "Exact Practice",
                        "website": "https://exact.example",
                    }
                )
                writer.writerow(
                    {
                        "instagram": "exact.practice.extra",
                        "company_name": "Wrong Similar Practice",
                        "website": "https://wrong.example",
                    }
                )

            rows = MODULE.load_release_rows(release, [])
            projection, matches = MODULE.exact_master_enrichment(rows, master)

        self.assertEqual(matches, 1)
        self.assertEqual(
            projection[0],
            {
                "username_normalized": "exact.practice",
                "practice_name": "Exact Practice",
                "city_state": "Austin, TX",
                "website": "https://exact.example",
            },
        )
        self.assertEqual(
            projection[1],
            {
                "username_normalized": "missing.fields",
                "practice_name": "Known Name",
                "city_state": "",
                "website": "",
            },
        )

    def test_deny_overlay_is_removed_without_changing_other_rows(self):
        with tempfile.TemporaryDirectory() as temp:
            release = Path(temp) / "release.csv"
            with release.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.DictWriter(
                    handle,
                    fieldnames=["username", "business_name", "city", "state"],
                )
                writer.writeheader()
                writer.writerow({"username": "keep.me", "business_name": "Keep"})
                writer.writerow({"username": "deny.me", "business_name": "Deny"})
            rows = MODULE.load_release_rows(release, ["@DENY.ME"])
        self.assertEqual([row["username_normalized"] for row in rows], ["keep.me"])

    def test_live_smoke_sends_the_lookup_token(self):
        source = inspect.getsource(MODULE.post_lookup)
        self.assertIn('"X-Lookup-Token": token', source)


if __name__ == "__main__":
    unittest.main()
