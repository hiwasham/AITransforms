#!/usr/bin/env python3
"""Crawl a Circle post space (Case Studies, Discussion, ...) into readable Markdown.

Usage: fetch_posts.py <space_id> <out_dir> [--force] [--no-comments]
Resumable: a post whose post.md already exists is skipped unless --force.
"""
import json, os, sys, time, datetime, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pm2md
from fetch_lesson import slugify, yaml_str, api, BASE, ROOT
from fetch_all import safe_name, curl_download, collect, stats

FORCE = "--force" in sys.argv
NO_COMMENTS = "--no-comments" in sys.argv
warn = []


_TOPICS = None


def topic_name(t):
    """Post detail returns topic ids, not objects; resolve them once, lazily."""
    if isinstance(t, dict):
        return t.get("name", "")
    global _TOPICS
    if _TOPICS is None:
        try:
            _TOPICS = {r["id"]: r["name"] for r in api("/internal_api/topics")["records"]}
        except SystemExit:
            _TOPICS = {}
    return _TOPICS.get(t, str(t))


def paged(path):
    """Yield every record across pages of a Circle paginated collection."""
    page = 1
    while True:
        sep = "&" if "?" in path else "?"
        d = api(f"{path}{sep}page={page}&per_page=50")
        for r in d.get("records") or []:
            yield r
        if not d.get("has_next_page"):
            return
        page += 1
        time.sleep(0.3)


def comment_tree(post_id):
    """Top-level comments, each with a 'replies' list. Circle serves replies separately."""
    tops = list(paged(f"/internal_api/posts/{post_id}/comments"))
    by_id = {c["id"]: c for c in tops}
    # The list payload already embeds each comment's replies — keep them. Wiping
    # them here silently dropped replies whenever the fallback 404'd.
    for c in tops:
        c["replies"] = list(c.get("replies") or [])
    orphans = []
    for c in tops:
        p = c.get("parent_comment_id")
        if p and p in by_id:
            by_id[p]["replies"].append(c)
        elif p:
            orphans.append(c)
    roots = [c for c in tops if not c.get("parent_comment_id")] + orphans
    for c in tops:
        want = c.get("replies_count") or 0
        if want > len(c["replies"]):
            try:
                extra = list(paged(f"/internal_api/posts/{post_id}/comments"
                                   f"?parent_comment_id={c['id']}"))
                have = {r["id"] for r in c["replies"]}
                c["replies"] += [r for r in extra if r["id"] not in have]
            except SystemExit as e:
                warn.append(f"post {post_id} comment {c['id']}: {want} replies "
                            f"unreachable ({str(e).splitlines()[0][:90]})")
    return roots


def render_comments(roots, depth=0, out=None):
    out = [] if out is None else out
    for c in roots:
        who = (c.get("community_member") or {}).get("name") or "Unknown"
        when = (c.get("created_at") or "")[:10]
        likes = c.get("likes_count") or 0
        body = pm2md.to_markdown(c.get("tiptap_body") or {}).strip()
        pad = "  " * depth
        head = f"{pad}- **{who}** · {when}" + (f" · {likes} 👍" if likes else "")
        out.append(head)
        for line in (body or "_(empty)_").splitlines():
            out.append(f"{pad}  {line}" if line.strip() else "")
        out.append("")
        render_comments(c.get("replies") or [], depth + 1, out)
    return out


def download_assets(body, post_dir):
    """Download every file/image node; returns the asset log and primes pm2md.assets."""
    file_attrs, image_attrs = collect(body)
    pm2md.assets, pm2md.unhandled = {}, set()
    log = []
    for i, a in enumerate(file_attrs, 1):
        sgid = a.get("signed_id")
        if not sgid:
            continue
        url = f"{BASE}/rails/active_storage/blobs/redirect/{urllib.parse.quote(sgid, safe='')}/file"
        got, err = curl_download(url, os.path.join(post_dir, "assets"), f"{i:02d}")
        if got:
            pm2md.assets[sgid] = got
            log.append({"kind": "file", **got})
            stats["files"] += 1
        else:
            warn.append(f"{post_dir}: file {i}: {err}")
    for i, a in enumerate(image_attrs, 1):
        src, sgid = a.get("src") or a.get("url"), a.get("signed_id")
        url = (f"{BASE}/rails/active_storage/blobs/redirect/{urllib.parse.quote(sgid, safe='')}/file"
               if sgid else src)
        if not url:
            continue
        got, err = curl_download(url, os.path.join(post_dir, "assets"), f"img{i:02d}")
        if got:
            if sgid:
                pm2md.assets[sgid] = got
            if src:
                pm2md.assets[src] = got
            log.append({"kind": "image", **got})
            stats["images"] += 1
        else:
            warn.append(f"{post_dir}: image {i}: {err}")
    return log


