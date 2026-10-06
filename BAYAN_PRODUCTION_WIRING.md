# Bayan Jev Production Integration — Wiring Plan

**Status:** Demo verified ✅ | Ready for production wiring

## What's Ready

6 Jev integrations tested and committed:
- **4 sales decisions:** warmth scoring, call readiness, proposal timing, renewal priority
- **2 CEO strategic:** grandfathering sunset, mid-tier SKU pricing

All route low-confidence cases (<0.7) to human review.

## Current State: Manual Bottleneck

From `bayan-sales-diagnostic.md` Process Maturity score: **13/70**

**The constraint:** CEO is 100% of the B2B engine, 10 hr/week capacity, 2-3 active conversations max.

**What's manual today:**
1. Nasim ranks warmth informally (no scoring system)
2. CEO decides discovery readiness conversationally (no framework)
3. Proposal timing improvised per conversation (no documented criteria)
4. Renewal priority ad-hoc (no systematic capture)

**What Jev automates:**
- Warmth scoring → Priority routing (hot → CEO, warm → Nasim, cool → nurture, cold → skip)
- Discovery readiness → Gated Noul (≥70% → book CEO call, <70% → Nasim warmup first)
- Proposal timing → Structured choice (send_now → CEO drafts, followup → Nasim qualifies)
- Renewal priority → Systematic scoring (critical/high → CEO outreach, medium/low → drip)

## Production Wiring: 3 Paths

### Path A: n8n HTTP-Node Recipe (RECOMMENDED)

**Why this path:**
- Bayan already uses n8n for email automation
- No code deployment needed
- Visual workflow = Nasim can modify routing logic
- Integrates with existing Supabase seat tracking

**Architecture:**
```
n8n Workflow (runs daily):
├─ Supabase Query (read warm book: 60 institutions)
├─ HTTP Request (POST to Jev API, 4 decisions per institution)
├─ Function Node (parse .score/.confidence/.choice)
├─ Switch Node (route on warmth + readiness + priority)
│  ├─ Hot + Ready + Critical → Slack CEO channel + calendar invite
│  ├─ Warm + Ready + High → Nasim task queue + email draft
│  ├─ Cool/Low → Nurture email sequence (automated)
│  └─ Cold → Archive (skip, log reason)
└─ Supabase Update (write scores back, timestamp last_scored_at)
```

**Implementation steps:**
1. Create n8n workflow "Bayan Warm Book Scoring"
2. Add HTTP Request node → `https://openrouter.ai/api/v1/systemone`
3. Set up authentication (OpenRouter API key from `../jev/.env`)
4. Map Supabase columns → Jev state context
5. Parse response → route with Switch node
6. Test with 3 sample institutions first
7. Deploy to full warm book (60 institutions)

**Cost:** 240 decisions/week (60 institutions × 4 decisions) = $0.0048/week = **$0.25/year**

**ROI:** Saves 3-4 hr/week CEO time (warmth ranking + discovery gate) = **150-200 hr/year** at ~$200/hr opportunity cost = **$30,000-40,000/year value**

---

### Path B: PostHog Instrumentation Hook

**Why this path:**
- Week 1 deliverable already instrumenting 10 core events
- Real-time scoring as activity happens (not batch)
- Scores stored as derived properties (queryable in dashboard)

**Architecture:**
```
PostHog Event Stream:
├─ trial_seat_active (fires daily per user)
├─ exam_attempted / module_completed (usage signals)
├─ Webhook → Cloud Function (scores warmth on activity)
├─ Jev API call → warmth_score + confidence
└─ PostHog Person Property update (warm_score, last_scored_at)

Supabase Scheduled Job (runs weekly):
├─ Read PostHog person properties (warmth scores)
├─ Call Jev for renewal_priority scoring
└─ Update institution records
```

**Implementation steps:**
1. Add PostHog webhook destination (Google Cloud Function or Vercel)
2. Function reads event payload → calls Jev warmth scoring
3. Updates PostHog person property `warmth_score` + `confidence`
4. Supabase cron job pulls warmth scores weekly
5. Runs renewal priority scoring on expiring trials
6. CEO dashboard queries both (warmth + priority)

**Cost:** ~10 warmth scores/day + 15 renewal scores/week = **$0.40/year**

**ROI:** Same as Path A but real-time (CEO sees live warmth scores in dashboard)

