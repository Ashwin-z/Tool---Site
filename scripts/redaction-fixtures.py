"""
Generate the PDF Redaction Checker regression corpus.

The fixtures are generated rather than committed so the repository stays light,
and so every case is reproducible and auditable from source.

CRITICALLY: this script uses PyMuPDF, a completely different PDF library from
the pdf.js engine the checker is built on. It both BUILDS each fixture and
INDEPENDENTLY VERIFIES whether the canary text is still recoverable, so the
expectations the test suite asserts are never derived from the code under test.

Requires:  pip install pymupdf
           a TrueType font (Windows Arial by default; override with --font)

Usage:     python scripts/redaction-fixtures.py --out <dir>
"""

import argparse
import os
import sys

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("PyMuPDF is required:  pip install pymupdf")

# A single distinctive string. If it survives into extractable text, the
# "redaction" failed - and that is checkable without trusting our own engine.
SECRET = "ACCOUNT 4417 9920 3311 Jane Doe salary 184000"


def base_page(doc, font):
    p = doc.new_page(width=595, height=842)
    p.insert_font(fontname="F", fontfile=font)
    p.insert_text((60, 80), "Confidential Memo", fontsize=18, fontname="F")
    p.insert_text((60, 140), SECRET, fontsize=12, fontname="F")
    p.insert_text((60, 200), "This paragraph is meant to stay visible.", fontsize=11, fontname="F")
    return p


