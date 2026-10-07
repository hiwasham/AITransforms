#!/usr/bin/env python3
"""Reusable hq.stage3.app session client. Login + authenticated Inertia JSON GET.

    from stage3 import Session
    s = Session()                      # logs in, caches jar at /tmp/stage3-recon/jar.txt
    d = s.inertia("/business-processes/14/cores")

Never prints or logs the password. Session cookie + XSRF handled automatically.
"""
import http.cookiejar, html as H, json, os, re, urllib.error, urllib.parse, urllib.request

BASE = "https://hq.stage3.app"
CREDS_MD = os.environ.get(
    "STAGE3_CREDS",
    "/root/projects/AITransforms/hq-stage3-archive/hq-stage3-username-password.md")
WORK = os.environ.get("STAGE3_WORK", "/tmp/stage3-recon")
JAR = os.path.join(WORK, "jar.txt")
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36")


class Session:
    def __init__(self, creds_md=CREDS_MD, jar=JAR, base=BASE):
        self.base = base
        self.jar_path = jar
        self.creds_md = creds_md
        os.makedirs(os.path.dirname(jar), exist_ok=True)
        self.cj = http.cookiejar.MozillaCookieJar(jar)
        if os.path.exists(jar):
            try:
                self.cj.load(ignore_discard=True, ignore_expires=True)
            except Exception:
                pass
        self.op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cj))
        # Writes must NOT follow redirects: a 302 on POST/DELETE is the success
        # signal, and re-issuing it as GET makes Laravel answer 405.
        class _NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *a, **k):
                return None
        self.op_nr = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cj),
                                                _NoRedirect)
        self._version = None

    # ---- low level ------------------------------------------------------
    def _req(self, path, data=None, method="GET", headers=None, form=False, follow=True):
        h = {"User-Agent": UA, "Accept": "text/html,application/xhtml+xml,application/json",
             "Accept-Encoding": "identity"}
        body = None
        if data is not None:
            if isinstance(data, bytes):
                body = data
            elif form:
                body = urllib.parse.urlencode(data).encode()
                h.setdefault("Content-Type", "application/x-www-form-urlencoded")
            else:
                body = json.dumps(data).encode()
                h.setdefault("Content-Type", "application/json")
        if headers:
            h.update(headers)
        r = urllib.request.Request(self.base + path, data=body, method=method, headers=h)
        op = self.op if follow else self.op_nr
        try:
            with op.open(r, timeout=60) as resp:
                return resp.status, {k.lower(): v for k, v in resp.headers.items()}, resp.read()
        except urllib.error.HTTPError as e:
            return e.code, {k.lower(): v for k, v in e.headers.items()}, e.read()
        except Exception as e:
            return 0, {}, str(e).encode()

    def _xsrf(self):
        return next((urllib.parse.unquote(c.value) for c in self.cj
                     if c.name == "XSRF-TOKEN"), "")

    def _save(self):
        self.cj.save(self.jar_path, ignore_discard=True, ignore_expires=True)
        os.chmod(self.jar_path, 0o600)

    def _read_creds(self):
        txt = open(self.creds_md, encoding="utf-8").read()
        u = re.search(r"^username:\s*(\S+)", txt, re.M)
        p = re.search(r"^password:\s*(\S+)", txt, re.M)
        return (u.group(1) if u else None, p.group(1) if p else None)

    # ---- auth -----------------------------------------------------------
    def login(self):
        self._req("/sanctum/csrf-cookie")
        u, p = self._read_creds()
        st, hd, body = self._req(
            "/login", data={"email": u, "password": p}, method="POST", form=True,
            headers={"X-XSRF-TOKEN": self._xsrf(),
                     "Referer": self.base + "/login", "Origin": self.base})
        ok = self._is_dashboard(body)
        if ok:
            self._save()
        return ok

    @staticmethod
    def _is_dashboard(body):
        m = re.search(rb'data-page="([^"]*)"', body)
        if not m:
            return False
        try:
            d = json.loads(H.unescape(m.group(1).decode()))
        except Exception:
            return False
        return d.get("component") not in ("auth/login", None)

    @staticmethod
    def _component(body):
        m = re.search(rb'data-page="([^"]*)"', body)
        if m:
            try:
                return json.loads(H.unescape(m.group(1).decode())).get("component")
            except Exception:
                return None
        return None

    def _alive(self):
        # Inertia page fetch; the authoritative tell is the component name.
        st, hd, body = self._req("/dashboard",
                                 headers={"X-Inertia": "true",
                                          "X-Inertia-Version": self.version() or ""})
        if st == 409:  # version mismatch still means authenticated
            return True
        if st != 200:
            return False
        return self._component(body) not in ("auth/login", None)

    def ensure(self):
        if not self._alive():
            if not self.login():
                raise RuntimeError("stage3 login failed")
        return self

    def version(self):
        if self._version is None:
            st, hd, body = self._req("/dashboard")
            m = re.search(rb'data-page="([^"]*)"', body)
            if m:
                d = json.loads(H.unescape(m.group(1).decode()))
                self._version = d.get("version")
        return self._version

    # ---- reads ----------------------------------------------------------
    def inertia(self, path):
        """Authenticated Inertia JSON GET -> parsed dict {component, props, url}."""
        self.ensure()
        v = self.version() or ""
        st, hd, body = self._req(path, headers={"X-Inertia": "true",
                                                "X-Inertia-Version": v})
        if st == 409:  # version changed -> refresh and retry once
            self._version = None
            st, hd, body = self._req(path, headers={"X-Inertia": "true",
                                                    "X-Inertia-Version": self.version() or ""})
        if st != 200:
            raise RuntimeError(f"{st} {path}: {body[:160]!r}")
        d = json.loads(body)
        # session can expire mid-run -> re-login once and retry
        if d.get("component") == "auth/login":
            if not self.login():
                raise RuntimeError(f"session died and re-login failed on {path}")
            self._version = None
            st, hd, body = self._req(path, headers={"X-Inertia": "true",
                                                    "X-Inertia-Version": self.version() or ""})
            d = json.loads(body)
        return d

    def json(self, path, method="GET", data=None, follow=None):
        """Write/JSON helper. `follow` defaults to (method == 'GET'): a 302 is
        the SUCCESS signal for a write, never a redirect to re-issue."""
        self.ensure()
        if follow is None:
            follow = method.upper() == "GET"
        st, hd, body = self._req(path, method=method, data=data, follow=follow,
                                 headers={"X-XSRF-TOKEN": self._xsrf(),
                                          "X-Requested-With": "XMLHttpRequest",
                                          "Accept": "application/json",
                                          "Origin": self.base,
                                          "Referer": self.base + path})
        return st, body


if __name__ == "__main__":
    s = Session()
    print("login ok:", s.login())
    d = s.inertia("/business-processes")
    print("component:", d.get("component"))
    print("props keys:", list((d.get("props") or {}).keys()))