# Bayan EMPOWER Resources

**Consolidated reference for all Bayan marketing frameworks, documentation, and Stage 3 implementation.**

Last updated: 2026-10-06

---

## Core Documents

### 1. Master Prompt & Shared Language
**Location:** `marketing-plans/bayan/master-prompt.md` (and `bayan-shared-language.md` — identical)

**Purpose:** The "second brain" for every Bayan marketing task. Read first, every time.

**Contains:**
- Interaction style (CEO + Nasim working protocols)
- Strategic approach (the thesis every task serves)
- Resources inventory (assets, tooling, skills library)
- Business framework (EMPOWER 3-Layer + 4-Level + AARRR)
- Stage 3 HQ implementation notes

**When to use:** Before starting any Bayan task — reel, plan section, pitch, ad, process update.

---

## EMPOWER Frameworks

### 2. 3-Layer Business Framework
**Location:** `.claude/skills/stage3-ops/bayan-empower-3-layer-framework.md`

**Purpose:** Classify every business process into Strategic Planning, Customer Lifecycle, or Enabling Processes.

**Key sections:**
- Layer 1: Strategic Planning (CEO decisions, company direction)
- Layer 2: Customer Lifecycle (revenue-generating: Market→Lead→Sale→Delivery→Success→Referral)
- Layer 3: Enabling Processes (support functions: Order to Cash, IT, Plan to Report, etc.)
- Current gaps analysis (what's built vs what's missing)
- How layers integrate (vertical and horizontal connections)

**When to use:** 
- Classifying new work ("Is this Layer 1, 2, or 3?")
- Identifying process gaps
- Understanding how a task connects to business objectives

### 3. 4-Level Documentation Framework
**Location:** `.claude/skills/stage3-ops/bayan-empower-4-level-framework.md`

**Purpose:** Structure process documentation from strategic overview to executable templates.

**The 4 levels:**
- **L1: Core Process** — Strategic overview, RACI, KPIs (for leadership)
- **L2: Blueprint** — Functional breakdown, quality gates, handoffs (for process owners)
- **L3: Guide (SOP)** — Step-by-step execution instructions (for operators)
- **L4: Forms** — Templates, scripts, checklists, tools (for everyone)

**Bayan's current coverage:** L1-L3 complete for all 7 cores (255-261); L4 pending Stage 3 feature.

**When to use:**
- Creating new process documentation
- Understanding what level of detail a task needs
- Onboarding someone (give them the right level for their role)

---

## Stage 3 HQ (Process Execution Platform)

### 4. Stage 3 Dashboard
**Live platform:** https://hq.stage3.app/

**Bayan processes:**
- Proc 14 (Lead to Sale): https://hq.stage3.app/business-processes/14
- Proc 15 (Market to Lead): https://hq.stage3.app/business-processes/15

**What's documented:**
- 7 cores built across proc 14/15
- All cores have L1 RACI, L2 Blueprint, L3 SOP
- Categories: Motion A (Self-Serve B2C) vs Motion B (Institutional B2B)

### 5. Stage 3 Ops Skill
**Location:** `.claude/skills/stage3-ops/`

**Purpose:** Interact with Stage 3 HQ programmatically (create cores, update docs, extract data).

**Key scripts:**
- `build_bayan_14_15.py` — Creates 7 cores with L1 RACI
- `build_bayan_blueprints.py` — Creates 7 categories + L2 Blueprints
- `build_bayan_sops.py` — Creates 7 L3 SOPs
- `stage3_client.py` — Low-level transport layer (login, Inertia, JSON)
- `stage3_full.py` — High-level API wrapper

**When to use:**
- Creating new Bayan cores
- Updating process documentation in Stage 3
- Extracting process data for reports

---

## Bayan Customer Lifecycle (Proc 14/15 Cores)

### Motion A: Self-Serve B2C

**Core 255: Self-Serve Onboarding**
- Journey stage: Lead to Sale
- Purpose: Diagnostic → trial routing
- Key metric: Aha moment (3 features in 7 days)
- Stage 3: proc 15, category "Motion A - Onboarding"

**Core 256: Subscription Conversion**
- Journey stage: Lead to Sale
- Purpose: Pricing display, 30-day trial
- Key metric: Trial → paid conversion rate
- Stage 3: proc 15, category "Motion A - Subscription"

**Core 258: Activation Campaign**
- Journey stage: Market to Lead
- Purpose: Dormant users → re-engagement
- Key metric: Email open → return rate
- Stage 3: proc 14, category "Motion A - Activation"

**Core 259: Paywall Optimization**
- Journey stage: Lead to Sale
- Purpose: Interstitial display, frequency cap
- Key metric: Paywall impression → conversion rate
- Stage 3: proc 14, category "Motion A - Paywall"

