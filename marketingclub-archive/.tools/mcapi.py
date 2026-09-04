#!/usr/bin/env python3
"""Shared helpers for the A.I. Marketing Club archive tools.

Stdlib only (no requests/bs4 on this box). Every other tool imports this.

    import mcapi
    mcapi.get_json("/api/meetings")
"""
import http.cookiejar
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

BASE = "https://members.marketingclub.ai"
JAR = os.environ.get("MC_JAR", os.path.expanduser("~/.marketingclub/jar.txt"))
CREDS = os.environ.get("MC_CREDS", "eben-pagan-members.marketingclub.ai.md")
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/128.0 Safari/537.36")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "raw-json")

_opener = None


def opener():
    """Cookie-backed opener; loads the jar written by login.py."""
    global _opener
    if _opener is None:
        cj = http.cookiejar.MozillaCookieJar(JAR)
        if os.path.exists(JAR):
            cj.load(ignore_discard=True, ignore_expires=True)
        _opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
        _opener.jar = cj
    return _opener


def login():
    """POST /api/login with the credentials file, then persist the cookie jar."""
    txt = open(CREDS, encoding="utf-8").read()
    email = re.search(r"^username:\s*(\S+)", txt, re.M).group(1)
    pw = re.search(r"^password:\s*(\S+)", txt, re.M).group(1)
    op = opener()
    body = json.dumps({"email": email, "password": pw}).encode()
    req = urllib.request.Request(BASE + "/api/login", data=body, method="POST", headers={
        "Content-Type": "application/json", "Accept": "application/json",
        "User-Agent": UA, "Origin": BASE, "Referer": BASE + "/"})
    with op.open(req, timeout=60) as r:
        who = json.loads(r.read().decode("utf-8", "replace"))
    for c in op.jar:
        c.discard = False
        c.expires = c.expires or 2000000000
    os.makedirs(os.path.dirname(JAR), exist_ok=True)
    op.jar.save(ignore_discard=True, ignore_expires=True)
    os.chmod(JAR, 0o600)
    return {k: who.get(k) for k in ("id", "email", "firstName", "lastName", "isAdmin")}


def get(path, tries=3):
    """Authenticated GET. Returns (status, bytes). Retries transient failures."""
    url = path if path.startswith("http") else BASE + path
    req = urllib.request.Request(url, headers={
        "Accept": "application/json, text/plain, */*", "User-Agent": UA,
        "X-Requested-With": "XMLHttpRequest", "Referer": BASE + "/"})
    for n in range(tries):
        try:
            with opener().open(req, timeout=180) as r:
                return r.status, r.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()
        except Exception as e:  # noqa: BLE001 - transport flake, retry
            if n == tries - 1:
                print(f"  ! {url}: {e}", file=sys.stderr)
                return 0, b""
            time.sleep(2 * (n + 1))
    return 0, b""


def get_json(path, default=None):
    code, raw = get(path)
    if code != 200:
        print(f"  ! {code} {path}", file=sys.stderr)
        return default
    try:
        return json.loads(raw)
    except ValueError:
        print(f"  ! {path}: not JSON ({raw[:60]!r})", file=sys.stderr)
        return default


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **kw):
        return None


_nr_opener = None


def location(path):
    """GET without following redirects. Returns (status, Location or body-bytes).

    The hub's /download-url endpoints answer 302 with the real file URL, so
    following the redirect only produces a TLS error on odd bucket names.
    """
    global _nr_opener
    if _nr_opener is None:
        _nr_opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(opener().jar), _NoRedirect)
    url = path if path.startswith("http") else BASE + path
    req = urllib.request.Request(url, headers={
        "Accept": "application/json, text/plain, */*", "User-Agent": UA,
        "X-Requested-With": "XMLHttpRequest", "Referer": BASE + "/"})
    try:
        with _nr_opener.open(req, timeout=120) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        loc = e.headers.get("Location")
        return e.code, (s3_pathstyle(loc) if loc else e.read())
    except Exception as e:  # noqa: BLE001
        return 0, str(e).encode()[:160]


