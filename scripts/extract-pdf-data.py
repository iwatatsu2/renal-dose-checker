#!/usr/bin/env python3
"""Extract renal dosing data from Shirasagi Hospital PDFs."""

import json
import subprocess
import urllib.request
import tempfile
import os
import re
import sys
import time

def extract_field(text, field_name):
    """Extract a field value from PDF text."""
    pattern = rf'【{field_name}】\s*(.*?)(?=【|$)'
    match = re.search(pattern, text, re.DOTALL)
    if match:
        value = match.group(1).strip()
        # Clean up whitespace
        value = re.sub(r'\s+', ' ', value)
        return value
    return ""

def extract_drug_data(pdf_url):
    """Download PDF and extract key fields."""
    try:
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
            tmp_path = f.name
            urllib.request.urlretrieve(pdf_url, tmp_path)

        result = subprocess.run(
            ['pdftotext', '-layout', tmp_path, '-'],
            capture_output=True, text=True, timeout=10
        )
        os.unlink(tmp_path)

        text = result.stdout
        if not text.strip():
            return None

        data = {}

        # Key fields for renal dosing
        fields = [
            ('normalDose', '常用量'),
            ('usage', '用法'),
            ('dialysis', '透析患者への投与方法'),
            ('ckd', '保存期 CKD 患者への投与方法'),
            ('otherReports', 'その他の報告'),
            ('features', '特徴'),
            ('sideEffects', '主な副作用･毒性'),
            ('monitoring', 'モニタ－すべき項目'),
            ('dialysability', '透析性'),
            ('importance', '重要度'),
            ('unit', '単位'),
            ('genericName', '一般製剤名'),
        ]

        for key, field_name in fields:
            val = extract_field(text, field_name)
            if val:
                # Truncate very long fields
                if key in ('sideEffects', 'features') and len(val) > 300:
                    val = val[:300] + '…'
                if key == 'otherReports' and len(val) > 400:
                    val = val[:400] + '…'
                data[key] = val

        return data if data else None

    except Exception as e:
        print(f"  Error: {e}", file=sys.stderr)
        return None

def main():
    with open('data/drugs.json', 'r') as f:
        drugs = json.load(f)

    total = len(drugs)
    enriched = []
    errors = 0

    for i, drug in enumerate(drugs):
        # Reconstruct original Shirasagi URL from drug data
        # We need to map back - use a lookup
        print(f"[{i+1}/{total}] {drug['name'][:40]}...", file=sys.stderr)

        # The URL field currently points to Google search, we need original PDF URLs
        # Let's load from the original scraped data
        pass

    # Load original data with PDF URLs
    with open('/Users/iwamototatsuya/Desktop/shirasagi-ckd-drugs.json', 'r') as f:
        original = json.load(f)

    # Create URL map
    url_map = {}
    for d in original:
        # Clean name same way
        clean = d['name'].replace('◎', '').replace('○', '').replace('△', '').replace('▼', '').strip()
        url_map[clean] = d['url']

    results = []
    for i, drug in enumerate(drugs):
        name = drug['name']
        pdf_url = url_map.get(name)

        if not pdf_url:
            print(f"[{i+1}/{total}] SKIP (no URL): {name[:40]}", file=sys.stderr)
            results.append({**drug, 'detail': None})
            continue

        print(f"[{i+1}/{total}] {name[:40]}...", file=sys.stderr, end=' ')

        detail = extract_drug_data(pdf_url)
        if detail:
            print(f"OK ({len(detail)} fields)", file=sys.stderr)
            results.append({**drug, 'detail': detail, 'pdfId': pdf_url.split('/')[-1].replace('.pdf', '')})
        else:
            print(f"FAIL", file=sys.stderr)
            results.append({**drug, 'detail': None})
            errors += 1

        # Rate limit
        if (i + 1) % 50 == 0:
            time.sleep(1)

    # Save
    with open('data/drugs-enriched.json', 'w') as f:
        json.dump(results, f, ensure_ascii=False)

    success = sum(1 for r in results if r.get('detail'))
    print(f"\nDone: {success}/{total} extracted, {errors} errors", file=sys.stderr)

if __name__ == '__main__':
    main()
