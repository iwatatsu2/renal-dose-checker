#!/usr/bin/env python3
"""
既存のckd/dialysisフリーテキストからCCr/eGFR別用量調節テーブルを構造化する
"""
import json
import re
import sys

def parse_tiers_from_text(ckd_text: str, dialysis_text: str, status: dict) -> list[dict]:
    """フリーテキストからCCr/eGFR別用量ティアを抽出"""
    tiers = []
    combined = ckd_text or ""

    # パターン: Ccr＞50mL/min：用量, Ccr 10～50：用量, CCr＜10：用量
    # 全角・半角混在に対応
    text = combined
    # 全角→半角変換（数値・記号）
    text = text.replace('＞', '>').replace('＜', '<').replace('～', '~')
    text = text.replace('≧', '>=').replace('≦', '<=')
    text = text.replace('，', ',').replace('：', ':')

    # CCr/eGFR パターンマッチ
    # "Ccr > 50 mL/min : 用量" or "eGFR 30~60 : 用量" etc.
    pattern = r'(?:Ccr|CCr|CKr|eGFR|GFR)\s*([><=]+)?\s*(\d+)\s*(?:~|～|-|〜)\s*(\d+)\s*(?:mL/min(?:/1\.73m\^?2)?)?\s*[:：]?\s*([^,，、Cc\n]+?)(?=[,，、]|Ccr|CCr|eGFR|GFR|HD|PD|$)'
    pattern_single = r'(?:Ccr|CCr|CKr|eGFR|GFR)\s*([><=≧≦]+)\s*(\d+)\s*(?:mL/min(?:/1\.73m\^?2)?)?\s*[:：]?\s*([^,，、Cc\n]+?)(?=[,，、]|Ccr|CCr|eGFR|GFR|HD|PD|$)'
    pattern_below = r'(?:Ccr|CCr|CKr|eGFR|GFR)\s*(\d+)\s*(?:mL/min(?:/1\.73m\^?2)?)?\s*(?:未満|以下)\s*[:：]?\s*([^,，、Cc\n]+?)(?=[,，、]|Ccr|CCr|eGFR|GFR|HD|PD|$)'
    pattern_above = r'(?:Ccr|CCr|CKr|eGFR|GFR)\s*(\d+)\s*(?:mL/min(?:/1\.73m\^?2)?)?\s*(?:以上)\s*[:：]?\s*([^,，、Cc\n]+?)(?=[,，、]|Ccr|CCr|eGFR|GFR|HD|PD|$)'

    found = False

    # Range pattern: CCr 10~50
    for m in re.finditer(pattern, text):
        op, low, high, dose = m.groups()
        dose = dose.strip().rstrip('（(')
        range_str = f"CCr {low}〜{high}"
        tiers.append({"range": range_str, "dose": dose})
        found = True

    # Single threshold: CCr > 50, CCr < 10
    for m in re.finditer(pattern_single, text):
        op, val, dose = m.groups()
        dose = dose.strip().rstrip('（(')
        # Skip if already captured as range
        if any(val in t["range"] for t in tiers):
            continue
        op_display = op.replace('>=', '≧').replace('<=', '≦')
        range_str = f"CCr {op_display}{val}"
        tiers.append({"range": range_str, "dose": dose})
        found = True

    # Japanese: CCr 10 未満, CCr 50 以上
    for m in re.finditer(pattern_below, text):
        val, dose = m.groups()
        dose = dose.strip().rstrip('（(')
        if not any(val in t["range"] and '<' in t["range"] for t in tiers):
            tiers.append({"range": f"CCr <{val}", "dose": dose})
            found = True

    for m in re.finditer(pattern_above, text):
        val, dose = m.groups()
        dose = dose.strip().rstrip('（(')
        if not any(val in t["range"] and '>' in t["range"] for t in tiers):
            tiers.append({"range": f"CCr ≧{val}", "dose": dose})
            found = True

    # HD tier from dialysis text
    if dialysis_text:
        hd_dose = dialysis_text.strip()
        # Truncate long text
        if len(hd_dose) > 100:
            hd_dose = hd_dose[:100] + "…"
        tiers.append({"range": "HD（透析）", "dose": hd_dose})
    elif status.get("dialysis") == "contraindicated":
        tiers.append({"range": "HD（透析）", "dose": "禁忌"})
    elif status.get("dialysis") == "normal":
        tiers.append({"range": "HD（透析）", "dose": "常用量"})

    # If no CCr/eGFR tiers found, generate from status
    if not found:
        ckd_status = status.get("ckd", "unknown")
        if ckd_status == "contraindicated":
            tiers.insert(0, {"range": "腎機能低下時", "dose": "禁忌"})
        elif ckd_status == "reduce":
            tier_dose = ckd_text.strip() if ckd_text else "減量"
            if len(tier_dose) > 100:
                tier_dose = tier_dose[:100] + "…"
            tiers.insert(0, {"range": "腎機能低下時", "dose": tier_dose})
        elif ckd_status == "caution":
            tier_dose = ckd_text.strip() if ckd_text else "慎重投与"
            if len(tier_dose) > 100:
                tier_dose = tier_dose[:100] + "…"
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
    t = dose_text.lower()
    if '禁忌' in t or '使用しない' in t or '避ける' in t or '投与しない' in t:
        return "contraindicated"
    if any(k in t for k in ['常用量', '減量の必要なし', '減量不要', '変更不要', '通常用量', '影響しない', '影響なし']):
        return "normal"
    if any(k in t for k in ['減量', '半量', '50%', '75%', '1/2', '1/3', '1/4', '延長', '間隔']):
        return "reduce"
    if any(k in t for k in ['慎重', '注意', '低用量から', '要注意', '要観察']):
        return "caution"
    if False:
        return "normal"  # unreachable - normal check moved above
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
        # Add status classification to each tier
        for tier in tiers:
            tier["status"] = classify_tier(tier["dose"])

        drug["renalDosing"] = tiers

        # Count
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

    # Show samples
    for drug in drugs[:5]:
        if drug.get('renalDosing'):
            print(f"\n--- {drug['name']} ---")
            for t in drug['renalDosing']:
                print(f"  {t['range']}: {t['dose'][:60]} [{t['status']}]")


if __name__ == '__main__':
    main()
