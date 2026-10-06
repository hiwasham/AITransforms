# Bayan EMPOWER 4-Level Documentation Framework

**Source**: EMPOWER Cohort 4, Session 3: Exercise 3.2 — 4-Level Documentation Framework

This framework structures business process documentation from strategic overview down to executable templates. Each level serves a different audience and purpose.

---

## The 4 Levels

### Level 1: Core Process (Strategic Overview)
**Audience**: Leadership, cross-functional teams  
**Purpose**: End-to-end understanding, accountability, success metrics

**Contains**:
- Process purpose and scope
- End-to-end flow diagram
- RACI matrix (who does what)
- KPIs and success metrics
- Integration points with other processes

**Bayan Example**: Core 255 "Self-Serve Onboarding"
- RACI: CEO owns diagnostic flow, Nasim executes content, Platform auto-routes
- KPIs: Aha-moment rate (3 features in 7 days), trial→paid conversion
- Integration: Feeds Core 256 (Subscription Conversion)

---

### Level 2: Blueprint (Functional Breakdown)
**Audience**: Process owners, functional leads  
**Purpose**: Detailed how-to, quality gates, coordination points

**Contains**:
- Sub-process breakdown
- Decision trees and conditional logic
- Quality gates and approval points
- Handoff protocols between functions
- Exception handling

**Bayan Example**: Core 255 Blueprint — "Self-Serve Onboarding Blueprint"
- Sub-processes: Diagnostic Flow, Free Tier Boundaries, Activation Metric
- Decision tree: Diagnostic result → feature trial routing
- Quality gate: 3 features in 7 days = aha moment achieved
- Exception: User hits paywall 3x in one session → trigger early conversion flow

---

### Level 3: Guide (Step-by-Step Instructions)
**Audience**: Individual contributors, operators  
**Purpose**: Execution playbook for day-to-day work

**Contains**:
- Step-by-step procedures
- Screenshots and examples
- Troubleshooting tips
- Links to forms and tools (Level 4)

**Bayan Example**: Core 255 SOP — "Self-Serve Onboarding SOP"
- Step 1: User lands on bayan.edu.om → sees diagnostic interstitial
- Step 2: User completes 5-question intake → system scores by role/specialty/location
- Step 3: System displays personalized gap screen with 3 feature trials
- Step 4: System tracks feature usage → flags aha moment at 3/7
- Troubleshooting: If user abandons diagnostic midway → retarget with email Day 3 (Core 258)

---

### Level 4: Forms (Templates & Tools)
**Audience**: Everyone executing the process  
**Purpose**: Standardized inputs/outputs, consistency, speed

**Contains**:
- Templates (emails, contracts, checklists)
- Scripts (call scripts, demo scripts)
- Checklists (QA checklists, handoff checklists)
- Tools (calculators, configurators)

**Bayan Example**: Core 255 Forms
- Diagnostic question bank (5 questions × 3 roles = 15 variants)
- Gap screen copy template (personalized by role/specialty)
- Onboarding email sequence (Day 0, 3, 7)
- Feature trial routing logic (MCQ → quiz engine, OSCE → video library, Articles → search)

**Note**: Stage 3 currently lacks native "Forms" feature — these live as attachments or external links in L3 SOPs

---

## Bayan's Current 4-Level Coverage (Proc 14/15)

| Core | L1 RACI | L2 Blueprint | L3 SOP | L4 Forms |
|------|---------|--------------|--------|----------|
| 255 (Onboarding) | ✅ | ✅ | ✅ | ⚠️ Templates in email tool |
| 256 (Subscription) | ✅ | ✅ | ✅ | ⚠️ Pricing table in Stripe |
| 257 (Institutional Pilot) | ✅ | ✅ | ✅ | ⚠️ Discovery questions manual |
| 258 (Activation) | ✅ | ✅ | ✅ | ⚠️ Email sequence in tool |
| 259 (Paywall) | ✅ | ✅ | ✅ | ⚠️ Interstitial copy in code |
| 260 (Lifecycle) | ✅ | ✅ | ✅ | ⚠️ Re-engagement emails manual |
| 261 (Institutional Sales) | ✅ | ✅ | ✅ | ⚠️ Qualification scorecard manual |

**Status**: L1-L3 complete via Stage 3 HQ. L4 exists as scattered artifacts (email tools, code, manual docs) — not yet centralized in Stage 3.

---

## How the Levels Connect

```
L1 (Core Process) — WHAT we do and WHY (strategy)
    ↓
L2 (Blueprint) — HOW we do it (coordination)
    ↓
L3 (Guide) — WHO does WHAT, step-by-step (execution)
    ↓
L4 (Forms) — Templates to DO it faster (tools)
```

**Information flows both ways**:
- Top-down: Strategic changes (L1) cascade into updated blueprints (L2), revised guides (L3), new templates (L4)
- Bottom-up: Execution friction (L4) surfaces process improvements (L3), which inform blueprint revisions (L2), which may trigger KPI changes (L1)

---

## Stage 3 Implementation Notes

**Created via `.claude/skills/stage3-ops/` skill**:

1. **L1 RACI** — `POST /business-processes/{proc}/cores` creates core, then `import_html_raci` attaches activities + RACI HTML via `POST /content/raci-template/cores/{core}`

2. **L2 Blueprint** — Requires category first:
   - `POST /business-processes/{proc}/cores/{core}/activities` with `category` field creates category
   - Extract `category_id` from response
   - `POST /content/blueprint/category/{category_id}` attaches Blueprint content

3. **L3 SOP** — `POST /business-processes/{proc}/cores/{core}/sop-template` creates SOP, then save content via `PUT /content/sop-template/{sop_id}/versions/{version_id}` + `PUT /content/sop-template/{sop_id}/status`

4. **L4 Forms** — No dedicated Stage 3 feature yet; workaround = attach as file links in L3 SOP or store in external tool (Google Docs, Notion, email platform)

**Scripts**:
- `build_bayan_14_15.py` — Creates 7 cores + L1 RACI
- `build_bayan_blueprints.py` — Creates 7 categories + L2 Blueprints
- `build_bayan_sops.py` — Creates 7 L3 SOPs
- `stage3_full.py` — High-level API wrapper (uses `stage3_client.py` transport)

---

## Using This Framework for Documentation Tasks

**When creating a new process**:
1. Start at L1 — define purpose, RACI, KPIs
2. Build L2 — break into sub-processes, define quality gates
3. Write L3 — step-by-step guide for operators
4. Extract L4 — pull reusable templates from L3

**When improving an existing process**:
- Friction in execution (L4) → update guide (L3)
- Bottleneck in coordination (L3) → revise blueprint (L2)
- Misaligned KPIs (L2) → adjust core process (L1)

**When onboarding someone new**:
- Leadership → Read L1 + L2
- Functional lead → Read L2 + L3
- Individual contributor → Read L3 + L4
- Never expect someone to read all 4 levels — give them the right level for their role
