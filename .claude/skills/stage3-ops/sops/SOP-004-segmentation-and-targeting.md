# SOP-004 (Core 216): Segmentation & Targeting

**Process:** Proc 4 - Customer Segmentation & Persona Development
**Core:** 216 (DRAFT — see warning)
**Owner:** Marketer (Nasim)
**Accountable:** CEO (Dr. Abdullah Al Alawi)
**Version:** 1.0
**Last Updated:** 2026-10-09

> ⚠️ **Core ID 216 is DRAFT** (`marketing-plans/bayan/cores-draft.md`), **unverified**
> against live Stage 3 HQ (lapsed 2026-10-09). Reconcile at renewal.

---

## Purpose

Turn the ICP and personas (Core 215) into addressable segments, score each lead's fit, and
route every segment to the right motion — so acquisition, lifecycle, and analytics all act on
the same definitions.

---

## Scope

**In Scope:**
- The segmentation matrix (the axes that define a segment)
- ICP fit scoring (0-10) and the priority tiers
- Segment-to-motion mapping (A self-serve / B institutional)
- Segment instrumentation handoff to Proc 22

**Out of Scope:**
- The ICP boundary and persona cards (Core 215)
- Pricing/entitlement rules (Proc 16 Core 265)
- Campaign execution per segment (Proc 9)

---

## Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Marketer (Nasim) | Matrix, scoring rules, motion mapping, tier maintenance |
| CEO (Dr. Abdullah Al Alawi) | Motion priority, high-priority threshold |
| Developer | Segment fields on the user record, event instrumentation |
| Clinical Reviewer | Exam-track axis accuracy |

---

## Prerequisites

- [ ] Core 215 personas signed (or HYPOTHESIS-labelled)
- [ ] Exam-track catalogue available (`product-archive/08-pricing-exam-catalog-and-access-model.md`)
- [ ] Proc 22 Core 262 event instrumentation planned (for segment measurement)

---

## Procedure

### 1. Define the Segmentation Matrix

**Frequency:** Process start, then on major catalogue change
**Owner:** Marketer

**Steps:**

1.1. A segment is the product of four axes:

```
Segment = Role × Exam Track × Geography/Tier × Motion
```

1.2. Axis values:

| Axis | Values |
|------|--------|
| Role | Doctor · Resident · Medical student · Nurse |
| Exam track | OMSB, DHA, MOH, SCFHS, QCHP, NHRA, Arab Board, MRCP, ABIM, OEN, SNLE, NCLEX-RN, … (~23) |
| Geography/Tier | International-paid · Oman-free (via grandfathering/institution) · Humanitarian free-country |
| Motion | A (self-serve B2C) · B (institutional B2B) |

1.3. **"Paid international" is not one segment.** A Pakistani IMG sitting OMSB and a Filipino
nurse sitting NCLEX-RN are different exam products, different content, different language.
Collapsing them hides the segments that actually convert differently.

**Output:** The four-axis matrix, Clinical-Reviewer-checked on the exam-track axis

---

### 2. Score ICP Fit

**Frequency:** Per lead (automated once instrumented)
**Owner:** Marketer (rules), Developer (implementation)

**Steps:**

2.1. Score each lead 0-10, reusing the Market-to-Lead fit model:

```python
def icp_fit_score(lead):
    """0-10 ICP fit. Reuses the Market-to-Lead fit tiering."""
    score = 0
    if lead.role in ICP_ROLES:                 score += 4   # inside the ICP at all
    if lead.exam_track in SUPPORTED_TRACKS:    score += 3   # we actually cover their exam
    if lead.exam_date_within_months(6):        score += 2   # urgency / intent
    if lead.motion == 'B':                     score += 1   # institutional reach multiplier
    if lead.is_anti_persona():                 return 0     # hard zero, regardless
    return min(score, 10)
```

2.2. Tier by score:

| Score | Tier | Treatment |
|-------|------|-----------|
| > 7 | High-Priority | Full lifecycle, human touch where B2B |
| 5-7 | Standard | Standard automated lifecycle |
| < 5 | Nurture | Light touch; re-check against anti-persona |

2.3. **A low score near the boundary triggers an anti-persona re-check** (Core 215). A lead
scoring 1-2 is often simply out of ICP — route it out rather than nurturing it forever.

