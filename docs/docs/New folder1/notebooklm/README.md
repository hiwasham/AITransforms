# NotebookLM Access — Agent Onboarding (Codex / OpenClaw on freedom1)

You are an agent that can query any of the shared NotebookLM notebooks under
account `emilycunningham7864@gmail.com`. Auth is already done for you — a shared
credential lives on this box. You never log in, never touch a browser, never
handle cookies.

## What is already set up (do not redo)

```
aitransforms-gstack-sandbox/notebooklm/
  .venv/                     isolated python env, notebooklm-py 0.7.3
  .secrets/storage-state.json  the shared credential (chmod 600, gitignored) — NEVER print or commit
  scripts/nlm_ask.py         the client you call
  .gitignore                 keeps .secrets/ and .venv/ out of git
```

## The one command

```bash
cd aitransforms-gstack-sandbox/notebooklm
.venv/bin/python scripts/nlm_ask.py NOTEBOOK_ID "your question" --json
```

- Exit `0` = grounded answer (has source citations, not a hallucination).
- Exit `1` = answer returned but NOT grounded — treat as suspect.
- Exit `2` = credential missing at `.secrets/storage-state.json` — escalate, do not retry.

Drop `--json` for plain-text answer (citations summary goes to stderr).

## Verified onboarding test (reproduce this to confirm access)

```bash
.venv/bin/python scripts/nlm_ask.py \
  1429e739-0148-401c-9946-63e4170cbe2e \
  "Summarize the first source of this notebook." --json
```

Expected: `grounded: true`, `reference_count >= 1`, and the answer names the
first source **"01. How to Level Up in the Game of Life"**. If you see that, you
are onboarded.

## Notebook IDs

The ID is the last path segment of a notebook URL:
`https://notebooklm.google.com/notebook/<ID>`.
Known-good: `1429e739-0148-401c-9946-63e4170cbe2e` = "10,000 Hours of Play".

## When it stops working (credential expired)

`nlm_ask.py` starts failing auth after Google rotates the session. Fix is a
one-time refresh of `.secrets/storage-state.json` from a browser-authenticated
export of the emilycunningham7864 account, re-copied to this box (chmod 600).
Escalate to the human — do not attempt an interactive login from this headless VPS.

## Security rules

- Never print, log, echo, or commit `.secrets/storage-state.json` or its contents.
- Report only: answer text, citation counts, source titles, notebook IDs, exit codes.
- The credential is shared across the human's machines and agents — treat it like a password.
