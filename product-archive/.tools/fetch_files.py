#!/usr/bin/env python3
"""Stage 4: download attached files. Documents are committed; media is opt-in.

    python3 .tools/fetch_files.py [--media] [--dry-run]
"""
import os
import sys

from siteconf import BASE
import siteapi

ROOT = siteapi.ROOT
MEDIA_EXT = {"mp3", "mp4", "m4a", "wav", "mov", "webm", "aac", "flac"}
DOC_MIME = ("pdf", "word", "excel", "powerpoint", "text", "zip", "epub", "octet")


def is_media(url, mime=""):
    ext = siteapi.safe_name(url).rsplit(".", 1)[-1].lower()
    return ext in MEDIA_EXT or (mime or "").startswith(("audio/", "video/"))


def targets():
    """(url, dest, kind) triples. Dedupe dest by suffixing, never by skipping."""
    out, seen = [], set()
    for entry in (siteapi.load_raw("download-urls.json", {}) or {}).values():
        u = entry.get("url")
        if not u:
            continue
        d = os.path.join(ROOT, "01-TODO", "assets", siteapi.safe_name(u))
        if d in seen:
            stem, ext = os.path.splitext(d)
            d = f"{stem}-{abs(hash(u)) % 9999}{ext}"
        seen.add(d)
        out.append((u, d, "media" if is_media(u, entry.get("mimeType")) else "doc"))
    return out


def main():
    want_media = "--media" in sys.argv
    dry = "--dry-run" in sys.argv
    ts = [t for t in targets() if want_media or t[2] == "doc"]
    if dry:
        print(f"{len(ts)} files ({sum(1 for t in ts if t[2]=='media')} media)")
        return
    ok = got = cached = fail = 0
    for u, d, _ in ts:
        good, n, note = siteapi.download(u, d)
        if not good:
            fail += 1
            print(f"  ! {note}: {u}", file=sys.stderr)
        elif note == "cached":
            cached += 1
        else:
            ok += 1
            got += n
    print(f"done: {ok} new ({siteapi.human(got)}), {cached} cached, {fail} failed")


if __name__ == "__main__":
    main()
