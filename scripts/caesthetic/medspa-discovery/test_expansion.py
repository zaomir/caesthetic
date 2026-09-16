import hashlib
import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch
import geography
import recurring
import contact_review
from master_ingest import package_rows
from outscraper_adapter import catalog_filters, ingest_rows

ROOT = Path(__file__).resolve().parents[3]
GEO = ROOT / "docs/ops/caesthetic-new-medspa-discovery/discovery-geography.json"

class ExpansionTest(unittest.TestCase):
    def test_dry_run_preserves_last_paid_receipt(self):
        geo = geography.load_geography(GEO)
        with tempfile.TemporaryDirectory() as folder, patch.object(recurring, "load_geography", return_value=geo):
            store = Path(folder)
            previous = '{"run_id":"last-real-run"}\n'
            (store / "last-run.json").write_text(previous)
            result = recurring.run_recurring_discovery(store, {"dry_run": True, "market_ids": ["orlando"], "quotes": {"orlando": {"ok": True, "quoted_usd": 0.01, "estimated_rows": 1}}})
            self.assertTrue(result["ok"])
            self.assertEqual((store / "last-run.json").read_text(), previous)

    def test_config_and_separate_cursors(self):
        geo = geography.load_geography(GEO)
        tiles = geography.iter_markets(geo)
        ids = [m["id"] for m in tiles]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(len({m["geography_id"] for m in tiles}), 31)
        self.assertEqual(len({m["niche_id"] for m in tiles}), 9)
        self.assertIn("orlando", ids)
        self.assertIn("tampa__hair_salon", ids)
        self.assertNotIn("scottsdale__hair_salon", ids)
        for m in tiles:
            self.assertTrue(m["postal_codes"])
            self.assertTrue(all(len(z)==5 and z.isdigit() for z in m["postal_codes"]))
            catalog_filters(postal_codes=m["postal_codes"], added_from=1, added_to=2, types=m["types"])
        with tempfile.TemporaryDirectory() as folder:
            store = Path(folder)
            geography.mark_success(store, "tampa", window={}, run_id="old")
            niche = next(m for m in tiles if m["id"] == "tampa__skin")
            self.assertTrue(geography.window_for_market(geo,store,niche)["first_collect"])
            rotated = geography.rotate_markets(geo,store)
            self.assertLess(next(i for i,m in enumerate(rotated) if m["id"]=="orlando"), next(i for i,m in enumerate(rotated) if m["id"]=="tampa"))

    def test_types_reach_paid_request_and_receipt(self):
        geo=geography.load_geography(GEO)
        with tempfile.TemporaryDirectory() as folder, patch.object(recurring,"load_geography",return_value=geo), patch.object(recurring,"quote_live",return_value={"ok":True,"quoted_usd":1.5,"estimated_rows":100,"unit_usd":0.015}), patch.object(recurring,"start_or_recover_catalog",return_value={"status":"success","rows":[],"window_complete":True,"job_id":"test-job"}) as start:
            result=recurring.run_recurring_discovery(Path(folder),{"allow_offline":True,"market_ids":["tampa__hair_salon"],"run_id":"test"})
            self.assertTrue(result["ok"])
            self.assertEqual(start.call_args.kwargs["filters"]["types"],["hair salon"])
            self.assertEqual(result["markets_attempted"][0]["niche_id"],"hair_salon")
            self.assertEqual(result["cost_upper_bound_usd"],0)

    def test_unknown_category_rejected(self):
        for cats in ([],["restaurant"]):
            with self.assertRaises(ValueError):
                catalog_filters(postal_codes=["33602"],added_from=1,added_to=2,types=cats)

    def test_cross_category_dedup_preserves_identity_and_holds(self):
        row={"place_id":"one","name":"Example","city":"Tampa","country_code":"US","category":"Medical Spa"}
        other={**row,"category":"Skin Care Clinic"}
        packaged,skipped=package_rows([row,other],[])
        self.assertEqual(len(packaged),1)
        self.assertEqual(packaged[0]["category"],"Medical Spa")
        self.assertIn("not_send_ready",packaged[0]["tags"])
        salon,_=package_rows([{**row,"category":"Hair Salon"}],[])
        self.assertEqual(salon[0]["category"],"Hair Salon")
        with self.assertRaises(ValueError):
            package_rows([row,{**other,"name":"Different company"}],[])
        self.assertEqual(package_rows([other],[{"name":"Example","blocker":"ownership_unresolved"}])[0],[])
        with tempfile.TemporaryDirectory() as folder:
            store=Path(folder)
            ingest_rows(store,[row],source_file="one")
            registry=json.loads((store/"registry.json").read_text())
            registry["locations"][0]["status"]="do_not_contact"
            (store/"registry.json").write_text(json.dumps(registry))
            ingest_rows(store,[other],source_file="two")
            after=json.loads((store/"registry.json").read_text())
            self.assertEqual(len(after["locations"]),1)
            self.assertEqual(after["locations"][0]["status"],"do_not_contact")

    def test_adjacent_contact_requires_niche_review(self):
        source={"place_id":"one","name":"Salon","website":"https://salon.example","category":"Hair Salon"}
        email="hello@salon.example"
        review={"place_id":"one","evidence_url":"https://salon.example/contact","email_sha256":hashlib.sha256(email.encode()).hexdigest()}
        with tempfile.TemporaryDirectory() as folder, patch.object(contact_review,"discovery_source_rows",return_value=[source]),patch.object(contact_review,"fetch_evidence",return_value=email):
            self.assertEqual(contact_review.hydrate_contacts(Path(folder),"test",[review])["error"],"niche_fit_review_required")
            review["niche_fit_confirmed"]=True
            self.assertTrue(contact_review.hydrate_contacts(Path(folder),"test",[review])["ok"])

if __name__=="__main__":
    unittest.main()
