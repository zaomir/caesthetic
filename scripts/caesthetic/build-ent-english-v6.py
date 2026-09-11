#!/usr/bin/env python3
"""Deterministic English localization of the owner-approved ENT review package.

Frozen Russian inputs preserve the source evidence; this renderer never scores,
chooses a pilot, adds findings or marks a human translation review complete.
"""
from pathlib import Path
import hashlib
import html
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'docs/audits/caesthetic/growth-score/cases/ent-urgent-care-network-2026/revisions/v6/english-2026-09-11'
APPROVAL = json.loads((BASE / 'approval.json').read_text())
TRANSLATIONS = {x['source']: x['en'] for x in json.loads((BASE / 'translation.json').read_text())}
ATTRS = {
    'Разделы отчёта': 'Report sections',
    'Реестр 47 филиалов и четырёх поверхностей': 'Register of 47 locations across four surfaces',
    'Таблица исследования': 'Research table',
    '10 поисковых намерений × четыре поверхности': '10 search intents across four surfaces',
}
CYRILLIC = re.compile('[А-Яа-яЁё]')


def render(source, route):
    parts = re.split(r'(<[^>]*>)', source)
    for i, part in enumerate(parts):
        if i % 2 == 0:
            decoded = html.unescape(part)
            if CYRILLIC.search(decoded):
                if decoded not in TRANSLATIONS:
                    raise ValueError('Untranslated source text: ' + decoded[:120])
                parts[i] = html.escape(TRANSLATIONS[decoded], quote=False)
        else:
            for old, new in ATTRS.items():
                part = part.replace('"' + old + '"', '"' + new + '"')
            parts[i] = part
    result = ''.join(parts)
    result = result.replace('lang="ru"', 'lang="en-US"')
    result = result.replace('data-review-state="manager_review"', 'data-review-state="translated"')
    result = result.replace('/score/ent-urgent-care-network-6f2c9a4e81d7/ru/v6/', '/score/ent-urgent-care-network-6f2c9a4e81d7/en/v6/')
    for service in ('location-alignment', 'review-system'):
        result = result.replace('/connect4/' + service + '/ru/', '/connect4/' + service + '/')
    result = re.sub(r'mailto:info@caesthetic\.com\?subject=[^"\s]*', 'mailto:info@caesthetic.com?subject=ENT%20Urgent%20Care%20-%20first%20location', result)
    result = result.replace('</head>', '<link rel="canonical" href="https://caesthetic.com' + route + '"></head>')
    if CYRILLIC.search(result):
        raise ValueError('Untranslated Cyrillic remains')
    return result


def main():
    check = '--check' in sys.argv
    for item in APPROVAL['pages']:
        source_path = ROOT / item['source']
        raw = source_path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != item['sha256']:
            raise ValueError('Approved source changed: ' + item['source'])
        result = render(raw.decode(), item['route'])
        destination = ROOT / ('site-caesthetic' + item['route'] + 'index.html')
        if check:
            if not destination.exists() or destination.read_text() != result:
                raise ValueError('Stale English report: ' + str(destination))
        else:
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(result)
    print('ENT English v6: 3 pages ' + ('verified' if check else 'generated'))


if __name__ == '__main__':
    main()
