#!/usr/bin/env python3
"""Ask a NotebookLM notebook a question. Shared-credential, stateless client.

Auth model: reads a pre-minted Playwright storage_state.json (the shared
credential for emilycunningham7864@gmail.com). No interactive login, no browser.
Never prints the credential. JSON to stdout; exit 0 = grounded answer.

Env overrides:
  NLM_STORAGE  path to storage_state.json (default: ../.secrets/storage-state.json)
Usage:
  nlm_ask.py NOTEBOOK_ID "question"            human text
  nlm_ask.py NOTEBOOK_ID "question" --json     structured + citations
"""
import argparse
import asyncio
import json
import os
import pathlib
import sys


async def main() -> int:
    ap = argparse.ArgumentParser(description="Ask a NotebookLM notebook (shared credential).")
    ap.add_argument("notebook_id")
    ap.add_argument("question")
    ap.add_argument("--storage", default=os.environ.get(
        "NLM_STORAGE",
        str(pathlib.Path(__file__).resolve().parent.parent / ".secrets" / "storage-state.json"),
    ))
    ap.add_argument("--json", action="store_true", help="emit structured JSON + citations")
    args = ap.parse_args()

    storage = pathlib.Path(args.storage).expanduser()
    if not storage.exists():
        print(json.dumps({"error": "storage_state_missing", "path": str(storage)}))
        return 2

    from notebooklm import NotebookLMClient  # imported after arg parse for fast --help

    async with NotebookLMClient.from_storage(str(storage), timeout=90) as client:
        result = await client.chat.ask(args.notebook_id, args.question)

    refs = getattr(result, "references", None) or []
    grounded = len(refs) > 0

    if args.json:
        print(json.dumps({
            "answer": result.answer,
            "grounded": grounded,
            "reference_count": len(refs),
            "conversation_id": getattr(result, "conversation_id", None),
            "references": [getattr(r, "__dict__", str(r)) for r in refs],
        }, ensure_ascii=False, indent=2, default=str))
    else:
        print(result.answer)
        print(f"\n[grounded={grounded} refs={len(refs)}]", file=sys.stderr)

    return 0 if grounded else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
