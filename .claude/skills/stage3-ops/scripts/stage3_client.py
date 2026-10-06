#!/usr/bin/env python3
"""Reusable client for Stage 3 HQ (hq.stage3.app) — Laravel + Inertia.

One account per business. Everything account-specific is config, not code:

    from stage3_client import Stage3
    s = Stage3.for_business("bayan")     # reads .stage3/bayan.json
    s.login()
    s.core_add(14, "Warm list pulled")

WHY THIS EXISTS
---------------
Stage 3 is a Laravel + Inertia SPA. There is no documented public API. The
real write surface was reverse-engineered and is pinned below. Three things
bite every naive client:

  1. Writes answer **302**, not JSON. A 302 IS the success signal. If your
     HTTP client follows it, the redirect is re-issued as GET and Laravel
     answers `405 The GET method is not supported` — a phantom error on a
     write that actually succeeded. So: never follow redirects on writes.

  2. `Content-Type` must be `application/json` for writes. Laravel sees no
     fields on a form-encoded body and returns 422. (Login is the exception:
     it wants urlencoded.)

  3. Inertia reads need `X-Inertia: true` + `X-Inertia-Version`. A stale
     version gives **409**, which is a version mismatch, NOT an auth failure.

No dependencies beyond the stdlib.
"""
from __future__ import annotations

import html as _html
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request

DEFAULT_BASE = "https://hq.stage3.app"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/131.0.0.0 Safari/537.36")

# Resolved from probing the live account. See SKILL.md for evidence.
KPI_FREQUENCIES = ("daily", "weekly", "monthly", "quarterly", "annually")
KPI_DIRECTIONS = ("maximize", "minimize")
SOP_STATUSES = (0, 1, 2)  # draft / published / archived (labels not yet confirmed)


class Stage3Error(RuntimeError):
    pass


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


