#!/usr/bin/env python3
"""Crawl every Circle lesson into the readable hierarchy, with assets.

Usage: fetch_all.py [--force] [--only <space_id>] [--limit N]
Resumable: a lesson whose lesson.md already exists is skipped unless --force.
"""
import json, os, re, subprocess, sys, time, datetime, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pm2md
from fetch_lesson import slugify, yaml_str, api, BASE, ROOT

HERE = os.path.dirname(os.path.abspath(__file__))
JAR = os.environ.get("EMPOWER_JAR", "/tmp/.empower.jar")
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
DIRS = {2414943: "01-cohort-4-curriculum", 2263196: "02-beginners-guide-to-claude"}

FORCE = "--force" in sys.argv
ONLY = int(sys.argv[sys.argv.index("--only") + 1]) if "--only" in sys.argv else None
LIMIT = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None

stats = {"lessons": 0, "skipped": 0, "files": 0, "images": 0, "videos": 0, "bytes": 0, "errors": []}


def safe_name(n, fallback="file"):
    n = urllib.parse.unquote(n or "")
    n = n.replace("\\", "/").split("/")[-1]
    # Parens and brackets break Markdown link targets, so they never reach a filename.
    n = re.sub(r"[^A-Za-z0-9._ -]", "-", n).strip().strip(".")
    n = re.sub(r"\s+", "-", n)
    n = re.sub(r"[-_]{2,}", "-", n).replace("-.", ".")
    return (n or fallback)[:110]


def curl_download(url, dest_dir, prefix, referer=BASE + "/"):
    """Download url following redirects; filename from Content-Disposition when present."""
    os.makedirs(dest_dir, exist_ok=True)
    tmp = os.path.join(dest_dir, ".part")
    r = subprocess.run(
        ["curl", "-sS", "-L", "--max-redirs", "6", "-b", JAR, "-A", UA, "-e", referer,
         "-o", tmp, "-D", tmp + ".hdr", "-w", "%{http_code}\t%{content_type}", url],
        capture_output=True, text=True)
    code, _, ctype = (r.stdout or "\t").partition("\t")
    if code.strip() != "200" or not os.path.exists(tmp):
        for p in (tmp, tmp + ".hdr"):
            if os.path.exists(p):
                os.remove(p)
        return None, f"HTTP {code.strip() or '?'}"
    name = None
    hdr = open(tmp + ".hdr", errors="replace").read()
    m = re.findall(r"filename\*=UTF-8''([^\r\n;]+)", hdr) or re.findall(r'filename="([^"]+)"', hdr)
    if m:
        name = safe_name(m[-1])
    if not name:
        base = safe_name(urllib.parse.urlparse(url).path)
        ext = {"application/pdf": ".pdf", "image/png": ".png", "image/jpeg": ".jpg",
               "image/gif": ".gif", "image/webp": ".webp", "text/plain": ".txt",
               "application/zip": ".zip"}.get((ctype or "").split(";")[0].strip(), "")
        name = (base or "file") + (ext if not base.lower().endswith(ext) else "")
    name = f"{prefix}-{name}"
    final = os.path.join(dest_dir, name)
    os.replace(tmp, final)
    os.remove(tmp + ".hdr")
    size = os.path.getsize(final)
    stats["bytes"] += size
    return {"path": "assets/" + name, "name": name, "size": size, "source": url}, None


def collect(body):
    """Return (file_nodes, image_nodes) in document order."""
    files, images = [], []
    def walk(n):
        if isinstance(n, dict):
            t = n.get("type")
            if t in ("file", "attachment"):
                files.append(n.get("attrs") or {})
            elif t == "image":
                images.append(n.get("attrs") or {})
            for c in n.get("content") or []:
                walk(c)
        elif isinstance(n, list):
            for c in n:
                walk(c)
    walk(body or {})
    return files, images


