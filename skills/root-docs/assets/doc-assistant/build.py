#!/usr/bin/env python3
"""Inject the "Ask this page" reading assistant into every standalone HTML
document under docs/.

    python3 docs/tools/doc-assistant/build.py
    python3 docs/tools/doc-assistant/build.py --check   # must report 0 pages would change

The assistant has one source — assistant.js and assistant.css in this folder.
This script inlines both, plus per-page metadata, between sentinel comments
immediately before </body>. **Never hand-edit the generated block in a page:**
change the shared source and rebuild.

Always rebuild *every* page, even when you touched one. Each page's metadata
carries the sibling index, so adding a page or changing a title changes the
generated block in every other page too. That is why there is no single-file
mode.

Idempotency is the property that makes --check meaningful, and two rules protect
it:

  1. Nothing time-varying is emitted. No build timestamp, no version counter.
     A date in the block would make every build differ from the last.
  2. Metadata is extracted from *visible document prose only* — the generated
     block is stripped first, then scripts, styles and comments. If the
     extractor could see its own output, the assistant would change the next
     build's input and the two would never converge.

Security: no API key belongs in this file, in a page, on the command line, or
in source control. The reader supplies their own in the panel. See the header of
assistant.js for the full boundary.
"""

import argparse
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DOCS = HERE.parent.parent            # .../docs
BEGIN = "<!-- doc-assistant:begin (generated — do not edit; change the shared source and rebuild) -->"
END = "<!-- doc-assistant:end -->"

BLOCK_RE = re.compile(re.escape(BEGIN) + r".*?" + re.escape(END), re.DOTALL)
SCRIPT_STYLE_RE = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.DOTALL | re.IGNORECASE)
COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)
TAG_RE = re.compile(r"<[^>]+>")
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.DOTALL | re.IGNORECASE)
H1_RE = re.compile(r"<h1[^>]*>(.*?)</h1>", re.DOTALL | re.IGNORECASE)
SECTION_RE = re.compile(r'<section\b[^>]*\bid="([^"]+)"[^>]*>(.*?)(?=<section\b|</body)', re.DOTALL | re.IGNORECASE)
H2_RE = re.compile(r"<h2[^>]*>(.*?)</h2>", re.DOTALL | re.IGNORECASE)

ENTITIES = {
    "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
    "&nbsp;": " ", "&mdash;": "—", "&ndash;": "–", "&hellip;": "…",
    "&#183;": "·", "&#8212;": "—", "&#8217;": "’", "&#8220;": "“",
    "&#8221;": "”", "&#160;": " ", "&#9888;": "⚠",
}


def strip_generated(html: str) -> str:
    """Remove the assistant's own block. Always the first step of extraction."""
    return BLOCK_RE.sub("", html)


def visible_text(fragment: str) -> str:
    """Collapse an HTML fragment to the prose a reader would see."""
    text = SCRIPT_STYLE_RE.sub(" ", fragment)
    text = COMMENT_RE.sub(" ", text)
    text = TAG_RE.sub(" ", text)
    for entity, char in ENTITIES.items():
        text = text.replace(entity, char)
    text = re.sub(r"&#\d+;", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def page_title(html: str) -> str:
    """The <title>, falling back to the first <h1>, falling back to nothing."""
    match = TITLE_RE.search(html) or H1_RE.search(html)
    return visible_text(match.group(1)) if match else ""


def page_sections(html: str):
    """Every <section id>, labelled by its own <h2>. Document order preserved."""
    sections = []
    for section_id, inner in SECTION_RE.findall(html):
        heading = H2_RE.search(inner)
        label = visible_text(heading.group(1)) if heading else section_id
        sections.append({"id": section_id, "label": label})
    return sections


def html_pages():
    """Every standalone .html under docs/, in a stable order."""
    return sorted(p for p in DOCS.rglob("*.html") if p.is_file())


def render_block(meta: dict, css: str, js: str) -> str:
    """The generated block. Deterministic: no timestamp, sorted keys."""
    payload = json.dumps(meta, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    # A literal "</script>" inside the JSON would close the tag early.
    payload = payload.replace("</", "<\\/")
    return (
        f"{BEGIN}\n"
        f"<style>\n{css.strip()}\n</style>\n"
        f"<script>window.__DOC_ASSISTANT__={payload};</script>\n"
        f"<script>\n{js.strip()}\n</script>\n"
        f"{END}"
    )


def build_page(path: Path, css: str, js: str, index: list) -> str:
    """Return what this page's HTML should be, without writing it."""
    original = path.read_text(encoding="utf-8")
    clean = strip_generated(original)

    meta = {
        "title": page_title(clean) or path.stem,
        "sections": page_sections(clean),
        "siblings": [row for row in index if row["file"] != path.name],
    }
    block = render_block(meta, css, js)

    if BLOCK_RE.search(original):
        return BLOCK_RE.sub(lambda _: block, original, count=1)

    lower = clean.lower()
    at = lower.rfind("</body>")
    if at == -1:
        raise SystemExit(f"error: {path} has no </body> to inject before")
    return clean[:at] + block + "\n" + clean[at:]


def main() -> int:
    parser = argparse.ArgumentParser(description="Build the docs reading assistant into every HTML page.")
    parser.add_argument("--check", action="store_true",
                        help="report what would change without writing; exits non-zero if anything would")
    args = parser.parse_args()

    css = (HERE / "assistant.css").read_text(encoding="utf-8")
    js = (HERE / "assistant.js").read_text(encoding="utf-8")

    pages = html_pages()
    if not pages:
        print("no HTML pages under docs/ — nothing to do")
        return 0

    # The sibling index is built from every page's prose *before* any injection,
    # so one page's generated block can never leak into another page's metadata.
    index = []
    for path in pages:
        clean = strip_generated(path.read_text(encoding="utf-8"))
        index.append({
            "file": path.name,
            "title": page_title(clean) or path.stem,
            "path": str(path.relative_to(DOCS)),
        })
    index.sort(key=lambda row: row["path"])

    changed = []
    for path in pages:
        current = path.read_text(encoding="utf-8")
        wanted = build_page(path, css, js, index)
        if current == wanted:
            continue
        changed.append(path)
        if not args.check:
            path.write_text(wanted, encoding="utf-8")

    rel = [str(p.relative_to(DOCS)) for p in changed]
    if args.check:
        for name in rel:
            print(f"would change: {name}")
        print(f"{len(changed)} pages would change")
        return 1 if changed else 0

    for name in rel:
        print(f"updated: {name}")
    print(f"{len(pages)} pages processed, {len(changed)} updated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
