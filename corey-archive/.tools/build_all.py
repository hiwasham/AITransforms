#!/usr/bin/env python3
"""Build the Corey Ganim archive Markdown tree from raw-json/ only (offline, idempotent).

Layout:
  00-SYSTEM/            the workflow map (why → what → how, all three sources cross-linked)
  01-classroom/         7 courses, lesson per file (ProseMirror desc + resources)
  02-community/         pinned/feed posts + comments (redacted)
  03-youtube/           80 videos: title, date, views, description, links, transcript status
  04-resources/         lead magnets: delivered docs + opt-in page index
  raw-json/             verbatim payloads (provenance)
"""
import csv
import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import siteapi  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "raw-json")

GROUP_URL = "https://www.skool.com/aioperatorhub"
YT_CHANNEL = "https://www.youtube.com/@coreyganim"


def load(name, default=None):
    p = os.path.join(RAW, name)
    if not os.path.exists(p):
        return default
    with open(p, encoding="utf-8") as f:
        try:
            return json.load(f)
        except ValueError:
            return default


def W(path, text):
    siteapi.write(os.path.join(ROOT, path), text)


# --------------------------------------------------------------- ProseMirror -> Markdown

def pm_to_md(v2):
    """Skool stores rich text as '[v2]' + JSON ProseMirror doc. Render to Markdown."""
    if not v2:
        return ""
    if not v2.startswith("[v2]"):
        # legacy plain text / HTML
        return siteapi.html2md(v2)
    try:
        doc = json.loads(v2[4:])
    except ValueError:
        return ""
    out = []

    def render_inline(nodes):
        s = ""
        for n in nodes:
            if n.get("type") == "text":
                t = n.get("text", "")
                marks = n.get("marks", [])
                for m in marks:
                    if m.get("type") == "bold":
                        t = f"**{t}**"
                    elif m.get("type") == "italic":
                        t = f"*{t}*"
                    elif m.get("type") == "code":
                        t = f"`{t}`"
                    elif m.get("type") == "link":
                        href = (m.get("attrs") or {}).get("href", "")
                        if href:
                            t = f"[{t}]({href})"
                s += t
            elif n.get("type") == "hardBreak":
                s += "\n"
        return s

    def walk(node, list_stack=()):
        typ = node.get("type")
        if typ == "heading":
            lvl = (node.get("attrs") or {}).get("level", 2)
            out.append("#" * min(lvl + 1, 6) + " " + render_inline(node.get("content") or []))
        elif typ in ("orderedList", "bulletList"):
            marker = "1." if typ == "orderedList" else "-"
            idx = 0
            for li in node.get("content") or []:
                idx += 1
                para = " ".join(render_inline(p.get("content") or []) for p in li.get("content") or [] if p.get("type") == "paragraph")
                out.append(f"{marker} {para}")
                for sub in li.get("content") or []:
                    if sub.get("type") in ("orderedList", "bulletList"):
                        walk(sub, list_stack + (marker,))
        elif typ == "blockquote":
            inner = " ".join(render_inline(p.get("content") or []) for p in node.get("content") or [])
            out.append("> " + inner)
        elif typ == "image":
            a = node.get("attrs") or {}
            src, alt = a.get("originalSrc") or a.get("src") or "", a.get("alt") or "image"
            out.append(f"![{alt}]({src})")
        elif typ == "codeBlock":
            out.append("```\n" + render_inline(node.get("content") or []) + "\n```")
        elif typ == "paragraph":
            txt = render_inline(node.get("content") or [])
            if txt.strip():
                out.append(txt)
        for sub in node.get("content") or []:
            if sub.get("type") in ("paragraph", "heading", "orderedList", "bulletList",
                                   "blockquote", "image", "codeBlock"):
                continue  # handled above; only recurse into containers we didn't render
        # container recursion for docs we didn't flatten (doc-level)
        if typ == "doc":
            for sub in node.get("content") or []:
                walk(sub)

    walk({"type": "doc", "content": doc if isinstance(doc, list) else [doc]})
    return "\n\n".join(out)


