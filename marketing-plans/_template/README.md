# Marketing System — Reusable Template

The client-agnostic engine behind the Bayan marketing work. Clone this folder to
start any new client engagement (or Hiwa's own **iranfluent**) with the same
method, then fill the placeholders. This is **not** a one-off: each engagement
should fold improvements back into this `_template/` layer so it gets better over
time.

## How to instantiate for a new client

1. Copy `_template/` → `marketing-plans/<client>/`.
2. Fill every `{{PLACEHOLDER}}` and resolve every `<!-- INSTANCE: … -->` note.
3. Delete guidance comments once the section is real.
4. Mark anything you can't verify `[TBD — confirm with team]` — never invent numbers.
5. Commit per doc on a feature branch → PR (don't dump all at once).

## The four layers (fill in this order)

| # | File | What it is | Why first |
|---|---|---|---|
| 1 | `master-prompt.template.md` | Shared brain: interaction style, thesis, resources, framework | Installs the shared language every other doc assumes |
| 2 | `revenue-integration-strategy.template.md` | Multi-source synthesis → one revenue machine + phased roadmap | The strategy the client buys |
| 3 | `analytics-events-spec.template.md` | Vendor-neutral measurement layer | Nothing downstream is trustworthy until the funnel is instrumented |
| 4 | `ceo-decision-briefs.template.md` | Decision briefs (pull + propose, no exec w/o sign-off) | Unblocks the phases that touch money / existing users |

## Placeholder vocabulary (keep consistent across all docs)

| Placeholder | Meaning | Bayan example |
|---|---|---|
| `{{CLIENT}}` | Client / brand name | Bayan Learning |
| `{{PRODUCT}}` | Flagship product / domain | bayan.edu.om |
| `{{ICP}}` | Ideal customer profile | Gulf IMG sitting a licensing exam |
| `{{SEGMENTS}}` | Distinct customer segments | physician / resident / student / nurse × exam track |
| `{{MOAT}}` | The client's defensible asset | clinician-reviewed content + human gate |
| `{{SOURCES}}` | Models / playbooks synthesized | Empower+Stage3 · Magister · Eben Pagan |
| `{{DECISION_MAKER}}` | Exec who signs off | CEO Dr. Abdullah Al-Alawi |
| `{{PRICE_LADDER}}` | Pricing tiers | free → sub → single-exam pass → cohort → B2B |
| `{{GUARDRAILS}}` | Brand red lines (never-say / never-do) | no pass guarantee; AI assists, humans own |

## What stays client-specific (never bake into the template)

Real numbers, exam paths / segment names, pricing, the moat description, the
guardrail list, and the specific source models studied. The template holds the
**structure and the reasoning**; the client folder holds the **values**.

**Version:** v1 (extracted from Bayan 2026-09-27) · bump on each engagement.
