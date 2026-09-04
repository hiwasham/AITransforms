#!/usr/bin/env python3
"""Regenerate README indexes at every level from course.json + what's on disk."""
import json, os, re, sys, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fetch_lesson import slugify

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = {2414943: "01-cohort-4-curriculum", 2263196: "02-beginners-guide-to-claude"}
idx = json.load(open(os.path.join(ROOT, "course.json")))


def ldir(cd, sp, sname, lp, lname):
    return os.path.join(cd, f"{sp:02d}-{slugify(sname)}", f"{lp:02d}-{slugify(lname)}")


def badges(rel):
    """Small icon summary of what a saved lesson carries."""
    p = os.path.join(ROOT, rel)
    if not os.path.exists(os.path.join(p, "lesson.md")):
        return None
    b = []
    a = os.path.join(p, "assets")
    names = os.listdir(a) if os.path.isdir(a) else []
    if os.path.exists(os.path.join(p, "transcript.md")):
        b.append("📝 transcript")
    v = [n for n in names if n.lower().endswith((".mp4", ".mov", ".m4v"))]
    if v:
        mb = sum(os.path.getsize(os.path.join(a, n)) for n in v) / 1048576
        b.append(f"🎬 {len(v)} video ({mb:.0f} MB)")
    if re.search(r"^video_url: \"", open(os.path.join(p, "lesson.md")).read(), re.M):
        b.append("🔗 vimeo")
    pdf = [n for n in names if n.lower().endswith(".pdf")]
    if pdf:
        b.append(f"📕 {len(pdf)} pdf")
    img = [n for n in names if n.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".webp"))]
    if img:
        b.append(f"🖼 {len(img)}")
    other = [n for n in names if n.lower().endswith((".txt", ".md", ".zip", ".csv", ".docx"))]
    if other:
        b.append(f"📎 {len(other)}")
    return b


def stat_totals():
    t = {"assets": 0, "bytes": 0, "transcripts": 0, "videos": 0, "pdfs": 0, "images": 0}
    for f in glob.glob(os.path.join(ROOT, "**", "assets", "*"), recursive=True):
        if not os.path.isfile(f):
            continue
        t["assets"] += 1
        t["bytes"] += os.path.getsize(f)
        low = f.lower()
        t["videos"] += low.endswith((".mp4", ".mov", ".m4v"))
        t["pdfs"] += low.endswith(".pdf")
        t["images"] += low.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp"))
    t["transcripts"] = len(glob.glob(os.path.join(ROOT, "**", "transcript.md"), recursive=True))
    return t


T = stat_totals()
def community_section():
    """Link the non-course archives, with live counts, when they have been fetched."""
    out, rows = [], []
    cs = os.path.join(ROOT, "empower-casestudies", "posts.json")
    if os.path.exists(cs):
        d = json.load(open(cs))
        pdfs = len(glob.glob(os.path.join(ROOT, "empower-casestudies", "*", "assets", "*.pdf")))
        rows.append(f"- **[Case studies](./empower-casestudies/)** — {len(d['posts'])} member "
                    f"implementations · {pdfs} PDFs · full write-ups and the discussion under them")
    mem = os.path.join(ROOT, "empower-participants", "members.json")
    if os.path.exists(mem):
        d = json.load(open(mem))
        vis = sum(1 for m in d["members"] if m.get("visible_in_member_directory"))
        rows.append(f"- **[Participants](./empower-participants/)** — {d['count']} members "
                    f"({vis} listed) · leaderboards · who posts and what about")
    if rows:
        out += ["## Community archive", ""] + rows + [""]
    return out


saved = len(glob.glob(os.path.join(ROOT, "**", "lesson.md"), recursive=True))

top = ["# EMPOWER Labs — archive", "",
       f"Offline copy of the course, the case studies and the member directory from {idx['source']}.", "",
       f"| | |", "|---|---|",
       f"| Lessons saved | **{saved} / {idx['total_lessons']}** |",
       f"| Readable transcripts | {T['transcripts']} |",
       f"| Files downloaded | {T['assets']} ({T['bytes']/1073741824:.2f} GB) |",
       f"| Slide decks (PDF) | {T['pdfs']} |",
       f"| Video files | {T['videos']} |",
       f"| Images | {T['images']} |", "",
       "## Courses", ""]
