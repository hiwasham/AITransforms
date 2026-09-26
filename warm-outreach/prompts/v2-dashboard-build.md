# Build Prompt — Warm Outreach Dashboard v2

> A goal-command-style brief written for Claude Fable 5 to execute in one pass.
> It carries its own success criteria and verification loop, so the work is
> right by construction, not by taste. Read it top to bottom, then build.

## Goal (the Stop condition)

Ship `warm-outreach/lead-dashboard-v2.html` — one self-contained HTML file that
**merges the two dashboards we already have** and is seeded with the **real five
leads**, so the moment it opens it shows the true state of the outreach pipeline
and its funnel. Done means: opened in a real browser, five real leads render,
funnel counts are correct, a status change survives a page reload, and export
downloads valid JSON.

## Why this exists (context, do not re-derive)

We have two dashboards, each half-right:

- `lead-signal-dashboard-warm-outreach.html` ("SIGNAL") — beautiful dark shell,
  stat-cards-as-filters, ⌘K search, detail slide-out, status flow. But its 10
  leads are **fictional** and nothing **persists** (in-memory array, resets on
  reload). It models cold signal-scanning, not the gift-first loop we ran.
- `dashboard.html` ("Warm Outreach — Today") — honest, minimal, **persists** to
  localStorage with JSON export, matches the real People+Tasks workflow. But it's
  too thin: it doesn't hold the gift asset, sent date, reply state, or follow-up.

v2 = SIGNAL's craft + persistence + detail panel, wrapped around dashboard.html's
honest warm-gift workflow, seeded with the real five, finally showing the funnel
counters `FUTURE_FEATURES.md` has been holding back. The funnel is now **earned** —
we ran the loop five times, so the friction is real. This is not speculative
building; it's the parked feature graduating.

## The real five (seed data — verified against the emails + files on 2026-07-20)

Each is a gift already built and an email already written; **none sent yet**. So
every lead seeds at funnel stage `written` (gift built ✓, email written ✓, sent ✗).

| # | Name | Org | Warmth | Gift deliverable(s) | Email file |
|---|------|-----|--------|--------------------|-----------|
| 1 | Dr Chris Burris | England Healing Circles | warm (webinar) | `burris-healing-circles-redesign.html` + AI enso art | `emails/01-chris-burris.md` |
| 2 | Walter | Nature's Edge Farm / Microgreens | warm (webinar) | `microgreensecrets-homepage-redesign.html`, `-shop-redesign.html`, `-contact.html` + logo/photos | `emails/02-walter-microgreens.md` |
| 3 | Holland & Barrett (email mktg) | Holland & Barrett | **cold** (subscriber, no tie) | redesigned Summer-Sale banner PNG | `emails/03-holland-barrett.md` |
| 4 | Fumiko | Face Yoga Method | warm (webinar) | `face-yoga-improved-page.html` | `emails/04-fumiko-faceyoga.md` |
| 5 | Jennifer LeSar | LeSar Holdings | warm (webinar) | `lesar-redesign.html` + 2 AI headshots (`e123709a…`, `b169db6f…`) | `emails/05-jennifer-lesar.md` |

Lead #3 is **cold** — surface it with a distinct badge; its send path is different
(reply to newsletter / LinkedIn to a marketing manager), not a warm personal note.

## Funnel model (the earned feature)

Five ordered stages, each lead sits at exactly one:

`built` → `written` → `sent` → `replied` → `booked`

- Seed all five at `written` (we built the gift and wrote the email; nothing sent).
- The stat row shows a **count per stage** and reads as a funnel (monotonic, left
  wide → right narrow). It is a sequential-magnitude visual, one hue, light→dark.
- Advancing a lead's stage is one click and **persists**. Regressing is allowed
  (mis-clicks happen) via the detail panel.

## Design tokens (derived, validated — do not eyeball color)

Keep SIGNAL's dark identity (Space Grotesk / IBM Plex Sans / IBM Plex Mono, ink
`#10141B`, panel `#171C25`, hairline `#2A3140`). Two palettes were run through the
dataviz validator:

- **Funnel green (sequential, light→dark, chroma passes):**
  `#7ED6A0 · #49BC7C · #2C9E5C · #197C43 · #0E5B30`
  Sequential ramp → judged on monotonic lightness + chroma floor (both pass); the
  categorical CVD/band flags do not apply. Every funnel number carries a **visible
  label**, which is the required contrast relief for the two lightest steps.
- **Warmth badge (status, not a series):** warm = `#2E8F46` (given-green),
  cold = `#8A857B` (neutral gray, intentionally low-chroma). Ships with a text
  label + icon, never color alone.

Text always wears ink tokens (`--text`/`--muted`/`--faint`), never the funnel hue.
Reserve status colors; never reuse a funnel step as a category color.

## Build spec

1. **Shell** — reuse SIGNAL's layout: header with brand + live "watching" chip,
   a stat/funnel row, a search + warmth-filter toolbar, a leads table, a detail
   slide-out, toasts. Add a JSON **Export** button (from dashboard.html).
2. **Funnel row** — 5 tiles `built/written/sent/replied/booked`, big number +
   mono label, a 3px left rule in the funnel green step for that stage. Tiles are
   also filters (click to show only that stage). Include a slim overall progress
   bar reading `N sent / 5`.
3. **Table** — columns: Lead (name + org), Gift (deliverable filename(s), the real
   ones), Warmth badge, Stage (the funnel select), Email (link to the `.md`). Row
   click opens detail.
4. **Detail panel** — name, org, warmth, gift list, the email subject line pulled
   from the file, current stage with advance/regress, a notes field. "Mark as
   sent" primary button advances to `sent` and stamps today's date.
5. **Persistence** — localStorage key `warm-outreach-v2`; seed the five ONLY when
   the key is absent (never clobber real edits on reload). Export writes
   `warm-outreach-v2-backup.json`. All escaping via a real `esc()` (no innerHTML
   injection of user text).
6. **Quality floor** — responsive to mobile (stack the funnel + collapse the
   table), visible keyboard focus, `prefers-reduced-motion` respected (kill the
   pulse + slide transitions), ⌘K focuses search, Esc closes overlays.

Do NOT add: multi-device sync, CSV, auth, a backend, analytics. Those stay parked
in `FUTURE_FEATURES.md`. Match existing file style; one file; no build step.

## Verification loop (must observe, not infer — CLAUDE.md §5)

1. `node --check` won't help (HTML); instead open it via the `/browse` skill.
2. Confirm: five real leads render; funnel reads **cumulatively** (a lead at
   `written` has passed `built`, so the row stays monotonic): `built 5 ·
   written 5 · sent 0 · replied 0 · booked 0`; the H&B row shows the **cold**
   badge, the other four **warm**.
3. Advance one lead to `sent`, **reload the page**, confirm it's still `sent` and
   funnel now reads `sent 1` (built/written stay 5). This proves persistence —
   the exact thing SIGNAL failed.
4. Click Export, confirm a JSON file downloads and parses.
5. Screenshot desktop + a narrow viewport. Eyeball for label collisions/overflow.
6. If any check fails, fix the root cause and re-run — do not claim done by exit
   code.

## What to cut if time runs short

Keep in this order: seed data + funnel counts + persistence (the point) → table →
detail panel → warmth filter → export. Motion polish and the progress bar are the
first things to drop. A correct, persistent, seeded funnel with no detail panel
beats a pretty shell that resets on reload.