# --------------------------------------------------------------- redaction

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}", re.I)

REDACT_USER_KEYS = {"email", "emailHash", "first_name", "last_name", "firstName", "lastName",
                    "time_zone", "phone", "address"}


def scrub_user(u):
    if not isinstance(u, dict):
        return u
    return {k: v for k, v in u.items() if k not in REDACT_USER_KEYS}


def scrub_tree(tree):
    """Drop user PII from a post/comment tree recursively."""
    if not isinstance(tree, dict):
        return tree
    out = {}
    for k, v in tree.items():
        if k == "post":
            p = dict(v)
            p["user"] = scrub_user(p.get("user"))
            out[k] = p
        elif k == "children":
            out[k] = [scrub_tree(c) for c in v or []]
        else:
            out[k] = v
    return out


def no_emails(s):
    """Replace emails in free text with a placeholder (defense in depth for builds)."""
    return EMAIL_RE.sub("[email-redacted]", s or "")


# --------------------------------------------------------------- sections

def build_classroom():
    courses = load("skool/courses-all.json") or {}
    lessons = load("skool/lessons-all.json") or {}
    idx = []
    order = ["Start Here", "The 7-Day Sprint", "AI Services Masterclass", "YouTube Resources",
             "Wins & Sprint Graduates", "Upgrade: AI Operator Academy", "Build With AI Podcast"]
    courses_sorted = sorted(courses.values(),
                            key=lambda c: order.index((c.get("metadata") or {}).get("title"))
                            if (c.get("metadata") or {}).get("title") in order else 99)
    n = 0
    for course in courses_sorted:
        md = course.get("metadata") or {}
        title = md.get("title") or course.get("name")
        slug = f"{n+1:02d}-" + siteapi.slug(title, 40)
        n += 1
        base = f"01-classroom/{slug}"
        desc = pm_to_md(md.get("desc") or "")
        W(f"{base}/README.md",
          siteapi.fm(title=title, source=f"{GROUP_URL}/classroom", type="course",
                     lessons=len(course.get("children") or [])) +
          f"\n# {title}\n\n{no_emails(desc)}\n")
        lessons_md = []
        for i, node in enumerate(course.get("children") or []):
            c = node.get("course") or {}
            lmd = c.get("metadata") or {}
            lid = c.get("id")
            ltitle = lmd.get("title") or c.get("name") or f"lesson-{i+1}"
            lslug = f"{i+1:02d}-" + siteapi.slug(ltitle, 50)
            full = (lessons.get(lid) or {}).get("module") or c
            fmd = full.get("metadata") or {}
            body = pm_to_md(fmd.get("desc") or "")
            resources = fmd.get("resources") or "[]"
            try:
                resources = json.dumps(json.loads(resources), indent=1) if isinstance(resources, str) else json.dumps(resources, indent=1)
            except ValueError:
                pass
            W(f"{base}/{lslug}/lesson.md",
              siteapi.fm(title=ltitle, course=title, lesson_id=lid,
                         source=f"{GROUP_URL}/classroom/{siteapi.slug(title,10)}?md={lid}",
                         has_access=bool(lmd.get("hasAccess"))) +
              f"\n# {ltitle}\n\n{no_emails(body)}\n\n## Resources\n\n```json\n{resources}\n```\n")
            lessons_md.append(f"| [{ltitle}]({lslug}/lesson.md) | {lid} |")
        idx.append((slug, title, md.get("desc") or "", lessons_md))
    # classroom index
    lines = [siteapi.fm(title="Classroom — AI Operator Hub", source=f"{GROUP_URL}/classroom"),
             "# Classroom\n",
             "The 7 courses of the AI Operator Hub, lesson by lesson. The **00-SYSTEM** map cross-references these.\n"]
    for slug, title, d, ls in idx:
        lines.append(f"## {title}\n")
        lines.append(f"{no_emails(pm_to_md(d))[:300]}\n" if d else "")
        lines.append("| Lesson | id |")
        lines.append("|---|---|")
        lines += [f"| {a} | `{b}` |" for a, b in ls]
        lines.append("")
    W("01-classroom/README.md", "\n".join(lines))
    return len(courses_sorted)


