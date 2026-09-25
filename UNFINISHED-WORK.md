# Unfinished Work — Branch Map

**Last updated:** 2026-09-22
**Why this file exists:** You had unstable Claude/Codex sessions that got
interrupted across several branches. This is the plain-English map of what was
left half-done and where, so nothing is lost and you never have to hunt for it.

Read the table first. Details below.

---

## The one urgent thing

⚠️ **`corey-creds.md` (Corey Ganim's Skool login) was committed to git and
pushed to your private GitHub** (commit `eeb41e9`, on remote `main`).

- The repo is **private**, so only people you gave access to can see it — not
  the public internet.
- As of 2026-09-22 the file is **untracked** (removed from git going forward,
  still on your disk) and added to `.gitignore`.
- **What only you can do:** change the Corey Ganim / Skool password. The old
  one lives in git history now, so rotate it. Then the new one goes into
  Infisical (the secret vault), never back into a file.

---

## Branch status at a glance

| Branch | State | Unfinished work | Skill to resume with |
|--------|-------|-----------------|----------------------|
| `feature/bayan-marketing-plan` | **active** (current) | Research + foundation done; drafting the 13 plan sections next | marketing-plan |
| `feature/audit-page-clone-preplan-20260731T113248Z` | interrupted | Dashboard deploy runbook half-written; deploy never finished | /setup-deploy + /browse |
| `feature/dashboard-login-origin-fix` | interrupted | Browser-login hotfix written but never reviewed/merged/deployed | /tdd → /ship |
| `chore/recovery-docs-consolidation` | clean tip | No interrupted work found | — |
| `feature/002-operator-review-dashboard` | clean tip | No interrupted work found | — |
| `feature/daily100openclawoutreach` | clean tip | No interrupted work found | — |
| `feature/warm-gift-outreach` | clean tip | No interrupted work found | — |
| `main` | clean tip | 1 trivial stash (`ignore corey-creds.md`) — now superseded | — |

"Clean tip" = the last commit is a normal finished commit, not a half-done
`WIP:` one. Nothing dangling.

---

## The 2 branches with real interrupted work

### 1. `feature/audit-page-clone-preplan-20260731T113248Z`
- **Last commit (interrupted):** `WIP: add dashboard deployment runbook` (2026-07-30)
- **What was in progress:** building + deploying a protected public dashboard.
  A stack of WIP commits: runtime, fail-closed HTTP router, dependency patches,
  Funnel listener, review/plan/design docs.
- **What's left to finish:** install/configure Infisical CLI + machine identity,
  run full regressions, pass security/QA/review/ship gates, cut a merged
  immutable release, do a private backup/restore drill, then wire the Funnel.
- **Resume with:** `/setup-deploy` then `/browse` to verify the live flow.

### 2. `feature/dashboard-login-origin-fix`
- **Last commit (interrupted):** `WIP: allow browser login without Origin header` (2026-08-06)
- **What was in progress:** a hotfix so browser login works when the Origin
  header is missing.
- **What's left to finish:** run ship review, merge the hotfix, deploy the
  merged SHA, verify the public browser login actually works.
- **Resume with:** `/tdd` (write the regression test first) then `/ship`.

---

## `main` stash (trivial, safe to ignore)
- `stash@{0}: On main: wip: ignore corey-creds.md`
- This was an old attempt to do exactly what we just did properly (untrack the
  creds file). It's now superseded by the `.gitignore` change on
  `feature/bayan-marketing-plan`. Safe to drop later; no work lost.

---

## Backup status
All local branches are pushed to `origin` (GitHub `hiwasham/AITransforms`,
private) as of 2026-09-22. Nothing is local-only anymore, so a laptop dying or
a session crashing can't lose committed work.

To pick any branch back up on another machine:
```
git fetch origin
git checkout <branch-name>
```
