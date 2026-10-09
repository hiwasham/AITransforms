# RACI-004: Customer Segmentation & Persona Development

**Process:** Proc 4 - Customer Segmentation & Persona Development (Strategy)
**Cores:** 215 (ICP & Persona), 216 (Segmentation & Targeting)
**Owner:** CEO (Dr. Abdullah Al Alawi)
**Version:** 1.0
**Last Updated:** 2026-10-09

> ⚠️ **Core IDs are DRAFT.** 215/216 come from `marketing-plans/bayan/cores-draft.md`
> (client working draft, marked "review before writing into live hq.stage3.app").
> They are **UNVERIFIED against live Stage 3 HQ**, which lapsed 2026-10-09. Reconcile
> IDs at renewal. Content below does not depend on the ID being correct.

---

## RACI Legend

- **R (Responsible)**: Does the work
- **A (Accountable)**: Final decision authority, single point of accountability
- **C (Consulted)**: Provides input before decisions/actions
- **I (Informed)**: Kept updated on progress/decisions

---

## Stakeholder Roster

| Role | Name | Responsibilities |
|------|------|------------------|
| CEO / Founder | Dr. Abdullah Al Alawi | Segment prioritization, ICP sign-off, anti-persona enforcement |
| Marketer | Nasim | Persona research, segment definition, messaging-fit per segment |
| Clinical Reviewer | Network (15+) | Exam-track accuracy, specialty realism of personas |
| Developer | TBD | Segment instrumentation (feeds Proc 22), tier/geo flags on user records |
| Support Lead | TBD | Voice-of-customer input, objection/VOC capture from real conversations |

**Scope note:** Proc 4 is a **strategy** process. It defines *who the customer is* before
any funnel is built. Its output is consumed by Proc 1 (content curation targets), Proc 5
(value prop per segment), Proc 9 (content marketing audience), and Proc 14-17 (lifecycle
messaging segmentation). It does **not** run campaigns — it tells the campaign processes who
to run them for.

**Hard constraint — the anti-persona (CEO-owned, non-negotiable):** Bayan serves medical
professionals and students preparing for licensing/board exams. **Not** the general public,
not consumer health, not patient education. Every segment and persona defined here lives
inside that boundary. A persona outside it is rejected, not refined.

---

## Core 215: ICP & Persona Definition

**Purpose:** Produce a small set of named, evidence-grounded personas that the whole team
refers to by name — not a demographic spreadsheet nobody opens.

### Activities & RACI

| Activity | CEO | Marketer | Clinical Reviewer | Developer | Support Lead |
|----------|-----|----------|-------------------|-----------|--------------|
| **Define the ICP boundary** (who is in, who is the anti-persona) | **A** | **R** | C | I | C |
| **Draft named personas** (job-to-be-done, triggers, objections) | C | **R/A** | C | I | C |
| **Verify exam-track realism** (do these learners actually sit these exams?) | I | C | **R/A** | I | I |
| **Capture Voice-of-Customer quotes** (real language, not invented) | I | **R** | I | I | **R** |
| **Sign off personas as canonical** | **R/A** | C | C | I | I |
| **Publish persona cards** (see F4-1) | I | **R** | I | I | I |

### Decision Rights

**Strategic (CEO):**
- The ICP boundary and the anti-persona — what Bayan will and will not serve
- Which personas are "flagship" (get the most product and marketing investment)
- Whether a proposed persona is real or wishful

**Operational (Marketer):**
- Persona names, structure, and the VOC language used
- When a persona has enough evidence to be called canonical vs. still a hypothesis

**Clinical (Clinical Reviewer):**
- Whether a persona's exam track, specialty, and career stage are internally consistent
  (e.g. a "resident sitting MRCP Part 1" is realistic; a "medical student sitting the Saudi Board" is not)

### Communication Flows

**On change:** Marketer → whole team: a new or revised canonical persona (named, one card)
**Monthly:** Marketer → CEO: VOC themes heard from Support/Sales that confirm or challenge a persona
**Quarterly:** CEO → team: persona priority review (which flagship, which to drop)

---

## Core 216: Segmentation & Targeting

**Purpose:** Turn the personas into an operational segmentation the product and funnel can
act on — a user record carries its segment, and every downstream process can filter by it.

### Activities & RACI

