import csv
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts/caesthetic/medspa-discovery"))
from company_resolution import CompanyResolver


class ResolutionTest(unittest.TestCase):
    def masters(self, root, companies, contacts=()):
        for name, fields, rows in [
            ("master_companies.csv", ["company_id", "company_name", "city", "country", "phone", "map_url", "do_not_contact"], companies),
            ("master_contacts.csv", ["company_id", "do_not_contact"], contacts),
        ]:
            with (root / name).open("w", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=fields)
                writer.writeheader()
                writer.writerows(rows)

    def company(self, cid="canonical-a", **extra):
        return dict(company_id=cid, company_name="Example Clinic", city="Miami", country="US", phone="+1 305 555 0101", map_url="https://maps.google.com/?query_place_id=place-a", do_not_contact="false", **extra)

    def test_exact_identity_and_linked_contact_refusal(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.masters(root, [self.company()])
            resolver = CompanyResolver(root)
            self.assertEqual(resolver.resolve({"place_id": "place-a"}), ("canonical-a", "exact_maps_identity"))
            self.assertEqual(resolver.resolve({"phone": "3055550101", "name": "Example Clinic", "city": "Miami"}), ("canonical-a", "exact_us_phone_name_city"))
            self.masters(root, [self.company()], [{"company_id": "canonical-a", "do_not_contact": "true"}])
            self.assertEqual(CompanyResolver(root).resolve({"place_id": "place-a"})[1], "canonical_company_do_not_contact")

    def test_conflicting_exact_keys_do_not_choose(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            second = self.company("canonical-b")
            second["map_url"] = "https://maps.google.com/?query_place_id=place-b"
            self.masters(root, [self.company(), second])
            self.assertEqual(CompanyResolver(root).resolve({"phone": "3055550101", "name": "Example Clinic", "city": "Miami"})[1], "canonical_company_match_conflict")

    def test_missing_and_unknown_suppression_fail_closed(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.assertEqual(CompanyResolver(root).error, "canonical_master_files_missing")
            row = self.company()
            row["do_not_contact"] = "unknown"
            self.masters(root, [row])
            self.assertEqual(CompanyResolver(root).error, "canonical_master_data_invalid")

    def test_name_only_or_supplied_id_is_not_evidence(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.masters(root, [self.company()])
            resolver = CompanyResolver(root)
            rows, summary = resolver.bind([{"company_id": "canonical-a", "name": "Example Clinic", "email": "private@example.org"}])
            self.assertNotIn("company_id", rows[0])
            self.assertEqual(summary["reasons"], {"canonical_company_not_matched": 1})
            self.assertNotIn("private", str(summary))


if __name__ == "__main__":
    unittest.main()