**Output:** Every lead scored and tiered

---

### 3. Map Segments to Motions

**Frequency:** On matrix change
**Owner:** Marketer (mapping), CEO (priority)

**Steps:**

3.1. Each segment maps to exactly one motion:

| Segment signal | Motion | Downstream cores |
|----------------|--------|------------------|
| Self-paying, exam-date-driven, individual | **A** (self-serve) | 255/256/258/259/260 |
| Seat-buying, invoiced, cohort (via MedResearch Academy) | **B** (institutional) | 257/261 |

3.2. **Motion is set at segmentation, not rediscovered later.** A segment carries its motion
into every downstream process; a lead that changes motion (an individual whose employer later
buys seats) is re-segmented, not patched mid-funnel.

3.3. CEO owns motion priority: current standing guidance is **B2C conversion first AND B2B in
parallel, B2C-weighted** — not B2B-over-B2C, and B2B is not parked.

**Output:** Each segment assigned a motion and downstream core path

---

### 4. Instrument Segments for Proc 22

**Frequency:** Once, then on axis change
**Owner:** Developer

**Steps:**

4.1. Persist the segment axes on the user record so every segment is measurable:

```python
def tag_segment(user):
    user.seg_role       = user.role
    user.seg_exam_track = user.exam_track
    user.seg_geo_tier   = resolve_geo_tier(user)      # intl_paid | oman_free | free_country
    user.seg_motion     = resolve_motion(user)        # 'A' | 'B'
    user.icp_fit_score  = icp_fit_score(user)
    user.save()
```

4.2. **A segment that cannot be measured does not exist operationally.** If an axis value is
not emitted to Proc 22 Core 262, no cohort, conversion, or retention number can be cut by it.

4.3. Hand the field list to Proc 22 so segment becomes a dimension on every funnel metric.

**Output:** Segment fields live and emitted to analytics

---

## Edge Cases

**Case 1: Lead matches ICP role but an unsupported exam track**
- **Cause:** We don't cover their exam yet
- **Solution:** Score drops the track points; tier as Nurture. Log the track — repeated misses
  are a content-roadmap signal, not a reason to force-fit.

**Case 2: Individual later becomes an institutional seat**
- **Cause:** Employer buys a cohort
- **Solution:** Re-segment to Motion B. Do not leave them on the Motion A lifecycle.

**Case 3: Oman learner**
- **Cause:** Free-access nuance
- **Solution:** geo-tier = `oman_free` with a free entitlement via grandfathering/institution.
  Segment them normally; never label copy "free in Oman."

**Case 4: Segment with no funnel data**
- **Cause:** Pre-instrumentation (current state)
- **Solution:** Size and conversion are `[TBD — funnel data]` until Proc 22 Core 262 is live.
  Define the segment now; populate numbers later. Do not invent sizes.

---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Leads scored | 100% | TBD — needs funnel data | - |
| Segments with a motion assigned | 100% | - | - |
| Segment axes instrumented in Proc 22 | 100% | - | - |
| High-Priority (>7) share of new leads | TBD — needs data | - | - |

---

## Appendix A: Segment-to-Motion Quick Reference

```
Self-paying + exam-date + individual   → Motion A → cores 255/256/258/259/260
Seat-buying + invoiced + cohort        → Motion B → cores 257/261 (MedResearch Academy)
```

---

## Appendix B: Priority Tiers (reused from Market-to-Lead)

| Score | Tier | Threshold origin |
|-------|------|------------------|
| > 7 | High-Priority | Market-to-Lead ICP fit (>7) |
| 5-7 | Standard | Market-to-Lead (5-7) |
| < 5 | Nurture | Market-to-Lead (<5) → anti-persona re-check |

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-09 | Initial SOP (P5, Proc 4 Core 216) | Stage 3 Ops Team |

---

## Approval

**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Motion priority, high-priority threshold
- [ ] Marketer (Nasim) - Matrix, scoring, mapping
- [ ] Developer (TBD) - Segment fields, instrumentation
- [ ] Clinical Reviewer (TBD) - Exam-track axis

**Approved:** _____________ **Next Review:** Q1 2027
