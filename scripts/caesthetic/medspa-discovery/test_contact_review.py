import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import contact_review as review

class ContactReviewTest(unittest.TestCase):
    def test_publicly_encoded_contact(self):
        address="contact@clinic.example"
        data=bytes([42]+[ord(c)^42 for c in address]).hex()
        self.assertEqual(review.published_emails('<a data-cfemail="'+data+'">email</a>'),{address})
        self.assertEqual(review.published_emails('<a data-cfemail="a">bad</a>'),set())

    def test_catalog_http_identity_allows_https_evidence_only(self):
        address="contact@clinic.example"
        source={"place_id":"one","name":"Clinic","website":"http://clinic.example","category":"medical spa"}
        item={"place_id":"one","evidence_url":"https://clinic.example/contact","email_sha256":hashlib.sha256(address.encode()).hexdigest()}
        with tempfile.TemporaryDirectory() as folder,patch.object(review,"discovery_source_rows",return_value=[source]),patch.object(review,"fetch_evidence",return_value=address):
            self.assertTrue(review.hydrate_contacts(Path(folder),'run',[item])['ok'])
            item['evidence_url']='http://clinic.example/contact'
            with self.assertRaises(ValueError):
                review.hydrate_contacts(Path(folder),'run',[item])

    def test_evidence_hash_required_and_persisted_privately(self):
        source={"place_id":"one","name":"Clinic","website":"https://clinic.example","category":"medical spa"}
        contact="office@clinic.example"
        item={"place_id":"one","evidence_url":"https://clinic.example/contact","email_sha256":hashlib.sha256(contact.encode()).hexdigest()}
        with tempfile.TemporaryDirectory() as folder, patch.object(review,"discovery_source_rows",return_value=[source]),patch.object(review,"fetch_evidence",return_value='<a href="mailto:'+contact+'">Email</a>'):
            root=Path(folder)
            result=review.hydrate_contacts(root,"run",[item])
            self.assertTrue(result["ok"])
            self.assertNotIn(contact,json.dumps(result))
            self.assertEqual(json.loads((root/"reviewed-contacts.json").read_text())["one"]["email"],contact)
            item["email_sha256"]="0"*64
            self.assertFalse(review.hydrate_contacts(root,"run",[item])["ok"])
    def test_foreign_host_and_private_address_blocked(self):
        with patch.object(review,"discovery_source_rows",return_value=[{"place_id":"one","category":"medical spa","website":"https://clinic.example"}]),patch.object(review,"fetch_evidence") as fetch:
            result=review.hydrate_contacts(Path("/unused"),"run",[{"place_id":"one","evidence_url":"https://other.example","email_sha256":"0"*64}])
            self.assertEqual(result["error"],"evidence_host_mismatch")
            fetch.assert_not_called()
        with patch.object(review.socket,"getaddrinfo",return_value=[(2,1,6,"",("127.0.0.1",443))]):
            with self.assertRaises(ValueError):
                review.fetch_evidence("https://clinic.example","clinic.example")
