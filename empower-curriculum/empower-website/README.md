# empowerlabs.ai — public marketing site archive

Offline archive of the **public** EMPOWER Labs marketing site, `https://empowerlabs.ai/`. Captured 2026-09-04.

**17 of 22 routes archived — 27,691 words.** The 5 remaining routes are logged in [`../../specs/roadmap.md`](../../specs/roadmap.md).

This is a different site from `community.empowerlabs.ai` (the Circle community), which is archived in the sibling folders `01-cohort-4-curriculum/`, `empower-casestudies/`, `empower-community/` and `empower-participants/`.

## Pages

| # | Page | Route | Words |
|--:|------|-------|------:|
| 1 | [Build Your Business Brain](pages/01-home.md) | `/` | 1,246 |
| 2 | [Systematize Your Advisory](pages/02-how-it-works.md) | `/how-it-works` | 416 |
| 3 | [🧠 Build Your](pages/03-business-brain.md) | `/business-brain` | 167 |
| 4 | [Create Your AI Business Advisor](pages/04-business-brain--lesson-1.md) | `/business-brain/lesson-1` | 793 |
| 5 | [The Business Framework](pages/05-business-brain--lesson-2.md) | `/business-brain/lesson-2` | 2,278 |
| 6 | [Process Mapping With AI](pages/06-business-brain--lesson-3.md) | `/business-brain/lesson-3` | 8,748 |
| 7 | [Document Your Business](pages/07-cohort.md) | `/cohort` | 3,750 |
| 8 | [Document Your Organization's Brain](pages/08-teams.md) | `/teams` | 1,351 |
| 9 | [The Five-Hour](pages/09-five-hour-agency.md) | `/five-hour-agency` | 2,418 |
| 10 | [Find The Right AI Starting Point In Your Customer Lifecycle](pages/10-ai-audit.md) | `/ai-audit` | 1,253 |
| 11 | [AI Masterclass:](pages/11-masterclass-replay.md) | `/masterclass-replay` | 360 |
| 12 | [Practical notes from inside the work.](pages/12-blog.md) | `/blog` | 227 |
| 13 | [We Cut Nearly $94,000 a Year From Our Software Stack](pages/13-blog--acquira-crm-transformation.md) | `/blog/acquira-crm-transformation` | 1,578 |
| 14 | [If You Can’t Change AI Providers, You Don’t Own Your AI System](pages/14-blog--ai-provider-sovereignty.md) | `/blog/ai-provider-sovereignty` | 1,246 |
| 15 | [Apply for the Live Cohort](pages/15-apply.md) | `/apply` | 317 |
| 16 | [Official Brand Assets](pages/16-logo.md) | `/logo` | 119 |
| 17 | [EMPOWER Labs – Privacy Policy](pages/17-privacy.md) | `/privacy` | 1,424 |

## Layout

```
empower-website/
├── README.md            this index
├── pages/               readable Markdown, one file per route
├── raw-html/            rendered DOM per route + outbound link lists
└── _source/             provenance
    ├── routes.txt              all 22 router paths
    ├── captures.json           capture log (url, size, link count)
    ├── pages.json              page index (title, words)
    ├── spa-shell-index.html    the server's single HTML response
    └── index-Dsal1Fme.js       app bundle the route list came from
```

## How it was captured

The site is a Vite + React single-page app behind a catch-all route: every path returns the **same** 103,674-byte `index.html` (`/`, `/blog`, `/apply`, and even `/nonexistent-xyz` are byte-identical). So `curl` cannot retrieve any page but the home page — each route has to be rendered in a real browser.

1. The 22 router paths were read out of the app bundle (`path:"..."` literals in `_source/index-Dsal1Fme.js`).
2. Each route was loaded in headless Chromium via the gstack `browse` skill and its rendered DOM saved to `raw-html/`.
3. `.tools/html2md.py` converted each DOM dump to Markdown, dropping `<script>`/`<style>`/`<svg>` and keeping the document outline.

Regenerate the Markdown at any time:

```bash
python3 .tools/html2md.py empower-website/raw-html/<slug>.html
```

## Not archived

Five routes render but were not captured — the VPS ran out of memory for headless Chromium (available RAM fell to ~370 MB against the ~400 MB Chromium needs, load average 12–27 on 2 cores):

- `/terms`
- `/waitlist`
- `/webinar`
- `/get-started`
- `/on-demand`

Four are funnel stubs and one is a legal page, so no primary content is believed lost. Retry steps are in [`../../specs/roadmap.md`](../../specs/roadmap.md).
