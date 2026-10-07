![[deepseek_html_20261003_0176b7.html]]
<!-- /autoplan restore point: "/root/.gstack/projects/hiwasham-AITransforms/mcp-magister-autoplan-restore-20260928-130005.md" -->
## Implementation plan
# Bayan — V1 Marketing Execution Plan

**Prepared:** 2026-09-28 · **Site:** bayan.edu.om · **Horizon:** 90 days · **Goal:** revenue
**Scope:** the *execution* layer — how every drafted Bayan artifact goes from drafted → live → measured. Strategy already exists in `bayan-ceo-marketing-plan.md` (in review); this plan does not re-argue it.

> Hard constraint: this workspace **cannot reach** the live site, CMS, or Supabase DB. Every step here is either (a) draftable by the agent or (b) a handoff to a named owner. Nothing publishes without CEO sign-off.

---

## Current state — artifact → status → blocker

| Artifact | Status | Blocker to ship |
|---|---|---|
| 6 GEO fixes (`geo-fixes/`) | drafted | site/CMS write access; 2 need fixes (below) |
| 10 Prometric pages + HUB | drafted | CMS publish access; FAQ schema + internal links |
| Days 31–60 content (6 files) | drafted | CMS publish access |
| Analytics event layer (`analytics-events-spec.md`) | spec only | DB/analytics owner to implement |
| 13-section marketing plan | in review | §4–8 gated on zero funnel data |
| 2 CEO decisions (grandfathering, mid-tier SKU) | briefs ready | CEO sign-off |

---

## Success criteria (the numbers we move)

| Lever | Baseline | Target | Proof |
|---|---|---|---|
| Marketing health | 25/100 | 54/100 | Magister audit re-run |
| GEO / AI-answer | 71/100 | ~90/100 | AEO audit re-run |
| AI search visibility | 10/100 | named in ≥1 of 3 AI answers | audit |
| Commercial keywords in top 100 | 0 | ≥3 (start: usmle step 3 qbank diff 5) | DataForSEO |
| Mobile LCP | 5,039 ms | <2,500 ms | PageSpeed |
| Funnel baseline | none | trial→paid + activation measured | analytics events live |

---

## Phases (sequenced by unblock-order, not by AARRR order)

### Phase 0 — Instrument + baseline (unblocks everything else)
Owner: **DB/analytics owner** · Agent: hands off spec + pull-list · CEO: none
1. Implement the event layer from `analytics-events-spec.md` → verify: events land in the DB for a real test session (signup, trial start, 5-Q wall hit, purchase).
2. Pull the funnel baseline (installs, trial→paid, activation) + the two CEO-decision number sets (grandfathered lifer count/$, current tier prices) → verify: numbers returned, `[TBD — funnel data]` markers in the plan get filled.
3. Segment pre-2026-05-01 free lifers out of the baseline → verify: activation/conversion re-read without them.

### Phase 1 — Fast technical wins (low effort, high GEO lift)
Owner: **Site/CMS owner** · Agent: fixes the 2 broken artifacts first
1. Fix `geo-fixes/` before deploy: replace placeholder URLs in llms.txt/llms-full.txt with real page URLs; make FAQ JSON-LD questions match **visible on-page copy** (Google invalidates schema that doesn't) → verify: Rich Results Test passes.
2. Deploy all 6 GEO fixes per `geo-fixes/DEPLOY.md` → verify: `curl` checks in DEPLOY.md pass; re-run AEO audit, GEO ≥ 85.
3. Fix mobile LCP: kill the 780 ms redirect chain + defer/remove the 600 ms unused JS → verify: PageSpeed mobile LCP < 2,500 ms.

### Phase 2 — Content publishing waves
Owner: **Site/CMS owner** · Agent: adds schema + linking to drafts
1. Wave A — Prometric HUB + top-3 lowest-difficulty pages (usmle step 3 qbank diff 5, step 2 diff 14, mrcp 1 → nudge #28 to page 1). Add FAQ schema + BLUF opener + internal links to hub → verify: pages live, indexed (Search Console), schema valid.
2. Wave B — remaining 7 Prometric pages + Days 31–60 (6 files), same treatment → verify: live + indexed.
3. Submit updated sitemap; request indexing → verify: pages appear in `site:` search within 2–3 weeks; track rank on the 8 target keywords.

### Phase 3 — Packaging / revenue (CEO-gated, runs parallel to 1–2)
Owner: **CEO** decides · Site/PayPal owner configures
1. CEO signs Brief 1 (grandfathering — rec C: reclaim dormant lifers only) → agent drafts the announcement **before** any account is touched → verify: message approved, dormant-only migration scoped.
2. CEO signs Brief 2 (mid-tier single-exam SKU — rec B: ~2.5× monthly, 60–90d window) → configure in PayPal → verify: SKU purchasable end-to-end with a real test transaction.

### Phase 4 — Finalize plan + weekly measurement loop
Owner: **Agent** drafts · CEO approves · Magister tracks
1. Fill §4–8 (AARRR) of the marketing plan with the Phase 0 numbers; remove `[TBD]` markers → verify: no TBD markers remain in §4–8.
2. Synthesize §1 executive summary last → verify: plan moves from `phase: review` to `phase: approved` after CEO sign-off.
3. Turn on Magister weekly auto-tracking of health/GEO/rank → verify: first weekly report lands.

---

## Approval gates (nothing crosses these without the named sign-off)
- **G1 — Publish gate:** no content or GEO fix goes live without CEO content sign-off (medical-brand trust bar).
- **G2 — Money/user gate:** no price change, SKU, or account migration without CEO sign-off on the specific brief.
- **G3 — Claims gate:** every factual claim (5,589 questions · 55+ countries) re-verified against source before it publishes.

---

## Verification commands / checks
```bash
# GEO fixes live (per geo-fixes/DEPLOY.md)
curl -sS https://bayan.edu.om/llms.txt | head
curl -sS https://bayan.edu.om/ | grep -o 'FAQPage'          # FAQ schema present
# schema validity: paste page URL into Google Rich Results Test (manual)
# LCP + speed: PageSpeed Insights (mobile) — target LCP < 2,500 ms
# audits (Magister, this session): run_aeo_audit → GEO ≥ 85; audit health → 54
# rank tracking: keyword_research / DataForSEO on the 8 target terms
```

## Risks & assumptions
1. **No live access (highest risk).** Agent cannot deploy, publish, or query the DB — every ship step is a handoff. If no owner executes, the plan stalls at "drafted." *Mitigation: name the owner per phase up front (done above).*
2. **Zero funnel data blocks §4–8 and revenue math.** Phase 0 is the true critical path; everything revenue-shaped waits on it.
3. **SEO lag.** Rank/traffic gains take 4–12 weeks — Phase 2 success is "published + indexed + schema valid," not "ranked," inside 90 days.
4. **Medical-brand trust bar.** No outcome guarantees, no fake scarcity, verified counts only. A botched public grandfathering message is not reversible.
5. **Assumption:** the 13-section plan drafted overnight is directionally approved; this execution layer sequences it rather than re-litigating strategy.

## Cut list (if time runs short — cut bottom-up)
1. §10 12-month outlook + §12 tactical idea bank — lowest leverage pre-traction.
2. Referral (§7) — needs a user base that doesn't exist yet.
3. Content Wave B (Days 31–60) — ship Prometric Wave A first; it targets the winnable keywords.
4. Mid-tier SKU (Phase 3.2) — reversible PayPal config, can follow first data.
**Never cut:** Phase 0 (measurement) and Phase 1 (GEO fixes + LCP) — the whole ROI story depends on them.



## Review record
