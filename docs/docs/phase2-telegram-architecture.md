# Phase 2 Telegram Architecture Lock

## Objective

Build the first AlphaClaw Gotcha Demo for the $500 revenue path, optimized for the $100 Chris Burris demo wedge.

Demo 1 is **Institutional Immortality**: a Telegram user asks a complex methodology question, and the bot returns a synthesized answer grounded in the sealed local GBrain corpus with visible source citations.

## Spine

- **Ingress:** default Telegram account, bound through `openclaw channels add --channel telegram --token <token>`.
- **Secret source:** `.env` only. The token is read at runtime and never committed.
- **Brain:** hermetic PGLite database at `.phase1/gbrain-home`, seeded from `.phase1/corpus/demo-corpus.jsonl`.
- **Retrieval:** `gbrain search` against `GBRAIN_HOME=.phase1/gbrain-home`; switch to semantic retrieval once `gbrain embed --stale` completes.
- **Answer contract:** answer only from local brain context; if no source is retrieved, refuse.
- **Citation contract:** include exact local brain slugs, starting with `alphaclaw-*` pages.

## Botmaster Pattern

The handler owns a self-healing polling loop:

- Long-poll Telegram with the default bot token.
- Process text messages only.
- Query the local brain with a bounded timeout.
- Return a refusal when retrieval has no grounded source.
- Catch transient Telegram/GBrain failures and keep polling after a bounded backoff.
- Restart local loop state without exiting on ordinary network or API errors.

## Watchdog Rules

The demo must not hang in front of a client:

- Polling iteration timeout is bounded.
- GBrain child process timeout is bounded.
- Consecutive failures trigger cooldown instead of tight-looping.
- The process logs failure class without printing secrets.
- Manual process supervision can restart the script without data migration.

## Gates

- Phase 1 sealed corpus exists and checksum passes.
- PGLite brain has 5 pages and 21 chunks before embeddings.
- `gbrain embed --stale` must be processing before live Telegram tests.
- No Phase 3 behavior is included in this lock.