def build(out, font):
    os.makedirs(out, exist_ok=True)
    box = fitz.Rect(55, 126, 540, 150)

    # ---------------- cases that MUST be detected ----------------

    # 1. The classic failure: a black box drawn over live text.
    d = fitz.open(); p = base_page(d, font)
    p.draw_rect(box, color=(0, 0, 0), fill=(0, 0, 0))
    d.save(f"{out}/rc-black-box.pdf"); d.close()

    # 2. Same failure, invisible to the eye: a white box over live text.
    d = fitz.open(); p = base_page(d, font)
    p.draw_rect(box, color=(1, 1, 1), fill=(1, 1, 1))
    d.save(f"{out}/rc-white-box.pdf"); d.close()

    # 3. Page 1 unsafe, page 2 properly redacted - proves per-page reporting.
    d = fitz.open()
    p1 = base_page(d, font); p1.draw_rect(box, color=(0, 0, 0), fill=(0, 0, 0))
    p2 = base_page(d, font); p2.add_redact_annot(box, fill=(0, 0, 0)); p2.apply_redactions()
    d.save(f"{out}/rc-mixed.pdf"); d.close()

    # 4. An unflattened annotation, as macOS Preview markup produces.
    d = fitz.open(); p = base_page(d, font)
    a = p.add_rect_annot(box); a.set_colors(stroke=(0, 0, 0), fill=(0, 0, 0)); a.update()
    d.save(f"{out}/rc-annot-square.pdf"); d.close()

    # 5. Invisible text (render mode 3) that is NOT explained by a page scan.
    d = fitz.open(); p = d.new_page(width=595, height=842)
    p.insert_font(fontname="F", fontfile=font)
    p.insert_text((60, 80), "Scanned Document", fontsize=18, fontname="F")
    p.draw_rect(box, color=(0, 0, 0), fill=(0, 0, 0))
    p.insert_text((60, 140), SECRET, fontsize=12, fontname="F", render_mode=3)
    d.save(f"{out}/rc-invisible-text.pdf"); d.close()

    # 6. White text on a white page - no covering shape at all.
    d = fitz.open(); p = d.new_page(width=595, height=842)
    p.insert_font(fontname="F", fontfile=font)
    p.insert_text((60, 80), "Confidential Memo", fontsize=18, fontname="F")
    p.insert_text((60, 140), SECRET, fontsize=12, fontname="F", color=(1, 1, 1))
    d.save(f"{out}/rc-white-text.pdf"); d.close()

    # 7. Live text hidden under an opaque IMAGE rather than a drawn shape.
    d = fitz.open(); p = d.new_page(width=595, height=842)
    p.insert_font(fontname="F", fontfile=font)
    p.insert_text((60, 80), "Confidential Memo", fontsize=18, fontname="F")
    p.insert_text((60, 140), SECRET, fontsize=12, fontname="F")
    patch = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 970, 48), False); patch.clear_with(0)
    p.insert_image(box, pixmap=patch)
    d.save(f"{out}/rc-image-overlay.pdf"); d.close()

    # 8. Page content properly redacted, but the secret left in metadata.
    d = fitz.open(); p = base_page(d, font)
    p.add_redact_annot(box, fill=(0, 0, 0)); p.apply_redactions()
    d.set_metadata({"title": "Memo", "subject": SECRET, "keywords": "payroll, " + SECRET})
    d.save(f"{out}/rc-metadata-leak.pdf"); d.close()

    # ---------------- cases that MUST NOT be flagged ----------------

    # 9. Text genuinely removed. A black box remains, but nothing under it.
    d = fitz.open(); p = base_page(d, font)
    p.add_redact_annot(box, fill=(0, 0, 0)); p.apply_redactions()
    d.save(f"{out}/rc-true-redaction.pdf"); d.close()

    # 10. An ordinary document with no redaction attempt at all.
    d = fitz.open(); base_page(d, font)
    d.save(f"{out}/rc-no-redaction.pdf"); d.close()

    # 11. FALSE-POSITIVE GUARD: shaded table + highlight bar, text drawn ON TOP.
    #     An engine that ignores draw order reports every cell as hidden.
    d = fitz.open(); p = d.new_page(width=595, height=842)
    p.insert_font(fontname="F", fontfile=font)
    p.insert_text((60, 60), "Quarterly Results", fontsize=16, fontname="F")
    rows = [("Region", "Revenue", "Growth"), ("North", "412,000", "+4.1%"),
            ("South", "388,500", "-1.2%"), ("East", "501,220", "+9.7%"),
            ("West", "297,880", "+2.4%")]
    y = 90
    for i, r in enumerate(rows):
        shade = (0.16, 0.22, 0.38) if i == 0 else ((0.93, 0.94, 0.96) if i % 2 else (1, 1, 1))
        p.draw_rect(fitz.Rect(55, y, 540, y + 26), color=None, fill=shade)
        for j, cell in enumerate(r):
            p.insert_text((65 + j * 160, y + 18), cell, fontsize=11, fontname="F",
                          color=(1, 1, 1) if i == 0 else (0, 0, 0))
        y += 26
    p.draw_rect(fitz.Rect(55, y + 30, 540, y + 56), color=None, fill=(1, 0.92, 0.4))
    p.insert_text((65, y + 48), "Note: East region includes the Kepler acquisition.",
                  fontsize=11, fontname="F")
    d.save(f"{out}/rc-benign-table.pdf"); d.close()

    # 12. FALSE-POSITIVE GUARD: white title on a dark full-bleed cover.
    d = fitz.open(); p = d.new_page(width=595, height=842)
    p.insert_font(fontname="F", fontfile=font)
    p.draw_rect(fitz.Rect(0, 0, 595, 842), color=None, fill=(0.09, 0.11, 0.19))
    p.insert_text((60, 300), "ANNUAL REPORT", fontsize=34, fontname="F", color=(1, 1, 1))
    p.insert_text((60, 340), "Fiscal year 2025", fontsize=14, fontname="F", color=(1, 1, 1))
    d.save(f"{out}/rc-benign-cover.pdf"); d.close()

    # ---------------- flattened / no text layer ----------------

    # 13. The whole page rasterised - what ToolMint's own Redact PDF produces.
    d = fitz.open(); p = base_page(d, font)
    p.draw_rect(box, color=(0, 0, 0), fill=(0, 0, 0))
    pix = p.get_pixmap(dpi=150)
    flat = fitz.open(); fp = flat.new_page(width=595, height=842)
    fp.insert_image(fitz.Rect(0, 0, 595, 842), pixmap=pix)
    flat.save(f"{out}/rc-rasterised.pdf"); flat.close(); d.close()

    # 14. A pure scan with no text layer whatsoever.
    d = fitz.open(); p = base_page(d, font)
    p.draw_rect(box, color=(0, 0, 0), fill=(0, 0, 0))
    pix = p.get_pixmap(dpi=110)
    f = fitz.open(); fp = f.new_page(width=595, height=842)
    fp.insert_image(fitz.Rect(0, 0, 595, 842), pixmap=pix)
    f.save(f"{out}/rc-scan-only.pdf"); f.close(); d.close()

    # ---------------- documented limitation ----------------

    # 15. A drawn signature under a black box. No text is involved, so text
    #     analysis cannot see it. Kept as a deliberate MISS: if this ever
    #     starts passing, the published limitations are out of date.
    d = fitz.open(); p = d.new_page(width=595, height=842)
    p.insert_font(fontname="F", fontfile=font)
    p.insert_text((60, 80), "Signed Agreement", fontsize=18, fontname="F")
    sh = p.new_shape()
    sh.draw_bezier(fitz.Point(70, 145), fitz.Point(110, 110), fitz.Point(150, 180), fitz.Point(190, 140))
    sh.draw_bezier(fitz.Point(190, 140), fitz.Point(230, 100), fitz.Point(270, 170), fitz.Point(310, 138))
    sh.finish(color=(0, 0, 0.6), width=2); sh.commit()
    p.draw_rect(fitz.Rect(55, 100, 330, 185), color=(0, 0, 0), fill=(0, 0, 0))
    d.save(f"{out}/rc-vector-signature.pdf"); d.close()

    # ---------------- edge cases ----------------

    # 16. Encrypted: must be reported as unreadable, never guessed at.
    d = fitz.open(); p = base_page(d, font)
    p.draw_rect(box, color=(0, 0, 0), fill=(0, 0, 0))
    d.save(f"{out}/rc-encrypted.pdf", encryption=fitz.PDF_ENCRYPT_AES_256,
           owner_pw="ownerpw", user_pw="userpw")
    d.close()

    # 17. Corrupt: truncated mid-object.
    raw = open(f"{out}/rc-black-box.pdf", "rb").read()
    open(f"{out}/rc-corrupt.pdf", "wb").write(raw[: len(raw) // 3])

    # 18. Large: 300 pages, with the only bad redaction deep at page 250.
    #     Tests throughput and that a single deep finding is not lost.
    d = fitz.open()
    for i in range(300):
        p = d.new_page(width=595, height=842)
        p.insert_font(fontname="F", fontfile=font)
        p.insert_text((60, 80), f"Report page {i + 1}", fontsize=14, fontname="F")
        for line in range(28):
            p.insert_text((60, 120 + line * 22),
                          f"Row {line + 1}: operational summary text for section {i + 1}.",
                          fontsize=10, fontname="F")
        if i == 249:
            p.insert_text((60, 700), SECRET, fontsize=12, fontname="F")
            p.draw_rect(fitz.Rect(55, 686, 540, 710), color=(0, 0, 0), fill=(0, 0, 0))
    d.save(f"{out}/rc-large.pdf"); d.close()


# Ground truth, established by PyMuPDF alone.
#
# Two DIFFERENT facts, which must not be conflated:
#   recoverable - can an independent parser still read the canary out?
#   concealed   - is it hidden from someone looking at the page?
#
# rc-no-redaction is the case that proves the distinction: the canary is fully
# recoverable there, because it is printed in plain sight. Nothing is hidden,
# so the checker must NOT flag it. A checker that flags visible text is just a
# text extractor with an alarm attached.
EXPECTED = [
    # name                    recoverable  concealed
    ("rc-black-box",          True,        True),
    ("rc-white-box",          True,        True),
    ("rc-mixed",              True,        True),
    ("rc-annot-square",       True,        True),
    ("rc-invisible-text",     True,        True),
    ("rc-white-text",         True,        True),
    ("rc-image-overlay",      True,        True),
    ("rc-metadata-leak",      True,        True),   # in metadata, not on the page
    ("rc-no-redaction",       True,        False),  # recoverable because VISIBLE
    ("rc-true-redaction",     False,       False),
    ("rc-benign-table",       False,       False),
    ("rc-benign-cover",       False,       False),
    ("rc-rasterised",         False,       False),
    ("rc-scan-only",          False,       False),
    ("rc-vector-signature",   False,       False),  # concealed, but not as TEXT
]


def verify(out):
    """Confirm with PyMuPDF - not with our own engine - what actually leaks."""
    print()
    print(f"{'fixture':<26}{'canary found in':<22}{'expected':<12}{'checker flags?'}")
    print("-" * 78)
    bad = 0
    for name, recoverable, concealed in EXPECTED:
        doc = fitz.open(f"{out}/{name}.pdf")
        body = "".join(pg.get_text() for pg in doc)
        meta = " ".join(str(v) for v in (doc.metadata or {}).values())
        doc.close()
        where = []
        if "4417" in body:
            where.append("page text")
        if "4417" in meta:
            where.append("metadata")
        ok = bool(where) == recoverable
        if not ok:
            bad += 1
        print(f"{'  ' if ok else '! '}{name:<24}{(', '.join(where) or 'nothing'):<22}"
              f"{str(recoverable):<12}{'yes' if concealed else 'no'}")
    print("-" * 78)
    print(f"{bad} fixture(s) do not match their documented ground truth")
    return bad


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="fixtures")
    ap.add_argument("--font", default=r"C:\Windows\Fonts\arial.ttf")
    args = ap.parse_args()
    if not os.path.exists(args.font):
        sys.exit(f"Font not found: {args.font}  (pass --font <path to a .ttf>)")
    build(args.out, args.font)
    print(f"Built 18 fixtures in {args.out}/")
    sys.exit(1 if verify(args.out) else 0)
