---
name: stage3-ops
description: When the user wants to read or write their Stage 3 HQ business-process dashboard at hq.stage3.app, or implement the EMPOWER system for a business inside it. Also use when the user mentions "stage3", "hq.stage3.app", "business processes" in the Stage 3 sense, "core process", "RACI mapping", "swimlane", "blueprint", "SOP tab", "KPI tab", "EMPOWER 4-level documentation", "EMPOWER 3 layers", "lead to sale", "sale to delivery", or asks to log into / automate their Stage 3 dashboard. One Stage 3 account maps to one business; the per-business config lives in `.stage3/<slug>.json`.
metadata:
  version: 1.0.0
---

# Stage 3 HQ operations

Programmatic read/write access to a Stage 3 HQ account (`hq.stage3.app`), plus the
mapping from the EMPOWER framework onto Stage 3's data model.

Stage 3 is a **Laravel + Inertia.js SPA**. There is no documented REST API. This
skill drives the same endpoints the UI drives, discovered from the embedded Ziggy
route table.

## Setup

One account per business. Config:

```
.stage3/<slug>.json    # gitignored — never commit
{
  "base": "https://hq.stage3.app",
  "username": "...",
  "password_env": "STAGE3_BAYAN_PASSWORD",
  "creds_file": "hq-stage3-archive/hq-stage3-username-password.md"
}
```

Password resolution order: `password` → `password_env` → `creds_file`.

Credentials belong in Infisical (`http://100.116.105.2:8080`); `creds_file` is a
fallback for when the vault host is unreachable. Never paste a secret into chat,
never commit one.

## Usage

```python
import sys; sys.path.insert(0, ".claude/skills/stage3-ops/scripts")
from stage3_client import Stage3, Stage3Error

s = Stage3.for_business("bayan")   # resolves .stage3/bayan.json from cwd
s.login()

for p in s.processes():            # 13 processes under 3 layer categories
    print(p["category"], p["id"], p["name"])

core = s.core_add(14, "Qualify & Route Inbound Leads")
s.activity_add(14, core, "Score lead", category="Lead Qualification")
s.kpi_add(core, "Lead response time < 4h", 210, "CRM timestamp delta",
          "weekly", 90, "maximize", unit="%")
```

`Stage3.for_business` resolves `.stage3/` **relative to cwd** — run from the repo root.

## Non-obvious mechanics

These were established by live probing. Violating them silently destroys data.

- **A 302 is the success signal for writes**, never JSON. Do not follow it; urllib
  re-issues the redirect as GET and you get a phantom
  `405 "The GET method is not supported"` on a write that actually succeeded.
  `write()` already disables redirect-following.
- **Never trust a status code.** `write()` returns `(status, errors)`; always
  re-read the collection to confirm. `core_add` does this internally and raises
  if nothing appeared.
- **`import_html_raci` REPLACES the core's entire activity list.** An HTML payload
  that parses to zero steps wipes every activity. It also creates no categories
  and ignores `div.step-desc`.
- **Activity `description` is not writable.** The server silently drops it; no
  field exists in the UI.
- **`activity_add(category=...)` is free text that auto-creates a category row,
  and there is no destroy route for activity categories.** A typo leaves permanent
  residue. The only removal path is `core_delete`, which cascades categories,
  activities and content.
- **Blueprint attaches to an activity category, not a core:**
  `POST /content/blueprint/category/{activity_category_id}`. The id is on each
  activity as `activity_category_id`. Posting to a core id 404s.
- **Swimlane has no write route** — it renders from activities.
- **Only two content type×scope pairs are valid:** `sop/core` and
  `blueprint/category`. Everything else (`guide`, `form`, `workflow`,
  `checklist`, `template`) 404s.
- **`versions/{v}/save` reads only the `content` key.** `content_html`, `body`,
  `html` are ignored.
- **`update-status` takes integers** (`0|1|2`); strings 422.
- **HTTP 409 means Inertia version mismatch, not auth failure.** The client
  refreshes `X-Inertia-Version` automatically.
- **Laravel paginators:** the list is at `props.cores.data`, not `props.cores`.
- **422 is the schema-discovery tool.** POST an empty payload: Laravel names every
  required field and creates nothing. To probe one field's enum safely, hold a
  *different* field deliberately invalid so the write can never commit.

## Feature gating

Check `pennantFeatures` / `features` in any page's props before planning work that
depends on a tab. On a trial account these were off:

```
workflows: False    tasks: False    aiAssistant: False    agents: False
assessments: {isEnabled: False}
```

With `workflows: False`, `/workflows/blueprint/{id}` and
`.../generate` return `404 {"message": ""}` — a bare `abort(404)` from feature
middleware. That is **not** a missing precondition: creating the blueprint
content, saving a version, setting status and committing it does not unlock it.
So Stage 3's **AI "generate" path is unavailable** on trial, and Guides/Forms
(EMPOWER L3/L4 proper) cannot be created. Author that content externally and
write it into SOP/Blueprint instead.

## EMPOWER → Stage 3 mapping

| EMPOWER | Stage 3 | Writable on trial |
|---|---|---|
| 3 Layers | the 3 process categories: Strategic Planning / Customer Lifecycle / Enabling | read-only (fixed) |
| L1 Core Process | core + activities + RACI | ✅ |
| L2 Blueprint | content on an **activity category** | ✅ |
| L3 Guide | `workflows/guide/{id}` | ❌ gated |
| L4 Forms | `assessments/form/{slug}` | ❌ gated |
| KPIs | `kpis/core/{core}` | ✅ |
| SOP | `content/sop/core/{core}` | ✅ |

## Teardown

`core_delete(proc, core)` is the only clean teardown — it cascades activities,
categories and content. Always scope-check before calling it: it is destructive
and the user's real cores live alongside any scratch ones.

Probe on a scratch core (`ZZZ-` prefix), and put the delete in a `finally` block
that cannot itself raise.
