# Warm Outreach Dashboard — Roadmap

Route: `/tools/warm-outreach` → `src/app/(en)/tools/warm-outreach/page.tsx`
Dashboard asset: `public/warm-outreach/lead-dashboard-v2.html` (5 seeded leads)
Gate: `src/components/PasswordGate.tsx` (client-side SHA-256, password `warmoutreach2024`)

## Done — 2026-08-31

- Restored the route, `PasswordGate`, and the public dashboard asset onto
  `feature/warm-gift-outreach` (they existed only on `main`, commit `02cf67a`).
- Restored all 5 lead emails and 7 gift HTML files from commit `8b9534e`.
- Repaired dependency resolution: `node_modules` was a symlink to
  `gstack-cache/AITransforms-node_modules`; because the target directory is not
  literally named `node_modules`, every nested `require` failed and `next dev`
  could not boot. Now a bind mount over a real `node_modules` directory.
- Pinned `turbopack.root` — Next was inferring `/root` as the workspace root
  (it found `/root/package-lock.json`) and scanning the whole home directory,
  which made the first compile take 2.5 minutes.

## Next step 1 — Persistence (replace localStorage)

Today all lead state (stage, notes, sent dates) lives in browser
`localStorage` under key `warm-outreach-v2`, seeded from a hardcoded `SEED`
array inside the HTML. Consequences: state is per-browser, lost on cache
clear, and invisible from a second device.

Ranked options:

1. **JSON file on disk + a route handler** — smallest change that fixes the
   real problem. `src/app/(en)/tools/warm-outreach/api/route.ts` with GET/PUT
   against `data/leads.json`. No new dependency, survives restarts, readable
   by any device. Note App Router requires the filename `route.ts`, not
   `leads.ts`.
2. **Supabase** — already used elsewhere in this stack (gbrain). Right choice
   if more than one person will edit the pipeline, or if history/audit matters.
3. **Stay on localStorage** — acceptable only while this is a single-operator
   tool on one browser. Export JSON regularly (the button already exists).

Recommendation: option 1 now, option 2 only when a second editor appears.

## Next step 2 — Real authentication

**The gate does not actually protect the leads.** `PasswordGate` is a client
component and the dashboard it wraps is a static file under `public/`, so
`http://<host>:3000/warm-outreach/lead-dashboard-v2.html` returns all five
leads with no password at all. Verified 2026-08-31: `200`, 26,135 bytes,
every lead name present. The password hash also ships in the client bundle,
so it is offline-crackable.

This matters more than usual because the dev server binds `0.0.0.0` on a
public IP (`89.167.19.64`) with `ufw` inactive — anyone who knows the path
can read the pipeline.

Fix, in order of effort:

1. **Move the dashboard out of `public/`** into a route handler that checks a
   session cookie before streaming the HTML. Kills the bypass entirely.
2. **Server-side session**: verify the password in a route handler against a
   secret from Infisical (never a hash in client code), set an httpOnly
   cookie, gate in `middleware.ts`.
3. **Interim mitigation if this stays public**: bind the dev server to the
   tailnet address only (`-H 100.93.250.79`) so it is not reachable from the
   open internet.

## Next step 3 — Tailwind styling

The dashboard is a standalone HTML file with its own `<style>` block and its
own design tokens; it does not use the project's Tailwind config, and the
iframe isolates it from `globals.css`. Two coherent paths:

1. **Leave it standalone.** It is already dark-themed and internally
   consistent. Cheapest, and the iframe keeps its `localStorage` behaviour
   intact.
2. **Port it to a real React page** using project Tailwind + logical
   properties (matching the rest of `src/`). Removes the iframe, makes the
   gate effective, and lets the lead data come from step 1's API. This is the
   right move if the dashboard becomes long-lived.

Do not do a half-port: mixing the standalone stylesheet with Tailwind
utilities inside an iframe buys nothing.

## Operational debt

- The `node_modules` bind mount is **not persistent across reboot**. After a
  reboot, re-run:
  `mount --bind /mnt/HC_Volume_106541224/gstack-cache/AITransforms/node_modules /root/projects/AITransforms/node_modules`
  A permanent fix means an `/etc/fstab` entry — not done, needs approval.
- `/` is **99% full (584 MB free)**. This is why a real local `node_modules`
  is not an option right now, and it will break the next `npm install`.
- `npm run lint` reports 1 error in `PasswordGate.tsx:27`
  (`react-hooks/set-state-in-effect`), inherited unchanged from `main`. Left
  as-is deliberately to keep the restored file byte-identical; fix it when
  step 2 rewrites the gate.
- Two lockfiles exist (`/root/package-lock.json` and this project's). The
  stray one at `/root` is what confused Turbopack's root detection.

---

# [note: added independently on \`main\`] Roadmap — unfinished archive work

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
