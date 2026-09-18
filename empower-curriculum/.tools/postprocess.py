#!/usr/bin/env python3
"""Post-pass over the saved archive:
  1. turn .vtt/.srt cue files into readable transcript.md (speaker-grouped prose)
  2. re-render lesson.md from the saved lesson.json without re-downloading assets
Both steps are idempotent.
"""
import json, os, re, sys, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pm2md
from fetch_lesson import yaml_str, BASE

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TS = re.compile(r"^\s*(\d+:)?\d{1,2}:\d{2}[.,]\d{3}\s*-->")
CUE_ID = re.compile(r"^\s*\d+\s*$")
TAG = re.compile(r"</?[cv][^>]*>|<\d{2}:\d{2}:\d{2}[.,]\d{3}>")


SPEAKER = re.compile(r"^([A-Z][\w'\u2019.\-]*(?: [A-Z][\w'\u2019.\-]*){0,3}):\s*(.*)$")


def _is_speaker(line):
    """A speaker label is 1-4 tokens that each start uppercase — not a sentence
    that happens to contain a colon ('So that\'s 10:' must not match)."""
    m = SPEAKER.match(line)
    if not m:
        return None
    name = m.group(1)
    if len(name) > 40:
        return None
    toks = name.split()
    if not all(t[:1].isupper() for t in toks):
        return None
    # A single ALL-CAPS word is usually a shouted word, not a name.
    if len(toks) == 1 and name.isupper() and len(name) > 3:
        return None
    return m


def _content_lines(path):
    for raw in open(path, errors="replace").read().splitlines():
        line = TAG.sub("", raw).strip()
        if not line or line.upper().startswith("WEBVTT") or line.startswith("NOTE"):
            continue
        if TS.search(line) or CUE_ID.match(line):
            continue
        yield line


def cues_to_prose(path):
    """Collapse a WebVTT/SRT file into readable prose.

    Speaker mode only turns on when the file actually labels speakers, so a
    caption-only transcript is not mangled by false-positive 'Name:' matches.
    """
    lines = list(_content_lines(path))
    if not lines:
        return ""
    hits = sum(1 for l in lines if _is_speaker(l))
    speaker_mode = hits >= max(5, len(lines) * 0.15)

    out, speaker, buf, seen = [], None, [], set()

    def flush():
        if buf:
            text = re.sub(r"\s+", " ", " ".join(buf)).strip()
            if text:
                out.append(f"**{speaker}:** {text}" if speaker else text)
        buf.clear()

    for line in lines:
        m = _is_speaker(line) if speaker_mode else None
        if m:
            new_sp, rest = m.group(1).strip(), m.group(2).strip()
            if new_sp != speaker:
                flush()
                speaker = new_sp
            if rest:
                buf.append(rest)
            continue
        if line in seen:      # overlapping cues repeat lines verbatim
            continue
        seen.add(line)
        if len(seen) > 20000:
            seen.clear()
        buf.append(line)
    flush()

    if not speaker_mode:
        # No speaker labels: emit paragraph breaks every ~6 sentences so it reads.
        blob = re.sub(r"\s+", " ", " ".join(out)).strip()
        sents = re.split(r"(?<=[.!?])\s+", blob)
        out = [" ".join(sents[i:i + 6]) for i in range(0, len(sents), 6)]
    return "\n\n".join(x for x in out if x.strip()).strip()


def do_transcripts():
    n = 0
    for cue in sorted(glob.glob(os.path.join(ROOT, "**", "assets", "*.vtt"), recursive=True) +
                      glob.glob(os.path.join(ROOT, "**", "assets", "*.srt"), recursive=True)):
        les_dir = os.path.dirname(os.path.dirname(cue))
        prose = cues_to_prose(cue)
        if len(prose) < 200:
            print(f"  ! thin transcript, skipped: {os.path.basename(cue)}")
            continue
        title = "Transcript"
        md = json.load(open(os.path.join(les_dir, "lesson.json"))) if os.path.exists(os.path.join(les_dir, "lesson.json")) else {}
        head = [f"# {title} — {md.get('name', os.path.basename(les_dir))}", "",
                f"_Readable version of `assets/{os.path.basename(cue)}`. Timestamps removed, "
                f"consecutive lines grouped by speaker._", "",
                "[← lesson](./lesson.md)", "", "---", ""]
        dest = os.path.join(les_dir, "transcript.md")
        with open(dest, "w") as f:
            f.write("\n".join(head) + prose.rstrip() + "\n")
        n += 1
        print(f"  {os.path.relpath(dest, ROOT)}  ({len(prose)/1024:.0f} KB prose)")
    print(f"transcripts written: {n}")


