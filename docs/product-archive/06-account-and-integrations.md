![[deepseek_html_20261003_f644f6.html]]
# 06 — Account & Integrations

Source: `raw-json/api__profile.json` (git-ignored), `api__prometric__access.json`,
`api__institution-code__auto-detect.json`, `api__programs.json`,
`api__assignments.json`, `api__messages.json`, `api__messages__unread-count.json`,
`api__notifications.json`, `pages/nursing__dashboard.txt`.

## Subscription / billing

From the profile record: `subscription_id`, `subscription_plan`,
`subscription_status`, `subscription_source`, `subscription_started_at`,
`subscription_updated_at`, `subscription_expires_at`, and **`paypal_email`**.

- Billing runs through **PayPal** (matches remote-friendly, Gulf/Iran-workable
  payments — relevant given Nasim works remotely).
- Subscription is a first-class account field, so the product is a paid
  subscription with plan tiers `[TBD — confirm plan names/prices with team]`.

## Prometric bundle (separate SKU)

`/api/prometric/access` → `{active: false, purchases_open: true}`. Profile also
carries `prometric_bundles: []`. So a **Prometric bundle is a purchasable add-on**
distinct from the base subscription. (Marketing note: sell as "Gulf Licensing
Exam Preparation," not "Prometric" — per the standing content constraint.)

## Institutions (B2B)

- `/api/institution-code/auto-detect` → `{matched: false, reason:
  "already_linked"}` — the app auto-detects an institution by code/email and
  links the account to it.
- Profile has `institution`, `institution_code`, `enrolled_programs[]`.
- `/api/programs` → `{programs: []}` and `/api/assignments` →
  `{assignments: []}` — an **institutional program + assignment** layer exists
  (teachers assign work to enrolled cohorts), empty for this individual account.

**Read:** there is a real **B2B / institution** path (codes, programs,
assignments) alongside the B2C subscription — a second revenue motion. Hiwa's
notes also mention a B2B pilot flow.

## Inbox / notifications

- `/api/messages` → `{messages: [], userRole: "reviewer"}` +
  `/api/messages/unread-count` → `{count: 0}`.
- `/api/notifications` → `{notifications: [], unread: 0}`.
- In-app **Inbox** nav item. All empty for this account.

## Telegram channel

Dashboard promotes **@BayanMedEd**: "Daily MCQs on Telegram — interactive
quizzes, clinical pearls, and board tips every day." An existing top-of-funnel /
retention channel and a live marketing surface to build on.

## Tools / calculators

Nav exposes **Calculators** and an **All Tools** hub ("clinical scoring tools").
No dedicated API (client-side calculators). Not deep-captured — see GAPS.md.
