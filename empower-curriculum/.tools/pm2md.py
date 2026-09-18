#!/usr/bin/env python3
"""Convert Circle's ProseMirror/TipTap rich_text_body into Markdown.

Unknown node types are NOT dropped: they emit an UNHANDLED marker plus the raw
node JSON, and are recorded in `unhandled` so a run over many lessons surfaces
gaps instead of silently losing content.
"""
import json

unhandled: set[str] = set()

# Filled by the caller before conversion: signed_id or source URL -> {"path", "name"}
assets: dict = {}


def _asset(key):
    return assets.get(key) if key else None


def _marks(text: str, marks: list) -> str:
    for m in marks or []:
        t = m.get("type")
        a = m.get("attrs") or {}
        if t == "bold":
            text = f"**{text}**"
        elif t == "italic":
            text = f"*{text}*"
        elif t == "underline":
            text = f"<u>{text}</u>"
        elif t == "strike":
            text = f"~~{text}~~"
        elif t == "code":
            text = f"`{text}`"
        elif t == "link":
            href = a.get("href") or a.get("url") or ""
            text = f"[{text}]({href})"
        else:
            unhandled.add(f"mark:{t}")
    return text


def inline(nodes, sgids: dict) -> str:
    out = []
    for n in nodes or []:
        t = n.get("type")
        a = n.get("attrs") or {}
        if t == "text":
            out.append(_marks(n.get("text", ""), n.get("marks")))
        elif t == "hardBreak":
            out.append("  \n")
        elif t == "entity":
            ent = sgids.get(a.get("sgid")) or {}
            name = (ent.get("name") or "").strip()
            url = ent.get("url")
            out.append(f"[{name}]({url})" if url else (name or "@mention"))
        elif t == "mention":
            out.append("@" + (a.get("name") or a.get("label") or "mention"))
        elif t == "emoji":
            out.append(a.get("native") or a.get("shortcodes") or "")
        elif t == "image":
            src = a.get("src") or a.get("url") or ""
            got = _asset(a.get("signed_id")) or _asset(src)
            out.append(f"![{a.get('alt') or (got or {}).get('name') or ''}]({(got or {}).get('path') or src})")
        else:
            unhandled.add(f"inline:{t}")
            out.append(f"<!-- UNHANDLED inline {t}: {json.dumps(n, ensure_ascii=False)} -->")
    return "".join(out)


def block(n, sgids: dict, depth: int = 0) -> list[str]:
    t = n.get("type")
    a = n.get("attrs") or {}
    kids = n.get("content") or []
    pad = "  " * depth

    if t == "paragraph":
        txt = inline(kids, sgids).strip()
        return [pad + txt] if txt else []
    if t == "heading":
        return ["#" * int(a.get("level", 2)) + " " + inline(kids, sgids).strip()]
    if t in ("bulletList", "orderedList"):
        lines = []
        for i, li in enumerate(kids, 1):
            marker = f"{i}." if t == "orderedList" else "-"
            inner = []
            for c in li.get("content") or []:
                inner += block(c, sgids, depth + 1)
            inner = [x for x in inner if x.strip()]
            if not inner:
                continue
            lines.append(f"{pad}{marker} {inner[0].strip()}")
            for extra in inner[1:]:
                lines.append(f"{pad}  {extra.strip()}")
        return lines
    if t == "listItem":
        out = []
        for c in kids:
            out += block(c, sgids, depth)
        return out
    if t == "blockquote":
        out = []
        for c in kids:
            out += ["> " + x for x in block(c, sgids, depth)]
        return out
    if t == "codeBlock":
        lang = a.get("language") or ""
        return [f"```{lang}", inline(kids, sgids), "```"]
    if t == "horizontalRule":
        return ["---"]
    if t == "image":
        src = a.get("src") or a.get("url") or ""
        got = _asset(a.get("signed_id")) or _asset(src)
        if got:
            return [f"![{a.get('alt') or got['name']}]({got['path']})", "", f"_{got['name']}_"]
        return [f"![{a.get('alt') or ''}]({src})"]
    if t in ("file", "attachment"):
        got = _asset(a.get("signed_id"))
        if got:
            return [f"\N{PAPERCLIP} **[{got['name']}]({got['path']})**"]
        url = a.get("url") or a.get("src") or a.get("href") or ""
        label = a.get("filename") or a.get("title") or "attachment"
        return [f"\N{PAPERCLIP} **{label}**" + (f" — {url}" if url else " _(unresolved)_")]
    if t == "cta":
        # Circle button. These are load-bearing: they're how lessons link out to
        # the Google Docs holding the prompts, so never let one degrade to a warning.
        label = a.get("label") or "Open"
        url = a.get("url") or ""
        return [f"\N{RIGHTWARDS ARROW} **[{label}]({url})**" if url else f"\N{RIGHTWARDS ARROW} **{label}**"]
    if t in ("embed", "iframe", "video", "audio", "bookmark"):
        url = a.get("url") or a.get("src") or a.get("href") or ""
        label = a.get("title") or t
        return [f"\N{CLAPPER BOARD} **{label}**" + (f" — {url}" if url else f" {json.dumps(a, ensure_ascii=False)}")]
    if t == "table":
        out = []
        for r_i, row in enumerate(kids):
            cells = ["  ".join(x.strip() for c in (cell.get("content") or []) for x in block(c, sgids)) for cell in row.get("content") or []]
            out.append("| " + " | ".join(cells) + " |")
            if r_i == 0:
                out.append("| " + " | ".join("---" for _ in cells) + " |")
        return out

    unhandled.add(f"block:{t}")
    return [f"<!-- UNHANDLED block {t} -->", "```json", json.dumps(n, indent=1, ensure_ascii=False), "```"]


def to_markdown(rich_text_body: dict) -> str:
    if not rich_text_body:
        return ""
    sgids = rich_text_body.get("sgids_to_object_map") or {}
    doc = rich_text_body.get("body") or {}
    out = []
    for n in doc.get("content") or []:
        chunk = block(n, sgids)
        if chunk:
            out.append("\n".join(chunk))
    return "\n\n".join(out).strip() + "\n"