class Stage3:
    # ---------------------------------------------------------------- ctor
    def __init__(self, base=DEFAULT_BASE, username=None, password=None,
                 jar=None, creds_file=None):
        self.base = base.rstrip("/")
        self.username = username
        self.password = password
        self.creds_file = creds_file
        self.jar_path = jar or os.path.join(
            os.path.expanduser("~"), ".cache", "stage3",
            re.sub(r"\W+", "_", self.base) + ".jar")
        os.makedirs(os.path.dirname(self.jar_path), exist_ok=True)
        os.chmod(os.path.dirname(self.jar_path), 0o700)

        import http.cookiejar as cookiejar
        self.cj = cookiejar.MozillaCookieJar(self.jar_path)
        if os.path.exists(self.jar_path):
            try:
                self.cj.load(ignore_discard=True, ignore_expires=True)
            except Exception:
                pass
        self.op = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(self.cj))
        self.op_nr = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(self.cj), _NoRedirect)
        self._version = None

    # -------------------------------------------------------- construction
    @classmethod
    def for_business(cls, slug, config_dir=None):
        """Load an account's config: `.stage3/<slug>.json`.

        Shape (secrets stay OUT of this file — use env vars or Infisical):

            {"base": "https://hq.stage3.app",
             "username": "you@example.com",
             "password_env": "STAGE3_BAYAN_PASSWORD"}
        """
        config_dir = config_dir or os.path.join(os.getcwd(), ".stage3")
        path = os.path.join(config_dir, f"{slug}.json")
        if not os.path.exists(path):
            raise Stage3Error(f"no config at {path}")
        with open(path, encoding="utf-8") as fh:
            cfg = json.load(fh)
        pw = None
        if cfg.get("password_env"):
            pw = os.environ.get(cfg["password_env"])
        if not pw:
            pw = cfg.get("password")  # last resort; keep this out of git
        if not pw and not cfg.get("creds_file"):
            raise Stage3Error(
                f"no password for '{slug}'. Set {cfg.get('password_env')} or "
                f"add a creds_file to {path}.\n"
                f"  source <(python3 ~/.infisical/creds-env.py "
                f"{cfg.get('infisical_prefix', 'STAGE3_' + slug.upper())})")
        return cls(base=cfg.get("base", DEFAULT_BASE),
                   username=cfg.get("username"), password=pw,
                   creds_file=cfg.get("creds_file"))

    # ------------------------------------------------------------- plumbing
    def _req(self, path, data=None, method="GET", headers=None, form=False,
             follow=True):
        h = {"User-Agent": UA,
             "Accept": "text/html,application/xhtml+xml,application/json",
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
        req = urllib.request.Request(self.base + path, data=body, method=method,
                                     headers=h)
        opener = self.op if follow else self.op_nr
        try:
            with opener.open(req, timeout=60) as resp:
                return resp.status, {k.lower(): v for k, v in resp.headers.items()}, resp.read()
        except urllib.error.HTTPError as e:
            return e.code, {k.lower(): v for k, v in e.headers.items()}, e.read()
        except Exception as e:  # noqa: BLE001 - surface as a status 0
            return 0, {}, str(e).encode()

    def _xsrf(self):
        return next((urllib.parse.unquote(c.value) for c in self.cj
                     if c.name == "XSRF-TOKEN"), "")

    def _save(self):
        self.cj.save(self.jar_path, ignore_discard=True, ignore_expires=True)
        os.chmod(self.jar_path, 0o600)

    def _read_creds(self):
        if self.username and self.password:
            return self.username, self.password
        if self.creds_file:
            txt = open(self.creds_file, encoding="utf-8").read()
            u = re.search(r"^username:\s*(\S+)", txt, re.M)
            p = re.search(r"^password:\s*(\S+)", txt, re.M)
            return (u.group(1) if u else None, p.group(1) if p else None)
        return self.username, self.password

    # ----------------------------------------------------------------- auth
    @staticmethod
    def _component_of(body: bytes):
        m = re.search(rb'data-page="([^"]*)"', body)
        if not m:
            return None
        try:
            return json.loads(_html.unescape(m.group(1).decode())).get("component")
        except Exception:
            return None

    def login(self):
        """POST /login (NOT /api/login — that 404s). Needs urlencoded + CSRF."""
        self._req("/sanctum/csrf-cookie")
        u, p = self._read_creds()
        if not u or not p:
            raise Stage3Error("no username/password available")
        st, hd, body = self._req(
            "/login", data={"email": u, "password": p}, method="POST", form=True,
            headers={"X-XSRF-TOKEN": self._xsrf(),
                     "Referer": self.base + "/login", "Origin": self.base})
        ok = self._component_of(body) not in ("auth/login", None)
        if ok:
            self._save()
        return ok

    def _alive(self):
        st, hd, body = self._req(
            "/dashboard", headers={"X-Inertia": "true",
                                   "X-Inertia-Version": self.version() or ""})
        if st == 409:  # version mismatch still means authenticated
            return True
        if st != 200:
            return False
        return self._component_of(body) not in ("auth/login", None)

    def ensure(self):
        if not self._alive() and not self.login():
            raise Stage3Error("stage3 login failed")
        return self

    def version(self):
        if self._version is None:
            st, hd, body = self._req("/dashboard")
            m = re.search(rb'data-page="([^"]*)"', body)
            if m:
                self._version = json.loads(
                    _html.unescape(m.group(1).decode())).get("version")
        return self._version

    # ---------------------------------------------------------------- reads
    def inertia(self, path):
        """Authenticated Inertia JSON GET -> {component, props, url}."""
        self.ensure()
        st, hd, body = self._req(path, headers={
            "X-Inertia": "true", "X-Inertia-Version": self.version() or ""})
        if st == 409:  # app was redeployed -> refresh version once
            self._version = None
            st, hd, body = self._req(path, headers={
                "X-Inertia": "true", "X-Inertia-Version": self.version() or ""})
        if st != 200:
            raise Stage3Error(f"{st} {path}: {body[:200]!r}")
        d = json.loads(body)
        if d.get("component") == "auth/login":  # session expired mid-run
            if not self.login():
                raise Stage3Error(f"session died and re-login failed on {path}")
            self._version = None
            st, hd, body = self._req(path, headers={
                "X-Inertia": "true", "X-Inertia-Version": self.version() or ""})
            d = json.loads(body)
        return d

    def props(self, path):
        return self.inertia(path)["props"]

    # --------------------------------------------------------------- writes
    def json(self, path, method="GET", data=None, follow=None):
        """JSON/write helper. `follow` defaults to False for writes: a 302 is
        the SUCCESS signal, not a redirect to re-issue as GET."""
        self.ensure()
        if follow is None:
            follow = method.upper() == "GET"
        return self._req(path, method=method, data=data, follow=follow, headers={
            "X-XSRF-TOKEN": self._xsrf(),
            "X-Requested-With": "XMLHttpRequest",
            "Accept": "application/json",
            "Origin": self.base,
            "Referer": self.base + path})

    def write(self, path, method="POST", data=None):
        """Perform a write and return (status, errors).

        SUCCESS IS NOT TRUSTED FROM THE STATUS ALONE. Callers must re-read the
        collection. This returns errors parsed from a 422 when present.
        """
        st, hd, body = self.json(path, method=method, data=data)
        errs = None
        if st in (422, 400, 500):
            try:
                errs = json.loads(body.decode(errors="replace")).get("errors")
            except Exception:
                errs = body[:300].decode(errors="replace")
        return st, errs

    # ------------------------------------------------------- process & core
    def processes(self):
        """All 13 processes, nested under their 3 layer categories."""
        for cat in (self.props("/business-processes").get("categories") or []):
            for p in (cat.get("processes") or []):
                yield {"category": cat["name"], "category_id": cat["id"], **p}

    def cores(self, process_id):
        """NOTE: props.cores is a LARAVEL PAGINATOR, not a list."""
        c = self.props(f"/business-processes/{process_id}/cores")["cores"]
        return c["data"] if isinstance(c, dict) else c

    def core(self, process_id, core_id):
        return self.props(f"/business-processes/{process_id}/cores/{core_id}")

    def core_add(self, process_id, name, description=None):
        before = {c["id"] for c in self.cores(process_id)}
        st, errs = self.write(f"/business-processes/{process_id}/cores",
                              data={"name": name, "description": description})
        new = {c["id"] for c in self.cores(process_id)} - before
        if not new:
            raise Stage3Error(f"core not created (st={st}, errs={errs})")
        return new.pop()

    def core_delete(self, process_id, core_id):
        """Cascades to that core's activities and categories."""
        return self.write(f"/business-processes/{process_id}/cores/{core_id}",
                          method="DELETE")

    # ------------------------------------------------------------ activities
    def activities(self, process_id, core_id):
        return self.core(process_id, core_id).get("activities") or []

    def import_html_raci(self, process_id, core_id, html_content):
        """Feed EMPOWER Level 1 HTML straight in.

        DESTRUCTIVE: this REPLACES the core's whole activity list. Markup
        contract: `div.step-box` > `div.step-title`, `div.raci`
        (`R: x | A: y | C: z | I: w`). Activity `description` is NOT parsed
        from `div.step-desc` — set it via activity_update() if you need it.
        """
        return self.write(
            f"/business-processes/{process_id}/cores/{core_id}/import-html-raci",
            data={"html_content": html_content})

    def activity_add(self, process_id, core_id, name, category=None):
        """`category` is FREE TEXT and auto-creates a category row.

        There is NO destroy route for business-process activity categories —
        a typo here leaves permanent residue. Validate before calling.
        """
        return self.write(
            f"/business-processes/{process_id}/cores/{core_id}/activities",
            data={"name": name, "category": category})

    def activity_update(self, activity_id, **fields):
        """Only `name` is required. Accepted: name, description, responsible,
        accountable, consulted, informed."""
        return self.write(f"/business-processes/activities/{activity_id}",
                          method="PUT", data=fields)

    def activity_delete(self, activity_id):
        return self.write(f"/business-processes/activities/{activity_id}",
                          method="DELETE")

    # ------------------------------------------------------------------ KPIs
    def kpis(self, process_id, core_id):
        return self.core(process_id, core_id).get("kpis") or []

    def kpi_add(self, core_id, success_metric, responsible_user_id,
                measurement_method, frequency, goal_value,
                optimization_direction="maximize", unit=None):
        assert frequency in KPI_FREQUENCIES, f"{frequency} not in {KPI_FREQUENCIES}"
        assert optimization_direction in KPI_DIRECTIONS
        payload = {"success_metric": success_metric,
                   "responsible_user_id": responsible_user_id,
                   "measurement_method": measurement_method,
                   "frequency": frequency, "goal_value": goal_value,
                   "optimization_direction": optimization_direction}
        if unit:
            payload["unit"] = unit
        return self.write(f"/kpis/core/{core_id}", data=payload)

    def kpi_delete(self, kpi_id):
        """WARNING: also deletes all historical records for this KPI."""
        return self.write(f"/kpis/{kpi_id}", method="DELETE")

    # ------------------------------------------------------------------- SOP
    def sop_create(self, core_id, title):
        return self.write(f"/content/sop/core/{core_id}", data={"title": title})

    def sop_content(self, process_id, core_id):
        p = self.core(process_id, core_id)
        contents = (p.get("core") or {}).get("contents") or []
        return p.get("sopContent"), contents, (p.get("sopVersions") or [])

    def sop_save(self, process_id, core_id, content_id, version_id, content):
        return self.write(
            f"/business-processes/{process_id}/cores/{core_id}"
            f"/contents/{content_id}/versions/{version_id}/save",
            method="PUT", data={"content": content})

    def sop_set_status(self, process_id, core_id, content_id, version_id,
                       status):
        assert status in SOP_STATUSES
        return self.write(
            f"/business-processes/{process_id}/cores/{core_id}"
            f"/contents/{content_id}/versions/{version_id}/status",
            method="PUT", data={"status": status})

    def sop_commit(self, content_id, scope="core"):
        return self.write(f"/content/sop/{scope}/{content_id}/commit",
                          method="PUT")

    def team_members(self, process_id, core_id):
        return self.core(process_id, core_id).get("teamMembers") or []


# --------------------------------------------------------------- EMPOWER L1
def step(title, desc, raci):
    """Build one EMPOWER Level 1 `step-box`.

    NOTE: `desc` is accepted for source fidelity but Stage 3 does not parse
    `step-desc` — set the description via activity_update() after import.
    """
    return (f'<div class="step-box">'
            f'<div class="step-title">{title}</div>'
            f'<div class="step-desc">{desc}</div>'
            f'<div class="raci">{raci}</div>'
            f'</div>')


def raci(r="N/A", a="N/A", c="N/A", i="N/A"):
    return f"R: {r} | A: {a} | C: {c} | I: {i}"


def level1_html(steps):
    return "\n".join(step(*s) for s in steps)


if __name__ == "__main__":
    import sys
    slug = sys.argv[1] if len(sys.argv) > 1 else "bayan"
    s = Stage3.for_business(slug)
    print("login:", s.login())
    procs = list(s.processes())
    print(f"processes: {len(procs)}")
    for p in procs:
        print(f"  [{p['category']}] {p['id']:>3} {p['name']}")