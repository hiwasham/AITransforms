# {{CLIENT}} — {{DECISION_MAKER}} Decision Briefs

The decisions that gate Phase 0/1 (see `revenue-integration-strategy.md`). Each
touches money or existing users, so it's {{DECISION_MAKER}}'s to make — this doc
is *pull + propose only*, no execution without sign-off.

Each brief: the decision, the exact numbers to pull, the options with tradeoffs,
a recommendation, and reversibility. Numbers marked `[TBD — pull]` need a query
against the live DB.

---

## Brief template (copy per decision)

### Brief N — {{DECISION_TITLE}}

**Decision:** {{ONE_SENTENCE_DECISION}}

**Why now:** {{WHY_THIS_GATES_A_PHASE}}
<!-- INSTANCE: name the cost of not deciding (revenue leak, poisoned baseline,
packaging gap). Two concrete costs beats one vague one. -->

**Numbers to pull (hand to whoever owns the DB):**

| Metric | Where / how |
|---|---|
| {{METRIC_1}} | {{QUERY_1}} |
| {{METRIC_2}} | {{QUERY_2}} |
| {{METRIC_3}} | {{QUERY_3}} |

**Options:**

| # | Option | Upside / recovers | Risk |
|---|---|---|---|
| A | {{OPTION_A}} | {{A_UPSIDE}} | {{A_RISK}} |
| B | {{OPTION_B}} | {{B_UPSIDE}} | {{B_RISK}} |
| C | {{OPTION_C}} | {{C_UPSIDE}} | {{C_RISK}} |

**Recommendation: {{REC}}** — {{WHY}}. <!-- INSTANCE: pick one, give the reason,
name what data would revisit it. Pre-traction → protect goodwill over marginal $. -->

**Guardrails:** {{GUARDRAILS_FOR_THIS_DECISION}} — no change without sign-off;
announce before touching users; honor the brand trust bar.

**Reversible?** {{REVERSIBILITY}} <!-- INSTANCE: state plainly. A config/price
change is fully reversible; a public announcement damages trust once. The harder
half to reverse is what the recommendation should protect. -->

---

## What {{DECISION_MAKER}} gets back

1. **{{DECISION_1}}:** a count + $ estimate + the recommended call, plus a draft
   before anything is touched.
2. **{{DECISION_2}}:** one clear config change, ready to A/B once Phase 0 measures conversion.

Both are inputs to Phase 0/1 — the event layer can be built in parallel and
doesn't wait on either.
