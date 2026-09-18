#!/usr/bin/env python3
"""Archive the EMPOWER Labs member directory, leaderboards and who-is-active data.

Usage: fetch_members.py [--skip-activity]

Writes into empower-participants/: members.json, leaderboard.json, activity.json.
Only fields the community itself shows in its member directory are stored — Circle
withholds email addresses for members who have not made them public, so none are here.
"""
import json, os, re, sys, time, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_lesson import api, BASE, ROOT

OUT = os.path.join(ROOT, "empower-participants")
PERIODS = ("7_days", "30_days", "all_time")
SKIP_ACTIVITY = "--skip-activity" in sys.argv
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")

KEEP = ("id", "user_id", "public_uid", "name", "headline", "bio", "profile_info",
        "status", "messaging_enabled", "visible_in_member_directory",
        "profile_confirmed_at", "accepted_or_not_invited")


def fetch_members():
    recs, page = [], 1
    while True:
        d = api(f"/internal_api/search/community_members?page={page}&per_page=100")
        batch = d.get("records") or []
        recs += batch
        print(f"  page {page}: +{len(batch)} (total {len(recs)}/{d.get('count')})", flush=True)
        if not d.get("has_next_page"):
            break
        page += 1
        time.sleep(0.35)
    out = []
    for r in recs:
        m = {k: r.get(k) for k in KEEP}
        m["profile_url"] = f"{BASE}/u/{r.get('public_uid')}"
        # Member tags are admin bookkeeping ("[OD] S01 Setup"); keep only ones the
        # community actually renders on a profile, so this stays a directory copy.
        m["tags"] = [t["name"] for t in (r.get("member_tags") or []) if t.get("should_display")]
        out.append(m)
    return out


def fetch_leaderboards():
    lb = {}
    for p in PERIODS:
        d = api(f"/internal_api/gamification/leaderboard?period={p}")
        lb[p] = d.get("top_members") or []
        print(f"  {p}: {len(lb[p])} ranked", flush=True)
        time.sleep(0.3)
    return lb


def fetch_activity():
    """Who posts and who comments, per space. Courses have no posts, so skip them."""
    spaces = [s for s in api("/internal_api/spaces").get("records", [])
              if s.get("post_type") != "course" and (s.get("posts_count") or 0) > 0]
    acts, posts_seen = {}, []

    def bump(member, kind, space, title, url, when):
        if not member:
            return
        mid = member.get("id")
        a = acts.setdefault(mid, {"id": mid, "name": member.get("name"),
                                  "public_uid": member.get("public_uid"),
                                  "posts": 0, "comments": 0, "items": []})
        a[kind] += 1
        a["items"].append({"kind": kind[:-1], "space": space, "title": title,
                           "url": url, "at": (when or "")[:10]})

    for s in spaces:
        page, n = 1, 0
        while True:
            d = api(f"/internal_api/spaces/{s['id']}/posts?page={page}&per_page=50")
            for p in d.get("records") or []:
                url = f"{BASE}/c/{s['slug']}/{p['slug']}"
                bump(p.get("community_member"), "posts", s["name"], p.get("name"), url,
                     p.get("published_at"))
                posts_seen.append({"space": s["name"], "space_id": s["id"], "id": p["id"],
                                   "title": p.get("name"), "slug": p["slug"], "url": url,
                                   "author": (p.get("community_member") or {}).get("name"),
                                   "published_at": p.get("published_at")})
                try:
                    c = api(f"/internal_api/posts/{p['id']}/comments?per_page=50")
                    for cm in c.get("records") or []:
                        bump(cm.get("community_member"), "comments", s["name"],
                             p.get("name"), url, cm.get("created_at"))
                except SystemExit as e:
                    print(f"    warn comments {p['id']}: {e}", flush=True)
                n += 1
                time.sleep(0.25)
            if not d.get("has_next_page"):
                break
            page += 1
        print(f"  {s['name'][:40]:<40} {n} posts scanned", flush=True)
    return acts, posts_seen


def main():
    os.makedirs(OUT, exist_ok=True)
    print("=== member directory ===", flush=True)
    members = fetch_members()
    json.dump({"community": "EMPOWER Labs", "source": f"{BASE}/members",
               "fetched_at": NOW, "count": len(members), "members": members},
              open(os.path.join(OUT, "members.json"), "w"), indent=2, ensure_ascii=False)

    print("=== leaderboards ===", flush=True)
    lb = fetch_leaderboards()
    json.dump({"source": f"{BASE}/leaderboard", "fetched_at": NOW,
               "periods": {p: [{k: v for k, v in m.items() if k != "avatar_url"} for m in ms]
                           for p, ms in lb.items()}},
              open(os.path.join(OUT, "leaderboard.json"), "w"), indent=2, ensure_ascii=False)

    if not SKIP_ACTIVITY:
        print("=== activity scan (posts + comments per space) ===", flush=True)
        acts, posts = fetch_activity()
        json.dump({"fetched_at": NOW, "posts_scanned": len(posts),
                   "contributors": sorted(acts.values(),
                                          key=lambda a: -(a["posts"] * 2 + a["comments"])),
                   "posts": posts},
                  open(os.path.join(OUT, "activity.json"), "w"), indent=2, ensure_ascii=False)
        print(f"  {len(acts)} contributors across {len(posts)} posts", flush=True)

    print(f"\nmembers {len(members)} · leaderboard periods {len(lb)} · out {OUT}")


if __name__ == "__main__":
    main()
