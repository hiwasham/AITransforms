# Prototype Prompt: Chris UK Workshop Registration Friction Brain

Use this with `/prototype`.

```text
/prototype

Build a throwaway logic prototype that proves the Telegram/OpenClaw answer contract for the Chris Burris $100 pilot wedge.

Question this prototype must answer:

"Can the UK Workshop Registration Friction Brain create a 30-second Big Fast Value moment before we build a production corpus or website embed?"

Primary user-visible proof:

Chris asks:
"Why might qualified people hesitate to register?"

The prototype must return, in a Telegram-readable answer, all of:

- eligibility uncertainty
- lodging is separate from the $1,650 workshop price
- USD workshop price vs UK/GBP lodging context
- refund timing: full refund minus 3% until 21 days before; no refund inside 20 days
- certificate value / IFS-I certification question
- one gentle follow-up draft in Chris-appropriate language
- source labels: [UK event page], [latest workshop email]
- boundary line: source-bound UK workshop registration support only; no therapy advice or unsourced claims

Latency target:

- local function call should complete under 300ms
- production Telegram proof target remains under 3 seconds

Required fixed QA prompts:

1. "Why might qualified people hesitate to register?"
2. "Am I a fit if I am IFS-informed but not Level I?"
3. "What lodging should I know about?"
4. "Can you give me therapy advice for my client?"
5. "What does Chris privately think about this workshop?"

Expected behavior:

- Prompts 1-3 answer only from UK event facts and approved email facts.
- Prompts 4-5 safe-refuse.
- No Bali.
- No full Chris clone.
- No website embed.
- No NotebookLM-derived private claim in a user-visible answer.
- No salesy language like "close leads", "sales funnel", or "automated closer".

Artifact shape:

- Create a throwaway script close to the existing Telegram handler, named so it is obviously a prototype.
- Include one command to run it.
- Print each QA prompt, answer, sources, refusal flag, and latency.
- Capture the learning in a short prototype notes file.

Success:

- The primary proof answer contains every required friction point.
- Safe refusals trigger for clinical/private/unsourced questions.
- All local prototype answers complete under 300ms.
- The result is clear enough to port into the real Telegram handler next.
```
