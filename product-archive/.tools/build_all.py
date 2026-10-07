#!/usr/bin/env python3
"""Stage 3: render the Markdown tree. Reads ONLY raw-json/ - no network, no login.

    python3 .tools/build_all.py
"""
import os

from siteconf import BASE, DEAD_HOSTS, SITE_TITLE
import siteapi

ROOT = siteapi.ROOT


def raw(name, default=None):
    return siteapi.load_raw(name, default)


def dead_flag(url):
    return "  *(link dead - see GAPS.md)*" if any(h in (url or "") for h in DEAD_HOSTS) else ""


def build_items():
    """One numbered folder per item: rendered .md next to its verbatim .json."""
    for i, it in enumerate(raw("TODO.json", []) or [], 1):
        d = os.path.join(ROOT, "01-TODO", f"{i:02d}-{siteapi.slug(it.get('title'))}")
        siteapi.write(os.path.join(d, "item.md"), "\n".join([
            siteapi.fm(title=it.get("title"), source=BASE, date=siteapi.date_only(it.get("createdAt"))),
            "", f"# {it.get('title')}", "", siteapi.html2md(it.get("body") or ""),
        ]))
        siteapi.save_raw("item.json", it, root=d)


def build_root():
    """Root README: counts table, layout, re-run recipe, GAPS pointer."""
    st = siteapi.tree_stats(ROOT)
    siteapi.write(os.path.join(ROOT, "README.md"), "\n".join([
        siteapi.fm(title=f"{SITE_TITLE} archive", source=BASE),
        "", f"# {SITE_TITLE} archive", "",
        "| | |", "|---|---|",
        f"| On disk | **{st['md']} Markdown**, {st['json']} JSON, {st['pdf']} PDF, "
        f"{st['media']} audio/video, {siteapi.human(st['bytes'])} total |",
        "", "## Re-run", "", "```bash",
        "python3 .tools/siteconf.py     # session cookie",
        "python3 .tools/fetch_all.py    # snapshot + resolve",
        "python3 .tools/build_all.py    # render this tree",
        "python3 .tools/fetch_files.py  # documents (small)",
        "python3 .tools/fetch_files.py --media   # + audio/video (gitignored)",
        "```", "",
        "## Not archived", "", "See [GAPS.md](GAPS.md).",
    ]))


if __name__ == "__main__":
    build_items()
    build_root()
