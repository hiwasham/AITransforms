#!/usr/bin/env python3
"""Convert an archived empowerlabs.ai DOM dump into readable Markdown.

Stdlib only (no bs4 on this box). Drops <script>/<style>/<svg>, keeps the
document outline: headings, paragraphs, list items, links, images.

    python3 .tools/html2md.py empower-website/raw-html/teams.html
"""
import re, sys, html
from html.parser import HTMLParser

SKIP = {"script", "style", "svg", "noscript", "template", "path", "head"}
BLOCK = {"p", "div", "section", "li", "tr", "br", "header", "footer", "main",
         "article", "ul", "ol", "table", "blockquote", "figure", "form", "nav"}
HEAD = {"h1": "# ", "h2": "## ", "h3": "### ", "h4": "#### ",
        "h5": "##### ", "h6": "###### "}


class Md(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.skip, self.head, self.href, self.buf = [], 0, None, None, []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in SKIP:
            self.skip += 1
            return
        if self.skip:
            return
        if tag in HEAD:
            self.flush(); self.head = tag
        elif tag == "a":
            self.href = a.get("href")
        elif tag == "li":
            self.flush(); self.buf.append("- ")
        elif tag == "img":
            src, alt = a.get("src", ""), a.get("alt", "")
            if src and not src.startswith("data:"):
                self.flush(); self.out.append(f"![{alt}]({src})")
        elif tag in BLOCK:
            self.flush()

    def handle_endtag(self, tag):
        if tag in SKIP:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip:
            return
        if tag in HEAD:
            self.flush()
        elif tag == "a":
            self.href = None
        elif tag in BLOCK:
            self.flush()

    def handle_data(self, d):
        if self.skip:
            return
        t = re.sub(r"\s+", " ", d)
        if not t.strip():
            if self.buf and not self.buf[-1].endswith(" "):
                self.buf.append(" ")
            return
        if self.href and self.href not in ("#", "") and not self.href.startswith("data:"):
            self.buf.append(f"[{t.strip()}]({self.href})")
        else:
            self.buf.append(t)

    def flush(self):
        s = "".join(self.buf).strip()
        self.buf = []
        if not s or s == "-":
            self.head = None
            return
        if self.head:
            s = HEAD[self.head] + s
            self.head = None
        self.out.append(s)

    def markdown(self):
        self.flush()
        lines, prev = [], None
        for s in self.out:                      # collapse consecutive duplicates
            if s != prev:
                lines.append(s)
            prev = s
        return "\n\n".join(lines) + "\n"


def convert(path):
    raw = open(path, encoding="utf-8", errors="replace").read()
    m = re.match(r"<!-- archived from (\S+) on (\S+) -->\n", raw)
    url, date = (m.group(1), m.group(2)) if m else ("", "")
    p = Md(); p.feed(raw)
    body = p.markdown()
    ttl = re.search(r"<title[^>]*>(.*?)</title>", raw, re.S | re.I)
    title = html.unescape(ttl.group(1).strip()) if ttl else ""
    head = "---\n"
    if title: head += f"title: {title}\n"
    if url:   head += f"source: {url}\n"
    if date:  head += f"archived: {date}\n"
    head += "---\n\n"
    return head + body


if __name__ == "__main__":
    for f in sys.argv[1:]:
        sys.stdout.write(convert(f))
