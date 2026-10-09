![[deepseek_html_20261002_44d1ef.html]]

# Bayan — Analytics Events Spec (build-ready)

Vendor-neutral event layer for the Bayan learner app (Next.js + Supabase).
Purpose: close Bayan's #1 revenue gap — no instrumented funnel. Build the
event layer now; connect GA4 later as a config swap, not a rebuild.

**Design:** one `track(event, props)` wrapper with a GA4 adapter stub, sinking
to the Supabase `analytics_events` table below. Dashboards read via SQL views
over that table. When GA4 connects, flip the adapter to `gtag` — the taxonomy
(snake_case names ≤40 chars, params in `props`) drops straight in.

Owner: `@process-owner` (reassign once real owners exist).

## 1. Table schema

```sql
create table public.analytics_events (
  event_id     uuid primary key default gen_random_uuid(),
  dedupe_key   text unique,                          -- client-generated; dedupes retries/double-fires
  event_name   text not null check (event_name in (
                 'diagnostic_started','diagnostic_completed','email_captured',
                 'account_created','first_quiz_completed','trial_started',
                 'paywall_hit','subscribe_clicked','subscription_started',
                 'trial_expired','subscription_canceled','question_answered')),
  occurred_at  timestamptz not null,                 -- client event time
  received_at  timestamptz not null default now(),   -- server ingest time
  anon_id      text,                                 -- pre-signup id; MUST persist through signup
  user_id      uuid references auth.users(id),       -- set once the learner is known
  session_id   text,
  -- promoted props (also kept in props) for fast GROUP BY:
  exam_path    text,        -- smle / oen / arab_board / omsb / dha
  source       text,        -- lead source / utm
  tier         text,        -- physician / nurse / student / single_exam
  price_cents  integer,
  currency     text,        -- ISO 4217; expect 'USD'
  props        jsonb not null default '{}'::jsonb,   -- everything else (doubles as GA4 params)
  context      jsonb not null default '{}'::jsonb    -- app_version, country. NO raw IP, NO email.
);

create index on public.analytics_events (event_name, occurred_at);
create index on public.analytics_events (user_id);
create index on public.analytics_events (anon_id);
create index on public.analytics_events (exam_path);
create index on public.analytics_events using gin (props);

alter table public.analytics_events enable row level security;
-- No client RLS policies = browser (anon/auth roles) can neither read nor write.
-- track() server route INSERTs with the SERVICE ROLE key (bypasses RLS) so events can't be spoofed.
-- Dashboards read via service role / SQL editor, never from the browser.
```

