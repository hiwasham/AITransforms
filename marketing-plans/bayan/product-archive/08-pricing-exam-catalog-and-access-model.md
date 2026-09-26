# 08 — Pricing, Exam Catalog & Access Model

Source: **public client JS bundle** of bayan.edu.om (Next.js `_next/static/chunks`,
chunk `c_7` = pricing/entitlement config), captured 2026-09-26. **Read-only** —
static assets, no login, no account mutation. This is the app's own source of
truth, more authoritative than click-through. Closes the GAPS "subscription
plan names / prices," "full exam catalog," and (partly) "dashboards" items.

> Deployment marker: pricing enforcement date `2026-05-01T00:00:00Z` — users
> created before this are **grandfathered to free** (see access model). Prices
> are in **USD** in the config.

## Consumer subscription tiers (3)

| Tier | Monthly | Annual | Save | Trial | Bank size (marketing copy) |
|---|---|---|---|---|---|
| **Physicians & Residents** | $29 | $199 | 43% | 30 days | "3,000+ IM questions with deep explanations" |
| **Nurses** | $19 | $129 | 43% | 30 days | "2,000+ nursing-specific questions" |
| **Medical Students** | $9.99 | $69 | 42% | 30 days | "3,000+ student questions (preclinical + clinical)" |

Feature lists (verbatim from config):
- **Physician:** adaptive learning engine · Doctor's Dilemma competition access ·
  virtual patient encounters · clinical calculators & drug index · performance
  analytics by specialty.
- **Nurse:** adult health / pharmacology / maternal-child · medication safety &
  wound-care modules · practice mode + exam simulation · performance tracking by domain.
- **Student:** organ-system-based question banks · integrated clinical vignettes ·
  study planner & weak-area targeting · analytics by system.

⚠️ Nurse tier description in the config reads *"Nursing licensure prep — OMSB
**Prometric**, NCLEX, DHA"* — uses the banned "Prometric" term **and** "NCLEX"
(US, not Gulf). Site's own copy breaks the brand rule; our copy must not.

## Institutional / team pricing (per-seat)

| Tier | Per seat / mo | Per seat / yr |
|---|---|---|
| Physician | $15 | $99 |
| Nurse | $10 | $69 |
| Student | $5 | $35 |

Terms: **min 20 seats**, up to **100 trial seats**, **1-year** institutional
trial. Contact routes to **`info@medresearch-academy.om`** — i.e. institutional
sales go through **MedResearch Academy** (the separate brand — keep distinct in
copy, but note the commercial link exists).

## Free-tier limits (unentitled users)

`questionsPerDay: 5 · oscePerDay: 1 · articlesPerMonth: 5` — the metered free
tier when a user is not otherwise entitled.

## Access / entitlement model (priority order)

A user is entitled (full access) if ANY of, in order:
1. **admin** · 2. **reviewer** · 3. **grandfathered** (account created before
2026-05-01) · 4. **institution** (seat) · 5. **free_country** (geo match) ·
6. **subscription active** · else metered free tier · prelaunch fallback = open.

**Free-country policy (humanitarian):** full free access for
Yemen, Sudan, Syria, Libya, Afghanistan, Somalia, South Sudan, Myanmar,
DR Congo, Central African Republic, Eritrea, Haiti, Palestine (Gaza / West Bank).
Strong mission / ESG proof point.

> ⚠️ Reconciles the "free in Oman" claim: **Oman is NOT in the free-country
> set.** Free access for Omani users comes via **grandfathering** (pre-May-2026
> signups) or **institution** deals, not a geo rule. Use "free for early Oman
> users / institutions," not a blanket "free in Oman."

## Full exam catalog (28 entries, ~23 distinct + legacy aliases)

Per-exam question counts are the app's own numbers. `count` = questions seeded
for that exam. This is the concrete backing for the "23 licensing/board exams"
proof point.

**Doctor — undergraduate / GP-licensing (10 distinct + aliases):**

