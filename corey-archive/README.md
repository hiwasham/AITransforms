---
title: "Corey Ganim — AI Operator Hub archive"
source: "https://www.skool.com/aioperatorhub"
youtube: "https://www.youtube.com/@coreyganim"
account: "hiwasham (member)"
archived: "2026-09-17"
---

# Corey Ganim — AI Operator Hub archive

Offline archive of the **AI Operator Hub** Skool community plus Corey Ganim's
YouTube channel and free-resource ecosystem, built so it can be regenerated
from `raw-json/` at any time.

**Start here → [00-SYSTEM/SYSTEM.md](00-SYSTEM/SYSTEM.md)** — the whole method
as one cross-linked workflow, not a pile of files.

| What | Count |
|---|---|
| Classroom courses | 7 (17 lessons) |
| Community posts | 17 (comments captured: 35) |
| YouTube videos | 80 (full descriptions + 401 description links) |
| Delivered resources | 2 (Meetup Master Prompt, YouTube Video Database CSV) |
| Opt-in pages indexed | 30 (landing copy gated — GAPS.md) |
| Transcripts | 0 (bot wall — GAPS.md) |

## Layout

```
00-SYSTEM/         the workflow map (start here)
01-classroom/      7 courses, lesson per file
02-community/      feed posts + comments (redacted)
03-youtube/        80 videos: description + every link
04-resources/      lead magnets: delivered docs + opt-in index
raw-json/          verbatim payloads (provenance; some gitignored)
.tools/            the scripts that build all of the above
```

## How to re-run

```bash
python3 .tools/siteconf.py      # prove the session
python3 .tools/fetch_all.py     # re-crawl (browser session required)
python3 .tools/build_all.py     # rebuild Markdown from raw-json/ only
```

## What is not archived

See [GAPS.md](GAPS.md) — every gap names its cause (tier gate, Cloudflare,
bot wall, comment pagination).
