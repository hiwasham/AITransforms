# Session Handoff — resume the Bayan marketing plan on the laptop

Start a fresh `claude` in this repo and say: **"read HANDOFF.md and continue."**
That reconstructs everything below. (Claude sessions don't sync across machines —
this doc is the bridge.)

## The goal

Build a full **13-section Corey-Haines marketing plan** for **Bayan AI Technologies**
(Oman medical ed-tech) to help **Nasim** win a marketing+branding role pitched to CEO
**Dr. Abdullah Al-Alawi** (~1000 OMR/mo target). Quality bar: `example-quietude.md`.

## The big decision we locked this session (read before drafting)

The layering, top to bottom — this keeps docs DRY:

1. **`empower-market-to-lead/` = the base framework.** The main guide. Everything
   bends to it. **⚠️ I have NOT read it yet — that is the required first action.**
   Confirm whether it defines a plan structure that overlaps/conflicts with the
   marketing-plan skill's 13-section template, or whether they compose cleanly.
2. **marketing skills** (marketing-plan, product-marketing, etc.) = execution toolkit,
   called **on demand** when the framework asks for that move. Not the master plan.
3. **Facts live once:** `marketing-plans/bayan/research.md` (ground truth) and
   `.agents/product-marketing.md` (product/audience). Plan sections **reference** these,
   never restate them.

My mistake this session: I hand-drafted a Strategic-frame section and wrote framework
prose from memory instead of reading `empower-market-to-lead/` first. Don't repeat that.
Framework stays generic/reusable — never put Bayan-specific facts into empower.

## State of the work

- **Branch:** `feature/bayan-marketing-plan` (all pushed).
- **Done:** `research.md` (facts + WhatsApp origin-thread intel), `master-prompt.md`
  (the "second brain"), `progress.md` (state machine), `CLEANUP-PLAN.md`, this file.
- **A background marketing-plan agent** was drafting in parallel last session — its
  output may need reconciling (don't blindly trust; dedupe against the above).
- **NOT done:** the actual 13 plan sections. Hybrid build order in `progress.md`
  (§2, §3, §9–13 first; §4–8 AARRR gated with `[TBD — funnel data]`; §1 last).

## Read these first (in order)

1. `empower-market-to-lead/` — the framework (FIRST, not yet read)
2. `marketing-plans/bayan/master-prompt.md` — shared language / operating system
3. `marketing-plans/bayan/research.md` — all Bayan facts (authority order inside)
4. `marketing-plans/bayan/progress.md` — where we are + build order

## Open items (human-only)

- 🔑 **Rotate the Corey/Skool password** — `corey-creds.md` was committed to the
  private remote's history (`eeb41e9`); untracking doesn't un-leak history.
- **Branch cleanup** — follow `CLEANUP-PLAN.md` (deliberate merge order in VS Code).

## Known #1 open decision for the plan

Bayan has **zero funnel data** (no analytics/attribution wired). Every AARRR
projection depends on instrumenting the funnel first — that's why §4–8 carry
`[TBD — funnel data]` until real numbers exist.