| Activity | CEO | Marketer | Clinical Reviewer | Developer | Support Lead |
|----------|-----|----------|-------------------|-----------|--------------|
| **Define the segmentation axes** (role × exam track × geography/tier × motion) | C | **R/A** | C | C | I |
| **Set the beachhead** (which segment leads) | **R/A** | C | I | I | I |
| **Rank segments by revenue priority** (paid international vs free Oman) | **R/A** | **R** | I | I | I |
| **Flag segment on the user record** (so Proc 22 can measure it) | I | C | I | **R/A** | I |
| **Map each segment to its lifecycle motion** (A self-serve / B institutional) | C | **R/A** | I | C | I |
| **Validate segment sizes against funnel data** (when data exists) | I | **R** | I | **C** | I |

### Decision Rights

**Strategic (CEO):**
- The beachhead segment (where limited resources concentrate first)
- Revenue prioritization — paid international leads; Oman-free builds proof, not MRR
- Whether to open a new segment or stay focused

**Operational (Marketer):**
- The segmentation axes and how segments are named
- Which segment a given campaign or content piece targets

**Technical (Developer):**
- How segment membership is represented on the user record and in events
- Where the free-vs-paid and geography flags live (so segments are measurable, not just conceptual)

### Communication Flows

**On change:** Marketer → Developer: a new segment axis that needs a user-record flag
**Monthly:** Marketer → CEO: segment performance (once funnel data exists — currently [TBD], no data)
**Quarterly:** CEO + Marketer: beachhead and revenue-priority review

---

## Appendix A: Canonical Segments (grounded in cores-draft.md + research.md)

Two revenue **motions**, four customer **segments**, named **personas** inside them:

| Motion | Segment | Persona | Monetization |
|--------|---------|---------|--------------|
| **A — Self-serve (B2C, flagship)** | Doctor / Resident | **"IMG self-funder"** — targets a Gulf Prometric/licensing exam, pays out of pocket, exam-date-driven | Subscription (physician/resident $29/mo) |
| A | Nurse | Nurse sitting OEN/SNLE/DHA/Prometric | Subscription ($19/mo) |
| A | Medical student | Board-readiness, time-poor | Subscription ($9.99/mo) |
| **B — Institutional (B2B)** | Hospital / University / Training board | **"Institutional buyer"** — L&D lead licensing seats for a cohort | Per-seat ($35-99/seat/yr, min 20 seats) |

**Beachhead (CEO-set):** IMG self-funders sitting Gulf Prometric exams (Motion A).
**Revenue rule:** lead with international paid segments. Oman access is free (via
grandfathering / institution deals — **not** a blanket geo rule), so it builds adoption and
proof, not MRR.

**Anti-persona (reject, do not refine):** general public, consumer health, patient education.

---

## Appendix B: Why Segmentation Is Upstream of Everything

Every other Bayan process inherits its target from here:

| Downstream process | What it inherits from Proc 4 |
|---|---|
| Proc 1 Exam Content Curation | Which exam tracks to build banks for (segment demand) |
| Proc 5 Value Prop & Messaging | The job-to-be-done per persona ("I stopped guessing what to study") |
| Proc 9 Content Marketing | The audience each content piece is written for |
| Proc 14-17 Lifecycle | The segment flag that decides which motion (A/B) a user enters |
| Proc 22 Funnel Instrumentation | The segment dimension every funnel metric is cut by |

Get segmentation wrong and every downstream process optimizes for the wrong person.

---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Canonical personas defined & CEO-signed | 4 (2 flagship) | 2 drafted | 🟡 |
| User records carrying a segment flag | 100% of new signups | [TBD] | ⚠️ needs Developer |
| Segments validated against funnel data | All paid segments | 0 — **no funnel data exists** | ⛔ blocked on Proc 22 |
| Anti-persona violations in live copy | 0 | - | - |

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-09 | Initial RACI (P5, Proc 4) | Stage 3 Ops Team |

---

## Approval

**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - ICP boundary, beachhead, revenue priority, anti-persona
- [ ] Marketer (Nasim) - Persona research, segmentation axes, VOC
- [ ] Clinical Reviewer (TBD) - Exam-track / specialty realism
- [ ] Developer (TBD) - Segment flags on user records

**Approved:** _____________ **Next Review:** Q1 2027