def rebuild_asset_map(les_dir, body):
    """Reconstruct signed_id -> local asset from the NN-/imgNN- filename prefixes."""
    adir = os.path.join(les_dir, "assets")
    if not os.path.isdir(adir):
        return {}, []
    names = sorted(os.listdir(adir))
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

    amap, log = {}, []
    def bind(attrs_list, prefix_fmt, kind):
        for i, a in enumerate(attrs_list, 1):
            pref = prefix_fmt.format(i=i)
            hit = next((x for x in names if x.startswith(pref + "-")), None)
            if not hit:
                continue
            rec = {"path": "assets/" + hit, "name": hit,
                   "size": os.path.getsize(os.path.join(adir, hit))}
            for k in (a.get("signed_id"), a.get("src"), a.get("url")):
                if k:
                    amap[k] = rec
            log.append({"kind": kind, **rec})
    bind(files, "{i:02d}", "file")
    bind(images, "img{i:02d}", "image")
    return amap, log


def render(les_dir):
    lj = os.path.join(les_dir, "lesson.json")
    md_path = os.path.join(les_dir, "lesson.md")
    if not os.path.exists(lj) or not os.path.exists(md_path):
        return None
    old = open(md_path).read()
    fm_old = dict(re.findall(r"^(\w+): (.*)$", old.split("---")[1], re.M)) if old.startswith("---") else {}
    L = json.load(open(lj))
    rtb = L.get("rich_text_body") or {}
    pm2md.assets, asset_log = rebuild_asset_map(les_dir, rtb.get("body"))
    pm2md.unhandled = set()
    body_md = pm2md.to_markdown(rtb)
    body_md = re.sub(r"^#{1,6}\s*$\n?", "", body_md, flags=re.M)
    embed = L.get("featured_media_embed") or {}
    video_url = embed.get("content")
    has_transcript = os.path.exists(os.path.join(les_dir, "transcript.md"))

    fm = {
        "title": L["name"],
        "course": fm_old.get("course", "").strip('"'),
        "section": fm_old.get("section", "").strip('"'),
        "lesson_number": fm_old.get("lesson_number", "0"),
        "section_number": fm_old.get("section_number", "0"),
        "status": L.get("status"), "completed": L.get("completed"),
        "lesson_id": L["id"], "section_id": fm_old.get("section_id", "0"),
        "space_id": fm_old.get("space_id", "0"),
        "url": fm_old.get("url", "").strip('"'),
        "video_url": video_url, "video_title": embed.get("title"),
        "attachments": sum(1 for a in asset_log if a["kind"] == "file"),
        "images": sum(1 for a in asset_log if a["kind"] == "image"),
        "transcript": "transcript.md" if has_transcript else None,
        "created_at": L.get("created_at"), "updated_at": L.get("updated_at"),
        "fetched_at": fm_old.get("fetched_at", "").strip('"'),
    }
    def raw(k, v):
        return f"{k}: {v}" if k in ("lesson_number", "section_number", "section_id", "space_id") else f"{k}: {yaml_str(v)}"
    out = ["---"] + [raw(k, v) for k, v in fm.items()] + ["---", ""]
    out += [f"# {L['name']}", "",
            f"> {fm['course']} › Section {fm['section_number']}: {fm['section']} › Lesson {fm['lesson_number']}", "",
            f"[Open on Circle]({fm['url']})", ""]
    if video_url:
        out += ["## Video", "", f"- **{embed.get('title') or 'Recording'}** — {video_url}", ""]
    vids = [a for a in asset_log if a["name"].lower().endswith((".mp4", ".mov", ".m4v"))]
    if vids:
        out += ["## Video files (downloaded)", ""]
        out += [f"- [{a['name']}](./{a['path']}) ({a['size']/1048576:.1f} MB)" for a in vids]
        out += [""]
    if has_transcript:
        out += ["## Transcript", "", "- [Readable transcript](./transcript.md)", ""]
    other = [a for a in asset_log if a not in vids]
    if other:
        out += ["## Files", ""]
        for a in other:
            kb = a["size"] / 1024
            sz = f"{kb/1024:.1f} MB" if kb > 1024 else f"{kb:.0f} KB"
            out += [f"- [{a['name']}](./{a['path']}) ({sz})"]
        out += [""]
    out += ["## Content", "", body_md]
    if pm2md.unhandled:
        out += ["", "## Conversion warnings", ""] + [f"- unhandled: `{u}`" for u in sorted(pm2md.unhandled)]
    with open(md_path, "w") as f:
        f.write("\n".join(out).rstrip() + "\n")
    return sorted(pm2md.unhandled)


def main():
    print("=== transcripts ===")
    do_transcripts()
    print("\n=== re-render lesson.md ===")
    warn, n = {}, 0
    for md in sorted(glob.glob(os.path.join(ROOT, "**", "lesson.md"), recursive=True)):
        u = render(os.path.dirname(md))
        n += 1
        if u:
            warn[os.path.relpath(os.path.dirname(md), ROOT)] = u
    print(f"re-rendered: {n}")
    print("remaining unhandled:", warn or "none")


if __name__ == "__main__":
    main()
