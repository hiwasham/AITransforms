# Roadmap — unfinished archive work

Open items for the EMPOWER archive under `empower-curriculum/`. Nothing here
blocks current work; each entry records what is missing, why, and how to finish it.

Last updated: 2026-09-04.

## 1. Five unarchived empowerlabs.ai routes

17 of the 22 routes on the public marketing site are archived in
[`empower-curriculum/empower-website/`](../empower-curriculum/empower-website/README.md).
These five are not:

| Route | Expected content | Priority |
|-------|------------------|---------:|
| `/terms` | Terms of service (legal, companion to the archived `/privacy`) | low |
| `/waitlist` | Cohort waitlist capture form | low |
| `/webinar` | Webinar registration / landing | medium |
| `/get-started` | Funnel entry, likely redirects | low |
| `/on-demand` | On-demand course offer page | medium |

**Why they are missing:** not a site problem and not a tooling bug. The site is
a React SPA, so every route must be rendered in headless Chromium. During the
capture run this VPS had 370 MB–1 GB of available RAM against the ~400 MB
Chromium needs to start, with load average 12–27 on 2 cores. Chromium either
failed to launch (`Server failed to start within 15s`) or the navigation blew
through `browse`'s hard-coded 15 s `goto` timeout. `/teams` failed the same way
on four attempts and then succeeded on the fifth, which is what identifies this
as resource contention rather than a broken route.

**To finish (~10 minutes when the box is idle):**

```bash
# 1. Check there is headroom first — needs >800 MB available, load < 4
free -m; cat /proc/loadavg

# 2. Capture the five routes
B="$HOME/.claude/skills/gstack/browse/dist/browse"
for r in /terms /waitlist /webinar /get-started /on-demand; do
  slug=${r#/}
  mkdir -p /tmp/elpages
  $B goto "https://empowerlabs.ai$r"
  sleep 3
  $B html > /tmp/elpages/$slug.html
  $B links > /tmp/elpages/$slug.links
done

# 3. Verify each capture is real, not an about:blank fallback
head -1 /tmp/elpages/*.html   # must read: source: https://empowerlabs.ai/...

# 4. Fold into the archive
cd empower-curriculum
cp /tmp/elpages/{terms,waitlist,webinar,get-started,on-demand}.html empower-website/raw-html/
python3 .tools/html2md.py empower-website/raw-html/<slug>.html > empower-website/pages/NN-<slug>.md
# then update empower-website/README.md and _source/pages.json
```

Two things that silently produce a useless capture, both hit during the first run:

- A failed `goto` leaves the tab on `about:blank`, and `browse` still returns a
  valid-looking 142-byte HTML document. Always check the `source:` line.
- If `browse`'s daemon is launched from a sandboxed shell, Chromium inherits a
  blocked network and every `goto` times out even though `browse status` reports
  healthy. Launch it with the sandbox disabled.

Fallback if the browser stays unavailable: the strings for these pages are inside
`empower-website/_source/index-Dsal1Fme.js` and can be recovered statically,
without rendering.

## 2. Circle Calendar events — blocked

The community Calendar space (`2414979`, 17 events) is not archived. Sixteen
endpoint shapes were tried across two sessions and none returns event data:

- `spaces/2414979/posts` with `?upcoming=true`, `?time_filter=upcoming`,
  `?time_filter=past`, `?start_date=2025-01-01&end_date=2027-12-31` → `count=0`
- `spaces/2414979/event_attendees`, `spaces/2414979/rsvps`,
  `/internal_api/upcoming_events`, `/internal_api/events/upcoming` → error

Circle appears to serve events through a different subsystem than posts. Do not
retry these shapes. Next thing worth trying is capturing the calendar in a
browser session and reading the rendered DOM, the same approach the marketing
site needed.

## 3. Lesson videos are not in git

8 video files, 453 MB, live in `empower-curriculum/**/assets/*.mp4` on disk but
are excluded by `.gitignore`. One of them is 105.5 MB, over GitHub's 100 MB
hard limit, so committing them would make the push fail outright.

Every affected lesson keeps its transcript and slides in git, so the text is not
lost. If the videos need to be versioned, the options are Git LFS or an
object-storage bucket referenced from the lesson Markdown.

## 4. Credential still on disk in plaintext

`hiwa-account-in-community-empower.json` in the repo root holds a
Circle login in plaintext. It is now in `.gitignore`, so it can no longer be
committed by accident, but it is still readable on this VPS.

It belongs in Infisical (`http://100.116.105.2:8080`), after which the file
should be deleted. Not done yet because moving a live credential is Hiwa's call.

## 5. Archive index does not know about `empower-community/`

`.tools/build_index.py::community_section()` still enumerates only
`empower-casestudies/posts.json` and `empower-participants/members.json`. It has
no branch for `empower-community/`, and `empower-community/README.md` does not
exist. The top-level `empower-curriculum/README.md` has not been regenerated
since that tree was added, and the archive-wide link sweep (last clean run:
536 links, 0 broken) predates it too.
#   Next steps:

    cd masterpromptv1

  Run your crew:
    crewai run

  Customize your crew:
    agents/*.jsonc    Define agent roles, goals, and LLMs
    crew.jsonc        Configure tasks and optional input defaults
    tools/            Add custom tools (Python)
# https://chat.deepseek.com/a/chat/s/fca3026d-14d3-4e81-ac1e-7b1fb2d0358d
