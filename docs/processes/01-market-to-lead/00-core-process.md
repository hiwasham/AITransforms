# Level 1: Market to Lead Core Process

**Process Name:** Market to Lead - AITransforms  
**Owner:** Hiwa (Founder, AI Transformation Architect)  
**Last Updated:** 2026-10-07  
**Status:** Draft v1

---

## Purpose & Strategic Objective

Convert website visitors and community members into qualified consulting leads by demonstrating expertise in AI transformation through educational content and systematic qualification.

**Success Definition:** 10-20 qualified leads per month with average lead quality score >7/10 (buying intent + fit score), leading to 2-3 closed consulting engagements monthly.

---

## Process Boundaries

**Starts:** When someone discovers AITransforms through any channel  
**Ends:** When lead is qualified and routed to consultation booking or nurture sequence

**In Scope:**
- Content creation and distribution (SEO, social, multi-language)
- Lead capture through website forms
- Initial qualification and routing
- Educational resource delivery

**Out of Scope:**
- Paid advertising (not in V1 scope)
- Discovery calls and consultation (covered in "Lead to Sale" process)
- Community building and engagement (separate "Community to Advocate" process)

---

## End-to-End Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ ATTRACT  │ --> │  ENGAGE  │ --> │ QUALIFY  │ --> │  ROUTE   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                  │
     v                v                v                  v
  SEO/Social     Problem-focused   Lead scoring    Priority response
  AI visibility  Content delivery  Intent check    or nurture sequence
  Multi-language Framework education               