def s3_pathstyle(url):
    """<bucket>.s3[.region].amazonaws.com/key -> s3.amazonaws.com/<bucket>/key.

    Buckets with an underscore (streaming_alt) are not covered by the wildcard
    certificate, so the virtual-hosted form cannot be fetched over TLS.
    """
    m = re.match(r"^https://([^./]+)\.s3[.-]?([a-z0-9-]*)\.amazonaws\.com/(.*)$", url or "")
    if not m or "_" not in m.group(1):
        return url
    bucket, region, key = m.groups()
    host = f"s3.{region}.amazonaws.com" if region and region != "amazonaws" else "s3.amazonaws.com"
    return f"https://{host}/{bucket}/{key}"


def save_raw(name, obj):
    """Write a verbatim API payload under raw-json/ for provenance."""
    os.makedirs(RAW, exist_ok=True)
    p = os.path.join(RAW, name)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=1, ensure_ascii=False)
    return p


def download(url, dest, skip_existing=True):
    """Stream a file to dest. Returns (ok, bytes, note)."""
    if skip_existing and os.path.exists(dest) and os.path.getsize(dest) > 0:
        return True, os.path.getsize(dest), "cached"
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": BASE + "/"})
    tmp = dest + ".part"
    try:
        with opener().open(req, timeout=600) as r, open(tmp, "wb") as f:
            n = 0
            while True:
                chunk = r.read(262144)
                if not chunk:
                    break
                f.write(chunk)
                n += len(chunk)
        os.replace(tmp, dest)
        return True, n, "ok"
    except Exception as e:  # noqa: BLE001
        if os.path.exists(tmp):
            os.remove(tmp)
        return False, 0, str(e)[:120]


# ---------------------------------------------------------------- text helpers

def slug(s, n=60):
    s = re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-")
    return (s[:n].rstrip("-") or "untitled")


def human(nbytes):
    for unit in ("B", "KB", "MB", "GB"):
        if nbytes < 1024 or unit == "GB":
            return f"{nbytes:.0f} {unit}" if unit == "B" else f"{nbytes:.1f} {unit}"
        nbytes /= 1024.0
    return ""


def date_only(iso):
    return (iso or "")[:10]


def yaml_str(s):
    """Quote a scalar for YAML frontmatter."""
    s = re.sub(r"\s+", " ", str(s or "")).strip()
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'


class _Md(HTMLParser):
    """Minimal HTML -> Markdown (headings, paragraphs, lists, links, images)."""
    SKIP = {"script", "style", "svg", "noscript", "template", "path", "head"}
    BLOCK = {"p", "div", "section", "li", "tr", "br", "header", "footer", "main",
             "article", "ul", "ol", "table", "blockquote", "figure", "nav"}
    HEAD = {"h1": "# ", "h2": "## ", "h3": "### ", "h4": "#### ",
            "h5": "##### ", "h6": "###### "}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.skip, self.head, self.href, self.buf = [], 0, None, None, []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in self.SKIP:
            self.skip += 1
            return
        if self.skip:
            return
        if tag in self.HEAD:
            self.flush()
            self.head = tag
        elif tag == "a":
            self.href = a.get("href")
        elif tag == "li":
            self.flush()
            self.buf.append("- ")
        elif tag == "img":
            src, alt = a.get("src", ""), a.get("alt", "")
            if src and not src.startswith("data:"):
                self.flush()
                self.out.append(f"![{alt}]({src})")
        elif tag in self.BLOCK:
            self.flush()

    def handle_endtag(self, tag):
        if tag in self.SKIP:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip:
            return
        if tag in self.HEAD or tag in self.BLOCK:
            self.flush()
        elif tag == "a":
            self.href = None

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
            s = self.HEAD[self.head] + s
            self.head = None
        self.out.append(s)

    def markdown(self):
        self.flush()
        lines, prev = [], None
        for s in self.out:
            if s != prev:
                lines.append(s)
            prev = s
        return "\n\n".join(lines).strip()


def html2md(s):
    if not s or not s.strip():
        return ""
    if "<" not in s:
        return s.strip()
    p = _Md()
    p.feed(s)
    return p.markdown()


def wrap_transcript(text, sentences_per_para=5):
    """Turn a wall-of-text transcript into readable paragraphs."""
    text = re.sub(r"\s+", " ", (text or "").strip())
    if not text:
        return ""
    parts = re.split(r"(?<=[.!?])\s+", text)
    paras, buf = [], []
    for s in parts:
        buf.append(s)
        if len(buf) >= sentences_per_para:
            paras.append(" ".join(buf))
            buf = []
    if buf:
        paras.append(" ".join(buf))
    return "\n\n".join(paras)


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text if text.endswith("\n") else text + "\n")
    return path
