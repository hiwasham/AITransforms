# F4-3: Segmentation Matrix

**Process:** Proc 4 - Customer Segmentation & Persona Development
**Core:** 216 (DRAFT — see warning)
**Realizes:** SOP-004 (Core 216) Procedure 1 — Build the Segmentation Matrix
**Owner:** Marketer (Nasim)
**Accountable:** CEO (Dr. Abdullah Al Alawi)
**Version:** 1.0
**Last Updated:** 2026-10-09

> ⚠️ **Core ID 216 is DRAFT** (`marketing-plans/bayan/cores-draft.md`), **unverified**
> against live Stage 3 HQ (lapsed 2026-10-09). Reconcile at renewal.

---

## Purpose

Define the one segmentation formula the whole team uses, so "segment" means the same thing in
a campaign brief, a dashboard, and a sales call. A segment is four coordinates — nothing more,
nothing improvised.

```
Segment = Role × Exam Track × Geography/Tier × Motion
```

---

## When to Use

- Tagging a user for lifecycle, reporting, or targeting (Core 216 → Proc 22)
- Writing a campaign brief that must name its audience precisely
- Auditing whether a proposed "segment" is a real segment or an ad-hoc slice

---

## The Four Axes

| Axis | Values | Source of truth |
|------|--------|-----------------|
| **Role** | doctor · resident · medical_student · nurse | ICP roles (Core 215) |
| **Exam track** | ~23 supported tracks (OMSB, DHA, MOH, SCFHS, QCHP, NHRA, Arab Board, MRCP, ABIM, OEN, SNLE, NCLEX-RN, …) | Exam catalog |
| **Geography / tier** | intl_paid · oman_free · free_country | Entitlement model |
| **Motion** | A (Self-Serve B2C) · B (Institutional B2B) | Go-to-market |

**Geography/tier is an entitlement tier, not a map.** `oman_free` means a free entitlement via
grandfathering (pre-2026-05-01) or institution — Oman is **not** in the free-country geo set,
and the matrix must never render as "free in Oman."

---

## The Matrix (worked slice, Motion A)

| Role × Track | intl_paid | oman_free | free_country |
|--------------|-----------|-----------|--------------|
| Doctor × OMSB | IMG self-funder (beachhead) | grandfathered/institution | humanitarian |
| Resident × SCFHS | resident self-funder | grandfathered/institution | humanitarian |
| Med student × MRCP-prep | student self-funder | grandfathered/institution | humanitarian |
| Nurse × NCLEX-RN | nurse self-funder | grandfathered/institution | humanitarian |

**Beachhead cell (CEO-confirmed):** `doctor × Gulf-track × intl_paid × A` — the IMG self-funder
sitting a Gulf licensing exam. Everything else is sequenced behind proving this cell.

Motion B collapses the geo axis (institutions buy seats regardless of individual geo) and adds
the buyer dimension: `institution × track-mix × seats × B`, sold via MedResearch Academy
(Physician $99 / Nurse $69 / Student $35 per seat/yr, min 20).

---

## Implementation (tagging)

```python
def tag_segment(user):
    """Stamp the four segment coordinates + fit score onto a user. Feeds Proc 22."""
    user.seg_role       = user.role
    user.seg_exam_track = user.exam_track
    user.seg_geo_tier   = resolve_geo_tier(user)   # intl_paid | oman_free | free_country
    user.seg_motion     = resolve_motion(user)     # 'A' | 'B'
    user.icp_fit_score  = icp_fit_score(user)      # see F4-2
    user.save()

def resolve_geo_tier(user):
    # Entitlement tier, not geography. Order matters: a grandfathered Omani
    # resolves to oman_free regardless of current country.
    if user.is_grandfathered or user.institution_id:
        return 'oman_free'
    if user.country in FREE_COUNTRIES:              # humanitarian set; Oman NOT in it
        return 'free_country'
    return 'intl_paid'

def resolve_motion(user):
    return 'B' if user.institution_id else 'A'
```

**Resolution order is load-bearing:** institution/grandfather is checked before the
free-country list precisely because Oman is absent from that list. Reordering would strand
Omani free users in `intl_paid`.

---

## Analytics

```sql
-- Segment population + fit, the cube Proc 22 reports against.
SELECT
    seg_role,
    seg_exam_track,
    seg_geo_tier,
    seg_motion,
    COUNT(*)                              AS users,
    ROUND(AVG(icp_fit_score), 1)          AS avg_fit
FROM users
WHERE seg_role IS NOT NULL
GROUP BY seg_role, seg_exam_track, seg_geo_tier, seg_motion
ORDER BY users DESC;
```

---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Active users with all 4 coordinates tagged | 100% | - | - |
| Segments with a canonical persona (F4-1) | beachhead + 3 | - | - |
| Beachhead-cell share of paid revenue | TBD — needs funnel data | - | - |
| "Segments" that are really ad-hoc slices | 0 | - | - |

---

## Edge Cases

**Multi-exam user (studying for two tracks)**
- Tag the primary track (nearest exam date, or highest engagement). A user is one segment at a
  time for targeting; store secondary tracks as attributes, not as a second segment row.

**Role × track clinical impossibility (e.g. resident × NCLEX-RN)**
- Flag, don't tag. A nurse exam against a physician role is a data error — route to correction,
  not into the matrix. (Clinical Reviewer owns realism, per SOP-004 Core 215.)

**Institution member who also self-funds**
- `motion = B` wins while the institution relationship is active; the entitlement follows the
  seat. On institution exit, re-tag.

**Over-segmentation (a cell with 2 users)**
- Real but not actionable. Report at the axis level (role, track) until a cell has enough
  population to target. Fewer sharp segments beat many empty cells.

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-09 | Initial form (Proc 4 exemplar) | Stage 3 Ops Team |
