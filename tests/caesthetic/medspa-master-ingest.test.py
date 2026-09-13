from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts/caesthetic/medspa-discovery"))
from master_ingest import package_rows


class PackageTest(unittest.TestCase):
    def row(self, **changes):
        return {**dict(place_id="place-a", name="Example Clinic", city="Miami", country_code="US", category="Medical Spa", phone="3055550101", website="https://example.org"), **changes}

    def test_preserves_real_conflicts_and_ignores_only_obsolete_transfer_block(self):
        rows, skipped = package_rows([self.row(), self.row(place_id="place-b", name="Other")], [
            {"name": "Example Clinic", "blocker": "paid_csv_not_on_vds"},
            {"name": "Other", "blocker": "same_building_duplicate_review"}])
        self.assertEqual(len(rows), 1)
        self.assertEqual(skipped, {"same_building_duplicate_review": 1})
        self.assertIn("not_send_ready", rows[0]["tags"])
        self.assertNotIn("email", rows[0])

    def test_incomplete_and_wrong_category_sources_stay_out(self):
        rows, skipped = package_rows([self.row(country_code="CA"), self.row(category="Physical Therapist")], [])
        self.assertEqual(rows, [])
        self.assertEqual(sum(skipped.values()), 2)

    def test_duplicate_place_with_changed_identity_is_not_collapsed(self):
        with self.assertRaisesRegex(ValueError, "source_identity_conflict"):
            package_rows([self.row(), self.row(phone="3055550102")], [])

    def test_punctuation_does_not_erase_known_blocker(self):
        rows, _ = package_rows([self.row(name="Example’s Clinic")], [{"name": "Example's Clinic", "blocker": "identity_conflict"}])
        self.assertEqual(rows, [])


if __name__ == "__main__":
    unittest.main()
