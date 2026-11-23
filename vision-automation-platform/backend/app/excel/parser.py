"""Excel in/out. Output preserves original data and appends clearly named result columns."""
from __future__ import annotations
import re
from dataclasses import dataclass
from pathlib import Path
import openpyxl

RESULT_COLS = ["AI_Status", "AI_Detail", "AI_Evidence", "AI_Timestamp"]
STATUSES = {"success", "failed", "skipped", "needs_review"}


@dataclass
class SheetData:
    name: str
    headers: list[str]
    rows: list[dict]          # {header: value}; row_index (1-based excel row) in "_row"
    issues: list[str]


def read_workbook(path: str | Path) -> list[SheetData]:
    wb = openpyxl.load_workbook(path, data_only=True)
    out = []
    for ws in wb.worksheets:
        vals = list(ws.iter_rows(values_only=True))
        if not vals:
            continue
        headers = [str(c).strip() if c is not None else "" for c in vals[0]]
        issues, rows, seen = [], [], set()
        if any(not h for h in headers):
            issues.append("blank header cell(s)")
        for h in headers:
            if h and h in seen:
                issues.append(f"duplicate header: {h}")
            seen.add(h)
        for i, r in enumerate(vals[1:], start=2):
            if all(c is None or str(c).strip() == "" for c in r):
                continue
            row = {h: ("" if c is None else str(c).strip()) for h, c in zip(headers, r) if h}
            row["_row"] = i
            rows.append(row)
        out.append(SheetData(ws.title, [h for h in headers if h], rows, issues))
    return out


def validate_row(row: dict, mandatory: list[str], patterns: dict[str, str] | None = None) -> list[str]:
    errs = [f"missing {c}" for c in mandatory if not row.get(c)]
    for col, pat in (patterns or {}).items():
        if row.get(col) and not re.fullmatch(pat, row[col]):
            errs.append(f"invalid {col}: {row[col]!r}")
    return errs


def write_results(src: str | Path, dst: str | Path, sheet: str, results: dict[int, dict]) -> None:
    """results: {excel_row: {status, detail, evidence, ts}}. Original cells untouched."""
    wb = openpyxl.load_workbook(src)
    ws = wb[sheet]
    base = ws.max_column
    existing = {str(c.value): c.column for c in ws[1] if c.value}
    cols = {}
    for i, name in enumerate(RESULT_COLS, start=1):
        cols[name] = existing.get(name) or base + i
        ws.cell(row=1, column=cols[name], value=name)
    for r, res in results.items():
        if res["status"] not in STATUSES:
            raise ValueError(f"bad status {res['status']}")
        ws.cell(row=r, column=cols["AI_Status"], value=res["status"])
        ws.cell(row=r, column=cols["AI_Detail"], value=res.get("detail", ""))
        ws.cell(row=r, column=cols["AI_Evidence"], value=res.get("evidence", ""))
        ws.cell(row=r, column=cols["AI_Timestamp"], value=res.get("ts", ""))
    wb.save(dst)