for c in idx["courses"]:
    cd = DIRS[c["space_id"]]
    got = sum(1 for si, s in enumerate(c["sections"], 1) for li, l in enumerate(s["lessons"], 1)
              if badges(ldir(cd, si, s["name"], li, l["name"])) is not None)
    top.append(f"- **[{c['name']}](./{cd}/)** — {got}/{c['lesson_count']} lessons saved · "
               f"{len(c['sections'])} sections · {c['space_group']}")
top += ["", "## Shared resources", "",
        "- **[Prompt library](./resources/prompt-library/)** — every exercise prompt, "
        "split per session (the Google Doc the lessons link out to)", ""]
top += community_section()
top += ["## How to read this", "",
        "Start at a course README, pick a section, open a lesson's `lesson.md`. Each lesson folder holds:", "",
        "| File | What it is |", "|---|---|",
        "| `lesson.md` | The lesson: frontmatter, video link, file list, full body text |",
        "| `transcript.md` | Session recording transcribed to readable prose (replays only) |",
        "| `assets/` | Slide decks, demo videos, chat logs, raw `.vtt`/`.srt`, images |",
        "| `lesson.json` | Raw Circle API payload, for re-runs and diffing |", "",
        "## Layout", "", "```", "empower-curriculum/",
        "├── README.md                     this index",
        "├── course.json                   machine-readable index of all lessons",
        "├── resources/prompt-library/     exercise prompts, per session",
        "├── empower-casestudies/          member case studies + their PDFs",
        "├── empower-participants/         member directory, leaderboards, who is active",
        "├── .tools/                       re-runnable fetch + convert scripts",
        "└── NN-<course>/README.md",
        "    └── NN-<section>/README.md",
        "        └── NN-<lesson>/{lesson.md, transcript.md, assets/, lesson.json}",
        "```", "",
        "## Re-running", "", "```bash",
        "python3 .tools/cookies.py        # refresh auth from the Chromium profile",
        "python3 .tools/fetch_all.py      # crawl (skips lessons already saved)",
        "python3 .tools/postprocess.py    # transcripts + re-render markdown",
        "python3 .tools/fetch_resources.py",
        "python3 .tools/build_index.py",
        "",
        "python3 .tools/fetch_posts.py 2345699 empower-casestudies   # case studies",
        "python3 .tools/build_posts_index.py empower-casestudies",
        "python3 .tools/fetch_members.py            # directory + leaderboards + activity",
        "python3 .tools/build_members_index.py",
        "```", ""]
open(os.path.join(ROOT, "README.md"), "w").write("\n".join(top).rstrip() + "\n")

for c in idx["courses"]:
    cd = DIRS[c["space_id"]]
    cl = [f"# {c['name']}", "",
          f"[Open on Circle]({c['url']}) · {c['space_group']} · {len(c['sections'])} sections · "
          f"{c['lesson_count']} lessons", "", "[← archive index](../README.md)", ""]
    for si, s in enumerate(c["sections"], 1):
        sd = f"{si:02d}-{slugify(s['name'])}"
        cl += [f"## {si}. [{s['name']}](./{sd}/)", ""]
        sl = [f"# Section {si}: {s['name']}", "",
              f"{c['name']} · {s['lesson_count']} lessons", "",
              f"[← {c['name']}](../README.md) · [← archive](../../README.md)", ""]
        for li, l in enumerate(s["lessons"], 1):
            lname = f"{li:02d}-{slugify(l['name'])}"
            b = badges(ldir(cd, si, s["name"], li, l["name"]))
            tail = f"  ·  {' · '.join(b)}" if b else ""
            draft = " _(draft — not accessible to members)_" if l.get("status") != "published" else ""
            if b is not None:
                cl += [f"{li}. [{l['name']}](./{sd}/{lname}/lesson.md){tail}"]
                sl += [f"{li}. [{l['name']}](./{lname}/lesson.md){tail}"]
            else:
                cl += [f"{li}. {l['name']}{draft} — [on Circle]({l['url']})"]
                sl += [f"{li}. {l['name']}{draft} — [on Circle]({l['url']})"]
        cl += [""]
        if os.path.isdir(os.path.join(ROOT, cd, sd)):
            open(os.path.join(ROOT, cd, sd, "README.md"), "w").write("\n".join(sl).rstrip() + "\n")
    open(os.path.join(ROOT, cd, "README.md"), "w").write("\n".join(cl).rstrip() + "\n")
print("indexes rebuilt:", saved, "lessons")
