---
title: "A.I. Marketing Club archive"
source: "https://members.marketingclub.ai/"
account: "member 1811"
access: "AI Marketing Club Basic Access, memberstack: ai marketing club"
---

# A.I. Marketing Club - content archive

Offline archive of the A.I. Marketing Club membership portal (Eben Pagan), built from the site's own JSON API so it can be regenerated at any time.

| What | Count | Detail |
|------|-------|--------|
| Live classes | 19 | 19 full transcripts + AI summaries |
| Core sections | 5 | 43 sessions, 13 attached files |
| Programs | 10 | 94 lessons, 181 media items |
| Members | 975 | roster without contact details |
| Upcoming events | 2 | scheduled live classes |

On disk: **198 Markdown**, 35 JSON, 71 PDF, 0 audio/video, 31.3 MB total.
Media links resolved: 41/41 videos, 123/181 program files.

## Layout

```
01-live-classes/    weekly live class replays (summary + transcript + raw)
02-main-content/    the five core tracks from the dashboard
03-programs/        bundled core + bonus programs, lesson by lesson
04-members/         community roster (no emails or phone numbers)
05-events/          upcoming scheduled classes
raw-json/           verbatim API payloads (provenance, diffable)
.tools/             the scripts that build all of the above
```

## How to read this

| File | What it is |
|------|------------|
| `README.md` in any folder | index for that folder |
| `transcript.md` | full spoken transcript, paragraphed |
| `meeting.json` / `raw-json/*.json` | untouched API payload |
| `directory.md` | member roster table |

Video and audio are **linked, not downloaded** (the audio alone is over 1 GB, past GitHub's limits). Run `python3 .tools/fetch_files.py --media` to pull them locally; `.gitignore` keeps them out of the repo.

## Re-running

```bash
cd marketingclub-archive
python3 .tools/login.py         # session cookie from the creds file
python3 .tools/fetch_all.py     # snapshot every API payload + resolve urls
python3 .tools/build_all.py     # render the Markdown tree
python3 .tools/fetch_files.py   # PDFs and documents (small)
python3 .tools/fetch_files.py --media   # + audio/video (~1 GB, gitignored)
```

Credentials are read from `eben-pagan-members.marketingclub.ai.md` (gitignored) or `$MC_CREDS`. The cookie jar lives outside the repo at `~/.marketingclub/jar.txt`.

## Not archived

See [GAPS.md](GAPS.md). Short version: the Platinum Passport tab needs a higher tier than this account, three endpoints (`/api/bonus`, `/api/events`, `/api/valuebombs`) are empty for this tier, 58 program videos are embed-only with no downloadable file, and 8 checklist PDFs are dead links in the club itself (their host no longer resolves).