def build_community():
    feed = (load("skool/feed.json") or {}).get("props", {}).get("pageProps", {})
    posts = load("skool/posts-all.json") or {}
    about = (load("skool/about.json") or {}).get("props", {}).get("pageProps", {})
    calendar = (load("skool/calendar.json") or {}).get("props", {}).get("pageProps", {})
    g = about.get("currentGroup") or (feed.get("currentGroup") or {})
    gmd = g.get("metadata") or {}
    ue = feed.get("upcomingEvents") or []

    lines = [siteapi.fm(title="Community — AI Operator Hub", source=GROUP_URL),
             "# Community\n",
             f"**Group:** {gmd.get('displayName') or g.get('name')}\n",
             f"**Description:** {gmd.get('description')}\n" if gmd.get("description") else "",
             f"**Members:** {gmd.get('membersCount', '?')}\n" if gmd.get("membersCount") else "",
             f"**Upcoming events in feed snapshot:** {len(ue)}\n" if ue else "No upcoming events in feed snapshot.\n",
             "\n| Post | Comments captured |",
             "|---|---|"]
    n_posts = n_comments = 0
    for name, entry in sorted(posts.items()):
        tree = entry.get("postTree") or {}
        p = tree.get("post") or {}
        m = p.get("metadata") or {}
        n_posts += 1
        kids = ((entry.get("comments") or {}).get("post_tree") or {}).get("children") or []
        n_comments += len(kids)
        lines.append(f"| [{m.get('title') or name}](posts/{siteapi.slug(name)}/post.md) | {len(kids)} |")
    W("02-community/README.md", no_emails("\n".join(lines)))

    os.makedirs(os.path.join(ROOT, "02-community/posts"), exist_ok=True)
    for name, entry in posts.items():
        tree = scrub_tree(entry.get("postTree") or {})
        p = tree.get("post") or {}
        m = p.get("metadata") or {}
        comments = scrub_tree((entry.get("comments") or {}).get("post_tree") or {})
        kids = comments.get("children") or []

        def render_comment(c, depth=0):
            cp = c.get("post") or {}
            cm = cp.get("metadata") or {}
            u = cp.get("user") or {}
            who = (u.get("first_name") or u.get("firstName") or "member")
            pad = "  " * depth
            out = [f"{pad}- **{who}** ({(cp.get('created_at') or '')[:10]}): {no_emails(cm.get('content') or '')[:800]}"]
            for sub in c.get("children") or []:
                out += render_comment(sub, depth + 1)
            return out

        body = m.get("content") or ""
        lines = [siteapi.fm(title=m.get("title") or name, author="post", source=f"{GROUP_URL}/{name}",
                            comments=(m.get("comments") or 0), upvotes=(m.get("upvotes") or 0)),
                 f"# {m.get('title') or name}\n", no_emails(body)]
        if p.get("created_at") or p.get("createdAt"):
            lines.append(f"\n_Posted: {(p.get('created_at') or p.get('createdAt'))[:10]}_\n")
        if kids:
            lines.append(f"\n## Comments ({len(kids)} top-level captured)\n")
            for c in kids:
                lines += render_comment(c)
        if (m.get("comments") or 0) > len(kids):
            lines.append(f"\n_(comment pagination beyond 25 not exposed to this session — see GAPS.md)_\n")
        W(f"02-community/posts/{siteapi.slug(name)}/post.md", "\n".join(lines))
    return n_posts, n_comments


