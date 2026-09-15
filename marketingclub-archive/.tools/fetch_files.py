#!/usr/bin/env python3
"""Download the archive's files. Documents by default, heavy media on request.

    python3 .tools/fetch_files.py            # PDFs / documents only (small)
    python3 .tools/fetch_files.py --media    # + audio and video (~1 GB, gitignored)
    python3 .tools/fetch_files.py --dry-run  # list what would be pulled

Sources: main-content session downloads + audio, and every hub item whose
download URL fetch_all.py managed to resolve. Files land next to the lesson
that references them, under assets/.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mcapi  # noqa: E402

MEDIA_EXT = {"mp3", "mp4", "m4a", "wav", "mov", "webm", "aac", "flac"}
DOC_MIME = ("pdf", "word", "excel", "powerpoint", "text", "zip", "epub", "octet")


def raw(name, default=None):
    p = os.path.join(mcapi.RAW, name)
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else default


def fname(url, fallback="file"):
    base = os.path.basename((url or "").split("?")[0].split("#")[0])
    base = re.sub(r"[^A-Za-z0-9._-]+", "-", base).strip("-")
    return base or fallback


def is_media(url, mime=""):
    ext = fname(url).rsplit(".", 1)[-1].lower()
    return ext in MEDIA_EXT or (mime or "").startswith(("audio/", "video/"))


def targets():
    """(url, dest_path, kind) for everything the archive references."""
    out = []
    sections = sorted(raw("main-content.json") or [], key=lambda s: s.get("sortOrder") or 0)
    for i, sec in enumerate(sections, 1):
        sd = os.path.join(mcapi.ROOT, "02-main-content",
                          f"{i:02d}-{mcapi.slug(sec.get('title') or '', 48)}", "assets")
        for s in sorted(sec.get("sessions") or [], key=lambda s: s.get("sortOrder") or 0):
            if s.get("audioUrl"):
                out.append((s["audioUrl"], os.path.join(sd, fname(s["audioUrl"], "audio.mp3")),
                            "media"))
            for d in s.get("downloads") or []:
                if d.get("url"):
                    out.append((d["url"], os.path.join(sd, fname(d["url"], "download.pdf")),
                                "media" if is_media(d["url"]) else "doc"))
    products = raw("hub-products.json") or []
    slugs = {p.get("slug"): (n, p) for n, p in enumerate(products, 1)}
    for key, rec in (raw("hub-download-urls.json") or {}).items():
        if not rec.get("url"):
            continue
        pslug = rec.get("product") or key.split("/")[0]
        n = slugs.get(pslug, (0, {}))[0]
        pd = os.path.join(mcapi.ROOT, "03-programs", f"{n:02d}-{mcapi.slug(pslug, 48)}", "assets")
        nm = fname(rec["url"]) or (mcapi.slug(rec.get("title") or "item", 48))
        kind = "media" if is_media(rec["url"], rec.get("mimeType") or "") else "doc"
        out.append((rec["url"], os.path.join(pd, nm), kind))
    seen, uniq = set(), []
    for u, d, k in out:
        if d in seen:
            stem, ext = os.path.splitext(d)
            d = f"{stem}-{abs(hash(u)) % 9999}{ext}"
        seen.add(d)
        uniq.append((u, d, k))
    return uniq


def main():
    want_media = "--media" in sys.argv
    dry = "--dry-run" in sys.argv
    all_t = targets()
    todo = [t for t in all_t if want_media or t[2] == "doc"]
    n_media = sum(1 for t in all_t if t[2] == "media")
    print(f"{len(all_t)} references: {len(all_t) - n_media} documents, {n_media} audio/video")
    print(f"fetching {len(todo)}" + ("" if want_media else "  (add --media for the rest)"))
    ok = fail = cached = 0
    got = 0
    for url, dest, kind in todo:
        rel = os.path.relpath(dest, mcapi.ROOT)
        if dry:
            print(f"  would get {rel}")
            continue
        good, n, note = mcapi.download(url, dest)
        if good and note == "cached":
            cached += 1
        elif good:
            ok += 1
            got += n
            print(f"  + {rel} ({mcapi.human(n)})")
        else:
            fail += 1
            print(f"  ! {rel}: {note}", file=sys.stderr)
    if not dry:
        print(f"done: {ok} new ({mcapi.human(got)}), {cached} cached, {fail} failed")


if __name__ == "__main__":
    main()
