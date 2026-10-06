# Bayan EMPOWER 3-Layer Business Framework

**Source**: EMPOWER Cohort 4, Session 2: The Invisible Structure of Business

This framework organizes every business process into one of three layers. Use it to classify Bayan's work, identify gaps, and ensure coverage across strategic, customer-facing, and enabling functions.

---

## Layer 1: Strategic Planning

**Purpose**: Setting direction and allocating resources

**Bayan Examples**:
- **Strategic Planning** — product roadmap (Bayan Learning expansion, PreOp/JournalReady/Medad/SmartRota prioritization), market expansion (Gulf region growth), investor relations, break-even planning
- **Business Model Design** — pricing per segment (physician/nurse/student), Oman-free vs international-paid model, institutional licensing
- **Resource Allocation** — team buildout priorities, marketing budget ($200/mo tools + conference travel), R&D investment (AI features, content quality)

---

## Layer 2: Customer Lifecycle (Core Revenue Processes)

**Purpose**: Directly generating revenue and serving customers

**Bayan Process Map** (mapped to proc 14/15 cores built):

### Market to Lead
- **Core 258**: Activation Campaign (dormant users → re-engagement)
- **Core 260**: Lifecycle & Retention (engagement tiers, churn prevention)

### Lead to Sale
- **Core 255**: Self-Serve Onboarding (diagnostic → trial routing)
- **Core 256**: Subscription Conversion (pricing display, 30-day trial)
- **Core 259**: Paywall Optimization (interstitial, frequency cap)
- **Core 257**: Institutional Pilot (Motion B — discovery, pricing)
- **Core 261**: Institutional Lead Qualification (Motion B — scoring, proposal)

### Sale to Delivery
- Payment confirmation & account provisioning (TBD — not yet mapped to Stage 3)
- Platform onboarding & first-value delivery (TBD)

### Delivery to Success
- Weekly progress tracking (TBD)
- Exam prep milestone support (TBD)
- Pass/certification outcome tracking (TBD)

### Success to Referral
- Peer invites & study group formation (TBD)
- User testimonials & case study capture (TBD)

---

## Layer 3: Enabling Processes

**Purpose**: Supporting and strengthening the core business (not directly revenue-generating but essential)

**Bayan Coverage** (gaps marked):

- **Order to Cash** — Stripe integration, subscription billing, Oman-free override logic ✅ (live)
- **Financial Performance Management** — MRR tracking, unit economics (TBD — no funnel data yet), break-even modeling
- **Information Technology & Knowledge Management** — bayan.edu.om hosting, database, AI infrastructure (Veo/Kling/Runway/Hedra/ElevenLabs stack), medical content QA workflow ✅
- **Hire to Retire** — Nasim onboarding (done), agency transition (done), future team scaling (TBD)
- **Plan to Report** — weekly marketing reports (committed: 2 calls + 3 messages/week), KPI dashboards (TBD — funnel instrumentation missing)
- **Partnerships Management** — Oman Health 2026 booth (done), future conference sponsorships, medical institution partnerships (Motion B)
- **Risk/Crisis Management** — medical content accuracy review (human-in-loop), brand compliance (no shortcuts messaging, AI tool disclosure)
- **Quality Management** — content review workflow (Nasim → CEO approval), brand standards (navy + gold, Omani cultural fidelity, English-first)
- **Legal & Compliance** — medical licensing exam trademark compliance (never cite SQUH/OMSB/SQU as employer), data privacy for user records
- **Continuous Improvement** — cohort learnings applied (EMPOWER frameworks), analytics-driven iteration (blocked on funnel data)
- **Vendor/Supplier Management** — tools budget ($200/mo), conference logistics
- **Supply Chain & Asset Management** — N/A (digital product, no physical inventory)
- **Operational Scheduling & Deployment** — content calendar (2-3 videos + 10-15 images/week baseline)
- **Sustainability & Environmental Management** — N/A (no physical operations)

---

## How This Framework Guides Bayan Work

1. **Strategic Planning (Layer 1)** decisions drive everything below:
   - CEO sets objective: "break even" → triggers conversion-first plan (Layer 2)
   - Resource allocation: Nasim's $200/mo tools → enables content production (Layer 3)

2. **Customer Lifecycle (Layer 2)** is the revenue engine:
   - Every core (255-261) maps to a stage in the customer journey
   - Each core has its own KPIs tying content → users → paid subscriptions

3. **Enabling Processes (Layer 3)** remove friction:
   - Funnel instrumentation (Layer 3) unblocks data-driven optimization (Layer 2)
   - Quality management (Layer 3) protects brand equity (Layer 1 strategic asset)

4. **Integration Points** (where layers connect):
   - Plan to Report (Layer 3) surfaces metrics → informs Strategic Planning (Layer 1)
   - IT/Knowledge Management (Layer 3) powers content delivery → enables Customer Lifecycle (Layer 2)
   - Financial Performance (Layer 3) tracks break-even progress → triggers compensation scale model (Layer 1)

---

## Current Gaps in Bayan's 3-Layer Coverage

**Layer 1 (Strategic) — mostly covered**, key decisions documented in master prompt

**Layer 2 (Customer Lifecycle) — partial**:
- ✅ Market to Lead (cores 255, 258, 260)
- ✅ Lead to Sale (cores 256, 257, 259, 261)
- ⚠️ Sale to Delivery (not mapped to Stage 3 yet)
- ⚠️ Delivery to Success (not mapped to Stage 3 yet)
- ⚠️ Success to Referral (not mapped to Stage 3 yet)

**Layer 3 (Enabling) — major gaps**:
- 🚨 **Funnel instrumentation missing** — blocks all Layer 2 optimization
- 🚨 **Plan to Report** — no KPI dashboard, manual reporting only
- ⚠️ Financial Performance — no unit economics tracking yet
- ⚠️ Continuous Improvement — blocked on analytics data

**Priority fixes** (to unlock Layer 2 execution):
1. Install funnel tracking (GA4 + Mixpanel/Amplitude) — Layer 3 prerequisite
2. Build KPI dashboard — Layer 3 reporting
3. Complete Sale → Delivery → Success → Referral cores — Layer 2 coverage

---

## Using This Framework for Any Bayan Task

Before starting work, classify it:
- **Layer 1?** → CEO approval required, affects company direction
- **Layer 2?** → Ties to a customer journey stage, has a conversion metric
- **Layer 3?** → Enables other work, no direct revenue impact but essential

Then check:
- Does this task serve the layer above it? (e.g., does this Layer 3 process enable a Layer 2 customer flow?)
- Does feedback from this layer inform the layer above? (e.g., does this Layer 2 metric inform Layer 1 strategic decisions?)

If a task doesn't fit the framework or doesn't connect layers, it's probably noise.
