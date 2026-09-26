# Chris Telegram Prototype Notes

## Question

Can the UK Workshop Registration Friction Brain create a 30-second Big Fast Value moment before we build a production corpus or website embed?

## Prototype

Run:

```bash
node scripts/prototype_chris_registration_brain.js
```

This is throwaway logic near the existing Telegram handler. It does not call Telegram, GBrain, OpenClaw, NotebookLM, or a model. It proves the answer contract before porting the behavior into the real handler.

## Current Verdict

Passed local prototype QA.

Observed run:

```text
node scripts/prototype_chris_registration_brain.js
```

Results:

- Primary hesitation answer included eligibility, lodging, currency/payment, refund timing, certificate value, gentle follow-up draft, source labels, and boundary line.
- Fit and lodging prompts answered from UK event/email source labels.
- Therapy advice and private-thought prompts safe-refused.
- All answers completed under 1ms locally, well below the 300ms local prototype target.

## Porting Decision

If the prototype passes, port the routing and refusal contract into `scripts/telegram_pglite_handler.js` behind a Chris-specific mode or a Chris-specific sealed corpus. Do not expand to Bali, a full Chris brain, or website embed until the Telegram proof converts.
