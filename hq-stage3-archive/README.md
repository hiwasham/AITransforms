---
title: "Stage 3 (hq.stage3.app) archive"
source: "https://hq.stage3.app"
---

# Stage 3 (hq.stage3.app) archive

Offline archive of the premium Stage 3 control panel for this account, cross-referenced against the local cohort content in `empower-curriculum/`.

| Area | Link |
|---|---|
| Dashboard | [dashboard.md](dashboard.md) |
| Curriculum (3 sessions, 20 lessons) | [curriculum/](curriculum/README.md) |
| Business Process Framework | [business-processes/](business-processes/README.md) |
| AI Master Prompts | [ai/](ai/README.md) |
| Cross-reference vs. cohort | [CROSS-REFERENCE.md](CROSS-REFERENCE.md) |
| Gaps / not archived | [GAPS.md](GAPS.md) |

On disk: **34 Markdown**, 2.6 MB total.

## Provenance & privacy

- Captured via authenticated Inertia.js JSON fetches (`X-Inertia`) through the logged-in browser session (Cloudflare-gated).
- Account PII (email, phone, consent IP, owner display name) is scrubbed from all committed Markdown.
- `raw-json/` (verbatim payloads) is **gitignored** — it carries per-page auth PII and is kept locally only for re-runs.

## Re-run

```bash
python3 .tools/build_all.py    # render this tree from raw-json/
```