def build_youtube():
    lst = load("youtube/channel-list.json") or {}
    vids = load("youtube/videos.json") or {}
    links = load("youtube/video-links.json") or {}
    titles = {v["videoId"]: v for v in lst.get("videos") or []}

    os.makedirs(os.path.join(ROOT, "03-youtube"), exist_ok=True)
    lines = [siteapi.fm(title="YouTube — @coreyganim", source=YT_CHANNEL + "/videos"),
             "# YouTube\n",
             f"**{len(titles)} videos** with full descriptions and extracted links.\n",
             "Transcripts: not captured this run (YouTube bot-wall for this IP — see GAPS.md).\n",
             "\n| Video | Published | Views | Links |",
             "|---|---|---|---|"]
    for v in (lst.get("videos") or []):
        vid = v["videoId"]
        d = vids.get(vid) or {}
        nlinks = len(links.get(vid) or [])
        lines.append(f"| [{(d.get('title') or v.get('title') or vid)[:60]}](videos/{vid}.md) "
                     f"| {d.get('date') or v.get('published') or '?'} | {v.get('views') or d.get('views') or '?'} | {nlinks} |")
    W("03-youtube/README.md", "\n".join(lines))

    os.makedirs(os.path.join(ROOT, "03-youtube/videos"), exist_ok=True)
    for v in (lst.get("videos") or []):
        vid = v["videoId"]
        d = vids.get(vid) or {}
        desc = d.get("desc") or ""
        ls = links.get(vid) or []
        link_lines = "\n".join(f"- {u}" for u in ls) if ls else "_none in description_"
        W(f"03-youtube/videos/{vid}.md",
          siteapi.fm(video_id=vid, title=d.get("title") or v.get("title"),
                     published=d.get("date") or v.get("published"), views=v.get("views"),
                     length=v.get("length"),
                     url=f"https://www.youtube.com/watch?v={vid}",
                     transcript="not captured (bot wall — see GAPS.md)"),
          )
        with open(os.path.join(ROOT, f"03-youtube/videos/{vid}.md"), "a", encoding="utf-8") as f:
            f.write(f"\n# {d.get('title') or v.get('title') or vid}\n\n")
            f.write(f"**Published:** {d.get('date') or v.get('published') or '?'}  |  "
                    f"**Views:** {v.get('views') or '?'}  |  **Length:** {v.get('length') or '?'}\n\n")
            f.write(f"**Watch:** https://www.youtube.com/watch?v={vid}\n\n")
            f.write(f"## Description\n\n{no_emails(desc) or '_not captured_'}\n\n")
            f.write(f"## Links in description ({len(ls)})\n\n{no_emails(link_lines)}\n")
    return len(titles)


def build_resources():
    pages = load("youtube/resource-pages.json") or {}
    lines = [siteapi.fm(title="Resources — lead magnets and delivered docs"),
             "# Resources\n",
             "## Delivered (captured in full)\n",
             "- [AI for Business Meetup Master Prompt](delivered/meetup-master-prompt.md) "
             "— Google Doc delivered by email after opting in via `corey-ganim.kit.com/f0f27f0f58`.\n",
             "- [YouTube Video Database Q3 2026 (CSV)](delivered/yt-video-database-Q3-2026.csv) "
             "— the official video→resources database linked from the *YouTube Resources* lesson.\n",
             "\n## Opt-in pages (Cloudflare-gated — landing copy in GAPS.md)\n",
             "\n| URL | What the video description says it delivers |",
             "|---|---|"]
    for u, v in sorted(pages.items()):
        note = (v.get("error") or "gated (Cloudflare)")
        lines.append(f"| {u} | {note} |")
    W("04-resources/README.md", "\n".join(lines))

    os.makedirs(os.path.join(ROOT, "04-resources/delivered"), exist_ok=True)
    txt = open(os.path.join(RAW, "resources/meetup-master-prompt.txt"), encoding="utf-8").read()
    W("04-resources/delivered/meetup-master-prompt.md",
      siteapi.fm(title="AI for Business Meetup Master Prompt",
                 source="https://docs.google.com/document/d/1umMkeZSGdcrBEzFuO8CV8EXqbVWQF5KfJxThCUPgow4/edit",
                 delivered_via="email opt-in (corey-ganim.kit.com/f0f27f0f58)",
                 instructions="Copy the entire prompt. Paste it into Claude. Swap in your city and your details. Hit enter.")
      + f"\n# AI for Business Meetup Master Prompt\n\n```\n{txt}\n```\n")
    return len(pages)


