# {{CLIENT}} — Analytics Events Spec (build-ready)

Vendor-neutral event layer for the {{CLIENT}} app ({{STACK}}). Purpose: close the
#1 revenue gap — no instrumented funnel. Build the event layer now; connect a
vendor (GA4 etc.) later as a config swap, not a rebuild.

**Design:** one `track(event, props)` wrapper with a vendor adapter stub, sinking
to an `analytics_events` table. Dashboards read via SQL views. When the vendor
connects, flip the adapter — the taxonomy (snake_case names ≤40 chars, params in
`props`) drops straight in.

Owner: `@process-owner` (reassign once real owners exist).

## 1. Table schema

```sql
create table public.analytics_events (
  event_id     uuid primary key default gen_random_uuid(),
  dedupe_key   text unique,                          -- client-generated; dedupes retries
  event_name   text not null check (event_name in ( {{EVENT_NAME_LIST}} )),
  occurred_at  timestamptz not null,                 -- client event time
  received_at  timestamptz not null default now(),   -- server ingest time
  anon_id      text,                                 -- pre-signup id; MUST persist through signup
  user_id      uuid references auth.users(id),
  session_id   text,
  -- promoted props (also kept in props) for fast GROUP BY:
  {{PROMOTED_COLUMNS}}                                -- e.g. segment, source, tier, price_cents, currency
  props        jsonb not null default '{}'::jsonb,    -- everything else (doubles as vendor params)
  context      jsonb not null default '{}'::jsonb     -- app_version, country. NO raw IP, NO email.
);

create index on public.analytics_events (event_name, occurred_at);
create index on public.analytics_events (user_id);
create index on public.analytics_events (anon_id);
create index on public.analytics_events using gin (props);

alter table public.analytics_events enable row level security;
-- No client RLS policies = browser can neither read nor write.
-- track() server route INSERTs with the service role (bypasses RLS) so events can't be spoofed.
```

**Three rules that make the funnel stitch (enforce in `track()`):**
1. `account_created` **must carry both** `anon_id` (pre-signup) *and* `user_id` — the only link between anonymous demand events and paid revenue.
2. `subscription_started` must set `tier`, `price_cents`, `currency`, and `props->>'interval'`.
3. Names are snake_case ≤40 chars → drop straight into the vendor later; `props` becomes vendor params.

## 2. The events (customize names to the client's funnel)

Keep the funnel shape; rename to fit. A typical SaaS set:

| # | Event | Fires when | Key props |
|---|---|---|---|
| 1 | `{{DEMAND_START}}` | lead opens the magnet | source, {{SEGMENT_PROP}} |
| 2 | `{{DEMAND_DONE}}` | sees result / score | result props |
| 3 | `email_captured` | gives contact | channel |
| 4 | `account_created` | signup | **anon_id + user_id**, {{SEGMENT_PROP}} |
| 5 | `first_value` | activation moment | — |
| 6 | `trial_started` | trial begins | tier |
| 7 | `paywall_hit` | hits metered wall | wall_type |
| 8 | `subscribe_clicked` | reaches checkout | tier, price |
| 9 | `subscription_started` | **paid** | tier, price_cents, currency, interval |
| 10 | `trial_expired` | trial ends unconverted | — |
| 11 | `subscription_canceled` | churn | reason |
| 12 | `{{HIGH_VOLUME_EVENT}}` | one per core action | keep props lean |

<!-- INSTANCE: identify the highest-volume event (one row per core user action)
and keep its props minimal; add a materialized-view rollup before it gets big. -->

## 3. The 6 dashboard rates (reusable SQL — customize event names)

These funnel-math queries are client-agnostic; only the event names change. See
the Bayan instance (`../bayan/analytics-events-spec.md` §3) for the full worked
SQL to copy:

1. **Trial → paid** — cohort by trial-start month; convert = paid after trial start.
2. **Activation** — first-value ÷ signups, by signup week.
3. **Demand → signup** — stitched on `anon_id` (magnet completers who signed up).
4. **MRR / ARPU / tier mix** — latest sub per user, active = not canceled, yearly→monthly.
5. **D1 / D7 / D30 retention** — exact-day return, any event = active.
6. **Monthly churn** — cancels ÷ active-at-month-start (running net-active balance).

## 4. North-star

{{NORTH_STAR}}
<!-- INSTANCE: the one metric of real value delivered (e.g. weekly active users
completing ≥N core actions), NOT a vanity count. Revenue conversion is the
guardrail under it. -->

## 5. Two caveats

- **Cohort ratios, not same-period ratios.** Trial→paid spans the trial window; a
  fresh month reads low until its cohort matures. Read by cohort age.
- **No raw IP / email in this table.** Identity is `user_id` / `anon_id`; email
  lives in auth. Store country (not IP) in `context`.
