#!/usr/bin/env python3
"""Stage 3: render the Markdown tree for hq.stage3.app.

Reads ONLY raw-json/ - no network, no login. Scrubs account PII (email, phone,
consent IP, owner display name) from every emitted string so the committed tree
is safe. raw-json/ itself is gitignored (verbatim capture carries per-page auth
PII); this rendered tree is what gets committed.

    python3 .tools/build_all.py
"""
import json
import os
import re

from siteconf import BASE
import siteapi

ROOT = siteapi.ROOT
RAW = os.path.join(ROOT, "raw-json")

# ---- PII scrub (value-level; the kernel's redact() is key-level only) --------
# PII literals are NOT hardcoded here — they are lifted at runtime from the
# logged-in account's own auth payload in raw-json/, so this committed script
# carries no personal data and auto-adapts to whichever account was captured.
def _collect_pii():
    values = set()
    for name in ("dashboard.json", "curriculum-index.json",
                 "business-processes-index.json"):
        d = load(name)
        u = ((d or {}).get("props", {}).get("auth", {}) or {}).get("user", {}) or {}
        team = u.get("current_team", {}) or {}
        for v in (u.get("email"), u.get("name"), u.get("consent_ip"),
                  team.get("cell_phone"), team.get("sms_consent_ip")):
            if v and isinstance(v, str) and len(v) >= 4:
                values.add(v.strip())
                # bare digit run of a phone number, spacing/“+” stripped
                digits = re.sub(r"\D", "", v)
                if len(digits) >= 7:
                    values.add(digits)
        if u:
            break
    return values


def _build_scrub():
    pairs = []
    for v in sorted(_collect_pii(), key=len, reverse=True):
        rep = ("[redacted-email]" if "@" in v else
               "[redacted-ip]" if ":" in v else
               "[redacted-phone]" if re.fullmatch(r"[\d+\s-]+", v) else
               "[account owner]")
        pairs.append((re.compile(re.escape(v), re.I), rep))
    return pairs


SCRUB = None


def scrub(s):
    global SCRUB
    if SCRUB is None:
        SCRUB = _build_scrub()
    s = "" if s is None else str(s)
    for rx, rep in SCRUB:
        s = rx.sub(rep, s)
    return s


def load(name, default=None):
    p = os.path.join(RAW, name)
    if not os.path.exists(p):
        return default
    txt = open(p, encoding="utf-8").read()
    if txt.startswith("__HTTP_"):
        return default
    try:
        return json.loads(txt)
    except ValueError:
        return default


def props(name):
    d = load(name)
    return (d or {}).get("props", {}) if isinstance(d, dict) else {}


def w(path, lines):
    siteapi.write(path, scrub("\n".join(lines)))


# ---- curriculum --------------------------------------------------------------
def curric_sessions():
    """[{slug,title,lessons:[{slug,type,title}]}] from the index shared prop."""
    return load("curriculum-index.json", {}).get("props", {}).get("curriculum", [])


def build_lesson(session_slug, lesson):
    lslug = lesson["slug"]
    p = props(f"curriculum/{session_slug}/{lslug}.json")
    L = p.get("lesson", {}) or {}
    fmeta = p.get("frontmatter", {}) or {}
    maya = p.get("mayaUsage", {}) or {}
    title = L.get("title") or fmeta.get("title") or lslug
    ltype = L.get("type") or fmeta.get("type") or "text"

    out = [
        siteapi.fm(title=title, type=ltype, session=session_slug,
                   exercise_key=L.get("exercise_key") or fmeta.get("exercise_key"),
                   required=bool(L.get("required")),
                   source=f"{BASE}/curriculum/101/{session_slug}/{lslug}"),
        "", f"# {title}", "",
        f"- **Type:** {ltype}",
    ]
    if L.get("exercise_key") or fmeta.get("exercise_key"):
        out.append(f"- **Exercise key:** `{L.get('exercise_key') or fmeta.get('exercise_key')}`")
    vid = L.get("video_url") or fmeta.get("video_url")
    if vid:
        out.append(f"- **Video:** {vid}")
    out += ["", "## Content", ""]
    out.append((p.get("content") or "").strip() or "*(no body content in payload)*")

    # Exercise configuration (button / Maya welcome / passing score / questions)
    ex_keys = ("button_label", "welcome_title", "welcome_description",
               "passing_score", "video_position")
    if any(fmeta.get(k) for k in ex_keys) or fmeta.get("questions"):
        out += ["", "## Exercise configuration", ""]
        for k in ex_keys:
            if fmeta.get(k) not in (None, ""):
                out.append(f"- **{k.replace('_', ' ').title()}:** {fmeta.get(k)}")
        qs = fmeta.get("questions") or []
        if qs:
            out += ["", f"### Assessment questions ({len(qs)})", ""]
            for i, q in enumerate(qs, 1):
                if isinstance(q, dict):
                    out.append(f"{i}. {q.get('text') or q.get('question') or json.dumps(q)}")
                else:
                    out.append(f"{i}. {q}")

    # Maya chatbot — the Stage3-only assistant the user flagged
    if maya.get("applies"):
        out += ["", "## Maya chatbot (Stage 3 only)", "",
                f"- **Applies:** yes",
                f"- **Message limit:** {maya.get('messageLimit')}",
                f"- **Messages used / remaining:** {maya.get('messagesUsed')} / {maya.get('messagesRemaining')}",
                f"- **Exhausted:** {maya.get('isExhausted')}"]
        if maya.get("exhaustedMessage"):
            out.append(f"- **Exhausted message:** {maya.get('exhaustedMessage')}")

    w(os.path.join(ROOT, "curriculum", session_slug, f"{lslug}.md"), out)


