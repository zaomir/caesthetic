import contextlib
import csv
import io
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts/outreach"))
import ingest


class StdlibIngestTest(unittest.TestCase):
    def setUp(self):
        self.old_pd = ingest.pd
        ingest.pd = None

    def tearDown(self):
        ingest.pd = self.old_pd

    def test_canonical_apply_replay_and_refusal_are_preserved(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            replacements = dict(MASTER_DIR=root / "master", COMPANIES_PATH=root / "master/companies.csv", CONTACTS_PATH=root / "master/contacts.csv", RAW_ARCHIVE_DIR=root / "archive", INBOX_LOG=root / "ingest.jsonl", UNMATCHED_DIR=root / "unmatched")
            original = {key: getattr(ingest, key) for key in replacements}
            try:
                for key, value in replacements.items():
                    setattr(ingest, key, value)
                source = root / "companies.csv"
                def write(stop):
                    source.write_text("company_name,city,phone,country,do_not_contact\nExample Clinic,Miami,3055550101,US," + stop + "\n")
                write("true")
                with contextlib.redirect_stdout(io.StringIO()):
                    preview = ingest.process_file(source, dry_run=True)
                    self.assertEqual(preview.companies_added, 1)
                    ingest.process_file(source, apply=True)
                    write("false")
                    replay = ingest.process_file(source, dry_run=True)
                self.assertEqual(replay.companies_added, 0)
                self.assertEqual(replay.companies_enriched, 0)
                with replacements["COMPANIES_PATH"].open() as f:
                    row = next(csv.DictReader(f))
                self.assertEqual(row["do_not_contact"], "true")
            finally:
                for key, value in original.items():
                    setattr(ingest, key, value)

    def test_quoted_csv_and_invalid_structure(self):
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "input.csv"
            source.write_text('\ufeffcompany_name,city\n"Example, Clinic",Miami\n', encoding="utf-8")
            frame = ingest.read_dataframe(source)
            self.assertEqual(next(frame.iterrows())[1].to_dict()["company_name"], "Example, Clinic")
            for malformed in ["name,name\na,b\n", "name,city\na,b,c\n"]:
                source.write_text(malformed)
                with self.assertRaises(ingest.MappingError):
                    ingest.read_dataframe(source)


if __name__ == "__main__":
    unittest.main()
