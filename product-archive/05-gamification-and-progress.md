# 05 — Gamification & Progress

Source: `raw-json/api__leaderboard.json`, `api__certificates.json`,
`api__profile.json` (git-ignored), `pages/leaderboard.txt`,
`screenshots/leaderboard.jpg`, `analytics.jpg`, `certificates.jpg`.

## Leaderboard (`/api/leaderboard`)

A weekly, **track-scoped, anonymized** ranking. Payload:

```
leaderboard: [50 × entry]
userRank: <int>   userPercentile: <int>   totalInTrack: <int>
education_level: "nursing"   user_is_student: true
user_country, user_institution   # the viewer's own (test data)
```

Per-entry schema:

```
rank, name, total, correct, accuracy, streak, xp, level,
training_level, badges[{id,name,icon}], is_you, is_anonymous,
weekly_xp, weekly_correct, weekly_total
```

- Names are anonymized: `"Anonymous Learner"` with `is_anonymous: true`
  (privacy-respecting by default; `leaderboard_visible` is a profile toggle).
- Example top entry: 819 answered, 76% accuracy, **level 50 (cap)**, xp 7,878,
  badges Century 💯 + Scholar 📚, weekly 490 xp.

## XP / levels / badges

- **XP** accrues from activity; **level** runs to a **cap of 50**.
- **Badges** are milestone-based: `first_100` → "Century 💯", `first_500` →
  "Scholar 📚" (id-driven, so more tiers exist beyond these two).
- **Streaks** with **streak freezes** as a reward currency (earned via the
  Weekly Challenge) — a retention mechanic, not just vanity.
- Weekly metrics (`weekly_xp/correct/total`) reset the competition cadence.

## Certificates (`/api/certificates`)

```
{ certificates: [], available: [], stats: {totalAttempted:3, totalCorrect:3,
  accuracy:100} }
```

Milestone certificates gate on volume — the dashboard shows "Next Certificate:
100 Questions · 3 / 100". Empty here (account has answered only 3 questions).

## Analytics (`/analytics`)

**No dedicated API** — computed client-side from attempt history / profile
(`specialty_scores`, `dailyProgress`, `weak_areas`). The dashboard's "Last 7
Days" and "Exam Domain Progress" blocks are the surfaced view. So analytics is a
presentation layer over the same performance fields documented in
[01](01-dashboard-and-profile.md), not a separate data source.

**Read:** the gamification stack (XP, levels, badges, streaks + freezes, weekly
anonymized leaderboard, milestone certificates) is a complete retention system
aimed at daily return — reinforced by the Telegram "Daily MCQs" channel
(@BayanMedEd). Good raw material for a "daily habit" marketing angle.
