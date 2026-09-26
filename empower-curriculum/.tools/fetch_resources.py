#!/usr/bin/env python3
"""Pull the shared external resources lessons link out to (the prompt library
Google Doc) and split it into per-session files."""
import os, re, subprocess, sys, json, datetime, collections, glob, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36"
OUT = os.path.join(ROOT, "resources", "prompt-library")


def google_doc_ids():
    """Every Google Doc id referenced from any saved lesson, with which lessons use it."""
    hits = collections.defaultdict(set)
    for lj in glob.glob(os.path.join(ROOT, "**", "lesson.json"), recursive=True):
        rel = os.path.relpath(os.path.dirname(lj), ROOT)
        j = json.load(open(lj))

        def scan(url):
            m = re.search(r"docs\.google\.com/document/d/([A-Za-z0-9_-]{20,})", url or "")
            if m:
                hits[m.group(1)].add(rel)

        def walk(n):
            if isinstance(n, dict):
                a = n.get("attrs") or {}
                scan(a.get("url"))
                for mk in n.get("marks") or []:
                    scan((mk.get("attrs") or {}).get("href"))
                for c in n.get("content") or []:
                    walk(c)
            elif isinstance(n, list):
                for c in n:
                    walk(c)
        walk((j.get("rich_text_body") or {}).get("body") or {})
    return hits


def export(doc_id, dest):
    url = f"https://docs.google.com/document/d/{doc_id}/export?format=md"
    r = subprocess.run(["curl", "-sS", "-L", "-A", UA, "-o", dest, "-w", "%{http_code}", url],
                       capture_output=True, text=True)
    code = (r.stdout or "").strip()
    if code != "200" or not os.path.exists(dest) or os.path.getsize(dest) < 500:
        return None
    txt = open(dest, errors="replace").read()
    if "accounts.google.com" in txt[:2000] and len(txt) < 5000:
        os.remove(dest)
        return None
    return txt


def split_sessions(text):
    """Split on '# Session N' headings, keeping anything before the first as intro."""
    parts, cur, name = [], [], "00-intro"
    for line in text.splitlines():
        m = re.match(r"^#\s+Session\s+(\d+)\s*$", line.strip())
        if m:
            if cur and any(l.strip() for l in cur):
                parts.append((name, "\n".join(cur).strip()))
            name = f"session-{int(m.group(1)):02d}"
            cur = [line]
        else:
            cur.append(line)
    if cur and any(l.strip() for l in cur):
        parts.append((name, "\n".join(cur).strip()))
    return parts


def main():
    os.makedirs(OUT, exist_ok=True)
    hits = google_doc_ids()
    print(f"google docs referenced: {len(hits)}")
    index = []
    for doc_id, lessons in hits.items():
        full = os.path.join(OUT, f"{doc_id}.md")
        txt = export(doc_id, full)
        if not txt:
            print(f"  {doc_id}: NOT PUBLIC (skipped)")
            index.append((doc_id, None, sorted(lessons), 0))
            continue
        name = "master-prompt-library.md"
        dest = os.path.join(OUT, name)
        os.replace(full, dest)
        print(f"  {doc_id}: {len(txt)/1024:.0f} KB -> {name}  (linked from {len(lessons)} lessons)")
        n = 0
        for sec_name, body in split_sessions(txt):
            with open(os.path.join(OUT, f"{sec_name}.md"), "w") as f:
                f.write(body.rstrip() + "\n")
            n += 1
        print(f"    split into {n} files")
        index.append((doc_id, name, sorted(lessons), n))

    lines = ["# Prompt library", "",
             "The exercise prompts the lessons link out to. Exported from the shared",
             "Google Doc the course uses, then split per session.", "",
             f"_Exported {datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')}._", "",
             "[← archive index](../../README.md)", ""]
    for f in sorted(os.listdir(OUT)):
        if f.endswith(".md") and f != "README.md":
            kb = os.path.getsize(os.path.join(OUT, f)) / 1024
            lines.append(f"- [{f}](./{f}) ({kb:.0f} KB)")
    open(os.path.join(OUT, "README.md"), "w").write("\n".join(lines).rstrip() + "\n")
    print("wrote", os.path.join(OUT, "README.md"))


if __name__ == "__main__":
    main()