**Three rules that make the funnel stitch (enforce in `track()`):**
1. `account_created` **must carry both** `anon_id` (same browser's pre-signup id) *and* `user_id` — the only link between anonymous diagnostic events and paid revenue. Without it, rate #3 is blind.
2. `subscription_started` must set `tier`, `price_cents`, `currency`, and `props->>'interval'` (`'month'` | `'year'`).
3. Names are snake_case ≤40 chars → drop straight into GA4 later; `props` becomes GA4 params.

## 2. The 12 events

| # | Event | Fires when | Key props |
|---|---|---|---|
| 1 | `diagnostic_started` | lead opens free diagnostic | source, exam_path |
| 2 | `diagnostic_completed` | sees score | score, weak_domains |
| 3 | `email_captured` | gives contact | channel (email/WhatsApp) |
| 4 | `account_created` | signup | exam_path, country, **anon_id + user_id** |
| 5 | `first_quiz_completed` | activation | — |
| 6 | `trial_started` | 30-day trial begins | tier |
| 7 | `paywall_hit` | hits 5 Q/day or metered wall | wall_type |
| 8 | `subscribe_clicked` | reaches checkout | tier, price |
| 9 | `subscription_started` | **paid** | tier, price_cents, currency, interval |
| 10 | `trial_expired` | trial ends unconverted | — |
| 11 | `subscription_canceled` | churn | reason (if available) |
| 12 | `question_answered` | one per answered question | is_correct, question_id, domain, quiz_mode |

`question_answered` is the highest-volume event (one row per question). Keep its
`props` lean. `is_correct` + `domain` also power the free diagnostic's weak-area
report — same event, two uses.

## 3. The 6 dashboard rates

**① Trial → paid conversion** (cohorted by trial-start month; convert counted only if paid after trial start):
```sql
with trials as (
  select distinct on (user_id) user_id, occurred_at as trial_at,
         date_trunc('month', occurred_at) as cohort
  from analytics_events where event_name = 'trial_started'
  order by user_id, occurred_at
),
paid as (
  select user_id, min(occurred_at) as paid_at
  from analytics_events where event_name = 'subscription_started' group by 1
)
select t.cohort,
       count(*) as trials,
       count(*) filter (where p.paid_at >= t.trial_at) as converted,
       round(100.0 * count(*) filter (where p.paid_at >= t.trial_at)
             / nullif(count(*), 0), 1) as conversion_pct
from trials t left join paid p using (user_id)
group by 1 order by 1;
```

**② Activation rate** (first quiz ÷ signups, by signup week):
```sql
with signups as (
  select user_id, min(occurred_at) as created_at
  from analytics_events where event_name = 'account_created' group by 1
),
activated as (
  select distinct user_id from analytics_events where event_name = 'first_quiz_completed'
)
select date_trunc('week', s.created_at) as week,
       count(*) as signups,
       count(a.user_id) as activated,
       round(100.0 * count(a.user_id) / nullif(count(*), 0), 1) as activation_pct
from signups s left join activated a using (user_id)
group by 1 order by 1;
```

**③ Diagnostic → signup** (stitched on `anon_id`):
```sql
with completed as (
  select distinct anon_id from analytics_events
  where event_name = 'diagnostic_completed' and anon_id is not null
),
signed as (
  select distinct anon_id from analytics_events
  where event_name = 'account_created' and anon_id is not null
)
select count(*) as diagnostics_completed,
       count(s.anon_id) as signed_up,
       round(100.0 * count(s.anon_id) / nullif(count(*), 0), 1) as signup_pct
from completed c left join signed s using (anon_id);
```

**④ MRR / ARPU / tier mix** (latest sub per user, active = not canceled; yearly → monthly):
```sql
with latest as (
  select distinct on (user_id) user_id, tier, currency, price_cents,
         coalesce(props->>'interval','month') as interval
  from analytics_events where event_name = 'subscription_started'
  order by user_id, occurred_at desc
),
canceled as (
  select distinct user_id from analytics_events where event_name = 'subscription_canceled'
)
select tier, currency,
       count(*) as active_subs,
       round(sum(case when interval='year' then price_cents/12.0 else price_cents end)/100.0, 2) as mrr,
       round(avg(case when interval='year' then price_cents/12.0 else price_cents end)/100.0, 2) as arpu
from latest where user_id not in (select user_id from canceled)
group by 1, 2 order by mrr desc;
-- Never SUM across currencies. Bayan is USD-enforced, so expect one row-group per tier.
```

**⑤ D1 / D7 / D30 retention** (exact-day return, any event = active):
```sql
with signups as (
  select user_id, min(occurred_at)::date as d0
  from analytics_events where event_name = 'account_created' group by 1
),
activity as (
  select distinct user_id, occurred_at::date as d from analytics_events
)
select s.d0 as cohort,
       count(distinct s.user_id) as cohort_size,
       round(100.0*count(distinct a.user_id) filter (where a.d = s.d0 + 1) /nullif(count(distinct s.user_id),0),1) as d1_pct,
       round(100.0*count(distinct a.user_id) filter (where a.d = s.d0 + 7) /nullif(count(distinct s.user_id),0),1) as d7_pct,
       round(100.0*count(distinct a.user_id) filter (where a.d = s.d0 + 30)/nullif(count(distinct s.user_id),0),1) as d30_pct
from signups s left join activity a using (user_id)
group by 1 order by 1;
-- Exact-day. For "returned within N days" swap `a.d = s.d0+N` to `a.d between s.d0+1 and s.d0+N`.
```

**⑥ Monthly churn** (cancels ÷ active-at-month-start, from a running net-active balance):
```sql
with monthly as (
  select date_trunc('month', occurred_at) as m,
         count(*) filter (where event_name = 'subscription_started')  as starts,
         count(*) filter (where event_name = 'subscription_canceled') as cancels
  from analytics_events group by 1
),
running as (
  select m, starts, cancels,
         sum(starts - cancels) over (order by m) - (starts - cancels) as active_at_month_start
  from monthly
)
select m, cancels, active_at_month_start,
       round(100.0 * cancels / nullif(active_at_month_start, 0), 1) as churn_pct
from running order by m;
-- Treats cancel as immediate. If you later add an effective-date prop, switch to that.
```

## 4. North-star — weekly active learners completing ≥20 Q

```sql
with weekly as (
  select user_id, date_trunc('week', occurred_at) as wk, count(*) as q
  from analytics_events where event_name = 'question_answered'
  group by 1, 2
)
select wk,
       count(*) filter (where q >= 20) as north_star_wal,   -- the metric: WAL ≥20 Q
       count(*)                        as any_active_learners,
       round(avg(q), 1)                as avg_q_per_active
from weekly group by 1 order by 1;
```

CEO's stated priority is outcome over vanity metrics, so this (learners doing real
work) is the north star; trial→paid conversion (#1) is the revenue guardrail under it.

## 5. Volume rollup — add before `question_answered` gets big

```sql
create materialized view public.analytics_daily_questions as
select user_id, occurred_at::date as d, count(*) as questions
from public.analytics_events
where event_name = 'question_answered'
group by 1, 2;
-- refresh nightly:  refresh materialized view public.analytics_daily_questions;
```
Run the north-star off the rollup (group `d` into weeks) once the raw query slows —
not day one.

## 6. Two caveats

- **Cohort ratios, not same-period ratios.** Trial→paid (#1) spans a 30-day trial;
  a fresh month reads low until its cohort matures. Read by cohort age.
- **No raw IP / email in this table.** Identity is `user_id` / `anon_id`; email lives
  in auth. Store country (not IP) in `context`.




