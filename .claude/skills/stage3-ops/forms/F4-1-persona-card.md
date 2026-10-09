# F4-1: Persona Card

**Process:** Proc 4 - Customer Segmentation & Persona Development
**Core:** 215 (DRAFT — see warning)
**Realizes:** SOP-004 (Core 215) Procedure 3 — Write Persona Cards
**Owner:** Marketer (Nasim)
**Accountable:** CEO (Dr. Abdullah Al Alawi)
**Version:** 1.0
**Last Updated:** 2026-10-09

> ⚠️ **Core ID 215 is DRAFT** (`marketing-plans/bayan/cores-draft.md`), **unverified**
> against live Stage 3 HQ (lapsed 2026-10-09). Reconcile at renewal.

---

## Purpose

A single, reusable template for one persona. Every persona the team talks about must have a
card filled from this template — no persona exists until it has a card, and no card is
"canonical" until the VOC is real and the CEO has signed it.

---

## When to Use

- Drafting a new persona (SOP-004 Core 215, Procedure 3)
- Reviewing an existing persona against fresh Voice-of-Customer evidence
- Onboarding a new team member who needs the shared definition of a segment

---

## The Card (template)

```
┌─────────────────────────────────────────────────────────────┐
│ PERSONA CARD                              Status: [HYPOTHESIS │
│                                                  | CANONICAL] │
├─────────────────────────────────────────────────────────────┤
│ Name + role      │ e.g. "Reza, IMG self-funder"              │
│ Motion           │ A (Self-Serve B2C) | B (Institutional B2B)│
│ Exam track       │ e.g. OMSB Internal Medicine               │
│ Geography / tier │ intl_paid | oman_free | free_country      │
│ Job-to-be-done   │ One sentence, in the user's own words     │
│ Trigger          │ The event that starts the search          │
│ Primary objection│ The one thing that stops the purchase     │
│ Anti-signals     │ What marks someone who looks right but    │
│                  │ is NOT this persona                        │
│ VOC quote        │ Real, attributed, never invented          │
│ VOC source       │ Where the quote came from (date + channel)│
├─────────────────────────────────────────────────────────────┤
│ CEO sign-off: [ ]  Date: __________  Version: ____            │
└─────────────────────────────────────────────────────────────┘
```

**Status rule:** a card is `HYPOTHESIS` until (a) it carries a real, attributed VOC quote and
(b) the CEO has signed it. Only then does it become `CANONICAL`. Hypothesis cards may be used
for internal planning but may **not** anchor public copy or paid campaigns.

---

## Field Definitions

| Field | What goes here | Rule |
|-------|----------------|------|
| Name + role | A memorable first name + the role label | Role must be an ICP role (doctor / resident / med student / nurse) |
| Motion | A or B | Set once; drives which cores own the lead |
| Exam track | The specific exam, not "a Gulf exam" | Must be a supported track, or flag as content-roadmap signal |
| Geography / tier | One of the three geo tiers | **Never** write "free in Oman" — Oman free access is grandfathering/institution |
| Job-to-be-done | The outcome the user is hiring Bayan for | In the user's words, from VOC |
| Trigger | The moment the search begins (e.g. exam date set) | Concrete event, not a mood |
| Primary objection | The single biggest reason they don't buy | One objection, the real one |
| Anti-signals | Traits that disqualify this as the persona | Links to the anti-persona (Core 215) |
| VOC quote | A real quote | **Never invent a quote.** No quote → HYPOTHESIS |
| VOC source | Channel + date | Support ticket, interview, review, reply |

---

## Four Canonical Personas (starting set)

These are the four personas SOP-004 names. Fill a full card for each; the summaries below are
the one-line identity, not the whole card.

| # | Persona | Motion | Role | JTBD (abbreviated) |
|---|---------|--------|------|--------------------|
| 1 | IMG self-funder | A | Doctor (international medical graduate) | "Stop guessing what to study for my Gulf licensing exam" |
| 2 | Resident / med student | A | Resident or student | "Pass the next exam without buying five scattered resources" |
| 3 | Program director | B | Institutional champion | "Give my cohort one tool that actually moves pass rates" |
| 4 | Hospital / university buyer | B | Financial buyer | "Justify the seat spend against measurable outcomes" |

**Grounded anchor (persona 1):** real self-funder language — *"I stopped guessing what to
study."* Use this as the VOC exemplar; do not reuse it as the quote for every card.

---

## Implementation (structured store)

Persona cards live as structured records, not just slides, so segmentation (Core 216) and
Proc 22 can reference them by key.

```python
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class PersonaCard:
    key: str                      # 'img_self_funder'
    name_role: str                # 'Reza, IMG self-funder'
    motion: str                   # 'A' | 'B'
    exam_track: str               # 'OMSB-IM'  (or 'unsupported:<name>')
    geo_tier: str                 # 'intl_paid' | 'oman_free' | 'free_country'
    jtbd: str
    trigger: str
    primary_objection: str
    anti_signals: list
    voc_quote: Optional[str] = None       # None => cannot be CANONICAL
    voc_source: Optional[str] = None
    ceo_signed: bool = False
    version: int = 1

    @property
    def status(self) -> str:
        # A card is only canonical with a real quote AND CEO sign-off.
        if self.voc_quote and self.ceo_signed:
            return 'CANONICAL'
        return 'HYPOTHESIS'

    def validate(self) -> list:
        errors = []
        if self.geo_tier not in ('intl_paid', 'oman_free', 'free_country'):
            errors.append(f'invalid geo_tier: {self.geo_tier}')
        if self.motion not in ('A', 'B'):
            errors.append(f'invalid motion: {self.motion}')
        if self.voc_quote and not self.voc_source:
            errors.append('voc_quote present but voc_source missing')
        return errors
```

**No invented quotes guard:** `voc_quote` defaults to `None`. A card with no quote can never
report `CANONICAL` — the status property enforces the SOP rule in code, not just in prose.

---

## KPIs & Targets

| Metric | Target | Why |
|--------|--------|-----|
| Canonical personas | 4 (the starting set) | Shared language across the team |
| Cards with real VOC quote | 100% of canonical | No persona anchored on invention |
| Cards CEO-signed | 100% of canonical | Anti-persona + boundary are CEO-owned |
| Hypothesis cards aged >90 days | 0 | Either validate with VOC or retire |

---

## Edge Cases

**Demand exists but no VOC yet**
- Keep the card as `HYPOTHESIS`. Plan around it, but keep it out of public copy until a real
  quote lands.

**Two cards describe the same person**
- Merge. Two personas that convert on the same message, trigger, and objection are one persona
  with two labels.

**A lucrative audience sits outside the ICP**
- Do not write a card for it. Log it to the anti-persona register (Core 215) and move on.

**Oman-based learner**
- Normal segment, `geo_tier = oman_free`. Free entitlement comes via grandfathering
  (pre-2026-05-01) or an institution deal — **not** a separate "Oman free" persona, and never
  the phrase "free in Oman."

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-09 | Initial form (Proc 4 exemplar) | Stage 3 Ops Team |
