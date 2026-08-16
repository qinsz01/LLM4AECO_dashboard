#!/usr/bin/env python3
"""Reclassify the representation taxonomy and synchronize dashboard assets."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
PAPER_DIR = DATA_DIR / "papers"
INDEX_PATH = DATA_DIR / "index.json"
I18N_PATH = ROOT / "js" / "i18n.js"
CHARTS_PATH = ROOT / "js" / "charts.js"

CODE_ZH = "学习/工程化编码"
CODE_EN = "Learned/engineered codes"

ASSIGNMENTS = {
    "almeida2025": "多模态",
    "du2025": CODE_ZH,
    "han2025": "文本",
    "jiang2026b": "结构化",
    "liu2025": "结构化",
    "lu2025": "多模态",
    "qin2026": CODE_ZH,
    "yinjun2025": CODE_ZH,
    "kang2024": CODE_ZH,
}

EXPECTED_COUNTS = {
    "文本": 72,
    "结构化": 39,
    "多模态": 41,
    "图结构": 16,
    CODE_ZH: 4,
}


def write_json(path: Path, obj: object) -> None:
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def update_papers() -> None:
    for paper_id, representation in ASSIGNMENTS.items():
        path = PAPER_DIR / f"{paper_id}.json"
        if not path.exists():
            raise FileNotFoundError(path)
        paper = json.loads(path.read_text(encoding="utf-8"))
        if paper.get("id") != paper_id:
            raise ValueError(f"{path}: id mismatch: {paper.get('id')!r}")
        paper["representation"] = representation
        write_json(path, paper)


def synchronize_index() -> list[dict]:
    index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    seen: set[str] = set()
    for entry in index:
        paper_id = entry["id"]
        path = PAPER_DIR / f"{paper_id}.json"
        if not path.exists():
            raise FileNotFoundError(path)
        paper = json.loads(path.read_text(encoding="utf-8"))
        if paper_id in seen:
            raise ValueError(f"duplicate index id: {paper_id}")
        seen.add(paper_id)
        entry.update(
            file=f"papers/{paper_id}.json",
            title=paper["title"],
            year=paper["year"],
            category=paper["category"],
            phase=paper["phase"],
            llmMethod=paper["llmMethod"],
            representation=paper["representation"],
        )
    if len(index) != 172 or len(seen) != 172:
        raise ValueError(f"expected 172 unique index records, found {len(index)} / {len(seen)}")
    write_json(INDEX_PATH, index)
    return index


def update_i18n() -> None:
    text = I18N_PATH.read_text(encoding="utf-8")
    old = """        representation: {\n            '\\u5176\\u4ED6': { zh: '\\u5176\\u4ED6', en: 'Others' },\n            '\\u56FE\\u7ED3\\u6784': { zh: '\\u56FE\\u7ED3\\u6784', en: 'Graph' },\n            '\\u591A\\u6A21\\u6001': { zh: '\\u591A\\u6A21\\u6001', en: 'Multimodal' },\n            '\\u6587\\u672C': { zh: '\\u6587\\u672C', en: 'Text' },\n            '\\u7ED3\\u6784\\u5316': { zh: '\\u7ED3\\u6784\\u5316', en: 'Structured' }\n        }"""
    new = f"""        representation: {{\n            '{CODE_ZH}': {{ zh: '{CODE_ZH}', en: '{CODE_EN}' }},\n            '\\u56FE\\u7ED3\\u6784': {{ zh: '\\u56FE\\u7ED3\\u6784', en: 'Graph' }},\n            '\\u591A\\u6A21\\u6001': {{ zh: '\\u591A\\u6A21\\u6001', en: 'Multimodal' }},\n            '\\u6587\\u672C': {{ zh: '\\u6587\\u672C', en: 'Text' }},\n            '\\u7ED3\\u6784\\u5316': {{ zh: '\\u7ED3\\u6784\\u5316', en: 'Structured' }}\n        }}"""
    if old not in text:
        if CODE_EN in text:
            return
        raise ValueError("expected representation block not found in js/i18n.js")
    I18N_PATH.write_text(text.replace(old, new), encoding="utf-8")


def update_charts() -> None:
    text = CHARTS_PATH.read_text(encoding="utf-8")
    old_map = """    var REPR_MAP = {\n        '文本': '文本', '结构化': '结构化', '多模态': '多模态',\n        '图结构': '图结构', '其他': '其他'\n    };"""
    new_map = f"""    var REPR_MAP = {{\n        '文本': '文本', '结构化': '结构化', '多模态': '多模态',\n        '图结构': '图结构', '{CODE_ZH}': '{CODE_ZH}'\n    }};"""
    old_order = "var reprs = ['文本', '结构化', '多模态', '图结构', '其他'];"
    new_order = f"var reprs = ['文本', '结构化', '多模态', '图结构', '{CODE_ZH}'];"
    if old_map in text:
        text = text.replace(old_map, new_map)
    elif CODE_ZH not in text:
        raise ValueError("expected REPR_MAP block not found in js/charts.js")
    if old_order in text:
        text = text.replace(old_order, new_order)
    elif new_order not in text:
        raise ValueError("expected representation ordering not found in js/charts.js")
    CHARTS_PATH.write_text(text, encoding="utf-8")


def validate(index: list[dict]) -> None:
    counts = Counter(entry["representation"] for entry in index)
    if dict(counts) != EXPECTED_COUNTS:
        raise AssertionError(f"representation counts {dict(counts)} != {EXPECTED_COUNTS}")
    if "其他" in counts:
        raise AssertionError("legacy representation label '其他' remains in index")
    for paper_id, representation in ASSIGNMENTS.items():
        paper = json.loads((PAPER_DIR / f"{paper_id}.json").read_text(encoding="utf-8"))
        if paper["representation"] != representation:
            raise AssertionError(f"{paper_id}: {paper['representation']} != {representation}")


if __name__ == "__main__":
    update_papers()
    index_data = synchronize_index()
    update_i18n()
    update_charts()
    validate(index_data)
    print("Representation migration complete:", EXPECTED_COUNTS)
