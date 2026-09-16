"""Persist only reviewed, first-party-published contacts for completed discovery runs."""
import hashlib
import html
import ipaddress
import json
import re
import socket
from urllib.parse import urlparse, unquote
from urllib.request import Request, build_opener, HTTPRedirectHandler
from master_ingest import discovery_source_rows
from niches import source_category_allowed

EMAIL = re.compile(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}")

def published_emails(page):
    found={email.lower() for email in EMAIL.findall(html.unescape(unquote(page)))}
    for encoded in re.findall(r'data-cfemail=["\']([0-9a-fA-F]+)["\']',page):
        try:
            data=bytes.fromhex(encoded)
            value=bytes(item ^ data[0] for item in data[1:]).decode("utf-8")
            if EMAIL.fullmatch(value):
                found.add(value.lower())
        except (ValueError, UnicodeError, IndexError):
            pass
    return found

def host(url):
    parsed = urlparse(str(url or ""))
    if parsed.scheme != "https" or parsed.username or parsed.password or parsed.port not in (None,443):
        raise ValueError("invalid_evidence_url")
    return (parsed.hostname or "").lower().removeprefix("www.")

def fetch_evidence(url, expected_host):
    def validate(value):
        if host(value) != expected_host:
            raise ValueError("evidence_host_mismatch")
        addresses = socket.getaddrinfo(urlparse(value).hostname,443,type=socket.SOCK_STREAM)
        if not addresses or any(not ipaddress.ip_address(item[4][0]).is_global for item in addresses):
            raise ValueError("non_public_evidence_host")
    class Redirects(HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            validate(newurl)
            return super().redirect_request(req,fp,code,msg,headers,newurl)
    validate(url)
    with build_opener(Redirects()).open(Request(url,headers={"User-Agent":"Mozilla/5.0"}),timeout=20) as response:
        validate(response.url)
        body=response.read(2_000_001)
        if len(body)>2_000_000:
            raise ValueError("evidence_page_too_large")
        return body.decode("utf-8",errors="replace")

def hydrate_contacts(store, run_id, reviews):
    if not isinstance(reviews,list) or not reviews or len(reviews)>100:
        return {"ok":False,"status":"blocked","error":"invalid_contact_reviews"}
    rows={row.get("place_id"):row for row in discovery_source_rows(store,run_id)}
    selected={}
    for review in reviews:
        pid=review.get("place_id")
        source=rows.get(pid)
        if not source or not source_category_allowed(source.get("category")):
            return {"ok":False,"status":"blocked","error":"review_source_out_of_scope"}
        if str(source.get("category") or "").strip().lower() != "medical spa" and review.get("niche_fit_confirmed") is not True:
            return {"ok":False,"status":"blocked","error":"niche_fit_review_required"}
        url=review.get("evidence_url")
        source_url=str(source.get("website") or "")
        # Catalog HTTP is identity metadata; evidence is still fetched over HTTPS.
        if source_url.startswith("http://"):
            source_url="https://"+source_url[7:]
        expected=host(source_url)
        if host(url)!=expected:
            return {"ok":False,"status":"blocked","error":"evidence_host_mismatch"}
        wanted=review.get("email_sha256")
        if not isinstance(wanted,str) or not re.fullmatch(r"[a-f0-9]{64}",wanted):
            return {"ok":False,"status":"blocked","error":"invalid_contact_hash"}
        page=fetch_evidence(url,expected)
        found=published_emails(page)
        matches=[email for email in found if hashlib.sha256(email.encode()).hexdigest()==wanted]
        if len(matches)!=1:
            return {"ok":False,"status":"blocked","error":"reviewed_contact_not_on_first_party_page","place_id":pid}
        selected[pid]={"place_id":pid,"lead_id":pid,"name":source.get("name"),"email":matches[0],
                       "email_present":True,"website":source.get("website"),"city":source.get("city"),
                       "phone":source.get("phone"),"category":source.get("category"),"niche_fit_confirmed":review.get("niche_fit_confirmed"),"source_run_id":run_id,"evidence_url":url,
                       "evidence_sha256":hashlib.sha256(page.encode()).hexdigest(),
                       "ownership":"first_party_page_and_reviewed_contact_hash","classification":"age_unknown"}
    path=store/"reviewed-contacts.json"
    prior=json.loads(path.read_text()) if path.exists() else {}
    prior.update(selected)
    temporary=path.with_suffix(".tmp")
    temporary.write_text(json.dumps(prior,indent=2)+"\n")
    temporary.replace(path)
    return {"ok":True,"status":"success","reviewed_count":len(selected),"lead_ids":list(selected),"paid_ops":"none"}