| id | Exam | Qs |
|---|---|---|
| omsb_gp / omsb_licensing | Omani Exam for General Practitioners (OEGP) | 150 |
| dha_gp | DHA GP (Dubai) | 150 |
| moh_uae_gp | MOHAP UAE — General Practitioner | 150 |
| doh_gp | DOH Abu Dhabi (formerly HAAD) — GP | 150 |
| qchp_gp | DHP Qatar — GP (legacy QCHP) | 150 |
| nhra_gp | Bahrain Medical Licensure Exam (BLE) | 150 |
| moh_kw_gp | MOH Kuwait GP | 150 |
| smle | Saudi Medical Licensure Exam (SMLE) | 200 |
| usmle_step1 | USMLE Step 1 | 280 |
| usmle_step2ck / usmle_step2 | USMLE Step 2 CK | 316 |

**Doctor — postgraduate / board (6):**

| id | Exam | Qs |
|---|---|---|
| arab_board | Arab Board Final Knowledge Exam — Internal Medicine | 110 |
| scfhs | Saudi Board Final Exam — Internal Medicine (written) | 200 |
| omsb_part1 | OMSB Part 1 — IM (residency progression, *not* licensing) | 200 |
| omsb_part2 | OMSB Part 2 — IM (residency exit, *not* licensing) | 200 |
| mrcp_uk | MRCP(UK) Part 1 | 200 |
| abim | ABIM Internal Medicine Certification | 200 |

**Nursing (6):**

| id | Exam | Qs |
|---|---|---|
| omsb_oen | Omani Exam for Nurses – BSN (OEN) | 100 |
| moh_uae_nursing | MOHAP UAE — Registered Nurse | 100 |
| dha_nursing | DHA Nursing (Dubai) | 150 |
| snle | Saudi Nursing Licensure Exam (SNLE) | 200 |
| qchp_nursing | DHP Qatar — Registered General Nurse (legacy QCHP) | 150 |
| nhra_nursing | Bahrain Nursing Licensure Exam (BNLE) | 100 |

**Pharmacy (4):**

| id | Exam | Qs |
|---|---|---|
| dha_pharmacy | DHA Pharmacy | 100 |
| sple | SPLE (Saudi) | 100 |
| omsb_pharmacy | OMSB Pharmacy | 100 |
| moh_pharmacy | MOH Pharmacy | 100 |

MRCP entry also carries exam metadata: 200 items, 360 min, delivery "Surpass",
2 papers of 100 best-of-five, with `sourceUrl` + `sourceReviewedAt: 2026-09-05`
citations — exams are sourced/dated in-app (credibility signal).

## Training-level → tier & dashboard mapping

The 11 UI training levels collapse to **3 pricing tiers** via the app's own
normalizer:
- `nursing / nurse` → **nurse** tier → `/nursing/dashboard`
- `medical_student / pre_med / undergraduate / student` → **student** tier → `/student/dashboard`
- `attending / fellow / intern / resident / r1..r5` → **physician** tier → `/postgrad/dashboard`
- `admin` → `/admin`; default → physician tier / `/dashboard`

Per-profession exam **scope** (candidate pool) follows `educationLevel` in the
catalog above: student/GP tracks → undergraduate + GP exams; residents/fellow/
attending → postgraduate board exams; nurse → nursing exams; pharmacy → pharmacy
exams. The exact *default-selected* `exam_targets` per track is the only piece
still stored per-user (write-gated) — everything else here is confirmed.

## learner_profiles data model (confirmed, read-only)

Select string from the client: `user_id, display_name, training_level,
institution, country, exam_targets, difficulty_preference, lab_unit_preference,
total_questions_attempted, total_correct, current_streak, longest_streak, …`.

## Marketing takeaways

1. **Prices are now known** — fills the biggest `[TBD]`. Anchor tiers: Student
   $9.99, Nurse $19, Physician $29 (monthly), all 30-day trial, ~43% annual save.
2. **Institutional seat pricing (min 20 seats, 1-yr trial)** = a B2B/hospital
   revenue lane, routed through MedResearch Academy — a Revenue-stage play.
3. **Humanitarian free-country access** (13 conflict/low-income countries) =
   authentic mission proof, on-brand for integrity-first positioning.
4. **Per-exam counts back the "23 exams / 5,500+ questions" claims** with
   auditable numbers — usable as concrete proof, not round marketing figures.
5. **Site's own copy uses banned terms** ("Prometric," "NCLEX") — reinforces the
   do-not-say rule: reframe to "Gulf Licensing Exam Preparation."