def write_post(space, meta, pos, out_dir):
    slug = meta["slug"]
    # Some spaces allow title-less posts; fall back to the API slug for the
    # directory name and label the post "(untitled)".
    title = meta.get("name") or None
    stem = slugify(title) if title else (meta.get("slug") or f"post-{meta['id']}")
    post_dir = os.path.join(ROOT, out_dir, f"{pos:02d}-{stem}")
    md_path = os.path.join(post_dir, "post.md")
    if os.path.exists(md_path) and not FORCE:
        stats["skipped"] += 1
        return None
    P = api(f"/internal_api/spaces/{space['id']}/posts/{urllib.parse.quote(slug)}")
    os.makedirs(post_dir, exist_ok=True)
    with open(os.path.join(post_dir, "post.json"), "w") as f:
        json.dump(P, f, indent=2, ensure_ascii=False)
        f.write("\n")

    body = (P.get("tiptap_body") or {}).get("body") or {}
    asset_log = download_assets(body, post_dir)
    body_md = pm2md.to_markdown(P.get("tiptap_body") or {})

    roots = [] if NO_COMMENTS else comment_tree(P["id"])
    n_comments = 0
    def count(cs):
        nonlocal n_comments
        for c in cs:
            n_comments += 1
            count(c.get("replies") or [])
    count(roots)
    if roots:
        with open(os.path.join(post_dir, "comments.json"), "w") as f:
            json.dump(roots, f, indent=2, ensure_ascii=False)
            f.write("\n")

    author = (P.get("community_member") or {}).get("name")
    url = f"{BASE}/c/{P.get('space_slug') or space['slug']}/{slug}"
    fm = {
        "title": P.get("name") or "(untitled)",
        "space": P.get("space_name") or space["name"],
        "post_number": pos, "author": author, "status": P.get("status"),
        "post_id": P["id"], "space_id": space["id"], "slug": slug, "url": url,
        "topics": ", ".join(topic_name(t) for t in (P.get("topics") or [])) or None,
        "attachments": sum(1 for a in asset_log if a["kind"] == "file"),
        "images": sum(1 for a in asset_log if a["kind"] == "image"),
        "comments": n_comments,
        "published_at": P.get("published_at"), "updated_at": P.get("updated_at"),
        "fetched_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
    }
    out = ["---"] + [f"{k}: {yaml_str(v)}" for k, v in fm.items()] + ["---", ""]
    out += [f"# {fm['title']}", "",
            f"> {fm['space']} › Post {pos}"
            + (f" › by {author}" if author else "")
            + (f" › {fm['published_at'][:10]}" if fm.get("published_at") else ""), "",
            f"[Open on Circle]({url})", ""]
    if asset_log:
        out += ["## Files", ""]
        for a in asset_log:
            kb = a["size"] / 1024
            sz = f"{kb/1024:.1f} MB" if kb > 1024 else f"{kb:.0f} KB"
            out += [f"- [{a['name']}](./{a['path']}) ({sz})"]
        out += [""]
    out += ["## Content", "", body_md]
    if roots:
        out += ["", f"## Discussion ({n_comments} comment{'s' if n_comments != 1 else ''})", ""]
        out += render_comments(roots)
    if pm2md.unhandled:
        out += ["", "## Conversion warnings", ""] + [f"- unhandled: `{u}`" for u in sorted(pm2md.unhandled)]
    with open(md_path, "w") as f:
        f.write("\n".join(out).rstrip() + "\n")
    stats["lessons"] += 1
    flag = f" [{fm['attachments']}f/{fm['images']}i]" if asset_log else ""
    print(f"  {pos:02d} {fm['title'][:56]:<56} {len(body_md):>6}c{flag} 💬{n_comments}", flush=True)
    return {"pos": pos, "dir": os.path.basename(post_dir), **fm}


def main():
    space_id, out_dir = int(sys.argv[1]), sys.argv[2]
    space = api(f"/internal_api/spaces/{space_id}")
    print(f"=== {space['name']} (space {space_id}, {space.get('posts_count')} posts) ===", flush=True)
    posts = list(paged(f"/internal_api/spaces/{space_id}/posts"))
    # Oldest first: case studies read as a series, and a stable order keeps the
    # NN- directory prefixes from churning on re-runs.
    posts.sort(key=lambda p: (p.get("published_at") or "", p["id"]))
    written = []
    os.makedirs(os.path.join(ROOT, out_dir), exist_ok=True)
    for pos, meta in enumerate(posts, 1):
        try:
            got = write_post(space, meta, pos, out_dir)
            if got:
                written.append(got)
        except SystemExit as e:
            warn.append(f"post {meta.get('slug')}: {e}")
            print(f"  !! {meta['name'][:50]}: {e}", flush=True)
        time.sleep(0.35)
    with open(os.path.join(ROOT, out_dir, "posts.json"), "w") as f:
        json.dump({"space": {k: space.get(k) for k in ("id", "name", "slug", "post_type",
                                                       "posts_count", "space_group_name")},
                   "fetched_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
                   "posts": [{k: v for k, v in p.items() if k != "pos"} for p in written]},
                  f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"\nwritten {stats['lessons']}  skipped {stats['skipped']}  "
          f"files {stats['files']}  images {stats['images']}  {stats['bytes']/1024/1024:.1f} MB")
    for w in warn:
        print("  warn:", w)


if __name__ == "__main__":
    main()
