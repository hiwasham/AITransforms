#!/usr/bin/env python3
"""Render the Markdown archive from the raw-json/ snapshots.

    python3 .tools/fetch_all.py     # first: pull the payloads
    python3 .tools/build_all.py     # then: render every tree + README + club.json

Idempotent: rewrites the tree from the JSON each run. Nothing is fetched here,
so it is safe to re-run offline after a snapshot.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mcapi  # noqa: E402

ROOT = mcapi.ROOT
RAW = mcapi.RAW
LIVE = os.path.join(ROOT, "01-live-classes")
MAIN = os.path.join(ROOT, "02-main-content")
PROG = os.path.join(ROOT, "03-programs")
MEMB = os.path.join(ROOT, "04-members")
EVTS = os.path.join(ROOT, "05-events")
# members.buildprofitablebusiness.com is NXDOMAIN - the club still links 10 PDFs
# there. Flag them inline so a reader does not chase a dead host. See GAPS.md.
DEAD_HOSTS = ("members.buildprofitablebusiness.com",)
EMBED = "https://video-vault-pro.replit.app/embed/"
WISTIA = "https://fast.wistia.net/embed/iframe/"

STATS = {}


def raw(name, default=None):
    p = os.path.join(RAW, name)
    if not os.path.exists(p):
        print(f"  ! missing {name} - run fetch_all.py", file=sys.stderr)
        return default
    return json.load(open(p, encoding="utf-8"))


def fm(**kw):
    """YAML frontmatter block from non-empty values."""
    lines = ["---"]
    for k, v in kw.items():
        if v in (None, "", [], {}):
            continue
        if isinstance(v, list):
            lines.append(f"{k}: [{', '.join(mcapi.yaml_str(x) for x in v)}]")
        elif isinstance(v, bool):
            lines.append(f"{k}: {str(v).lower()}")
        elif isinstance(v, (int, float)):
            lines.append(f"{k}: {v}")
        else:
            lines.append(f"{k}: {mcapi.yaml_str(v)}")
    lines.append("---")
    return "\n".join(lines)


def num(i):
    return f"{i:02d}"


def hhmm(seconds):
    try:
        s = int(float(seconds or 0))
    except (TypeError, ValueError):
        return ""
    if not s:
        return ""
    h, m = divmod(s // 60, 60)
    return f"{h}h {m:02d}m" if h else f"{m}m"


def media_link(video_id, shares):
    """videovault:NNNN -> a resolved embed link, or the bare id."""
    if not video_id:
        return ""
    rec = (shares or {}).get(video_id) or {}
    if rec.get("shareId"):
        return f"[{video_id}]({rec['embedUrl']})"
    return f"`{video_id}`"


def build_live_classes():
    """19 live-class replays: index + per-class summary/transcript/raw payload."""
    meetings = raw("meetings.json") or []
    shares = raw("videovault-share-ids.json") or {}
    meetings = sorted(meetings, key=lambda m: (m.get("date") or "", m.get("id") or 0))
    rows, kept = [], 0
    for i, m in enumerate(meetings, 1):
        date = mcapi.date_only(m.get("date"))
        title = (m.get("title") or "untitled").strip()
        d = os.path.join(LIVE, f"{num(i)}-{date}-{mcapi.slug(title, 48)}")
        dur = hhmm(m.get("totalDurationSeconds") or m.get("duration"))
        video = media_link(m.get("sourceUrl") or m.get("videoUrl"), shares)
        body = [fm(title=title, date=date, author=m.get("author"),
                   replay_type=m.get("replayType"), duration=dur,
                   video=m.get("sourceUrl") or m.get("videoUrl"),
                   access_tag=m.get("accessTag"), published=m.get("published"),
                   source="https://members.marketingclub.ai/ (/api/meetings)"),
                "", f"# {title}", ""]
        meta = [f"**Date** {date}" if date else "", f"**Length** {dur}" if dur else "",
                f"**Host** {m.get('author')}" if m.get("author") else "",
                f"**Video** {video}" if video else ""]
        body.append("  ·  ".join(x for x in meta if x))
        if m.get("summary"):
            body += ["", "## Summary", "", mcapi.html2md(m["summary"])]
        tlen = len(m.get("transcript") or "")
        if tlen:
            body += ["", f"Full transcript: [transcript.md](transcript.md) "
                         f"({tlen // 1000} KB)"]
        mcapi.write(os.path.join(d, "README.md"), "\n".join(body))
        if tlen:
            mcapi.write(os.path.join(d, "transcript.md"), "\n".join([
                fm(title=f"{title} - transcript", date=date, source="/api/meetings"),
                "", f"# {title} - transcript", "",
                mcapi.wrap_transcript(m["transcript"])]))
        mcapi.write(os.path.join(d, "meeting.json"),
                    json.dumps(m, indent=1, ensure_ascii=False))
        kept += 1
        rows.append(f"| {num(i)} | {date} | [{title}]({os.path.basename(d)}/) | "
                    f"{dur or '-'} | {'yes' if tlen else 'no'} |")
    mcapi.write(os.path.join(LIVE, "README.md"), "\n".join([
        fm(title="Live classes", count=kept,
           source="https://members.marketingclub.ai/ (/api/meetings)"),
        "", "# Live classes", "",
        f"{kept} recorded live classes with Eben Pagan, "
        f"{mcapi.date_only(meetings[0].get('date')) if meetings else ''} to "
        f"{mcapi.date_only(meetings[-1].get('date')) if meetings else ''}.",
        "", "Each folder holds `README.md` (metadata + AI summary), "
        "`transcript.md` (full transcript) and `meeting.json` (raw payload).",
        "", "| # | Date | Class | Length | Transcript |",
        "|---|------|-------|--------|------------|"] + rows))
    STATS["live_classes"] = kept
    STATS["live_transcripts"] = sum(1 for m in meetings if m.get("transcript"))
    print(f"  live classes: {kept} ({STATS['live_transcripts']} transcripts)")


def build_main_content():
    """5 core sections, 43 sessions: one Markdown file per session."""
    sections = raw("main-content.json") or []
    shares = raw("videovault-share-ids.json") or {}
    sections = sorted(sections, key=lambda s: s.get("sortOrder") or 0)
    idx, n_sess, n_dl = [], 0, 0
    for i, sec in enumerate(sections, 1):
        stitle = (sec.get("title") or "untitled").strip()
        sd = os.path.join(MAIN, f"{num(i)}-{mcapi.slug(stitle, 48)}")
        sessions = sorted(sec.get("sessions") or [],
                          key=lambda s: s.get("sortOrder") or 0)
        rows = []
        for j, s in enumerate(sessions, 1):
            t = (s.get("title") or "untitled").strip()
            fn = f"{num(j)}-{mcapi.slug(t, 48)}.md"
            dls = sorted(s.get("downloads") or [], key=lambda d: d.get("sortOrder") or 0)
            n_dl += len(dls)
            body = [fm(title=t, section=stitle, session=j, video=s.get("videoId"),
                       audio=s.get("audioUrl"), access_tag=sec.get("accessTag"),
                       source="https://members.marketingclub.ai/ (/api/main-content)"),
                    "", f"# {t}", ""]
            if s.get("description"):
                body += [mcapi.html2md(s["description"]), ""]
            bits = []
            if s.get("videoId"):
                bits.append(f"- **Video** {media_link(s['videoId'], shares)}")
            if s.get("audioUrl"):
                bits.append(f"- **Audio** [{os.path.basename(s['audioUrl'].split('?')[0])}]"
                            f"({s['audioUrl']})")
            for d in dls:
                u = d.get("url") or ""
                dead = "  *(link dead - see GAPS.md)*" if any(h in u for h in DEAD_HOSTS) else ""
                bits.append(f"- **{d.get('label') or 'Download'}** "
                            f"[{os.path.basename(u.split('?')[0])}]({u}){dead}")
            if bits:
                body += ["## Media", ""] + bits
            mcapi.write(os.path.join(sd, fn), "\n".join(body))
            n_sess += 1
            rows.append(f"| {num(j)} | [{t}]({fn}) | "
                        f"{'video' if s.get('videoId') else ''}"
                        f"{' audio' if s.get('audioUrl') else ''} | {len(dls) or ''} |")
        mcapi.write(os.path.join(sd, "README.md"), "\n".join([
            fm(title=stitle, sessions=len(sessions), access_tag=sec.get("accessTag"),
               source="https://members.marketingclub.ai/ (/api/main-content)"),
            "", f"# {stitle}", "",
            mcapi.html2md(sec.get("description") or ""), "",
            "| # | Session | Media | Files |", "|---|---------|-------|-------|"] + rows))
        idx.append(f"| {num(i)} | [{stitle}]({os.path.basename(sd)}/) | "
                   f"{len(sessions)} | {sec.get('accessTag') or '-'} |")
    mcapi.write(os.path.join(MAIN, "README.md"), "\n".join([
        fm(title="Main content", sections=len(sections), sessions=n_sess,
           source="https://members.marketingclub.ai/ (/api/main-content)"),
        "", "# Main content", "",
        f"The five core tracks on the member dashboard: {n_sess} sessions, "
        f"{n_dl} attached files.", "",
        "| # | Section | Sessions | Access |",
        "|---|---------|----------|--------|"] + idx))
    STATS["sections"] = len(sections)
    STATS["sessions"] = n_sess
    STATS["session_files"] = n_dl
    print(f"  main content: {len(sections)} sections, {n_sess} sessions, {n_dl} files")


def build_programs():
    """10 hub programs, 94 lessons: one Markdown file per lesson."""
    products = raw("hub-products.json") or []
    dls = raw("hub-download-urls.json") or {}
    idx, n_les, n_items, n_res = [], 0, 0, 0
    for i, p in enumerate(products, 1):
        ptitle = (p.get("title") or p.get("slug") or "untitled").strip()
        pd = os.path.join(PROG, f"{num(i)}-{mcapi.slug(p.get('slug') or ptitle, 48)}")
        lessons = sorted(p.get("lessons") or [], key=lambda l: l.get("sortOrder") or 0)
        rows = []
        for j, l in enumerate(lessons, 1):
            t = (l.get("menuTitle") or l.get("slug") or "untitled").strip()
            fn = f"{num(j)}-{mcapi.slug(t, 48)}.md"
            items = l.get("items") or []
            n_items += len(items)
            body = [fm(title=t, subtitle=l.get("subTitle"), program=ptitle,
                       lesson=j, slug=l.get("slug"),
                       source=f"https://members.marketingclub.ai/ "
                              f"(/api/hub-agent/products/{p.get('slug')})"),
                    "", f"# {t}", ""]
            if l.get("subTitle"):
                body += [f"*{l['subTitle'].strip()}*", ""]
            desc = mcapi.html2md(l.get("descriptionHtml") or "")
            if desc:
                body += [desc, ""]
            vids = [it for it in items if it.get("itemType") == "video"]
            files = [it for it in items if it.get("itemType") != "video"]
            if vids:
                body += ["## Video", ""]
                for it in vids:
                    url = (it.get("videoEmbedUrl")
                           or (WISTIA + it["wistiaHashedId"] if it.get("wistiaHashedId") else ""))
                    label = (it.get("title") or "watch").strip()
                    body.append(f"- {'main' if it.get('role') == 'main_video' else 'extra'}: "
                                + (f"[{label}]({url})" if url else label))
                body.append("")
            if files:
                body += ["## Files", "", "| Type | File | Size | Link |",
                         "|------|------|------|------|"]
                for it in files:
                    rec = dls.get(f"{p.get('slug')}/{it.get('id')}") or {}
                    url = rec.get("url")
                    if url:
                        n_res += 1
                    size = mcapi.human(it["sizeBytes"]) if it.get("sizeBytes") else "-"
                    body.append(f"| {it.get('itemType')} | {(it.get('title') or '-').strip()} "
                                f"| {size} | {'[download](' + url + ')' if url else 'unresolved'} |")
                body.append("")
            mcapi.write(os.path.join(pd, fn), "\n".join(body))
            n_les += 1
            rows.append(f"| {num(j)} | [{t}]({fn}) | {len(vids)} | {len(files)} |")
        mcapi.write(os.path.join(pd, "README.md"), "\n".join([
            fm(title=ptitle, slug=p.get("slug"), content_type=p.get("contentType"),
               lessons=len(lessons),
               source=f"https://members.marketingclub.ai/ "
                      f"(/api/hub-agent/products/{p.get('slug')})"),
            "", f"# {ptitle}", "", mcapi.html2md(p.get("description") or ""), "",
            "| # | Lesson | Videos | Files |", "|---|--------|--------|-------|"] + rows))
        idx.append(f"| {num(i)} | [{ptitle}]({os.path.basename(pd)}/) | "
                   f"{p.get('contentType') or '-'} | {len(lessons)} |")
    mcapi.write(os.path.join(PROG, "README.md"), "\n".join([
        fm(title="Programs", programs=len(products), lessons=n_les, items=n_items,
           source="https://members.marketingclub.ai/ (/api/hub-agent/products)"),
        "", "# Programs", "",
        f"{len(products)} bundled programs (core + bonus), {n_les} lessons, "
        f"{n_items} media items.", "",
        "| # | Program | Type | Lessons |", "|---|---------|------|---------|"] + idx))
    STATS["programs"] = len(products)
    STATS["lessons"] = n_les
    STATS["items"] = n_items
    STATS["items_resolved"] = n_res
    print(f"  programs: {len(products)}, {n_les} lessons, {n_items} items "
          f"({n_res} file urls resolved)")


REDACT = {"email", "phone", "phoneNumber", "address", "street", "city", "zip",
          "postalCode", "stripeCustomerId", "memberstackId", "password",
          "passwordHash", "token", "ipAddress", "lastIp"}


def build_members():
    """Community directory. Contact fields are stripped from what gets committed."""
    members = raw("members.json") or []
    me = raw("members-me.json") or {}
    keys = {k for m in members for k in m}
    name_k = [k for k in ("firstName", "lastName", "name", "fullName") if k in keys]
    extra = [k for k in ("company", "headline", "title", "role", "location",
                         "country", "website", "membershipStatus", "joinedAt",
                         "createdAt") if k in keys]
    rows, safe = [], []
    for m in sorted(members, key=lambda m: (str(m.get("firstName") or m.get("name") or "")).lower()):
        nm = " ".join(str(m.get(k) or "").strip() for k in name_k).strip() or f"member {m.get('id')}"
        clean = {k: v for k, v in m.items() if k not in REDACT}
        safe.append(clean)
        cells = [nm] + [str(m.get(k) or "")[:40].replace("|", "/") for k in extra[:4]]
        tags = m.get("tags")
        if isinstance(tags, list):
            cells.append(", ".join(str(t)[:32] for t in tags[:2]))
        rows.append("| " + " | ".join(cells) + " |")
    head = ["Member"] + [k for k in extra[:4]] + (["tags"] if any("tags" in m for m in members) else [])
    mcapi.write(os.path.join(MEMB, "directory.md"), "\n".join([
        fm(title="Member directory", members=len(members),
           note="contact fields (email, phone) intentionally omitted",
           source="https://members.marketingclub.ai/ (/api/members)"),
        "", "# Member directory", "",
        f"{len(members)} members of the A.I. Marketing Club as of the snapshot date. "
        "Email addresses and phone numbers are **not** archived here.", "",
        "| " + " | ".join(head) + " |",
        "|" + "|".join(["---"] * len(head)) + "|"] + rows))
    mcapi.write(os.path.join(MEMB, "members.json"),
                json.dumps(safe, indent=1, ensure_ascii=False))
    tags = {}
    for m in members:
        for t in (m.get("tags") or []):
            tags[str(t)] = tags.get(str(t), 0) + 1
    mcapi.write(os.path.join(MEMB, "README.md"), "\n".join([
        fm(title="Members", count=len(members),
           source="https://members.marketingclub.ai/ (/api/members)"),
        "", "# Members", "",
        f"- **{len(members)}** members in the directory",
        f"- this account: `{me.get('id')}`, joined {mcapi.date_only(me.get('joinedAt') or me.get('createdAt'))}, "
        f"status {me.get('membershipStatus') or '-'}",
        f"- access tags on this account: {', '.join(me.get('tags') or []) or '-'}", "",
        "## Files", "",
        "- [directory.md](directory.md) - the full roster (no contact details)",
        "- `members.json` - same rows as JSON, contact fields stripped", "",
        "## Access tags across the community", "",
        "| Tag | Members |", "|-----|---------|"]
        + [f"| {t} | {n} |" for t, n in sorted(tags.items(), key=lambda kv: -kv[1])[:20]]))
    STATS["members"] = len(members)
    print(f"  members: {len(members)} (contact fields stripped)")


def build_events():
    events = raw("addevent-events.json") or []
    rows = []
    for e in events:
        t = e.get("title") or e.get("name") or "event"
        when = e.get("date") or e.get("start") or e.get("startDate") or ""
        rows.append(f"| {mcapi.date_only(when) or '-'} | {t} | "
                    f"{e.get('timezone') or e.get('tz') or ''} | "
                    f"{e.get('url') or e.get('link') or ''} |")
    mcapi.write(os.path.join(EVTS, "README.md"), "\n".join([
        fm(title="Events", count=len(events),
           source="https://members.marketingclub.ai/ (/api/addevent-events)"),
        "", "# Events", "",
        f"{len(events)} scheduled live classes at snapshot time. Past classes are "
        "archived under [01-live-classes](../01-live-classes/).", "",
        "| Date | Event | TZ | Link |", "|------|-------|----|------|"] + rows))
    mcapi.write(os.path.join(EVTS, "events.json"),
                json.dumps(events, indent=1, ensure_ascii=False))
    STATS["events"] = len(events)
    print(f"  events: {len(events)}")


def tree_stats():
    """Count what actually landed on disk."""
    n_md = n_json = n_pdf = n_media = 0
    total = 0
    for base, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in (".tools", "__pycache__")]
        for f in files:
            p = os.path.join(base, f)
            try:
                total += os.path.getsize(p)
            except OSError:
                continue
            ext = f.rsplit(".", 1)[-1].lower()
            n_md += ext == "md"
            n_json += ext == "json"
            n_pdf += ext == "pdf"
            n_media += ext in ("mp3", "mp4", "m4a", "wav", "mov", "webm")
    return n_md, n_json, n_pdf, n_media, total


def build_root():
    shares = raw("videovault-share-ids.json") or {}
    dl = raw("hub-download-urls.json") or {}
    rules = raw("content-access-rules.json") or []
    me = raw("members-me.json") or {}
    n_md, n_json, n_pdf, n_media, total = tree_stats()
    res_v = sum(1 for v in shares.values() if v.get("shareId"))
    res_f = sum(1 for v in dl.values() if v.get("url"))
    counts = [
        ("Live classes", STATS.get("live_classes", 0),
         f"{STATS.get('live_transcripts', 0)} full transcripts + AI summaries"),
        ("Core sections", STATS.get("sections", 0),
         f"{STATS.get('sessions', 0)} sessions, {STATS.get('session_files', 0)} attached files"),
        ("Programs", STATS.get("programs", 0),
         f"{STATS.get('lessons', 0)} lessons, {STATS.get('items', 0)} media items"),
        ("Members", STATS.get("members", 0), "roster without contact details"),
        ("Upcoming events", STATS.get("events", 0), "scheduled live classes"),
    ]
    mcapi.write(os.path.join(ROOT, "README.md"), "\n".join([
        fm(title="A.I. Marketing Club archive",
           source="https://members.marketingclub.ai/",
           account=f"member {me.get('id')}",
           access=", ".join(me.get("tags") or []) or None),
        "", "# A.I. Marketing Club - content archive", "",
        "Offline archive of the A.I. Marketing Club membership portal "
        "(Eben Pagan), built from the site's own JSON API so it can be "
        "regenerated at any time.", "",
        "| What | Count | Detail |", "|------|-------|--------|"]
        + [f"| {a} | {b} | {c} |" for a, b, c in counts]
        + ["", f"On disk: **{n_md} Markdown**, {n_json} JSON, {n_pdf} PDF, "
             f"{n_media} audio/video, {mcapi.human(total)} total.",
           f"Media links resolved: {res_v}/{len(shares)} videos, "
           f"{res_f}/{len(dl)} program files.", "",
           "## Layout", "", "```",
           "01-live-classes/    weekly live class replays (summary + transcript + raw)",
           "02-main-content/    the five core tracks from the dashboard",
           "03-programs/        bundled core + bonus programs, lesson by lesson",
           "04-members/         community roster (no emails or phone numbers)",
           "05-events/          upcoming scheduled classes",
           "raw-json/           verbatim API payloads (provenance, diffable)",
           ".tools/             the scripts that build all of the above",
           "```", "",
           "## How to read this", "",
           "| File | What it is |", "|------|------------|",
           "| `README.md` in any folder | index for that folder |",
           "| `transcript.md` | full spoken transcript, paragraphed |",
           "| `meeting.json` / `raw-json/*.json` | untouched API payload |",
           "| `directory.md` | member roster table |", "",
           "Video and audio are **linked, not downloaded** (the audio alone is "
           "over 1 GB, past GitHub's limits). Run "
           "`python3 .tools/fetch_files.py --media` to pull them locally; "
           "`.gitignore` keeps them out of the repo.", "",
           "## Re-running", "", "```bash",
           "cd marketingclub-archive",
           "python3 .tools/login.py         # session cookie from the creds file",
           "python3 .tools/fetch_all.py     # snapshot every API payload + resolve urls",
           "python3 .tools/build_all.py     # render the Markdown tree",
           "python3 .tools/fetch_files.py   # PDFs and documents (small)",
           "python3 .tools/fetch_files.py --media   # + audio/video (~1 GB, gitignored)",
           "```", "",
           "Credentials are read from `eben-pagan-members.marketingclub.ai.md` "
           "(gitignored) or `$MC_CREDS`. The cookie jar lives outside the repo at "
           "`~/.marketingclub/jar.txt`.", "",
           "## Not archived", "",
           "See [GAPS.md](GAPS.md). Short version: the "
           f"{', '.join(r.get('tabLabel') or '?' for r in rules) or 'gated'} tab needs "
           "a higher tier than this account, three endpoints "
           "(`/api/bonus`, `/api/events`, `/api/valuebombs`) are empty for this tier, "
           "58 program videos are embed-only with no downloadable file, and 8 checklist "
           "PDFs are dead links in the club itself (their host no longer resolves)."]))
    club = {"source": "https://members.marketingclub.ai/", "stats": STATS,
            "on_disk": {"markdown": n_md, "json": n_json, "pdf": n_pdf,
                        "media": n_media, "bytes": total},
            "resolved": {"videos": res_v, "video_refs": len(shares),
                         "files": res_f, "file_refs": len(dl)},
            "gated_tabs": rules, "account": {"id": me.get("id"), "tags": me.get("tags")}}
    mcapi.write(os.path.join(ROOT, "club.json"),
                json.dumps(club, indent=1, ensure_ascii=False))
    print(f"  root: {n_md} md, {n_json} json, {mcapi.human(total)}")


def main():
    print("== build ==")
    build_live_classes()
    build_main_content()
    build_programs()
    build_members()
    build_events()
    build_root()
    print("done ->", ROOT)


if __name__ == "__main__":
    main()
