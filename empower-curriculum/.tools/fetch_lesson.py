#!/usr/bin/env python3
"""Fetch one Circle lesson and write it into the readable hierarchy.

Usage: fetch_lesson.py <course_slug_dir> <space_id> <section_id> <lesson_id>
"""
import json, os, re, subprocess, sys, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pm2md

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAPI = os.path.join(os.path.dirname(os.path.abspath(__file__)), "capi.sh")
BASE = "https://community.empowerlabs.ai"


def api(path):
    out = subprocess.run([CAPI, path], capture_output=True, text=True).stdout
    body, _, code = out.rpartition("__HTTP:")
    if code.strip() != "200":
        raise SystemExit(f"HTTP {code.strip()} for {path}: {body[:200]}")
    return json.loads(body)


def slugify(s, maxlen=72):
    # A bare leading "N." only repeats the positional prefix we already add.
    # "Exercise 2.1:" / "Lesson 3:" carry real meaning, so they stay.
    s = re.sub(r"^\s*\d+[.)]\s+", "", s)
    s = re.sub(r"&", "and", s)
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s[:maxlen].rstrip("-")


def yaml_str(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    return '"' + str(v).replace('\\', '\\\\').replace('"', '\\"') + '"'


def main():
    course_dir, space_id, section_id, lesson_id = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
    idx = json.load(open(os.path.join(ROOT, "course.json")))
    course = next(c for c in idx["courses"] if c["space_id"] == space_id)
    section = next(s for s in course["sections"] if s["id"] == section_id)
    pos = [l["id"] for l in section["lessons"]].index(lesson_id) + 1
    sec_pos = [s["id"] for s in course["sections"]].index(section_id) + 1

    L = api(f"/internal_api/courses/{space_id}/sections/{section_id}/lessons/{lesson_id}")

    sec_dir = os.path.join(ROOT, course_dir, f"{sec_pos:02d}-{slugify(section['name'])}")
    les_dir = os.path.join(sec_dir, f"{pos:02d}-{slugify(L['name'])}")
    os.makedirs(les_dir, exist_ok=True)

    with open(os.path.join(les_dir, "lesson.json"), "w") as f:
        json.dump(L, f, indent=2, ensure_ascii=False)
        f.write("\n")

    body_md = pm2md.to_markdown(L.get("rich_text_body") or {})

    embed = L.get("featured_media_embed") or {}
    video_url = embed.get("content")
    files = []
    def walk(n):
        if isinstance(n, dict):
            if n.get("type") == "file":
                files.append((n.get("attrs") or {}).get("signed_id"))
            for c in n.get("content") or []:
                walk(c)
        elif isinstance(n, list):
            for c in n:
                walk(c)
    walk(((L.get("rich_text_body") or {}).get("body")) or {})

    fm = {
        "title": L["name"],
        "course": course["name"].strip(),
        "section": section["name"],
        "lesson_number": pos,
        "section_number": sec_pos,
        "status": L.get("status"),
        "completed": L.get("completed"),
        "comments_enabled": L.get("comments_enabled"),
        "lesson_id": L["id"],
        "section_id": section_id,
        "space_id": space_id,
        "url": f"{BASE}/c/{course['slug']}/sections/{section_id}/lessons/{lesson_id}",
        "video_url": video_url,
        "video_title": embed.get("title"),
        "attachments": len(files),
        "transcript": None,
        "created_at": L.get("created_at"),
        "updated_at": L.get("updated_at"),
        "fetched_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
    }

    out = ["---"]
    out += [f"{k}: {yaml_str(v)}" for k, v in fm.items()]
    out += ["---", "", f"# {L['name']}", ""]
    out += [f"> {course['name'].strip()} › Section {sec_pos}: {section['name']} › Lesson {pos}", ""]
    out += [f"[Open on Circle]({fm['url']})", ""]
    if video_url:
        out += ["## Video", "", f"- **{embed.get('title') or 'Recording'}**: {video_url}", ""]
    out += ["## Content", "", body_md]
    if files:
        out += ["", "## Attachments", ""]
        out += [f"- `signed_id`: `{s}` _(download pending — see .tools/README)_" for s in files]
    if pm2md.unhandled:
        out += ["", "## Conversion warnings", ""]
        out += [f"- unhandled node: `{u}`" for u in sorted(pm2md.unhandled)]

    dest = os.path.join(les_dir, "lesson.md")
    with open(dest, "w") as f:
        f.write("\n".join(out).rstrip() + "\n")
    print(dest)
    print(f"  body: {len(body_md)} chars | video: {video_url or 'none'} | files: {len(files)} | unhandled: {sorted(pm2md.unhandled) or 'none'}")


if __name__ == "__main__":
    main()
