import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import recurring

class MarketSelectionTest(unittest.TestCase):
    def test_explicit_order_and_invalid_selection(self):
        markets = [{"id": key, "queue":"A", "postal_codes":["1"]} for key in ["pilot","ny","la"]]
        with tempfile.TemporaryDirectory() as folder, patch.object(recurring,"load_geography",return_value={}), patch.object(recurring,"rotate_markets",return_value=markets), patch.object(recurring,"window_for_market",return_value={"added_from":1,"added_to":2}), patch.object(recurring,"quote_live",return_value={"ok":True,"quoted_usd":1,"estimated_rows":100}) as quote:
            result = recurring.run_recurring_discovery(Path(folder),{"dry_run":True,"market_ids":["la","ny"]})
            self.assertEqual([m["id"] for m in result["markets_attempted"]],["la","ny"])
            for ids in [[],["unknown"],["ny","ny"],"ny",[{}]]:
                quote.reset_mock()
                result = recurring.run_recurring_discovery(Path(folder),{"dry_run":True,"market_ids":ids})
                self.assertEqual(result["stop_reason"],"invalid_market_ids")
                quote.assert_not_called()