def build_curriculum():
    sessions = curric_sessions()
    meta = (load("curriculum-index.json", {}).get("props", {}).get("curriculums") or [{}])[0]
    for s in sessions:
        for L in s.get("lessons", []):
            build_lesson(s["slug"], L)
        # per-session README
        rows = ["| # | Lesson | Type |", "|---|---|---|"]
        for i, L in enumerate(s.get("lessons", []), 1):
            rows.append(f"| {i} | [{L.get('title')}]({L['slug']}.md) | {L.get('type')} |")
        w(os.path.join(ROOT, "curriculum", s["slug"], "README.md"),
          [siteapi.fm(title=s.get("title"), source=f"{BASE}/curriculum/101/{s['slug']}"),
           "", f"# {s.get('title')}", "",
           f"{len(s.get('lessons', []))} lessons.", "", *rows])
    # curriculum index README
    idx = ["| Session | Lessons |", "|---|---|"]
    for s in sessions:
        idx.append(f"| [{s.get('title')}]({s['slug']}/README.md) | {len(s.get('lessons', []))} |")
    w(os.path.join(ROOT, "curriculum", "README.md"),
      [siteapi.fm(title=f"Curriculum — {meta.get('title', '101')}",
                  source=f"{BASE}/curriculum"),
       "", f"# Curriculum — {meta.get('title', '')}", "",
       f"> {meta.get('description', '')}", "",
       f"- **Slug:** `{meta.get('slug')}`  **Audience:** {meta.get('audience')}", "",
       *idx])


# ---- business processes ------------------------------------------------------
def build_core(proc_id, core_row):
    """Render one core-detail page (RACI / Visual / KPIs / SOP schema)."""
    cid = core_row.get("id")
    p = props(f"bp/proc-{proc_id}-core-{cid}.json")
    if not p:
        return None
    core = p.get("core", {}) or {}
    name = core.get("name") or f"core-{cid}"
    fname = f"{cid}-{siteapi.slug(name)}.md"
    activities = p.get("activities") or []
    kpis = p.get("kpis") or []
    sop = p.get("sopContent")
    out = [
        siteapi.fm(title=f"Core: {name}", process=core_row.get("process_name"),
                   status=core.get("status"), version=core.get("version"),
                   source=f"{BASE}/business-processes/{proc_id}/cores/{cid}"),
        "", f"# Core: {name}", "",
        f"- **Version:** {core.get('version')}",
        f"- **Owner:** {core.get('owner')}",
        f"- **Status:** {core.get('status')}",
        "",
        "## RACI / Activities", "",
        (f"{len(activities)} activities captured." if activities
         else "*No activities recorded — this core is a blank draft in the account.*"),
    ]
    for a in activities:
        out.append(f"- **{a.get('name')}** — R:{a.get('responsible')} "
                   f"A:{a.get('accountable')} C:{a.get('consulted')} I:{a.get('informed')}")
    out += ["", "## KPIs", "",
            (f"{len(kpis)} KPIs captured." if kpis else "*No KPIs recorded.*")]
    for k in kpis:
        out.append(f"- {k.get('name')}: {k.get('target')}")
    out += ["", "## SOP", "",
            (sop if isinstance(sop, str) and sop.strip() else "*No SOP content recorded.*")]
    w(os.path.join(ROOT, "business-processes", "cores", fname), out)
    return fname


