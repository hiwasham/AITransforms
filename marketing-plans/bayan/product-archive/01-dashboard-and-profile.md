![[deepseek_html_20261003_623a36.html]]
# 01 — Dashboard & Profile

Source: `raw-json/api__dashboard.json` (git-ignored, PII), `api__profile.json`
(git-ignored, PII), `pages/nursing__dashboard.txt`, `pages/profile.txt`,
`screenshots/dashboard*.jpg`, `screenshots/profile*.jpg`.

## Learner dashboard (`/nursing/dashboard`)

Role-scoped console. The nurse view carries a left nav grouped as **Today**
(Dashboard, Start Quiz, Flashcards, Study Plan), **Learn** (Courses, Explore
Topics, Library), **Grow** (Analytics, Leaderboard, Certificates, Inbox),
**Tools** (Calculators, All Tools).

Above-the-fold blocks captured live:
- **Greeting + streak** ("Good evening, [learner] · 🔥 1-day streak").
- **Quick-start quiz** with size chips (5/10/15/20) and a primary CTA.
- **Weekly Challenge** — "10 Qs · 15 min · Compete & earn a streak freeze".
- **Continue where you left off** — last activity card (e.g. a pharma drug).
- **Stat trio** — Questions answered / Accuracy (with a "Pass: 60%" marker) / Streak.
- **Last 7 Days** sparkline (per-day answered count).
- **Exam Domain Progress** — the 7 clinical domains with weightings + per-domain
  accuracy (see [02](02-quiz-and-study.md)).
- **Next Certificate** progress bar ("3 / 100 — 97 to go").
- **Discover** grid (ABG course, catalog, calculators, flashcards, leaderboard,
  drug reference, tools hub) + a **Telegram** join card (@BayanMedEd).

### `/api/dashboard` shape (values redacted — PII)

```
educationLevel: <str>        # "undergraduate" / "nursing"
displayName: <str>           # test-account PII
period: { days, since }
today:   { answered, correct, accuracy }
overall: { totalAnswered, totalCorrect, accuracy, streak }
dailyProgress: [30 × {day, count, ...}]   # 30-day activity series
recentSessions: []
```

## Profile & data model (`/profile`)

`/api/profile` is the richest single payload — effectively the learner record.
Redacted schema (keys only; all values stripped as test-account PII):

```
identity:      user_id, display_name, country, institution, timezone,
               institution_code, account_status, created_at, updated_at
track/exam:    training_level, education_level, exam_targets[], target_exam,
               study_phase, year_of_study, fellowship_interest,
               subspecialty_interest, medical_school, graduation_year
preferences:   difficulty_preference, lab_unit_preference,
               leaderboard_visible, referral_source
performance:   total_questions_attempted, total_correct, current_streak,
               longest_streak, next_review_due, weak_areas[],
               specialty_scores{ <domain>: {correct, attempted} }
gamification:  xp_total, total_xp, level, badges[], bookmarks[], streak_freezes
SRS:           review_queue[3]   # due-card refs
subscription:  subscription_id, subscription_plan, subscription_status,
               subscription_source, subscription_started_at,
               subscription_updated_at, subscription_expires_at,
               paypal_email, prometric_bundles[], enrolled_programs[]
geo/anti-fraud: ip_country, ip_country_mismatch
```

**Marketing-relevant reads:**
- Per-domain `specialty_scores` + `weak_areas` = the app models each learner's
  weak spots, which feeds adaptive quizzing and the "Previously Wrong" pool.
- `subscription_*` + `paypal_email` + `prometric_bundles` = PayPal billing and a
  separate Prometric bundle SKU exist (see [06](06-account-and-integrations.md)).
- `ip_country_mismatch` = a geo/anti-fraud signal on the account.

## Role & track

- The account is a **nurse** learner in the client area and a **reviewer** in the
  console (`/api/messages` returns `userRole: "reviewer"`;
  `/api/reviewer-preferences` → `reviewer_scope: "student"`).
- A **"Preview As" / "Viewing as Nurse"** toggle sits bottom-right in-app — a
  likely non-mutating way to see other role dashboards, unverified (not clicked;
  see GAPS.md). Student and Resident dashboards need a track switch = mutation.
