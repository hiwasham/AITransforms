#!/usr/bin/env python3
"""Stage 2: snapshot every API payload verbatim, then resolve ids -> real URLs.

    python3 .tools/fetch_all.py [--no-resolve]
"""
import sys

import siteconf
from siteconf import ENDPOINTS, SITE, alive, login
import siteapi


def snapshot():
    """Re-login only if the session died, then save every payload raw."""
    if not alive():
        print(f"{SITE}: session dead, re-logging in")
        login()
    for name, path in ENDPOINTS.items():
        data = siteapi.get_json(path, default=[])
        n = len(data) if hasattr(data, "__len__") else "?"
        print(f"  {name}: {n}")
        siteapi.save_raw(name, data)


def resolve():
    """Turn internal ids / 302 download endpoints into real URLs.

    Cache each resolution family in its own raw-json file and merge, so a re-run
    only fills the gaps. See references/spa-member-portal.md for the two worked
    patterns (latching onto a working request shape, 302 Location capture).
    """
    # downloads = {}
    # for item in ...:
    #     url = siteapi.resolve_download(f"/api/.../{item['id']}/download-url")
    #     downloads[key] = {"url": url, "title": item.get("title")}
    # siteapi.merge_cache("download-urls.json", downloads)
    pass


if __name__ == "__main__":
    snapshot()
    if "--no-resolve" not in sys.argv:
        resolve()
