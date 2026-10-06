# Bayan — Access request (what to ask for, in order)

**For:** Nasim → Dr. Abdullah Al-Alawi (Bayan)
**From:** Hiwa + Nasim
**Date:** 2026-10-04
**Why now:** the UX audit found live defects we can *point at* but not *size*, because
we have zero funnel data. Every number we'd want to promise depends on access we
don't have yet. So the ask is staged: read-only first, this week.

---

## The framing (one paragraph for the CEO)

> "Every recommendation we've made is verified — we reproduced the blocked
> Google Ads signal and the two broken dashboard queries live, in your product.
> But we can't yet tell you *how much* they cost, because we can't see your
> funnel. Give us read-only access to the four things below and, inside a week,
> we'll replace 'this is bleeding' with 'this is bleeding *this many rials per
> month, and here's the fix order*.'"

Read-only. No write scope, no billing, nobody's data leaves the tools.

---

## Tier 1 — ask for these first (this week)

### 1. Google Analytics 4 — property `G-YNPH01TKYD`
**Scope:** Viewer (read-only).
**Why:** the #1 finding is that GA4 receives **nothing** from the web app (CSP
blocks `region1.analytics.google.com`). We need to (a) confirm the property is
empty in Realtime, (b) after the one-line CSP fix, verify `page_view` +
conversion events start arriving, (c) read the funnel: landing → signup →
trial → paid. Without it, "we fixed tracking" is unprovable.
**How to grant:** GA4 → Admin → Property access management → add
`[Nasim's Google account]` as Viewer.

### 2. Google Ads — account `AW-529849606`
**Scope:** Read-only ("Read only" user role on the Ads account).
**Why:** the same CSP blocks the Ads conversion linker, so bids are optimizing
against **zero conversion signal**. We need spend, clicks, CPA and the
conversion action config to show what the blind bidding has cost — and to prove
the fix restores it.
**How to grant:** Google Ads → Admin → Access and security → invite as
**Read only**.

### 3. Google Search Console — the `bayan.edu.om` property
**Scope:** Full or Restricted (read-only) user.
**Why:** acquisition is half the funnel; Search Console is the free, clean
source for which query → landing page → click actually brings learners. It also
tells us whether the public landing page is indexed correctly per market
(Oman vs GCC vs wider).
**How to grant:** Search Console → Settings → Users and permissions → Add user
→ Restricted.

### 4. Supabase — project read access (or a role-scoped key)
**Scope:** **Read-only** — either a read-only Postgres role, or a dashboard
"Developer"/read seat, or the exact PostgREST error bodies for the two failing
queries.
**Why:** Finding 2 (`quiz_sessions` + `osce_stations` returning HTTP 400) is a
**labelled hypothesis**. We think it's schema drift — the client selects columns
the live schema no longer has. We did not read the error body (needs the anon
key). With read access we confirm root cause in minutes instead of guessing, and
we can quantify the affected-user count ("N learners see a broken dashboard").
**Minimum acceptable:** the two PostgREST error responses, pasted. Full read
access is better.
**How to grant:** Supabase → Project Settings → a read-only DB role + a
restricted key; or invite as a read-only org member.

---

## Tier 2 — helpful, lower priority (after Tier 1 lands)

| Tool | Scope | What it buys us |
|---|---|---|
| **PostHog** (if used) | Read-only API key | Session-level funnel + drop-off, not just aggregate GA4 |
| **App Store Connect / Play Console** | Analytics-only role | install → activation → IAP trials/refunds (the real money line) |
| **Stripe** (or the payment processor) | Read-only restricted key | MRR, trial→paid, churn, involuntary-payment failures |
| **CMS / content admin** | Read-only | content-consistency findings (#5 drug count, #6 library) traced to source |
| **Cloudflare** (if fronted) | Read-only analytics | CSP/Cache rules already live; verify the CSP fix after deploy |

Do **not** ask for all of Tier 2 at once. It signals we don't know what we need.

---

## What we will NOT ask for (and why it builds trust)

- **No write / editor / admin scope.** Read-only everywhere. We are not going to
  touch the product.
- **No billing or payment credentials.** We read revenue numbers; we never move
  money.
- **No user PII export.** We work at the aggregate level; we already declined to
  extract the anon key from the browser session rather than dig into the DB
  uninvited.
- **No code-repo write access** for this phase — the audit is read-only by
  method, and we said so in the QA report.

Stating the boundary is the trust play. The CEO is a researcher; he will notice
that we asked for the minimum and named the ceiling.

---

## The ask, one line

> **Grant read-only access to GA4, Google Ads, Search Console and Supabase, and
> in one week we turn "the product is losing money" into a number with a fix
> order — no write scope, no billing, nothing leaves your tools.**