def write_lesson(course, course_dir, section, sec_pos, lesson_meta, pos):
    lid, sid, spid = lesson_meta["id"], section["id"], course["space_id"]
    les_dir = os.path.join(ROOT, course_dir, f"{sec_pos:02d}-{slugify(section['name'])}",
                           f"{pos:02d}-{slugify(lesson_meta['name'])}")
    md_path = os.path.join(les_dir, "lesson.md")
    if os.path.exists(md_path) and not FORCE:
        stats["skipped"] += 1
        return
    L = api(f"/internal_api/courses/{spid}/sections/{sid}/lessons/{lid}")
    os.makedirs(les_dir, exist_ok=True)
    with open(os.path.join(les_dir, "lesson.json"), "w") as f:
        json.dump(L, f, indent=2, ensure_ascii=False)
        f.write("\n")

    rtb = L.get("rich_text_body") or {}
    body = rtb.get("body") or {}
    file_attrs, image_attrs = collect(body)

    pm2md.assets = {}
    pm2md.unhandled = set()
    asset_log = []
    for i, a in enumerate(file_attrs, 1):
        sgid = a.get("signed_id")
        if not sgid:
            continue
        url = f"{BASE}/rails/active_storage/blobs/redirect/{urllib.parse.quote(sgid, safe='')}/file"
        got, err = curl_download(url, os.path.join(les_dir, "assets"), f"{i:02d}")
        if got:
            pm2md.assets[sgid] = got
            asset_log.append({"kind": "file", **got})
            stats["files"] += 1
        else:
            stats["errors"].append(f"L{lid} file {i}: {err}")
    for i, a in enumerate(image_attrs, 1):
        src = a.get("src") or a.get("url")
        sgid = a.get("signed_id")
        url = (f"{BASE}/rails/active_storage/blobs/redirect/{urllib.parse.quote(sgid, safe='')}/file"
               if sgid else src)
        if not url:
            continue
        got, err = curl_download(url, os.path.join(les_dir, "assets"), f"img{i:02d}")
        if got:
            if sgid:
                pm2md.assets[sgid] = got
            if src:
                pm2md.assets[src] = got
            asset_log.append({"kind": "image", **got})
            stats["images"] += 1
        else:
            stats["errors"].append(f"L{lid} image {i}: {err}")

    body_md = pm2md.to_markdown(rtb)
    embed = L.get("featured_media_embed") or {}
    video_url = embed.get("content")
    if video_url:
        stats["videos"] += 1

    fm = {
        "title": L["name"], "course": course["name"].strip(), "section": section["name"],
        "lesson_number": pos, "section_number": sec_pos, "status": L.get("status"),
        "completed": L.get("completed"), "comments_enabled": L.get("comments_enabled"),
        "lesson_id": lid, "section_id": sid, "space_id": spid,
        "url": f"{BASE}/c/{course['slug']}/sections/{sid}/lessons/{lid}",
        "video_url": video_url, "video_title": embed.get("title"),
        "attachments": sum(1 for a in asset_log if a["kind"] == "file"),
        "images": sum(1 for a in asset_log if a["kind"] == "image"),
        "created_at": L.get("created_at"), "updated_at": L.get("updated_at"),
        "fetched_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
    }
    out = ["---"] + [f"{k}: {yaml_str(v)}" for k, v in fm.items()] + ["---", ""]
    out += [f"# {L['name']}", "",
            f"> {course['name'].strip()} › Section {sec_pos}: {section['name']} › Lesson {pos}", "",
            f"[Open on Circle]({fm['url']})", ""]
    if video_url:
        out += ["## Video", "", f"- **{embed.get('title') or 'Recording'}** — {video_url}",
                "", "_Not downloaded. Open the link to watch, or see the transcript in the content below if the lesson includes one._", ""]
    if asset_log:
        out += ["## Files", ""]
        for a in asset_log:
            kb = a["size"] / 1024
            sz = f"{kb/1024:.1f} MB" if kb > 1024 else f"{kb:.0f} KB"
            out += [f"- [{a['name']}](./{a['path']}) ({sz})"]
        out += [""]
    out += ["## Content", "", body_md]
    if pm2md.unhandled:
        out += ["", "## Conversion warnings", ""] + [f"- unhandled: `{u}`" for u in sorted(pm2md.unhandled)]
    with open(md_path, "w") as f:
        f.write("\n".join(out).rstrip() + "\n")
    stats["lessons"] += 1
    flag = f" [{fm['attachments']}f/{fm['images']}i]" if asset_log else ""
    vid = " 🎬" if video_url else ""
    print(f"  {sec_pos:02d}.{pos:02d} {L['name'][:58]:<58} {len(body_md):>6}c{flag}{vid}", flush=True)


def main():
    idx = json.load(open(os.path.join(ROOT, "course.json")))
    n = 0
    for course in idx["courses"]:
        if ONLY and course["space_id"] != ONLY:
            continue
        cd = DIRS[course["space_id"]]
        print(f"\n=== {course['name'].strip()} ({course['lesson_count']} lessons) ===", flush=True)
        for sp, section in enumerate(course["sections"], 1):
            for lp, lesson in enumerate(section["lessons"], 1):
                if LIMIT and n >= LIMIT:
                    print("\n[limit reached]")
                    return report()
                try:
                    write_lesson(course, cd, section, sp, lesson, lp)
                except SystemExit as e:
                    stats["errors"].append(f"L{lesson['id']}: {e}")
                    print(f"  !! {lesson['name'][:50]}: {e}", flush=True)
                n += 1
                time.sleep(0.35)
    report()


def report():
    print("\n--- summary ---")
    print(f"lessons written: {stats['lessons']}  skipped(existing): {stats['skipped']}")
    print(f"files: {stats['files']}  images: {stats['images']}  videos linked: {stats['videos']}")
    print(f"downloaded: {stats['bytes']/1024/1024:.1f} MB")
    if stats["errors"]:
        print(f"errors ({len(stats['errors'])}):")
        for e in stats["errors"][:25]:
            print("  ", e)


if __name__ == "__main__":
    main()