```

### Stage 1: Attract (Inbound Traffic Generation)

**Objective:** Drive qualified traffic from people searching for AI transformation solutions

**Key Activities:**
- Publish 2-3 technical blog posts per week (EN/FA/AR)
- Optimize for AI search visibility (ChatGPT, Perplexity citations)
- Share framework concepts on social media
- Maintain multi-language presence (Persian/Arabic markets)

**Target Audience:**
- **Primary:** Technical founders/CTOs in 50-200 person companies
- **Secondary:** Business leaders exploring AI implementation
- **Tertiary:** AI consultants/agencies looking to level up

**Channels:**
- Organic search (Google, AI search engines)
- LinkedIn (technical thought leadership)
- Direct referrals (word of mouth)
- Persian/Arabic language communities

**Metrics:**
- Monthly visitors: Target 2,000-5,000
- Organic search traffic growth: 10-20% MoM
- AI search citations: Track mentions in ChatGPT/Perplexity
- Geographic distribution: 40% EN, 30% FA, 30% AR

---

### Stage 2: Engage (Value Demonstration)

**Objective:** Demonstrate expertise and build trust through educational content

**Key Activities:**
- Problem-focused content (not just "look at this tool")
- Framework education (Empower 4-level docs, Business Brain mapping)
- Real implementation examples (when available)
- Multi-language resource accessibility

**Content Strategy:**
- **Pain Points:** Documents scattered, knowledge trapped, AI overwhelm
- **Frameworks:** Empower Operating System, Business Brain → AI Systems
- **Solutions:** RAG architecture patterns, AI CEO Assistant concepts
- **Proof:** Case studies, technical walkthroughs, implementation guides

**Engagement Signals:**
- Time on page >3 minutes
- Multiple page views per session
- Resource downloads (templates, guides)
- Return visits within 7 days

**Metrics:**
- Average session duration: >3 minutes
- Pages per session: >2.5
- Bounce rate: <60%
- Return visitor rate: >25%

---

### Stage 3: Qualify (Intent & Fit Assessment)

**Objective:** Identify which leads are ready for consultation vs need more nurturing

**Current State (Manual):**
- Review contact form submissions
- Assess: company size, problem clarity, urgency signals
- Gut-feel priority ranking

**Future State (Jev-Powered):**
- Automated lead scoring on submission
- Decision engine evaluates:
  - Buying intent (0-10 scale)
  - ICP fit score (0-10 scale)
  - Service interest (which of 4 offerings)
  - Urgency (probability they need solution <30 days)
  - Technical readiness (where they are in AI journey)

**Qualification Criteria:**

**High-Priority Lead (Score >7):**
- Clear business problem related to knowledge/AI transformation
- Company size 20-500 employees (can afford consulting)
- Specific language: "need help," "looking to implement," "ready to start"
- Timeline mentioned or urgency implied
- Decision maker or technical leader

**Standard Lead (Score 5-7):**
- Interested but exploratory
- May need education on approach
- Timeline unclear or long (3+ months)
- Right profile but low urgency

**Nurture Lead (Score <5):**
- Very early stage, just learning
- Wrong ICP (too small, wrong industry)
- Student/academic (research not implementation)
- Looking for free tools or DIY solutions

**Metrics:**
- Lead volume: 20-50 submissions per month
- Qualification rate: >20% high-priority
- False positive rate: <10% (scored high but not actually qualified)

---

### Stage 4: Route (Response & Next Action)

**Objective:** Get the right response to each lead based on their readiness

**Routing Logic:**

**High-Priority Leads (Score >7 + Urgent):**
- **Response Time:** <24 hours
- **Action:** Personal email from Hiwa
- **Content:** Acknowledge specific problem, propose discovery call
- **Next Step:** Send calendar link, follow up in 48h if no booking

**Standard Leads (Score 5-7):**
- **Response Time:** <48 hours
- **Action:** Personalized template response
- **Content:** Relevant case study or technical guide, offer to answer questions
- **Next Step:** Add to nurture sequence (weekly educational emails)

**Nurture Leads (Score <5):**
- **Response Time:** <72 hours (automated)
- **Action:** Educational resource delivery
- **Content:** Link to relevant blog post or framework guide
- **Next Step:** Add to monthly newsletter, no direct follow-up

**Metrics:**
- Response time adherence: >90%
- Consultation booking rate (high-priority): >40%
- Nurture-to-consultation conversion: >5% within 90 days

---

## Key Performance Indicators (Process-Level)

| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| Monthly qualified leads | 10-20 | TBD | High-priority score >7 |
| Lead quality (avg score) | >7.0 | TBD | Combined intent + fit |
| Lead → Consultation rate | >30% | TBD | Booked calls / qualified leads |
| Time to first response | <24h | TBD | Submission to reply timestamp |
| Cost per lead | <$20 | TBD | Total marketing spend / leads |
| Organic traffic growth | 10-20% MoM | TBD | Google Analytics |

---

## Cross-Functional Dependencies

### Upstream (Inputs)
- **None** — This is the first process in the customer journey

### Downstream (Outputs)
- **Lead to Sale Process:** Qualified leads ready for discovery call
- **Content Strategy:** Engagement data informs which topics to create
- **Product Development:** Lead questions reveal market needs

### Parallel Processes
- **Community to Advocate:** Some leads come from community members
- **Partner to Referral:** Referral partners send pre-qualified leads

---

## RACI Matrix

| Activity | Hiwa (Founder) | Future Marketing | Future Sales | AI Systems |
|----------|----------------|------------------|--------------|------------|
| Content strategy | **R, A** | C | C | I |
| Content creation | **R, A** | R | I | C (editing/ideas) |
| Lead qualification | **R, A** | C | I | **R** (when automated) |
| High-priority response | **R, A** | I | C | I |
| Nurture sequence | **A** | R | I | R (delivery) |
| Process optimization | **R, A** | C | C | I |

**R** = Responsible (does the work)  
**A** = Accountable (final decision)  
**C** = Consulted (input before decision)  
**I** = Informed (notified of outcome)

---

## Common Issues & Escalation

**Issue:** Lead volume too low
- **Symptoms:** <10 submissions per month
- **Diagnosis:** Traffic too low OR conversion rate too low
- **Resolution:** Check traffic numbers first, then audit form friction
- **Escalation:** Pause other work to focus on content if traffic <1000/mo

**Issue:** Lead quality too low
- **Symptoms:** Lots of students, wrong company size, unclear inquiries
- **Diagnosis:** Content attracting wrong audience OR unclear positioning
- **Resolution:** Audit top traffic pages, ensure ICP is clear in copy
- **Escalation:** Rewrite homepage/key landing pages if avg score <4

**Issue:** High lead response time
- **Symptoms:** >48h average response for priority leads
- **Diagnosis:** Capacity issue OR notification system broken
- **Resolution:** Set up daily lead review routine, check email notifications
- **Escalation:** Pause content creation to handle backlog if >20 leads waiting

**Issue:** Low booking rate from qualified leads
- **Symptoms:** <20% of score >7 leads book consultation
- **Diagnosis:** Qualification criteria wrong OR response messaging weak
- **Resolution:** Review 10 recent non-converted leads, identify pattern
- **Escalation:** Refine qualification logic or rewrite response templates

---

## Integration with Other Core Processes

**→ Lead to Sale Process**
- **Handoff Point:** When lead books discovery call
- **Handoff Data:** Lead score, service interest, company info, conversation history
- **Success Criteria:** Lead shows up to call, has clear business problem

**→ Sale to Delivery Process**
- **Feedback Loop:** What problems do closed clients actually have?
- **Data Flow:** Informs content strategy (write about real pain points)

**→ Delivery to Success Process**
- **Feedback Loop:** Which implementations work best?
- **Data Flow:** Success stories become case studies for attraction stage

---

## Technology Stack

### Current (V1)
- **Website:** Next.js (Vercel deployment)
- **Forms:** Native HTML forms → email notifications
- **Analytics:** Basic Google Analytics (TBD)
- **Email:** Manual Gmail responses
- **Content:** Manual writing + publishing

### Future (V2 - After Jev Integration)
- **Lead Scoring:** Jev decision engine (TypeSafe SDK)
- **Automation:** n8n or PostHog webhooks
- **CRM:** TBD (may not need one initially)
- **Email Sequences:** TBD (ConvertKit, Mailchimp, or custom)

---

## Process Improvement Cadence

**Daily:** 
- Check lead queue
- Respond to high-priority leads

**Weekly:**
- Review lead quality scores
- Identify content gaps from lead questions

**Monthly:**
- Full process metrics review
- Adjust qualification criteria if needed
- Content performance audit

**Quarterly:**
- Strategic review: Are we attracting the right leads?
- Benchmark against targets
- Major process changes if needed

---

## Next Steps (Implementation)

- [ ] **Break into Level 2 Blueprints**
  - [ ] Blueprint 1: Inbound Content Strategy
  - [ ] Blueprint 2: Lead Capture & Qualification
  - [ ] Blueprint 3: Response & Routing Execution

- [ ] **Measure Current State**
  - [ ] Set up basic analytics tracking
  - [ ] Manually score last 20 leads (calibrate qualification)
  - [ ] Measure current response times

- [ ] **Quick Wins**
  - [ ] Set up form notification to guarantee <24h awareness
  - [ ] Create response templates for each lead tier
  - [ ] Document "what makes a good lead" for future reference

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-10-07 | v1 | Initial draft based on Build Packet and Empower framework | Hiwa + Claude |

---

## Notes & Assumptions

**Assumptions:**
- Starting from ~zero: no existing lead flow
- Solo founder (Hiwa doing all roles initially)
- Bootstrap budget (no paid ads budget yet)
- Multi-language is a differentiator (Persian/Arabic markets underserved)

**To Validate:**
- Are discovery calls actually the right next step? Or should some leads go straight to proposal?
- Is 10-20 leads/month realistic given current traffic?
- Should we track AI search visibility differently than Google SEO?

**Dependencies for Full Implementation:**
- Google Analytics setup
- Form submission tracking
- Jev decision engine integration (deferred to after Level 2-4 docs)
