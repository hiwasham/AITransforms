# Integration Plan: Jev, Marketing Plan, and Empower Framework

**Date:** 2026-10-07  
**Project:** AITransforms  
**Status:** Planning Phase

---

## Three Integration Objectives

### 1. Install gstack Skills

**Issue:** The gstack skills mentioned in `/root/.claude/CLAUDE.md` aren't accessible yet.

**Skills Needed:**
- `/plan-ceo-review` — Strategy/scope review
- `/office-hours` — Product ideas/brainstorming
- `/plan-eng-review` — Architecture review
- `/design-consultation` — Design system review
- `/autoplan` — Full review pipeline

**Action Required:**
- Locate gstack installation or installation instructions
- Install gstack executable/CLI tool
- Verify skills are accessible via `claude` CLI or Skill tool

---

### 2. Integrate Jev Decision Engine into Bayan Marketing Plan

**Context:**
- Jev project has 6 decision integrations built (4 sales + 2 CEO strategic)
- Located at `/mnt/d/Obsidi1/03.Projects/jev`
- Background agent (a6bdfcce) is committing files and wiring to production
- Decision types: Choice, Score, Noul
- Cost: ~$0.00002 per decision

**Integration Points for Marketing Plan:**

#### A. Lead Qualification & Scoring
```python
# Score incoming leads for priority routing
questions = {
    "buying_intent": Score(0, 10, "0=browsing, 10=ready to buy now"),
    "fit_score": Score(0, 10, "0=poor fit, 10=ideal customer profile"),
    "segment": Choice(["startup", "scaleup", "enterprise", "education"]),
    "urgency": Noul("needs solution in next 30 days")
}
```

#### B. Content Triage & Routing
```python
# Route content inquiries to right resource
questions = {
    "topic": Choice(["ai_ceo_assistant", "rag_architecture", "coaching_systems", "empower_framework"]),
    "expertise_level": Choice(["beginner", "intermediate", "advanced"]),
    "intent": Choice(["learn", "implement", "consult"])
}
```

#### C. Campaign Effectiveness Scoring
```python
# Evaluate campaign performance signals
questions = {
    "message_clarity": Score(0, 10, "how clear is the value prop"),
    "cta_strength": Score(0, 10, "how compelling is the call-to-action"),
    "audience_fit": Score(0, 10, "how well does this match ICP")
}
```

**Implementation Path:**
1. Copy jev decision library to AITransforms
2. Create `src/lib/decisions/` directory
3. Build marketing-specific decision schemas
4. Wire decisions into marketing automation (n8n or PostHog)

---

### 3. Implement Empower Framework (4-Level Documentation)

**Framework Structure:**
- **Level 1: Core Process** (Strategic Overview) → Directors/Executives
- **Level 2: Blueprint** (Functional Breakdown) → Managers/Directors
- **Level 3: Guide** (Step-by-Step Execution) → Individual Contributors
- **Level 4: Forms & Templates** (Execution Tools) → Anyone executing

**Application to AITransforms Marketing:**

#### Level 1: Core Process
- "Market to Lead - AITransforms"
- "Lead to Sale - Consulting Engagement"
- "Sale to Delivery - AI Implementation"

#### Level 2: Blueprints
- "Inbound Content Strategy" (within Market to Lead)
- "Consultation & Qualification" (within Lead to Sale)
- "Knowledge Mapping & RAG Setup" (within Sale to Delivery)

#### Level 3: Guides
- "SEO Blog Post Creation Guide"
- "Discovery Call Execution Guide"
- "Business Brain Mapping Session Guide"

#### Level 4: Forms & Templates
- "Lead Qualification Questionnaire"
- "Discovery Call Script"
- "AI Readiness Assessment Template"
- "Knowledge Architecture Worksheet"

**Implementation Path:**
1. Start with one critical process: "Market to Lead"
2. Document Level 1 (strategic flow with stakeholders)
3. Break into Level 2 blueprints (functional areas)
4. Create Level 3 guides for highest-impact activities
5. Build Level 4 templates/forms
6. Store in `docs/processes/` following hierarchy

---

## Dependencies & Risks

**Dependencies:**
- gstack installation instructions/location unknown
- Jev background agent (a6bdfcce) must complete before copying decision code
- Need to decide on production automation: n8n vs PostHog vs direct integration

**Risks:**
- gstack may require separate installation/setup
- Jev integrations are built for Bayan context, may need adaptation
- Empower framework is extensive—risk of over-documentation

**Mitigation:**
- Start with smallest valuable increment for each
- Use `/plan-ceo-review` skill once installed to validate strategy
- Build one complete Level 1→4 process first before scaling

---

## Next Steps

**Immediate (This Session):**
1. [ ] Locate gstack installation method
2. [ ] Check status of background agent a6bdfcce
3. [ ] Choose one marketing process to document first

**Short Term (This Week):**
1. [ ] Install gstack skills
2. [ ] Copy Jev decision schemas
3. [ ] Document first Level 1 process
4. [ ] Build first decision integration

**Medium Term (Next 2 Weeks):**
1. [ ] Wire Jev decisions into marketing automation
2. [ ] Complete all 4 levels for primary process
3. [ ] Test decision accuracy with real marketing data
4. [ ] Create reusable templates for other processes
