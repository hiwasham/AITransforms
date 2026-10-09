[[JEV_INTEGRATION_AITransforms_bAYAN_COMPLETE_Bayan CEO decision briefs]]
[[CEO_DECISION_FRAMEWORK]]
...
![[deepseek_html_20261003_8eb800.html]]
# Bayan — CEO Decision Briefs

Two decisions gate Phase 0/1 (see
[revenue-integration-strategy.md](revenue-integration-strategy.md)). Both touch
money or existing users, so they are the CEO's to make — this doc is *pull +
propose only*, no execution without sign-off.

Each brief: the decision, the exact numbers to pull, the options with tradeoffs,
a recommendation, and reversibility. Numbers marked `[TBD — pull]` need a query
against the live Supabase DB / auth, which this workspace can't reach.

---

## Brief 1 — Grandfathering sunset

**Decision:** what to do with free / comped accounts created **before the
paywall (pre-2026-05-01)** that still have free access today.

**Why now:** two costs. (1) Revenue leak — engaged lifers who'd pay are seated
for free. (2) They poison the Phase 0 baseline — free lifers look like active
users but can never convert, so trial→paid and activation read artificially
low until they're segmented out.

### Numbers to pull (hand to whoever owns the DB)

| Metric | Where / how |
|---|---|
| Count of pre-2026-05-01 accounts with free access | `auth.users` created_at < 2026-05-01, filtered to free/comped plan |
| Of those, active last 30 / 90 days | join to activity (any event) — splits *engaged* from *dormant* |
| $ at risk (annualized) | engaged-lifer count × target sub price × 12 |
| How many already hit the paywall behavior | pre-paywall accounts that would trip the 5-Q/day wall today |

### Options

| # | Option | Recovers $ | Churn / goodwill risk |
|---|---|---|---|
| A | Grandfather forever (do nothing) | none — permanent leak | zero, but sets a precedent |
| B | Sunset with grace (announce → N-day window → convert to free-limited or paid) | high | moderate — some walk |
| C | Convert dormant only (reclaim inactive lifers, keep engaged ones free) | partial | low — protects your few real fans |

**Recommendation: C, then revisit.** Bayan is pre-traction; the handful of
engaged early users are worth more as advocates/testimonials than as reclaimed
seats. Reclaim only *dormant* lifers now (near-zero goodwill cost), and hold the
engaged-lifer decision until Phase 0 shows what a converted user is actually
worth. If the engaged-lifer count is trivially small, C ≈ A and you skip the
risk entirely.

**Guardrails:** no migration without sign-off; announce before any change;
frame as access/effort tiers, never punitive; honor the medical-brand trust bar.

**Reversible?** Partially. Re-comping an account is trivial; a botched *public*
announcement damages trust once and doesn't un-send. So the message matters more
than the mechanism — draft it before touching a single account.

---

## Brief 2 — Mid-tier price (single-exam / exam-window pass)

**Decision:** the price and shape of a one-time **single-exam pass** SKU
(`tier = single_exam` already exists in the analytics spec). Captures the IMG
who won't commit to a recurring sub but will pay once for their exam run-up.

**Why now:** it's the Phase 1 packaging gap — today the ladder jumps free →
recurring sub with nothing for the commitment-averse. The pass is a lower-friction
first purchase that later upsells into the sub or the cohort.

### Numbers to pull

| Metric | Where / how |
|---|---|
| Current tier prices + what each includes | confirm the `$9.99 / $19 / $29` tiers — monthly? by role? `[TBD — confirm]` |
| Exam-sitting calendar (SMLE / OMSB / DHA / OEN / Arab Board) | sets the pass window length (60–90 days to a sitting) |
| Competitor one-time / q-bank prices in the Gulf IMG market | anchors what "one exam" is worth locally |
| Current trial→paid rate | baseline willingness-to-pay before adding the SKU |

### Options (one-time payment, time-boxed to one exam window)

| # | Option | Upside | Risk |
|---|---|---|---|
| A | Aggressive entry (low price) | max volume, easy yes | cannibalizes the recurring sub |
| B | Anchored mid (~2–3× the monthly sub) | reads as "commit to your exam," protects the sub | fewer buyers if mispriced |
| C | Two SKUs (single-exam vs all-access window) | more choice | more complexity, splits the message |

**Recommendation: B, single SKU.** Price at roughly **2.5× the monthly sub**,
window = next sitting (~60–90d), localized *down* for price-sensitive IMGs. One
SKU keeps the message clean (guardrail: simplicity); split into C only if Phase 1
data shows demand for both scopes. Price is a PayPal config change, so treat the
first number as a starting point to A/B, not a commitment.

**Guardrails:** no fake scarcity / countdown around the exam date (guardrail #2);
price well below the Empower US anchors (guardrail #5); one SKU to start.

**Reversible?** Yes — fully. Price and window are PayPal config; adjust or A/B
any time. This is the low-risk decision of the two; the constraint is picking a
*defensible* first number, not a permanent one.

---

## What the CEO gets back

1. **Grandfathering:** a count + $ estimate + the C-vs-B call, plus a draft
   announcement before any account is touched.
2. **Mid-tier:** one price, one window, live in PayPal, ready to A/B once Phase 0
   is measuring conversion.

Both are inputs to Phase 0/1 — the event layer can be built in parallel and
doesn't wait on either.
