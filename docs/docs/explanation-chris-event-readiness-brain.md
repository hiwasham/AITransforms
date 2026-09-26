# Why the Chris Event Readiness Brain Exists

The Chris Event Readiness Brain exists to turn a warm relationship and real event demand into a small paid pilot.

It is not a general chatbot pitch. It is a narrow prototype for a support and conversion layer around Chris Burris's UK Creating Healing Circles workshop.

## The Problem

Chris's event pages already show demand. Several trainings are sold out, and the inspected UK workshop includes premium-registration stakes:

- UK workshop price: `$1,650`
- UK participant cap: `40`

The bottleneck is not proving that Chris can attract buyers. The bottleneck is reducing buyer uncertainty and repeated support work around high-ticket registration.

Prospective participants need answers before they commit:

- Am I qualified?
- What is included?
- What is not included?
- How do lodging, currency, certificate, and refund timing work?
- Is this an official IFSI training?
- Who should I contact if my background is unclear?

Those questions are high-friction because the answers are spread across event pages, registration copy, lodging notes, and external checkout pages.

## The Approach

The prototype shows a future assistant that answers only from approved event material.

```text
Participant question
        |
        v
Approved event corpus
  - UK event page
  - Latest workshop email
  - First-pass audit notes
  - Future Chris-approved handouts
        |
        v
Grounded answer with source labels
        |
        +--> If no source exists: safe refusal
```

The static page simulates this with four answer states:

1. Registration friction map
2. Participant fit
3. Logistics support
4. Safe refusal

The point is to show the trust contract before building a backend.

## Why This Is Better Than a Generic Landing Page

A generic landing page would ask Chris to imagine value.

This prototype shows value in his actual event system:

- It starts from his current UK workshop facts.
- It names the registration friction.
- It demonstrates refusal instead of hallucination.
- It includes a $100 pilot message Chris can react to immediately.

That lowers time delay. Chris does not need to schedule a long discovery call to understand the offer.

## Why Safe Refusal Is Central

For an IFS training context, trust matters more than fluency.

An unsafe assistant could invent clinical guidance, overstate eligibility, or answer from general internet knowledge. That would damage trust.

The intended assistant should behave like this:

```text
Can cite approved source?  -> answer with source
Cannot cite source?        -> refuse and route to human/contact
Clinical advice request?   -> refuse and route to appropriate human support
```

The refusal is not a weakness. It is the product moat.

## The Revenue Logic

The prototype follows the current $100 to $500 path:

```text
$100 pilot
  Seal 3-5 approved sources
  Prove fit answer
  Prove logistics answer
  Prove safe refusal
        |
        v
$500 event-support brain
  Telegram access
  More approved source material
  Support analytics
  Optional website embed
```

The $100 pilot is a demand filter. If Chris will not pay a small amount for an event assistant grounded in his own pages, the larger build is not ready.

## Trade-Offs

### Static prototype first

The first artifact is static HTML instead of a live retrieval system.

This gives up real retrieval, but it wins speed. Chris can inspect the idea now, before any proprietary source ingestion or deployment work.

### Public pages first

The prototype uses public event pages instead of Chris's book or private handouts.

This limits depth, but it avoids asking for proprietary material before trust is established.

### Telegram first

The pilot proposes Telegram before website embedding.

Telegram is faster to test, easier to demo, and already matches the existing AlphaClaw proof path. A website embed can come after the $500 build is justified.

## Alternatives Considered

### Raw Telegram link

Rejected. A raw bot link does not explain the event-specific value, the risk reversal, or the $100 pilot terms.

### Full public funnel

Deferred. A full funnel is too much surface before one paid Chris proof.

### WordPress redesign

Rejected. Chris's pages are functional and demand already exists. The better wedge is a support layer, not replacing the site.

## Related

- [Chris Event Readiness Brain reference](reference-chris-event-readiness-brain.md)
- [How to QA the Chris Event Readiness Brain](howto-qa-chris-event-readiness-brain.md)
- [Chris Event Readiness Brain plan](designs/chris-event-readiness-brain-plan.md)