def build_business_processes():
    idx = load("business-processes-index.json", {})
    ip = idx.get("props", {}) if isinstance(idx, dict) else {}
    cats = ip.get("categories", []) or []
    totals = (f"{ip.get('totalProcesses', '?')} processes, "
              f"{ip.get('totalCategories', '?')} layers, "
              f"{ip.get('totalDiagrams', '?')} diagrams")
    body = [siteapi.fm(title="Business Process Framework", source=f"{BASE}/business-processes"),
            "", "# Business Process Framework", "",
            f"Team: **{ip.get('currentTeamName', '')}** — {totals}.", ""]
    for cat in cats:
        body += [f"## {cat.get('name')} ({cat.get('description', '')})", ""]
        procs = cat.get("processes", []) or []
        body += ["| Process | Status | Cores | Diagrams |", "|---|---|---|---|"]
        for pr in procs:
            cores = pr.get("cores", []) or []
            body.append(f"| {pr.get('name')} | {pr.get('status')} | "
                        f"{len(cores)} | {len(pr.get('diagrams', []) or [])} |")
        body.append("")
        # render cores for processes that have them
        for pr in procs:
            clist = load(f"bp/proc-{pr.get('id')}-cores.json", {})
            data = (clist.get("props", {}).get("cores", {}) or {}).get("data", []) if clist else []
            for cr in data:
                cr["process_name"] = pr.get("name")
                fn = build_core(pr.get("id"), cr)
                if fn:
                    body.append(f"  - Core [{cr.get('name')}](cores/{fn}) "
                                f"(process: {pr.get('name')})")
        if any((pr.get("cores") for pr in procs)):
            body.append("")
    w(os.path.join(ROOT, "business-processes", "README.md"), body)


# ---- AI master prompts -------------------------------------------------------
def build_ai():
    edit = props("ai/master-prompt-217-edit.json")
    prompt = edit.get("prompt", {}) or {}
    versions = edit.get("versions", []) or []
    docs = (edit.get("documents", {}) or {}).get("data", []) or []
    ver = load("ai/master-prompt-version-366-details.json", {}) or {}
    out = [
        siteapi.fm(title=f"Master Prompt — {prompt.get('name')}",
                   source=f"{BASE}/ai/master-prompts/217/edit"),
        "", f"# Master Prompt — {prompt.get('name')}", "",
        f"> {prompt.get('description', '')}", "",
        f"- **Active:** {prompt.get('is_active')}  **Versions:** {prompt.get('version_count')}",
        f"- **Type:** {edit.get('promptType')}", "",
        "## Versions", "", "| Version | Status | Tokens | Docs | Summary |",
        "|---|---|---|---|---|",
    ]
    for v in versions:
        out.append(f"| {v.get('version_label')} | {v.get('status_label')} | "
                   f"{v.get('token_count')} | {v.get('document_count')} | {v.get('change_summary')} |")
    if docs:
        out += ["", "## Linked knowledge documents", ""]
        for d in docs:
            out.append(f"- **{d.get('title')}** ({d.get('file_type')}, {d.get('human_size')}) "
                       f"— {d.get('classification_label')}")
    if ver.get("compiled_prompt"):
        out += ["", f"## Compiled prompt (v{ver.get('version_label')}, "
                f"{ver.get('formatted_token_count')} tokens)", "", "```text",
                (ver.get("compiled_prompt") or "").strip(), "```"]
    w(os.path.join(ROOT, "ai", "master-prompt-217-bayan.md"), out)
    # ai README
    w(os.path.join(ROOT, "ai", "README.md"),
      [siteapi.fm(title="AI — Master Prompts", source=f"{BASE}/ai/master-prompts"),
       "", "# AI — Master Prompts", "",
       "One master prompt on this account:", "",
       f"- [{prompt.get('name')}](master-prompt-217-bayan.md)", "",
       "Knowledge Documents index (`/ai/knowledge`) returned 404 — see ../GAPS.md."])