**Core 260: Lifecycle & Retention**
- Journey stage: Market to Lead
- Purpose: Engagement tiers, churn prevention
- Key metric: Monthly active users, churn rate
- Stage 3: proc 14, category "Motion A - Lifecycle"

### Motion B: Institutional B2B

**Core 257: Institutional Pilot**
- Journey stage: Lead to Sale
- Purpose: Discovery, pilot pricing (3-month term)
- Key metric: Discovery call → pilot close rate
- Stage 3: proc 15, category "Motion B - Institutional Pilot"

**Core 261: Institutional Lead Qualification**
- Journey stage: Lead to Sale
- Purpose: ANBT scoring (Authority, Need, Budget, Timeline)
- Key metric: Lead score → proposal rate
- Stage 3: proc 14, category "Motion B - Institutional Sales"

---

## Original EMPOWER Curriculum

### 6. EMPOWER Cohort 4 Materials
**Location:** `empower-curriculum/01-cohort-4-curriculum/`

**Key sessions:**
- Session 2: The Invisible Structure of Business (3-layer framework origin)
- Session 3: Exercise 3.2 (4-level documentation framework origin)
- Session 5: Market-to-Lead framework

**When to use:** Reference original curriculum when adapting frameworks to new contexts or explaining the "why" behind Bayan's structure.

### 7. Stage 3 Archive
**Location:** `hq-stage3-archive/curriculum/`

**Contains:** Stage 3 platform training materials, including 4-level documentation exercise.

---

## Research & Facts

### 8. Bayan Research File
**Location:** `marketing-plans/bayan/research.md`

**Purpose:** Canonical source of truth for all Bayan facts (products, proof points, pricing, founder credentials).

**Authority order:** Sept-7 CEO "Final Exhibition" email > Sept-5 WhatsApp > Aug-29 brief > live sites.

**When to use:** Pulling proof points, verifying product names, checking pricing, citing founder credentials.

---

## Skills Library

### 9. Marketing Skills (GitHub)
**Location:** `.agents/skills/` (on disk)

**Available skills:** marketing-plan, product-marketing, social, ads, ad-creative, content-strategy, copywriting, launch, influencer-marketing, community-marketing, events, pricing, offers, cro, onboarding, analytics, attribution, seo-audit, ai-seo, and more.

**When to use:** Task-specific execution (e.g., invoke `ad-creative` skill when building ad campaigns).

---

## Quick Reference: Task → Resource Mapping

| Task | Primary Resource | Supporting Resources |
|------|------------------|---------------------|
| Classify new work | 3-Layer Framework | Master Prompt §4 |
| Document new process | 4-Level Framework | Stage 3 Ops Skill |
| Update Stage 3 | Stage 3 Ops Skill | Stage 3 Dashboard |
| Pull Bayan facts | Research file | Master Prompt §3 |
| Understand CEO style | Master Prompt §1 | — |
| Map customer journey | Master Prompt §4 | 3-Layer Framework (Layer 2) |
| Identify gaps | 3-Layer Framework | Master Prompt §4 |
| Execute marketing task | Master Prompt first | Then relevant skill from library |
| Onboard someone new | 4-Level Framework | Give them the right level for their role |

---

## Critical Gaps (Updated 2026-10-06)

**Layer 3 (Enabling) — blocking Layer 2 optimization:**
1. 🚨 **Funnel instrumentation missing** — No GA4/Mixpanel/Amplitude
2. 🚨 **KPI dashboard missing** — Manual reporting only
3. ⚠️ **Unit economics tracking** — No LTV/CAC/cohort analysis

**Layer 2 (Customer Lifecycle) — incomplete journey coverage:**
1. ⚠️ **Sale to Delivery** — Payment confirmation, account provisioning (not mapped to Stage 3 yet)
2. ⚠️ **Delivery to Success** — Weekly progress tracking, exam milestone support (not mapped)
3. ⚠️ **Success to Referral** — Peer invites, testimonial capture (not mapped)

**L4 Documentation — pending for all cores:**
- Stage 3 lacks native "Forms" feature
- Workaround: External links in L3 SOPs or attachments
- Current forms scattered across email tools, Stripe, manual docs

**Next priorities:**
1. Build proc 22 "Funnel Instrumentation & Unit Economics" (closes measurement gap)
2. Complete Sale → Delivery → Success → Referral cores
3. Implement L4 Forms workaround or wait for Stage 3 feature

---

## Version History

- **v1** (2026-09-22): Initial resource consolidation
- **v2** (2026-10-06): Added Stage 3 implementation, 3-layer framework, 4-level framework, proc 14/15 cores mapping
