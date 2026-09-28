# EMPOWER Labs — archive

Offline copy 
- of 
	- the course,
	- the case studies 
	- and the member directory 
- from https://community.empowerlabs.ai.

|                      |               |
| -------------------- | ------------- |
| Lessons saved        | **96 / 97**   |
| Readable transcripts | 13            |
| Files downloaded     | 120 (0.49 GB) |
| Slide decks (PDF)    | 15            |
| Video files          | 8             |
| Images               | 64            |

## Courses

- **[Beginner's Guide to Claude](./02-beginners-guide-to-claude/)** — 7/7 lessons saved · 1 sections · Welcome
- **[Curriculum](./01-cohort-4-curriculum/)** — 89/90 lessons saved · 15 sections · Cohort 4

## Shared resources

- **[Prompt library](./resources/prompt-library/)** — every exercise prompt, split per session (the Google Doc the lessons link out to)

## Community archive

- **[Case studies](./empower-casestudies/)** — 5 member implementations · 5 PDFs · full write-ups and the discussion under them
	- [[03.Projects/AITransforms/empower-curriculum/empower-casestudies/README|README]]
- **[Participants](./empower-participants/)** — 428 members (358 listed) · leaderboards · who posts and what about
	- [[03.Projects/AITransforms/empower-curriculum/empower-participants/README|README]]

## How to read this

- Start at a course README, 
- pick a section, 
- open a lesson's `lesson.md`. 
	- Each lesson folder holds:

| File | What it is |
|---|---|
| `lesson.md` | The lesson: frontmatter, video link, file list, full body text |
| `transcript.md` | Session recording transcribed to readable prose (replays only) |
| `assets/` | Slide decks, demo videos, chat logs, raw `.vtt`/`.srt`, images |
| `lesson.json` | Raw Circle API payload, for re-runs and diffing |

## Layout

```
empower-curriculum/
├── README.md                     this index
├── course.json                   machine-readable index of all lessons
├── resources/prompt-library/     exercise prompts, per session
├── empower-casestudies/          member case studies + their PDFs
├── empower-participants/         member directory, leaderboards, who is active
├── .tools/                       re-runnable fetch + convert scripts
└── NN-<course>/README.md
    └── NN-<section>/README.md
        └── NN-<lesson>/{lesson.md, transcript.md, assets/, lesson.json}
```

## Re-running

```bash
python3 .tools/cookies.py        # refresh auth from the Chromium profile
python3 .tools/fetch_all.py      # crawl (skips lessons already saved)
python3 .tools/postprocess.py    # transcripts + re-render markdown
python3 .tools/fetch_resources.py
python3 .tools/build_index.py

python3 .tools/fetch_posts.py 2345699 empower-casestudies   # case studies
python3 .tools/build_posts_index.py empower-casestudies
python3 .tools/fetch_members.py            # directory + leaderboards + activity
python3 .tools/build_members_index.py
```
