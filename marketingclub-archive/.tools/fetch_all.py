#!/usr/bin/env python3
"""Snapshot every member-facing API payload into raw-json/, then resolve media URLs.

    python3 .tools/fetch_all.py            # snapshot + resolve
    python3 .tools/fetch_all.py --no-resolve

Writes raw-json/*.json (verbatim payloads) plus two resolver caches:
    videovault-share-ids.json   videovault:NNNN -> {shareId, embedUrl}
    hub-download-urls.json      <product>/<itemId> -> {url, ...}
Re-runnable: resolver caches are merged, so a second pass only fills gaps.
"""
import json
import os
import sys
import urllib.parse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mcapi  # noqa: E402

ENDPOINTS = {
    "auth-user.json": "/api/auth/user",
    "members-me.json": "/api/members/me",
    "main-content.json": "/api/main-content",
    "meetings.json": "/api/meetings",
    "hub-products.json": "/api/hub-agent/products",
    "members.json": "/api/members",
    "addevent-events.json": "/api/addevent-events",
    "content-access-rules.json": "/api/content-access-rules",
    "bonus.json": "/api/bonus",
    "events.json": "/api/events",
    "valuebombs.json": "/api/valuebombs",
}
SHARE_CACHE = "videovault-share-ids.json"
DL_CACHE = "hub-download-urls.json"
EMBED = "https://video-vault-pro.replit.app/embed/"


def load_cache(name):
    p = os.path.join(mcapi.RAW, name)
    if os.path.exists(p):
        try:
            return json.load(open(p, encoding="utf-8"))
        except ValueError:
            pass
    return {}


def snapshot():
    me = mcapi.get_json("/api/members/me")
    if not me:
        print("session dead or missing - logging in")
        who = mcapi.login()
        print(f"  logged in as {who.get('firstName')} {who.get('lastName')}")
    out = {}
    for name, ep in ENDPOINTS.items():
        data = mcapi.get_json(ep)
        if data is None:
            continue
        mcapi.save_raw(name, data)
        n = len(data) if isinstance(data, (list, dict)) else 1
        print(f"  {name:<28} {n:>5} {'items' if isinstance(data, list) else 'keys'}")
        out[name] = data
    return out


def videovault_ids(main_content, meetings):
    """Every videovault:NNNN reference across the two content trees."""
    ids = set()
    for sec in main_content or []:
        for s in sec.get("sessions") or []:
            v = s.get("videoId")
            if isinstance(v, str) and v.startswith("videovault:"):
                ids.add(v)
    for m in meetings or []:
        for k in ("sourceUrl", "videoUrl"):
            v = m.get(k)
            if isinstance(v, str) and v.startswith("videovault:"):
                ids.add(v)
    return sorted(ids, key=lambda s: int(s.split(":")[1]) if s.split(":")[1].isdigit() else 0)


def resolve_share_ids(ids, cache):
    """Try the known request shapes; keep whichever returns a shareId."""
    todo = [i for i in ids if i not in cache or not cache[i].get("shareId")]
    print(f"  share ids: {len(ids)} refs, {len(todo)} to resolve")
    variants = [
        lambda v: f"/api/videovault/share-id?videoId={urllib.parse.quote(v)}",
        lambda v: f"/api/videovault/share-id?videoId={v.split(':')[1]}",
        lambda v: f"/api/videovault/share-id/{urllib.parse.quote(v)}",
        lambda v: f"/api/videovault/share-id/{v.split(':')[1]}",
    ]
    good = None
    for vid in todo:
        tries = [variants[good]] if good is not None else variants
        for n, mk in enumerate(tries):
            code, raw = mcapi.get(mk(vid))
            if code != 200:
                continue
            try:
                d = json.loads(raw)
            except ValueError:
                continue
            sid = d.get("shareId") or d.get("share_id") or d.get("id")
            if not sid:
                continue
            cache[vid] = {"shareId": sid, "embedUrl": EMBED + str(sid),
                          "raw": {k: v for k, v in d.items() if k != "shareId"} or None}
            if good is None:
                good = variants.index(mk) if mk in variants else n
            break
        else:
            cache.setdefault(vid, {"shareId": None, "error": "unresolved"})
    ok = sum(1 for v in cache.values() if v.get("shareId"))
    print(f"  share ids resolved: {ok}/{len(cache)}")
    mcapi.save_raw(SHARE_CACHE, cache)
    return cache


def resolve_downloads(products, cache):
    """Ask the hub for a real file URL per item."""
    todo = []
    for p in products or []:
        for l in p.get("lessons") or []:
            for it in l.get("items") or []:
                key = f"{p['slug']}/{it['id']}"
                if key not in cache or not cache[key].get("url"):
                    todo.append((p["slug"], l.get("slug"), it, key))
    print(f"  hub items: {len(todo)} to resolve")
    for slug, lslug, it, key in todo:
        path = (f"/api/hub-agent/products/{urllib.parse.quote(slug)}"
                f"/items/{urllib.parse.quote(str(it['id']))}/download-url")
        code, body = mcapi.location(path)
        rec = {"product": slug, "lesson": lslug, "itemType": it.get("itemType"),
               "title": it.get("title"), "mimeType": it.get("mimeType"),
               "sizeBytes": it.get("sizeBytes"), "url": None}
        if code in (301, 302, 303, 307, 308) and isinstance(body, str):
            rec["url"] = body
        elif code == 200:
            try:
                d = json.loads(body)
                rec["url"] = mcapi.s3_pathstyle(
                    d.get("url") or d.get("downloadUrl") or d.get("signedUrl") or "")
                rec["expires"] = d.get("expiresAt") or d.get("expires")
            except ValueError:
                rec["error"] = "not JSON"
        else:
            rec["error"] = f"HTTP {code}"
        cache[key] = rec
    ok = sum(1 for v in cache.values() if v.get("url"))
    print(f"  hub urls resolved: {ok}/{len(cache)}")
    mcapi.save_raw(DL_CACHE, cache)
    return cache


def main():
    print("== snapshot ==")
    data = snapshot()
    if "--no-resolve" in sys.argv:
        return
    print("== resolve videovault ==")
    ids = videovault_ids(data.get("main-content.json"), data.get("meetings.json"))
    resolve_share_ids(ids, load_cache(SHARE_CACHE))
    print("== resolve hub downloads ==")
    resolve_downloads(data.get("hub-products.json"), load_cache(DL_CACHE))
    print("done ->", mcapi.RAW)


if __name__ == "__main__":
    main()
