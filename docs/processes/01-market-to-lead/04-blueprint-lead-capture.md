# Level 2: Lead Capture & Qualification Blueprint

**Blueprint Name:** Lead Capture & Qualification
**Within Core Process:** Market to Lead
**Owner:** Hiwa (Founder)
**Audience:** Future sales/ops hire, the automation that scores leads
**Last Updated:** 2026-10-09

---

## Function

Turn an engaged visitor into a captured, scored, and routed lead. This blueprint
covers the **Qualify** and **Route** stages of the core process — the half that
decides who gets Hiwa's time and who gets nurtured automatically.

This is the blueprint the **Jev lead-scorer** plugs into. Everything scored here
is defined here first, by hand, before any automation.

---

## Detailed Workflow

### 1. Capture (on every page)

- Contact form present on key pages (Home, Services, CTA, each blog post)
- Minimum fields: name, email, message. Optional: company, company size, role
- On submit: store submission + fire notification to Hiwa within minutes
- No form should take more than ~20 seconds to complete

**Quality gate:** Every submission is captured and triggers a notification. Zero
silent drops.

### 2. Score (manual now, Jev later)

For each submission, assess five dimensions. These are the exact questions the
Jev scorer will answer automatically once validated:

| Dimension | Type | Scale / Options | What it means |
|-----------|------|-----------------|---------------|
| `buying_intent` | Score | 0-10 | 0 = browsing, 10 = ready to buy now |
| `fit_score` | Score | 0-10 | 0 = poor fit, 10 = ideal customer profile |
| `service_interest` | Choice | brain-mapping / rag / productization / ai-ceo | Which of the 4 services |
| `urgency` | Noul | 0-1 probability | Needs a solution in the next 30 days? |
| `technical_readiness` | Choice | exploring / planning / implementing / scaling | Where they are in the AI journey |

**Quality gate:** Every lead gets all five values before routing.

### 3. Route (based on score)

| Tier | Condition | Response time | Action |
|------|-----------|---------------|--------|
| **Priority** | `buying_intent` > 7 **and** (`fit_score` > 7 **or** `urgency` > 0.7) | < 24h | Personal email from Hiwa → discovery-call link |
| **Standard** | `fit_score` ≥ 5 and not Priority | < 48h | Personalized reply + relevant case study/guide; add to nurture |
| **Nurture** | everything else | < 72h (automated) | Send relevant educational resource; add to newsletter only |

**Quality gate:** Response-time SLA met for the tier; routing decision logged.

### 4. Handoff

- **Priority → Lead-to-Sale process** when the discovery call is booked
- **Standard → nurture sequence**, re-scored if they re-engage
- **Nurture → newsletter**, no direct follow-up

**Handoff data carried forward:** all five scores, service interest, company
info, and the original message.

---

## Defining "Qualified" (the criteria Jev will learn)

A lead is **qualified** (Priority tier) when it clears this bar:

- **Real business problem** tied to knowledge / documents / AI transformation —
  not a generic "tell me about AI" or a student research request
- **Can afford consulting** — roughly 20-500 employees, or an obviously funded
  smaller team
- **Decision influence** — founder, CTO, head of ops/L&D, or similar
- **Signal of movement** — a timeline, a budget mention, "we're looking to
  start," or an urgent pain

A lead is **disqualified** (Nurture tier) when it shows:

- Student / academic researching, not implementing
- Wrong size (solo hobbyist) or wrong intent (wants a free tool / DIY only)
- No identifiable problem — just curiosity

> This hand-written definition is the spec. The Jev scorer is only allowed to go
> live once it reproduces these human judgments on ~20 real past leads.

---

## Service Level Agreements

- Notification to Hiwa: within minutes of submission
- Priority response: < 24h
- Standard response: < 48h
- Nurture response: < 72h (automated)
- Every lead scored and routed within one business day

---

## Resources Required

- Contact form on the site (native, no heavy backend — matches V1 constraints)
- Notification channel (email to Hiwa; later a webhook)
- A place to log leads + scores (simple sheet now; CRM only if volume demands)
- Response templates per tier (Level 4 — to build)
- Jev scorer (`lib/decisions/lead_scorer.py` — deferred until criteria validated)

---

## Common Issues & Escalation

- **Submission with no business context** → reply once asking one clarifying
  question; if no answer, Nurture tier
- **High `buying_intent` but low `fit_score`** → flag for human review, don't
  auto-Priority (classic false positive the threshold alone misses)
- **Backlog > 20 unscored leads** → pause content creation, clear the queue
  (per the core-process escalation rule)
- **Jev score disagrees with gut on a real lead** → trust the human, log the
  case as a Class-RAG example to correct the scorer later

---

## Success Criteria

- 100% of submissions captured and notified
- 100% scored and routed within one business day
- Priority-tier booking rate > 40%
- Human/Jev agreement > 90% on the validation set before automation goes live

---

## Jev Integration (deferred — this is the spec for it)

When criteria above are validated against real leads, implement:

```python
# lib/decisions/lead_scorer.py — schema mirrors the Score table above
from typesafe_sdk import Choice, Noul, Score

questions = {
    "buying_intent": Score(0, 10, "0=browsing, 10=ready to buy now"),
    "fit_score": Score(0, 10, "0=poor fit, 10=ideal customer profile"),
    "service_interest": Choice(criteria={
        "brain_mapping":  "AI Business Brain Mapping",
        "rag":            "RAG & Knowledge Architecture",
        "productization": "AI Productization & Coaching Systems",
        "ai_ceo":         "Local AI Agents & AI CEO Assistant",
    }, instructions="Which service does the message point to?"),
    "urgency": Noul("Needs a solution within the next 30 days?"),
    "technical_readiness": Choice(criteria={
        "exploring":    "Just exploring AI possibilities",
        "planning":     "Planning an AI implementation",
        "implementing": "Actively implementing AI",
        "scaling":      "Scaling existing AI systems",
    }, instructions="Where are they in the AI journey?"),
}
# Route with the exact thresholds from the Route table above.
```

Validation gate: score ~20 past leads, compare to the human tier, add
Class-RAG examples for every disagreement until agreement > 90%.

---

## Related Documents

- Core Process: `00-core-process.md`
- Sibling blueprint: `01-blueprint-inbound.md`
- To build (Level 3): Lead scoring & routing guide
- To build (Level 4): Response templates per tier
