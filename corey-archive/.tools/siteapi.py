#!/usr/bin/env python3
"""Shared kernel for member-site content archives. Stdlib only.

Generalized from two shipped archives (Circle community + bespoke Vite/React SPA).
An adapter script configures it once, then uses the same calls on every site:

    import siteapi
    siteapi.configure(base="https://members.example.com",
                      jar="~/.example/jar.txt",
                      creds="example-creds.md")
    siteapi.get_json("/api/meetings")

Nothing here knows your site's schema. It does the transport, the auth, the file
IO, and the text munging that every archive needs identically.
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

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/128.0 Safari/537.36")

BASE = ""
JAR = ""
CREDS = ""
ROOT = ""
RAW = ""

_opener = None
_nr_opener = None


def configure(base=None, jar=None, creds=None, root=None, raw="raw-json", ua=None):
    """Point the kernel at one site. Call once from the adapter, before any get().

    root defaults to the parent of the directory holding the calling script's
    module (i.e. the archive folder that contains .tools/), so an adapter dropped
    into <archive>/.tools/ needs no root argument.
    """
    global BASE, JAR, CREDS, ROOT, RAW, UA, _opener, _nr_opener
    if base:
        BASE = base.rstrip("/")
    if jar:
        JAR = os.path.expanduser(jar)
    if creds:
        CREDS = creds
    if ua:
        UA = ua
    if root is None:
        root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ROOT = os.path.abspath(root)
    RAW = os.path.join(ROOT, raw)
    _opener = _nr_opener = None
    return {"BASE": BASE, "JAR": JAR, "CREDS": CREDS, "ROOT": ROOT, "RAW": RAW}


# ------------------------------------------------------------------- transport

def opener():
    """Cookie-backed opener. Loads the jar written by form_login()/harvest."""
    global _opener
    if _opener is None:
        cj = http.cookiejar.MozillaCookieJar(JAR)
        if JAR and os.path.exists(JAR):
            cj.load(ignore_discard=True, ignore_expires=True)
        _opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
        _opener.jar = cj
    return _opener


def _headers(extra=None):
    h = {"Accept": "application/json, text/plain, */*", "User-Agent": UA,
         "X-Requested-With": "XMLHttpRequest", "Referer": BASE + "/"}
    h.update(extra or {})
    return h


def _persist_cookies(keep=("id", "email", "firstName", "lastName", "isAdmin")):
    """Session cookies are discard-only, so force them to disk before saving."""
    op = opener()
    for c in op.jar:
        c.discard = False
        c.expires = c.expires or 2000000000
    os.makedirs(os.path.dirname(JAR), exist_ok=True)
    op.jar.save(ignore_discard=True, ignore_expires=True)
    os.chmod(JAR, 0o600)
    return keep


def read_creds(path=None, fields=("username", "password")):
    """Parse `key: value` lines out of a credentials file. Never prints values."""
    txt = open(path or CREDS, encoding="utf-8").read()
    out = {}
    for f in fields:
        m = re.search(rf"^{f}:\s*(\S+)", txt, re.M)
        out[f] = m.group(1) if m else None
    return out


def form_login(path="/api/login", body=None, fields=("username", "password"),
               mapping=None, keep=("id", "email", "firstName", "lastName", "isAdmin")):
    """POST credentials as JSON, persist the session cookies, return a redacted who.

    `mapping` renames cred keys to the site's field names, e.g.
    {"username": "email"} when the file says `username:` but the API wants `email`.
    The full response is NOT returned - it usually carries the login email.
    """
    c = read_creds(fields=fields)
    mapping = mapping or {"username": "email", "password": "password"}
    payload = {mapping.get(k, k): v for k, v in c.items() if v}
    req = urllib.request.Request(BASE + path, data=json.dumps(payload).encode(),
                                 method="POST",
                                 headers=_headers({"Content-Type": "application/json",
                                                   "Accept": "application/json",
                                                   "Origin": BASE}))
    with opener().open(req, timeout=60) as r:
        who = json.loads(r.read().decode("utf-8", "replace"))
    _persist_cookies()
    return {k: who.get(k) for k in keep}


def get(path, tries=3, timeout=180, headers=None):
    """Authenticated GET. Returns (status, bytes). Retries transport flakes."""
    url = path if path.startswith("http") else BASE + path
    req = urllib.request.Request(url, headers=_headers(headers))
    for n in range(tries):
        try:
            with opener().open(req, timeout=timeout) as r:
                return r.status, r.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()
        except Exception as e:  # noqa: BLE001 - transport flake, retry
            if n == tries - 1:
                print(f"  ! {url}: {e}", file=sys.stderr)
                return 0, b""
            time.sleep(2 * (n + 1))
    return 0, b""


def get_json(path, default=None, **kw):
    code, raw = get(path, **kw)
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


def location(path):
    """GET without following redirects. Returns (status, Location or body-bytes).

    Signed-download endpoints answer 302 with the real file URL in Location.
    Following the redirect only produces a TLS error on odd bucket names.
    """
    global _nr_opener
    if _nr_opener is None:
        _nr_opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(opener().jar), _NoRedirect)
    url = path if path.startswith("http") else BASE + path
    req = urllib.request.Request(url, headers=_headers())
    try:
        with _nr_opener.open(req, timeout=120) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        loc = e.headers.get("Location")
        return e.code, (s3_pathstyle(loc) if loc else e.read())
    except Exception as e:  # noqa: BLE001
        return 0, str(e).encode()[:160]


def resolve_download(path, keys=("url", "downloadUrl", "signedUrl")):
    """Get the real file URL behind a download endpoint: 3xx Location, else JSON."""
    code, val = location(path)
    if 300 <= code < 400 and isinstance(val, (str, bytes)):
        return s3_pathstyle(val.decode() if isinstance(val, bytes) else val)
    if isinstance(val, bytes):
        try:
            val = json.loads(val)
        except ValueError:
            return None
    if isinstance(val, dict):
        return s3_pathstyle(next((val[k] for k in keys if val.get(k)), None))
    return None


def s3_pathstyle(url):
    """<bucket>.s3[.region].amazonaws.com/key -> s3.amazonaws.com/<bucket>/key.

    Buckets with an underscore are not covered by the wildcard certificate, so
    the virtual-hosted form cannot be fetched over TLS.
    """
    m = re.match(r"^https://([^./]+)\.s3[.-]?([a-z0-9-]*)\.amazonaws\.com/(.*)$", url or "")
    if not m or "_" not in m.group(1):
        return url
    bucket, region, key = m.groups()
    host = f"s3.{region}.amazonaws.com" if region and region != "amazonaws" else "s3.amazonaws.com"
    return f"https://{host}/{bucket}/{key}"


# ------------------------------------------------------------------------ files

def save_raw(name, obj, root=None):
    """Write a verbatim API payload under raw-json/ for provenance + re-runs."""
    d = root or RAW
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, name)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=1, ensure_ascii=False)
    return p


def load_raw(name, default=None, root=None):
    p = os.path.join(root or RAW, name)
    if not os.path.exists(p):
        return default
    with open(p, encoding="utf-8") as f:
        try:
            return json.load(f)
        except ValueError:
            return default


def merge_cache(name, fresh, root=None):
    """Cache file of resolved URLs/ids: merge so re-runs only fill gaps."""
    old = load_raw(name, {}, root) or {}
    old.update(fresh)
    save_raw(name, old, root)
    return old


def download(url, dest, skip_existing=True, referer=None):
    """Stream a file to dest atomically. Returns (ok, bytes, note)."""
    if skip_existing and os.path.exists(dest) and os.path.getsize(dest) > 0:
        return True, os.path.getsize(dest), "cached"
    os.makedirs(os.path.dirname(dest) or ".", exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": UA,
                                              "Referer": referer or BASE + "/"})
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


def write(path, text):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text if text.endswith("\n") else text + "\n")
    return path


def tree_stats(root=None, media_ext=("mp3", "mp4", "m4a", "wav", "mov", "webm",
                                    "aac", "flac")):
    """Count Markdown/JSON/docs/media and total bytes under the archive root."""
    root = root or ROOT
    n = {"md": 0, "json": 0, "pdf": 0, "media": 0, "other": 0}
    total = 0
    for dirs, sub, files in os.walk(root):
        sub[:] = [d for d in sub if not d.startswith(".git")]
        for fn in files:
            full = os.path.join(dirs, fn)
            try:
                total += os.path.getsize(full)
            except OSError:
                continue
            ext = fn.rsplit(".", 1)[-1].lower() if "." in fn else ""
            if ext in media_ext:
                n["media"] += 1
            elif ext in ("md", "json", "pdf"):
                n[ext if ext != "md" else "md"] += 1
            else:
                n["other"] += 1
    n["bytes"] = total
    return n


# ---------------------------------------------------------------- text helpers

def slug(s, n=60):
    s = re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-")
    return (s[:n].rstrip("-") or "untitled")


def safe_name(s, fallback="file", maxlen=110):
    """Filename from a URL or title.

    Parens and brackets break Markdown link targets, so they never reach a
    filename. Spaces survive as single dashes so titles stay readable.
    """
    s = urllib.parse.unquote((s or "").split("?")[0].split("#")[0])
    s = s.replace("\\", "/").split("/")[-1]
    s = re.sub(r"[^A-Za-z0-9._ -]", "-", s).strip().strip(".")
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[-_]{2,}", "-", s).replace("-.", ".")
    return (s or fallback)[:maxlen]


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


def fm(**kw):
    """YAML frontmatter block. Values are quoted; None is skipped."""
    lines = ["---"]
    for k, v in kw.items():
        if v is None:
            continue
        if isinstance(v, bool):
            lines.append(f"{k}: {'true' if v else 'false'}")
        elif isinstance(v, (int, float)):
            lines.append(f"{k}: {v}")
        else:
            lines.append(f"{k}: {yaml_str(v)}")
    lines.append("---")
    return "\n".join(lines)


class _Md(HTMLParser):
    """Minimal HTML -> Markdown (headings, paragraphs, lists, links, images)."""
    SKIP = {"script", "style", "svg", "noscript", "template", "path", "head"}
    BLOCK = {"p", "div", "section", "li", "tr", "br", "header", "footer", "main",
             "article", "ul", "ol", "table", "blockquote", "figure", "form", "nav"}
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
        for s in self.out:                      # collapse consecutive duplicates
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


# ------------------------------------------------- WebVTT/SRT -> readable prose

_TS = re.compile(r"^\s*(\d+:)?\d{1,2}:\d{2}[.,]\d{3}\s*-->")
_CUE_ID = re.compile(r"^\s*\d+\s*$")
_TAG = re.compile(r"</?[cv][^>]*>|<\d{2}:\d{2}:\d{2}[.,]\d{3}>")
_SPEAKER = re.compile(r"^([A-Z][\w'’.\-]*(?: [A-Z][\w'’.\-]*){0,3}):\s*(.*)$")


def _is_speaker(line):
    """A speaker label is 1-4 tokens that each start uppercase - not a sentence
    that happens to contain a colon ('So that's 10:' must not match)."""
    m = _SPEAKER.match(line)
    if not m:
        return None
    name = m.group(1)
    if len(name) > 40:
        return None
    toks = name.split()
    if not all(t[:1].isupper() for t in toks):
        return None
    if len(toks) == 1 and name.isupper() and len(name) > 3:
        return None      # a single ALL-CAPS word is usually a shouted word
    return m


def _cue_lines(path):
    for raw in open(path, errors="replace").read().splitlines():
        line = _TAG.sub("", raw).strip()
        if not line or line.upper().startswith("WEBVTT") or line.startswith("NOTE"):
            continue
        if _TS.search(line) or _CUE_ID.match(line):
            continue
        yield line


def cues_to_prose(path):
    """Collapse a WebVTT/SRT file into readable prose, speaker-grouped if labeled.

    Speaker mode only turns on when the file actually labels speakers, so a
    caption-only transcript is not mangled by false-positive 'Name:' matches.
    """
    lines = list(_cue_lines(path))
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
        if line in seen:          # overlapping cues repeat lines verbatim
            continue
        seen.add(line)
        if len(seen) > 20000:
            seen.clear()
        buf.append(line)
    flush()

    if not speaker_mode:
        blob = re.sub(r"\s+", " ", " ".join(out)).strip()
        sents = re.split(r"(?<=[.!?])\s+", blob)
        out = [" ".join(sents[i:i + 6]) for i in range(0, len(sents), 6)]
    return "\n\n".join(x for x in out if x.strip()).strip()


# ------------------------------------------------------------------- redaction

#: Fields stripped from any committed member/user payload. Extend per site.
REDACT = {"email", "phone", "phoneNumber", "address", "street", "city", "zip",
          "postalCode", "stripeCustomerId", "memberstackId", "circleId",
          "password", "passwordHash", "token", "accessToken", "refreshToken",
          "ipAddress", "lastIp", "ssn", "dob", "birthday"}


def redact(obj, extra=()):
    """Recursively drop REDACT keys from a dict/list so it is safe to commit."""
    drop = REDACT | set(extra)
    if isinstance(obj, dict):
        return {k: redact(v, extra) for k, v in obj.items()
                if k not in drop and not k.lower().endswith(("token", "secret", "password"))}
    if isinstance(obj, list):
        return [redact(v, extra) for v in obj]
    return obj
