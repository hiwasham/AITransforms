# Chris 30-Second Wow Experience

## Design Goal

Chris should understand in under 30 seconds that this is not a generic AI demo.

The memorable thing:

> It already found the registration friction in my UK workshop and can answer from my event material without overreaching.

## Product Frame

Name shown to Chris:

**UK Workshop Registration Friction Brain**

Do not call it:

- Chris clone
- AI therapist
- General event chatbot
- Full company brain

Say:

> I mapped your UK workshop registration path and built a private registration assistant around the public event material.

## 30-Second Sequence

```text
0s   Chris opens Telegram or the prototype.
3s   He sees "UK Workshop Registration Friction Brain" and the Bristol event facts.
6s   He taps or asks: "Why might qualified people hesitate to register?"
12s  The assistant returns a concise friction map with citations.
20s  The assistant includes a gentle follow-up draft in Chris-appropriate language.
26s  It names the trust boundary: source-bound answers, safe refusal outside event material.
30s  The $100 pilot feels like the obvious next step.
```

## First Screen

Primary visual object:

- A Telegram-style answer pane, not a sales hero.

Above the answer:

- Event: UK Creating Healing Circles workshop.
- Date: July 25-28, 2027.
- Price: $1,650.
- Cap: 40 participants.
- Scope: public event page + latest email + internal NotebookLM-informed audit notes.

Primary prompt button:

> Why might qualified people hesitate?

Secondary prompt buttons:

- Is this person a fit?
- What logistics matter?
- Ask a trick question.

Parked from the first screen:

- Bali routing.
- All trainings.
- Website embed.
- Multi-user brain.

## Required First Answer

The answer should be short enough to read on a phone.

```text
Qualified practitioners may hesitate for five practical reasons:

1. Eligibility: the page welcomes IFS-informed and IFS Level I trained practitioners, but a buyer may still wonder if their exact background qualifies.
2. Lodging: the workshop price includes lunch, but lodging is separate and must be booked with Ham Green House.
3. Currency/payment: the price is listed in USD, while the UK venue and lodging are in GBP.
4. Refund timing: full refunds minus 3% are available until 21 days before the workshop; no refunds inside 20 days.
5. Certificate: the page says a certificate is available, but buyers may want to know how it applies to IFS-I certification.

Gentle follow-up draft:
"If you are IFS-informed or Level I trained and unsure whether this workshop fits your background, send us a short note about your training and group-facilitation experience. We can help you decide before you register."

Sources: [UK event page], [latest workshop email]
```

## Tone Rules

Chris's market is not normal SaaS. The assistant should sound:

- Calm.
- Specific.
- Respectful of therapeutic boundaries.
- Helpful without pressure.
- Operational, not hype-driven.

Avoid:

- "Crush objections."
- "Convert leads."
- "AI clone."
- "Sales funnel."
- "Automated closer."

Use:

- "Registration friction."
- "Participant uncertainty."
- "Fit and logistics questions."
- "Gentle follow-up."
- "Source-bound."
- "Human handoff."

## NotebookLM Role

NotebookLM is a backstage personalization tool.

Use it to shape:

- Chris-appropriate wording.
- Likely participant concerns.
- Audit notes.
- Candidate source list.

Do not expose NotebookLM as:

- The public source of truth.
- A hidden persona engine.
- A claim that Chris completed an audit.

Production answers must cite approved source slugs.

## Interaction Design

### Safe Choices

- Telegram-first: fast, familiar, low-friction.
- Source chips: visible trust proof.
- Short answer: phone-readable.
- One primary question: avoid making Chris hunt for the value.

### Deliberate Risks

- Lead with friction audit instead of "ask me anything."
  - Gain: Chris sees business value immediately.
  - Cost: it feels less magical than a general assistant, but it is more sellable.

- Use a gentle follow-up draft in the first answer.
  - Gain: moves from analysis to usable artifact.
  - Cost: copy must stay appropriate and non-salesy.

- Show refusal as a feature.
  - Gain: trust in a psychology/healing context.
  - Cost: less flashy than answering everything.

## Success Criteria

Chris should be able to say one of these within 30 seconds:

- "That is exactly what people ask us."
- "This would save repeated email replies."
- "I like that it refuses clinical questions."
- "Can it use our approved handouts?"

If he says "cool bot," the experience failed.

## CTA After The Wow

```text
If this feels useful, I can seal the first pilot around 3-5 approved UK workshop sources:

- fit and eligibility answers
- logistics and lodging answers
- gentle follow-up drafts
- safe refusal for clinical or unsourced questions
- a weekly friction report

$100 for the pilot. If it does not help, I refund it. If it does, I credit it toward the $500 event-support brain.
```

