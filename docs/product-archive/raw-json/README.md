# raw-json — API payload provenance

Verbatim `/api/*` responses from the logged-in bayan.edu.om learner app, one
file per endpoint (filename = path with `/` → `__`). These are the evidence
behind every claim in the section docs (`../01`…`../06`). Captured read-only via
in-page bearer-fetch — see `../README.md` for the re-run recipe.

## Committed (15) — structural / aggregate / anonymized, no PII

| File | What it proves | Used by |
|---|---|---|
| `api__public-stats.json` | Corpus scale: 5,610 Q · 40 OSCE · 472 articles | [03](../03-content-corpus.md) |
| `api__review__stats.json` | Reviewer scorecard / calibration schema | [04](../04-review-qa-pipeline.md) |
| `api__reviewer-preferences.json` | `reviewer_scope: "student"` | [01](../01-dashboard-and-profile.md) |
| `api__certificates.json` | Milestone-cert schema (empty for this account) | [05](../05-gamification-and-progress.md) |
| `api__flashcards.json` | SRS buckets incl. leeches | [03](../03-content-corpus.md) |
| `api__courses__abg-analysis.json` | ABG course: 5 modules, ~60 min | [03](../03-content-corpus.md) |
| `api__courses__generated.json` | Generated-courses slot (empty) | [03](../03-content-corpus.md) |
| `api__prometric__access.json` | `{active:false, purchases_open:true}` — separate SKU | [06](../06-account-and-integrations.md) |
| `api__programs.json` / `api__assignments.json` | B2B program + assignment layer (empty here) | [06](../06-account-and-integrations.md) |
| `api__institution-code__auto-detect.json` | `{matched:false, reason:"already_linked"}` | [06](../06-account-and-integrations.md) |
| `api__messages.json` / `api__messages__unread-count.json` | Inbox + `userRole:"reviewer"` | [06](../06-account-and-integrations.md) |
| `api__notifications.json` | Notifications shape (empty) | [06](../06-account-and-integrations.md) |
| `.gitkeep` | Keeps the folder when only ignored files remain | — |

## Git-ignored (8) — PII or proprietary corpus, local-only

Excluded by `../../../../.gitignore`. Redacted schema + scale + one sample per
corpus live in the section docs instead; the full dumps never enter git.

| File | Why excluded |
|---|---|
| `api__profile.json` | Full learner record — user_id, email-linked identity, subscription, PayPal |
| `api__dashboard.json` | displayName + 30-day activity trail |
| `api__leaderboard.json` | Viewer's own name / country / institution |
| `api__review__questions.json` | Proprietary Q corpus + internal reviewer UUIDs |
| `api__pharma__drugs.json` | Proprietary 260-drug monograph corpus |
| `api__library__859.json` | Proprietary article corpus (schema exemplar) |
| `_endpoint-inventory.json` | Embeds every response body (all PII + full corpus) |

See [GAPS.md](../GAPS.md) for endpoints that returned no data or were not probed.
