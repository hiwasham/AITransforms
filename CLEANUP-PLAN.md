# Branch Cleanup Plan — do this on the laptop (VS Code)

You picked: resolve on laptop with VS Code's 3-way merge editor. Right call —
these branches conflict by the hundreds, and CLI conflict-reading is painful.
This doc is your checklist. Open it in VS Code and work top to bottom.

## Step 0 — get everything (2 min) : DONE

```bash
git fetch --all --prune
git checkout feature/bayan-marketing-plan
git pull
code .
```

All 7 branches are on GitHub. Only exception: `feature/warm-gift-outreach` has
3 local-only commits (they hold secrets — see the ⚠️ row). Everything else is synced.

## The reality (why we are NOT doing "merge all")

`main` is stale. Every feature branch diverged from it and from each other. Merging
them all blindly = 200+ conflicts and a broken main. So we integrate **deliberately,
easiest first**, and some branches should NOT be merged whole.

| Order | Branch | Conflicts | What it really is | Action |
|---|---|---|---|---|
| 1 | feature/dashboard-login-origin-fix | 0 | 1 commit, 2 files — browser login hotfix | merge whole |
| 2 | chore/recovery-docs-consolidation | 1 | docs → mkdocs site (15 files) | merge, fix 1 conflict |
| 3 | feature/daily100openclawoutreach | 12 | first-100 operator outreach workflow | merge, resolve 12 |
| 4 | feature/002-operator-review-dashboard | 81 | operator review dashboard (148 files) | merge, resolve 81 |
| 5 | feature/audit-page-clone-preplan-…113248Z | 144 | audit page clone + deploy runbook (189 files) | merge last, heaviest |
| — | feature/bayan-marketing-plan | 0 | see note ⬇️ — do NOT merge whole | cherry-pick 4 files |
| — | feature/warm-gift-outreach | 0 | ⚠️ SECRETS — do NOT merge | extract clean work only |

### ⬇️ bayan-marketing-plan — cherry-pick, don't merge whole
It shows "0 conflicts / 649 files" but 620 of those are agent/tooling config
(`.agents`, `agent`, `.claude`, `.specify`) that just never existed on main.
The real deliverable is **4 files** under `marketing-plans/`. Don't dump 620
config files onto main. Instead, once the marketing plan is finished, copy just
`marketing-plans/bayan/**` where you want it.

### ⚠️ warm-gift-outreach — never merge as-is
3 local commits contain raw session transcripts with echoed secrets
(`e13f65d claude-sessions`). Its real feature work is already on remote at an
earlier commit. If you need the deliverable, tell me and I'll extract the
non-secret files into a fresh clean commit. Do not `git push` this branch.

## Per-branch merge commands (run on the laptop, in order 1→5)

```bash
git checkout main
git pull

# 1 — trivial
git merge feature/dashboard-login-origin-fix
# 2 — one conflict; VS Code shows it, pick a side, then:
git merge chore/recovery-docs-consolidation
# 3, 4, 5 — heavier; use the VS Code merge editor for each conflict
git merge feature/daily100openclawoutreach
git merge feature/002-operator-review-dashboard
git merge feature/audit-page-clone-preplan-20260731T113248Z
```

After each merge: `npm run lint && npx tsc --noEmit && npm run test && npm run build`
(from CLAUDE.md). Only push main once it's green: `git push origin main`.

Delete a branch **only after** it's merged and pushed:
```bash
git branch -d <branch>            # local (safe: refuses if unmerged)
git push origin --delete <branch> # remote
```

## Still outstanding (human-only)

- 🔑 **Rotate the Corey Ganim / Skool password.** `corey-creds.md` was committed to
  the private remote's history (commit `eeb41e9`) before we untracked it. Untracking
  doesn't un-leak history. Rotate the password; that closes it.
</parameter>
</invoke>