# ---- dashboard ---------------------------------------------------------------
def build_dashboard():
    p = props("dashboard.json")
    qs = p.get("quickStats", {}) or {}
    tm = p.get("taskMetrics", {}).get("summary", {}) or {}
    wm = p.get("workflowMetrics", {}).get("summary", {}) or {}
    ad = p.get("assessmentData", {}).get("overallProgress", {}) or {}
    td = p.get("trialData", {}) or {}
    out = [
        siteapi.fm(title="Dashboard", source=f"{BASE}/dashboard"),
        "", "# Dashboard", "",
        f"- **Role:** {p.get('userRole')}", "",
        "## Quick stats", "",
        f"- Processes owned: {qs.get('processesOwned')}",
        f"- Active workflows: {qs.get('activeWorkflows')}",
        f"- Shared resources: {qs.get('sharedResources')}",
        f"- Completion rate: {qs.get('completionRate')}%",
        f"- Assessments: {ad.get('completedAssessments')}/{ad.get('totalAssessments')} "
        f"({ad.get('percentComplete')}%)",
        "", "## Tasks & workflows", "",
        f"- Tasks: {tm.get('total', 0)} total, {tm.get('completed', 0)} completed",
        f"- Workflows: {wm.get('total', 0)} total, {wm.get('active', 0)} active",
        "", "## Curriculum progress", "",
    ]
    for cr in td.get("curriculumReports", []) or []:
        out.append(f"- **{cr.get('title')}**: {cr.get('completedSessions')}/"
                   f"{cr.get('totalSessions')} sessions")
    ra = td.get("recentAssets", []) or []
    if ra:
        out += ["", "## Recent assets", ""]
        for a in ra:
            out.append(f"- {a.get('name')} ({a.get('type')})")
    w(os.path.join(ROOT, "dashboard.md"), out)


# ---- root README + GAPS ------------------------------------------------------
def build_root():
    st = siteapi.tree_stats(ROOT)
    w(os.path.join(ROOT, "README.md"), [
        siteapi.fm(title="Stage 3 (hq.stage3.app) archive", source=BASE),
        "", "# Stage 3 (hq.stage3.app) archive", "",
        "Offline archive of the premium Stage 3 control panel for this account, "
        "cross-referenced against the local cohort content in `empower-curriculum/`.", "",
        "| Area | Link |", "|---|---|",
        "| Dashboard | [dashboard.md](dashboard.md) |",
        "| Curriculum (3 sessions, 20 lessons) | [curriculum/](curriculum/README.md) |",
        "| Business Process Framework | [business-processes/](business-processes/README.md) |",
        "| AI Master Prompts | [ai/](ai/README.md) |",
        "| Cross-reference vs. cohort | [CROSS-REFERENCE.md](CROSS-REFERENCE.md) |",
        "| Gaps / not archived | [GAPS.md](GAPS.md) |",
        "",
        f"On disk: **{st['md']} Markdown**, {siteapi.human(st['bytes'])} total.", "",
        "## Provenance & privacy", "",
        "- Captured via authenticated Inertia.js JSON fetches (`X-Inertia`) through "
        "the logged-in browser session (Cloudflare-gated).",
        "- Account PII (email, phone, consent IP, owner display name) is scrubbed "
        "from all committed Markdown.",
        "- `raw-json/` (verbatim payloads) is **gitignored** — it carries per-page "
        "auth PII and is kept locally only for re-runs.", "",
        "## Re-run", "", "```bash",
        "python3 .tools/build_all.py    # render this tree from raw-json/",
        "```",
    ])


def build_gaps():
    w(os.path.join(ROOT, "GAPS.md"), [
        siteapi.fm(title="Gaps — not archived"),
        "", "# Gaps — not archived / empty", "",
        "- **`/ai/knowledge`** (Knowledge Documents index) → HTTP 404. Feature not "
        "provisioned for this trial team; the master prompt still lists one linked "
        "document (see ai/master-prompt-217-bayan.md).",
        "- **Business Process cores are blank drafts.** The three user-created cores "
        "(Testimonials #211, auto outreach #212, paywall #213) have **no** activities, "
        "RACI, KPIs, or SOP content. The RACI / Visual / Swimlane / KPIs / SOP tab "
        "schema is captured, but the account has not populated them yet.",
        "- **10 of 13 processes have no cores** — seeded framework processes only.",
        "- **Maya chatbot transcripts** are not archived — only usage counters "
        "(limit 70, e.g. 30 used / 40 remaining) travel in the lesson payloads.",
        "- **Videos** (Vimeo player URLs) are referenced, not downloaded.",
        "- Account is on a **trial** (started 2026-09-24); quotas/limits reflect that.",
    ])


if __name__ == "__main__":
    build_curriculum()
    build_business_processes()
    build_ai()
    build_dashboard()
    build_root()
    build_gaps()
    print("built:", siteapi.tree_stats(ROOT))