def build_system():
    """The workflow map: Corey's system distilled from all three sources, cross-linked."""
    lines = [siteapi.fm(title="THE SYSTEM — Corey Ganim's AI Operator path", type="workflow-map"),
             "# The System\n",
             "Corey's whole playbook, assembled from the three sources of this archive. "
             "Every step links back to the source lesson, video, or resource.\n",
             "## The model in one paragraph\n",
             "Build a sellable AI offer in 7 days — no coding or capital required "
             "(group description). The offer is the **AI Assessment**: a fixed-scope audit "
             "where you map a business owner's workflows and show them where AI makes them "
             "money, saves time, or improves customer experience, for a flat fee "
             "(Day 1 lesson). Sell it, fulfill it, reinvest into retention offers "
             "(AI Concierge, second-brain builds), then compound via case studies "
             "and content.\n",
             "## Phase 0 — Orientation (Start Here)\n",
             "- [Welcome to the AI Operator Hub](../01-classroom/01-start-here/01-welcome-to-the-ai-operator-hub/lesson.md) "
             "— what's inside, where to start.\n",
             "- [How to Win Here](../01-classroom/01-start-here/02-how-to-win-here/lesson.md) — community rules of engagement.\n",
             "- [Start the 7-Day Sprint](../01-classroom/01-start-here/03-start-the-7-day-sprint/lesson.md) — the on-ramp.\n",
             "## Phase 1 — The 7-Day Sprint (build the offer)\n",
             "| Day | Lesson |",
             "|---|---|",
             "| 1 | [The Model and Your Money Math](../01-classroom/02-the-7-day-sprint/01-day-1-the-model-and-your-money-math/lesson.md) |",
             "| 2 | [See the Machine End to End](../01-classroom/02-the-7-day-sprint/02-day-2-see-the-machine-end-to-end/lesson.md) |",
             "| 3 | [Build Your 10-Person Warm List](../01-classroom/02-the-7-day-sprint/03-day-3-build-your-10-person-warm-list/lesson.md) |",
             "| 4 | [Send Your First 5 Messages](../01-classroom/02-the-7-day-sprint/04-day-4-send-your-first-5-messages/lesson.md) |",
             "| 5 | [Learn the Discovery Questions](../01-classroom/02-the-7-day-sprint/05-day-5-learn-the-discovery-questions/lesson.md) |",
             "| 6 | [Follow Up and Book It](../01-classroom/02-the-7-day-sprint/06-day-6-follow-up-and-book-it/lesson.md) |",
             "| 7 | [Graduate and Plan the Next 30 Days](../01-classroom/02-the-7-day-sprint/07-day-7-graduate-and-plan-the-next-30-days/lesson.md) |\n",
             "## Phase 2 — Understand the whole model (Masterclass + podcast)\n",
             "- [Watch: How to Sell AI Services](../01-classroom/03-ai-services-masterclass/01-watch-how-to-sell-ai-services/lesson.md)\n",
             "- [Build With AI podcast — start listening](../01-classroom/07-build-with-ai-podcast/01-start-listening/lesson.md)\n",
             "## Phase 3 — Steal the free resources (YouTube)\n",
             "Every free resource from the videos lives in the [YouTube Video Database CSV]"
             "(../04-resources/delivered/yt-video-database-Q3-2026.csv) (columns: Publish Date, "
             "Title, Watch, Summary, Resources). Per-video pages with every description link: "
             "[03-youtube/](../03-youtube/README.md). Headline magnets:\n",
             "- [AI Assessment report template](https://audittemplate.ai/) — referenced in 6+ videos "
             "(opt-in gated; see GAPS.md).\n",
             "- [AI for Business Meetup Master Prompt](../04-resources/delivered/meetup-master-prompt.md) — captured in full.\n",
             "- Kit opt-in pages per video — [04-resources/](../04-resources/README.md).\n",
             "## Phase 4 — Go deeper (paid, not in this archive)\n",
             "- [Upgrade: AI Operator Academy](../01-classroom/06-upgrade-ai-operator-academy/01-ready-for-the-full-system/lesson.md) "
             "— the full system behind the Hub (tier-gated; see GAPS.md).\n",
             "## Where the live proof is\n",
             "- [Wins & Sprint Graduates](../01-classroom/05-wins-sprint-graduates/README.md) — monthly updated wins.\n",
             "- [Community posts](../02-community/README.md) — 17 posts incl. member questions and sprint check-ins.\n"]
    W("00-SYSTEM/SYSTEM.md", "\n".join(lines))
    W("00-SYSTEM/README.md",
      siteapi.fm(title="The System map") +
      "\n# The System\n\nStart with [SYSTEM.md](SYSTEM.md) — the whole workflow, "
      "phase by phase, cross-linked to lessons, videos, and resources.\n")
    return True


