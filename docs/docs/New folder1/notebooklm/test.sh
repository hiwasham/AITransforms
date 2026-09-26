#!/usr/bin/env bash
# Self-contained NotebookLM test. No args, no cd. Prints progress immediately.
set -o pipefail
D=/home/miraddo/.openclaw/projects/aitransforms-gstack-sandbox/notebooklm
echo "[nlm] starting query, expect ~30s for NotebookLM to answer..." >&2
PYTHONUNBUFFERED=1 "$D/.venv/bin/python" "$D/scripts/nlm_ask.py" \
  1429e739-0148-401c-9946-63e4170cbe2e \
  "Summarize the first source of this notebook."
rc=$?
echo "EXIT: $rc"
exit $rc
