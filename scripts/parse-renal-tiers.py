#!/usr/bin/env python3
"""
既存のckd/dialysisフリーテキストからCCr/eGFR別用量調節テーブルを構造化する
"""
import json
import re


def detect_unit(text: str) -> str:
    """テキスト内の腎機能指標を判定（eGFR優先）"""
    if re.search(r'eGFR|ＥＧＦＲegfr', text, re.IGNORECASE):
        return "eGFR"
    return "CCr"


def normalize_text(text: str) -> str:
    """全角→半角変換"""
    t = text.replace('＞', '>').replace('＜', '<').replace('～', '~')
    t = t.replace('≧', '>=').replace('≦', '<=')
    t = t.replace('，', ',').replace('：', ':').replace('．', '.')
    return t


def parse_tiers_from_text(ckd_text: str, dialysis_text: str, status: dict) -> list[dict]:
    """フリーテキストからCCr/eGFR別用量ティアを抽出"""
    tiers = []
    raw = ckd_text or ""
    unit = detect_unit(raw)
    text = normalize_text(raw)

    found = False
    seen_ranges = set()

    # Pattern: range "CCr 10~50: dose" or "eGFR 30-45: dose"
    pat_range = r'(?:Ccr|CCr|CKr|eGFR|GFR)\s*([><=]*)\s*(\d+)\s*(?:~|-|〜)\s*(\d+)\s*(?:mL/min(?:/1\.73m\^?2)?)?\s*[:：]?\s*([^,，、\n]+?)(?=[,，、]|(?:Ccr|CCr|eGFR|GFR)\s*\d|HD|PD|$)'
    for m in re.finditer(pat_range, text, re.IGNORECASE):
        _, low, high, dose = m.groups()
        dose = dose.strip().rstrip('（(').strip()
        key = f"{low}-{high}"
        if key not in seen_ranges:
            seen_ranges.add(key)
            tiers.append({"range": f"{unit} {low}〜{high}", "dose": dose})
            found = True

    # Pattern: single threshold "CCr > 50: dose", "CCr < 10: dose"
    pat_single = r'(?:Ccr|CCr|CKr|eGFR|GFR)\s*([><=]+)\s*(\d+)\s*(?:mL/min(?:/1\.73m\^?2)?)?\s*[:：]?\s*([^,，、\n]+?)(?=[,，、]|(?:Ccr|CCr|eGFR|GFR)\s*\d|HD|PD|$)'
    for m in re.finditer(pat_single, text, re.IGNORECASE):
        op, val, dose = m.groups()
        dose = dose.strip().rstrip('（(').strip()
        if any(val in r for r in seen_ranges):
            continue
        op_display = op.replace('>=', '≧').replace('<=', '≦')
        key = f"{op}{val}"
        if key not in seen_ranges:
            seen_ranges.add(key)
            tiers.append({"range": f"{unit} {op_display}{val}", "dose": dose})
            found = True

    # Pattern: Japanese "CCr 10 未満", "eGFR 30 未満"
    pat_below = r'(?:Ccr|CCr|CKr|eGFR|GFR)\s*(\d+)\s*(?:mL/min(?:/1\.73m\^?2)?)?\s*(?:未満|以下)\s*(?:の患者には?)?\s*[:：]?\s*([^,，、\n]+?)(?=[,，、]|(?:Ccr|CCr|eGFR|GFR)\s*\d|HD|PD|$)'
    for m in re.finditer(pat_below, text, re.IGNORECASE):
        val, dose = m.groups()
        dose = dose.strip().rstrip('（(').strip()
        key = f"<{val}"
        if key not in seen_ranges:
            seen_ranges.add(key)
            tiers.append({"range": f"{unit} <{val}", "dose": dose})
            found = True

    pat_above = r'(?:Ccr|CCr|CKr|eGFR|GFR)\s*(\d+)\s*(?:mL/min(?:/1\.73m\^?2)?)?\s*(?:以上)\s*[:：]?\s*([^,，、\n]+?)(?=[,，、]|(?:Ccr|CCr|eGFR|GFR)\s*\d|HD|PD|$)'
    for m in re.finditer(pat_above, text, re.IGNORECASE):
        val, dose = m.groups()
        dose = dose.strip().rstrip('（(').strip()
        key = f">={val}"
        if key not in seen_ranges:
            seen_ranges.add(key)
            tiers.append({"range": f"{unit} ≧{val}", "dose": dose})
            found = True

    # Sort tiers by the highest number in descending order (high eGFR/CCr first)
    def sort_key(tier):
        nums = re.findall(r'\d+', tier["range"])
        return -max(int(n) for n in nums) if nums else 0
    if found:
        tiers.sort(key=sort_key)

    # HD tier
    if dialysis_text:
        hd_dose = dialysis_text.strip()
        if len(hd_dose) > 120:
            hd_dose = hd_dose[:120] + "…"
        tiers.append({"range": "HD（透析）", "dose": hd_dose})
    elif status.get("dialysis") == "contraindicated":
        tiers.append({"range": "HD（透析）", "dose": "禁忌"})
    elif status.get("dialysis") == "normal":
        tiers.append({"range": "HD（透析）", "dose": "常用量"})

    # Fallback if no CCr/eGFR tiers found
    if not found:
        ckd_status = status.get("ckd", "unknown")
        if ckd_status == "contraindicated":
            tiers.insert(0, {"range": "腎機能低下時", "dose": "禁忌"})
        elif ckd_status == "reduce":
            tier_dose = ckd_text.strip() if ckd_text else "減量"
            if len(tier_dose) > 120:
                tier_dose = tier_dose[:120] + "…"
            tiers.insert(0, {"range": "腎機能低下時", "dose": tier_dose})
        elif ckd_status == "caution":
            tier_dose = ckd_text.strip() if ckd_text else "慎重投与"
            if len(tier_dose) > 120:
                tier_dose = tier_dose[:120] + "…"
            tiers.insert(0, {"range": "腎機能低下時", "dose": tier_dose})
        elif ckd_status == "normal":
            tiers.insert(0, {"range": "腎機能低下時", "dose": "常用量（減量不要）"})
        else:
            tiers.insert(0, {"range": "腎機能低下時", "dose": "データなし"})

    return tiers