def main():
    n_courses = build_classroom()
    n_posts, n_comments = build_community()
    n_vids = build_youtube()
    n_pages = build_resources()
    build_system()

    # counts for README
    stats = siteapi.tree_stats(ROOT)
    W("README.md", f"""---
title: "Corey Ganim — AI Operator Hub archive"
source: "{GROUP_URL}"
youtube: "{YT_CHANNEL}"
account: "hiwasham (member)"
archived: "2026-09-17"
---

# Corey Ganim — AI Operator Hub archive

Offline archive of the **AI Operator Hub** Skool community plus Corey Ganim's
YouTube channel and free-resource ecosystem, built so it can be regenerated
from `raw-json/` at any time.

**Start here → [00-SYSTEM/SYSTEM.md](00-SYSTEM/SYSTEM.md)** — the whole method
as one cross-linked workflow, not a pile of files.

| What | Count |
|---|---|
| Classroom courses | {n_courses} (17 lessons) |
| Community posts | {n_posts} (comments captured: {n_comments}) |
| YouTube videos | {n_vids} (full descriptions + {sum(len(v) for v in (load('youtube/video-links.json') or {{}}).values())} description links) |
| Delivered resources | 2 (Meetup Master Prompt, YouTube Video Database CSV) |
| Opt-in pages indexed | {n_pages} (landing copy gated — GAPS.md) |
| Transcripts | 0 (bot wall — GAPS.md) |

## Layout

```
00-SYSTEM/         the workflow map (start here)
01-classroom/      7 courses, lesson per file
02-community/      feed posts + comments (redacted)
03-youtube/        80 videos: description + every link
04-resources/      lead magnets: delivered docs + opt-in index
raw-json/          verbatim payloads (provenance; some gitignored)
.tools/            the scripts that build all of the above
```

## How to re-run

```bash
python3 .tools/siteconf.py      # prove the session
python3 .tools/fetch_all.py     # re-crawl (browser session required)
python3 .tools/build_all.py     # rebuild Markdown from raw-json/ only
```

## What is not archived

See [GAPS.md](GAPS.md) — every gap names its cause (tier gate, Cloudflare,
bot wall, comment pagination).
""")
    print(f"built: {n_courses} courses, {n_posts} posts ({n_comments} comments), "
          f"{n_vids} videos, {n_pages} opt-in pages")
    print("stats:", {k: v for k, v in stats.items() if k != "bytes"},
          f"{stats['bytes']/1e6:.1f} MB")


if __name__ == "__main__":
    main()
