import importlib.util
import unittest
from pathlib import Path

MODULE = Path(__file__).parents[2] / "scripts/caesthetic/cae_wave1_public_enrich.py"
spec = importlib.util.spec_from_file_location("enrich", MODULE)
enrich = importlib.util.module_from_spec(spec)
spec.loader.exec_module(enrich)


class EnrichmentTests(unittest.TestCase):
    def test_email_filter_rejects_placeholders_and_accepts_work_email(self):
        self.assertTrue(enrich.allowed_email("owner@practice.com"))
        self.assertFalse(enrich.allowed_email("name@example.com"))
        self.assertFalse(enrich.allowed_email("x@sentry.io"))
        self.assertFalse(enrich.allowed_email("user123@email.com"))
        self.assertFalse(enrich.allowed_email("u0022info@practice.com"))

    def test_owner_pattern_requires_role_and_person_name(self):
        text = "Our founder Jane Marie Smith opened the practice."
        self.assertEqual(enrich.OWNER_RE.search(text).group(1), "Jane Marie Smith")


if __name__ == "__main__":
    unittest.main()