---

### Path C: Direct SOP Integration (Manual)

**Why this path:**
- No automation infrastructure needed
- Nasim runs scoring on-demand
- Good for testing before automation

**How it works:**
1. Nasim opens terminal weekly
2. Runs: `npx tsx src/lib/demo-jev-bayan-sales.ts > weekly-scores.txt`
3. Reviews scores + review flags
4. Routes manually:
   - Hot leads → books CEO discovery calls
   - Warm leads → sends outreach emails
   - Cool leads → adds to nurture sequence
   - Cold leads → archives with reason

**Implementation steps:**
1. Document the command in Bayan SOP
2. Create a template for recording decisions
3. Train Nasim on interpreting confidence thresholds
4. Run weekly for 4 weeks (validate accuracy)
5. Graduate to Path A automation after validation

**Cost:** Same as automated (~$0.25/year)

**ROI:** Lower (manual routing overhead) but proves the system before investing in automation

---

## Recommendation: Path A (n8n)

**Why:**
- Bayan already uses n8n for email workflows
- Visual workflow = non-technical modification (Nasim can adjust routing rules)
- Integrates with existing Supabase seat tracking (no new database)
- Batch scoring (daily/weekly) matches CEO's 10 hr/week availability rhythm
- Lowest implementation risk (no code deployment, no PostHog dependency)

**Timeline:**
- Week 1: Build n8n workflow, test with 3 sample institutions
- Week 2: Deploy to full warm book (60 institutions), monitor scores
- Week 3: Connect routing to CEO calendar (hot leads) + Nasim task queue (warm leads)
- Week 4: Measure ROI (CEO time saved, discovery call quality)

**Next step:** Build the n8n workflow JSON template (see `BAYAN_N8N_RECIPE.md`)

---

## Security Checklist

Before any production deployment:

- [x] Verify `../jev/.env` is gitignored (✅ confirmed)
- [ ] Never log OpenRouter API key in n8n execution logs
- [ ] Store API key in n8n credential store (encrypted)
- [ ] Restrict n8n workflow access to Nasim + CEO only
- [ ] Rate-limit Jev API calls (60 institutions × 4 decisions = 240 calls/day max)
- [ ] Monitor OpenRouter usage (should be ~$0.25/year, alert if >$10/month)

---

## Testing Protocol

**Before full deployment:**

1. **Accuracy test (Week 1):**
   - Score 10 known institutions (5 hot, 3 warm, 2 cold from CEO memory)
   - Compare Jev scores vs CEO manual ranking
   - Target: 90% agreement on hot/cold, 70% on warm/cool boundary

2. **Confidence calibration (Week 2):**
   - Collect 20 low-confidence flags (<0.7)
   - CEO reviews each manually
   - Target: 80% of flagged cases genuinely ambiguous (validates the threshold)

3. **ROI measurement (Week 3-4):**
   - Log CEO time before automation (baseline: 10 hr/week)
   - Deploy Jev scoring, measure CEO time after (target: 7-8 hr/week freed)
   - Calculate saved hours × opportunity cost

**Pass criteria:**
- Accuracy ≥85% on hot/cold classification
- Confidence flags catch ≥75% of genuinely ambiguous cases
- CEO time saved ≥2 hr/week (20% capacity freed)

If any criterion fails → revert to manual, retune confidence threshold, retest.

---

## Files Created This Session

```
AITransforms/
├── src/lib/
│   ├── jev-client.ts              # Portable TypeScript client (auto-reads ../jev/.env)
│   ├── demo-jev-prospecting.ts    # AITransforms lead-score
│   ├── demo-jev-bayan-ceo-briefs.ts  # Grandfathering + pricing decisions
│   └── demo-jev-bayan-sales.ts    # 4 sales decisions (warmth/readiness/timing/priority)
├── BAYAN_JEV_SALES_INTEGRATION.md # Full technical writeup
├── JEV_INTEGRATION_COMPLETE.md    # Integration map + next steps
├── JEV_INTEGRATION.md             # Prospecting + AITransforms targets
└── BAYAN_PRODUCTION_WIRING.md     # This file (production integration plan)
```

**Git status:** Integration code committed (5e3e293, d516bf2)

**Next:** Create `BAYAN_N8N_RECIPE.md` with workflow JSON template for Path A.
