import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import budget
import outscraper_adapter as adapter
import recurring


class LaunchDiscoveryTest(unittest.TestCase):
    def test_quote_never_fetches_records_or_assumes_free_usage(self):
        payload = {"account_status": "valid", "upcoming_invoice": {"products_lines": [
            {"product_name": "Google Maps Data", "lines": [{"unit_price": "$0.00", "quantity": 382}]}]}}
        calls = []
        def api(method, path, *args):
            calls.append((method, path))
            return 200, payload
        with patch.object(adapter, 'outscraper_request', api):
            quote = adapter.quote_live(postal_codes=['85251'], added_from=1, added_to=2, budget_usd=1)
        self.assertTrue(quote['ok'])
        self.assertEqual(quote['quoted_usd'], 1)
        self.assertEqual(quote['estimated_rows'], 100)
        self.assertEqual(quote['free_remaining_assumed'], 0)
        self.assertEqual(calls, [('GET', '/profile/balance')])

    def test_timeout_intent_prevents_repurchase(self):
        with tempfile.TemporaryDirectory() as d:
            with patch.object(adapter, 'outscraper_request', return_value=(0, {'error': 'TimeoutError'})) as api:
                for _ in range(2):
                    job = adapter.start_or_recover_catalog(store=Path(d), filters={'postal_codes':['85251']}, limit=10)
                self.assertEqual(api.call_count, 1)
                self.assertEqual(job['status'], 'unknown')
                self.assertFalse(recurring.recover_unfinished(Path(d), 3)['ok'])

    def test_empty_success_and_truncated_window(self):
        for payload, complete in [({'data': [], 'total': 0}, True),
                                  ({'data': [{'place_id': 'real'}], 'next_cursor': 'next'}, False)]:
            with tempfile.TemporaryDirectory() as d:
                with patch.object(adapter, 'outscraper_request', return_value=(200, payload)):
                    job = adapter.start_or_recover_catalog(store=Path(d), filters={}, limit=1)
                self.assertEqual(job['status'], 'success')
                self.assertEqual(job['window_complete'], complete)
                self.assertIsNone(job['provider_job_id'])

    def test_unknown_200_schema_is_not_success(self):
        with tempfile.TemporaryDirectory() as d:
            with patch.object(adapter, 'outscraper_request', return_value=(200, {'error': 'bad'})):
                job = adapter.start_or_recover_catalog(store=Path(d), filters={}, limit=1)
            self.assertEqual(job['status'], 'unknown')

    def test_failed_quote_is_blocked_and_dryrun_keeps_schedule(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            market = {'id':'one', 'queue':'A', 'postal_codes':['85251']}
            before = {'skip_next_scheduled': False}
            budget.save_state(root, before)
            original = (root/'budget-state.json').read_bytes()
            with patch.object(recurring, 'load_geography', return_value={}), patch.object(recurring, 'rotate_markets', return_value=[market]), patch.object(recurring, 'window_for_market', return_value={'added_from':1, 'added_to':2}), patch.object(recurring, 'quote_live', return_value={'ok':False, 'stop_reason':'unknown_cost_upper_bound', 'error':'pricing_failed', 'http':401}):
                result = recurring.run_recurring_discovery(root, {'dry_run':True, 'starter':True})
            self.assertFalse(result['ok'])
            self.assertEqual(result['status'], 'blocked')
            self.assertEqual(result['markets_skipped'][0]['http'], 401)
            self.assertEqual((root/'budget-state.json').read_bytes(), original)

    def test_empty_catalog_page_does_not_consume_full_page_budget(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            market = {"id":"one", "queue":"A", "postal_codes":["85251"]}
            quote = {"ok":True, "quoted_usd":1, "estimated_rows":100, "unit_usd":0.01}
            job = {"job_id":"sync-empty", "sync":True, "status":"success", "rows":[], "window_complete":True}
            with patch.object(recurring, "load_geography", return_value={}), patch.object(recurring, "rotate_markets", return_value=[market]), patch.object(recurring, "window_for_market", return_value={"added_from":1,"added_to":2}), patch.object(recurring,"quote_live",return_value=quote), patch.object(recurring,"start_or_recover_catalog",return_value=job):
                result = recurring.run_recurring_discovery(root,{"allow_offline":True})
            self.assertTrue(result["ok"])
            self.assertEqual(result["cost_upper_bound_usd"],0)
            self.assertEqual(result["remaining_run_usd"],3)
            self.assertIsNone(result["actual_usd"])
            self.assertEqual(budget.week_spent_usd(root),0)

    def test_exact_budget_capacity(self):
        self.assertEqual(budget.max_rows_for_budget(3)['max_rows'], 300)
        self.assertEqual(budget.max_rows_for_budget(1)['max_rows'], 100)


if __name__ == '__main__':
    unittest.main()
