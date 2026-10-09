# F4-2: ICP Fit Scorecard

**Process:** Proc 4 - Customer Segmentation & Persona Development
**Core:** 216 (DRAFT — see warning)
**Realizes:** SOP-004 (Core 216) Procedure 2 — Score ICP Fit
**Owner:** Marketer (Nasim)
**Accountable:** CEO (Dr. Abdullah Al Alawi)
**Version:** 1.0
**Last Updated:** 2026-10-09

> ⚠️ **Core ID 216 is DRAFT** (`marketing-plans/bayan/cores-draft.md`), **unverified**
> against live Stage 3 HQ (lapsed 2026-10-09). Reconcile at renewal.

---

## Purpose

Turn a lead into one number (0-10) and one tier, so sales and lifecycle effort goes where it
pays. The score is deterministic — same lead, same score — so two people sort a lead the same
way. This is the operational form of the ICP boundary (Core 215): the boundary says in/out,
the scorecard says how hard to lean in.

---

## When to Use

- A new lead enters any top-of-funnel channel (signup, download, demo request)
- Re-scoring on new information (exam date added, role corrected)
- Prioritizing a backlog of leads for human outreach

---

## The Scorecard

```
┌──────────────────────────────────────────────────────────────┐
│ ICP FIT SCORECARD                                              │
├──────────────────────────────────────────────────────────────┤
│ Signal                                   │ Points │ This lead  │
│ ─────────────────────────────────────────┼────────┼─────────── │
│ Role is an ICP role                      │  +4    │  [ ]       │
│   (doctor / resident / med student / nurse)                    │
│ Exam track is supported                  │  +3    │  [ ]       │
│ Exam date within 6 months                │  +2    │  [ ]       │
│ Motion B (institutional signal)          │  +1    │  [ ]       │
│ ─────────────────────────────────────────┼────────┼─────────── │
│ Anti-persona?  →  SCORE = 0 (hard stop)  │  n/a   │  [ ]       │
├──────────────────────────────────────────┴────────┴─────────── │
│ TOTAL (0-10):  ____                                            │
│ TIER:  High-Priority (>7) | Standard (5-7) | Nurture (<5)      │
└──────────────────────────────────────────────────────────────┘
```

---

## Scoring Rules

| Signal | Points | Definition |
|--------|--------|------------|
| ICP role | +4 | Doctor, resident, medical student, or nurse. The single heaviest signal. |
| Supported exam track | +3 | One of the ~23 supported tracks (OMSB, DHA, MOH, SCFHS, QCHP, NHRA, Arab Board, MRCP, ABIM, …) |
| Exam date ≤ 6 months | +2 | Urgency; the trigger that converts |
| Motion B signal | +1 | Named institution, cohort, or buyer role |
| **Anti-persona** | **→ 0** | General public / consumer-health / patient education → hard zero, overrides everything |

**Tiers:**

| Tier | Score | Action |
|------|-------|--------|
| High-Priority | > 7 | Fast-track; human touch if Motion B; priority nurture if Motion A |
| Standard | 5-7 | Standard automated lifecycle |
| Nurture | < 5 | Low-touch nurture; re-score on new info |

---

## Implementation

```python
ICP_ROLES = {'doctor', 'resident', 'medical_student', 'nurse'}
SUPPORTED_TRACKS = {
    'OMSB', 'DHA', 'MOH', 'SCFHS', 'QCHP', 'NHRA', 'Arab_Board',
    'MRCP', 'ABIM', 'OEN', 'SNLE', 'NCLEX-RN',  # ... ~23 total
}

def icp_fit_score(lead):
    """Deterministic 0-10 ICP fit score. Anti-persona short-circuits to 0."""
    if lead.is_anti_persona():
        return 0

    score = 0
    if lead.role in ICP_ROLES:              score += 4
    if lead.exam_track in SUPPORTED_TRACKS: score += 3
    if lead.exam_date_within_months(6):     score += 2
    if lead.motion == 'B':                  score += 1
    return min(score, 10)

def icp_tier(score):
    if score > 7:  return 'high_priority'
    if score >= 5: return 'standard'
    return 'nurture'
```

**Why anti-persona short-circuits:** a general-public lead who happens to name a supported exam
would otherwise score +3. The hard zero enforces the Core 215 boundary — fit is not additive
across the boundary, it is gated by it.

---

## Analytics

```sql
-- Fit-tier distribution of this month's leads, with conversion.
SELECT
    CASE
        WHEN icp_fit_score > 7              THEN 'high_priority'
        WHEN icp_fit_score >= 5             THEN 'standard'
        ELSE 'nurture'
    END                                      AS tier,
    COUNT(*)                                 AS leads,
    COUNT(*) FILTER (WHERE converted)        AS converted,
    ROUND(100.0 * COUNT(*) FILTER (WHERE converted)
          / NULLIF(COUNT(*), 0), 1)          AS conv_rate_pct
FROM leads
WHERE created_at >= DATE_TRUNC('month', NOW())
GROUP BY tier
ORDER BY MIN(icp_fit_score) DESC;
```

Watch for the score actually predicting conversion. If High-Priority does not out-convert
Nurture, the weights are wrong — that is a finding for the CEO, not a reason to abandon scoring.

---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Leads scored | 100% | - | - |
| High-Priority tier conversion | TBD — needs funnel data | - | - |
| Score→conversion correlation (positive) | monotonic | TBD | - |
| Anti-persona leads scored 0 | 100% | - | - |

---

## Edge Cases

**Role unknown at capture**
- Score the known signals; role contributes 0 until learned. Re-score when role is captured —
  do not guess a role to inflate the score.

**Supported-track-adjacent (track we don't yet cover)**
- +0 for the track signal, but log it. A cluster of high-role leads naming the same unsupported
  track is a content-roadmap signal, not a scoring problem.

**High score, no exam date**
- Legitimate — many strong leads sign up before booking. The +2 is urgency, not fit; its
  absence lowers priority, not qualification.

**Looks ICP, is anti-persona (e.g. consumer-health course shopper using medical words)**
- `is_anti_persona()` returns the hard zero. When in doubt on a borderline case, the boundary
  call is CEO-owned (Core 215).

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-09 | Initial form (Proc 4 exemplar) | Stage 3 Ops Team |