def classify_tier(dose_text: str) -> str:
    """用量テキストからステータスを分類"""
    if not dose_text:
        return "unknown"
    t = dose_text
    if '禁忌' in t or '使用しない' in t or '避ける' in t or '投与しない' in t:
        return "contraindicated"
    if any(k in t for k in ['常用量', '減量の必要なし', '減量不要', '変更不要', '通常用量', '影響しない', '影響なし']):
        return "normal"
    if any(k in t for k in ['減量', '半量', '50%', '75%', '1/2', '1/3', '1/4', '延長', '間隔']):
        return "reduce"
    if any(k in t for k in ['慎重', '注意', '低用量から', '要注意', '要観察']):
        return "caution"
    # If it contains specific dosing numbers, it's likely a dose adjustment
    if re.search(r'\d+\s*mg', t):
        return "reduce"
    return "unknown"


def main():
    with open('data/drugs-final.json', 'r') as f:
        drugs = json.load(f)

    stats = {"with_ccr": 0, "fallback": 0}

    for drug in drugs:
        tiers = parse_tiers_from_text(
            drug.get('ckd', ''),
            drug.get('dialysis', ''),
            drug.get('status', {})
        )
        for tier in tiers:
            tier["status"] = classify_tier(tier["dose"])

        drug["renalDosing"] = tiers

        has_ccr = any('CCr' in t['range'] or 'eGFR' in t['range'] for t in tiers)
        if has_ccr:
            stats["with_ccr"] += 1
        else:
            stats["fallback"] += 1

    with open('data/drugs-final.json', 'w') as f:
        json.dump(drugs, f, ensure_ascii=False, indent=2)

    print(f"Total: {len(drugs)}")
    print(f"With CCr/eGFR tiers: {stats['with_ccr']}")
    print(f"Fallback (status-based): {stats['fallback']}")

    # Show key drugs
    for name in ['メトホルミン', 'アシノン', 'アカルボース', 'アクロマイシン', 'アジルバ']:
        for drug in drugs:
            if name in drug['name']:
                print(f"\n--- {drug['name']} ---")
                for t in drug['renalDosing']:
                    print(f"  {t['range']}: {t['dose'][:80]} [{t['status']}]")
                break


if __name__ == '__main__':
    main()
