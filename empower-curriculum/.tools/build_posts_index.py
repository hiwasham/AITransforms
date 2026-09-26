#!/usr/bin/env python3
"""Regenerate the README index for a post-space directory written by fetch_posts.py.

Usage: build_posts_index.py <out_dir> [--title "Heading"] [--intro "one line"]
"""
import json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def arg(flag, default=None):
    return sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else default


def frontmatter(path):
    fm, body, in_fm = {}, [], False
    with open(path, encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i == 0 and line.strip() == "---":
                in_fm = True
                continue
            if in_fm and line.strip() == "---":
                in_fm = False
                continue
            if in_fm:
                k, _, v = line.partition(":")
                v = v.strip()
                if v.startswith('"') and v.endswith('"'):
                    v = v[1:-1].replace('\\"', '"')
                fm[k.strip()] = None if v == "null" else v
            else:
                body.append(line.rstrip("\n"))
    return fm, body


def teaser(body, limit=200):
    """First real sentence of the post — skips attachment lines and bold-only labels."""
    try:
        start = body.index("## Content") + 1
    except ValueError:
        start = 0
    for line in body[start:]:
        s = line.strip()
        if not s or s.startswith(("#", "📎", "🎬", "→", "|", "-", "*", ">")):
            continue
        if re.fullmatch(r"\*\*[^*]{0,60}\*\*", s):      # a bold section label, not prose
            continue
        s = re.sub(r"[*_`]", "", s)
        return (s[:limit].rsplit(" ", 1)[0] + "…") if len(s) > limit else s
    return ""


def badges(post_dir):
    out, adir = [], os.path.join(post_dir, "assets")
    files = sorted(os.listdir(adir)) if os.path.isdir(adir) else []
    pdf = [f for f in files if f.lower().endswith(".pdf")]
    img = [f for f in files if f.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".webp"))]
    other = [f for f in files if f not in pdf and f not in img]
    if pdf:
        mb = sum(os.path.getsize(os.path.join(adir, f)) for f in pdf) / 1024 / 1024
        out.append(f"📕 {len(pdf)} pdf ({mb:.1f} MB)")
    if img:
        out.append(f"🖼 {len(img)}")
    if other:
        out.append(f"📎 {len(other)}")
    return out


def main():
    out_dir = sys.argv[1]
    base = os.path.join(ROOT, out_dir)
    meta = json.load(open(os.path.join(base, "posts.json")))
    space = meta["space"]
    title = arg("--title", space["name"])
    intro = arg("--intro")

    rows, total = [], {"posts": 0, "comments": 0, "chars": 0, "files": 0}
    for d in sorted(glob.glob(os.path.join(base, "[0-9][0-9]-*"))):
        md = os.path.join(d, "post.md")
        if not os.path.isfile(md):
            continue
        fm, body = frontmatter(md)
        b = badges(d)
        n = int(fm.get("comments") or 0)
        if n:
            b.append(f"💬 {n}")
        total["posts"] += 1
        total["comments"] += n
        total["chars"] += sum(len(x) for x in body)
        total["files"] += len(os.listdir(os.path.join(d, "assets"))) if os.path.isdir(os.path.join(d, "assets")) else 0
        rows.append((fm, os.path.basename(d), teaser(body), b))

    out = [f"# {title}", ""]
    if intro:
        out += [intro, ""]
    out += [f"Archived from [{space['name']}]({'https://community.empowerlabs.ai/c/' + space['slug']}) "
            f"· {total['posts']} posts · {total['files']} attachments · {total['comments']} comments "
            f"· {total['chars']/1024:.0f} KB of text", "",
            f"_Fetched {meta['fetched_at'][:10]}. Regenerate: `python3 .tools/fetch_posts.py {space['id']} {out_dir} --force`_", "",
            "---", ""]
    for fm, dirname, tz, b in rows:
        out += [f"## {fm.get('post_number')}. [{fm.get('title')}](./{dirname}/post.md)", ""]
        line = " · ".join(x for x in [fm.get("author"), (fm.get("published_at") or "")[:10]] if x)
        if b:
            line += "  ·  " + " · ".join(b)
        out += [line, ""]
        if tz:
            out += [tz, ""]
    with open(os.path.join(base, "README.md"), "w") as f:
        f.write("\n".join(out).rstrip() + "\n")
    print(f"wrote {os.path.join(out_dir, 'README.md')}: {total['posts']} posts, {total['comments']} comments")


if __name__ == "__main__":
    main()
