# TPRS Books — BFV workstream handoff

**Branch:** `feature/tprsbooks` (dedicated TPRS line; Bayan work lives on `feature/proposl4byan`)
**Origin session:** `tprsBFVmail` → resume with `claude --resume "tprsBFVmail"` from `/root/projects/AITransformTPRS`
**Status:** deliverable built + merged to `main`; outreach email still a DRAFT, not sent.

## What was built (all committed, now in `main`)
- `docs/tprsbooks-value-first.html` — BFV hub ("A Week of Work, Built For You")
- `docs/assets/bfv.css` — shared dark-theme stylesheet
- `docs/deliverables/` — 8 build pages: berto-rebuild, comparison-guide,
  french-books-page, homepage-discovery-package, novice-fit-guidance,
  social-calendar, spanish-books-page, speed-set
- `docs/tprsbooks-discovery-audit.html` — the audit the builds came from

## Live
GitHub Pages (main/docs): https://hiwasham.github.io/AITransforms/tprsbooks-value-first.html

## Outreach
- `warm-outreach/emails/06-von-ray-tprsbooks.md` — v3, BFV-first. **DRAFT only.**

## STOP points (do not cross without Hiwa's explicit OK)
- Do NOT replace the `{{BFV_URL}}` placeholder in the email.
- Do NOT send any email.
- Do NOT deploy to Vercel (Pages is the chosen channel; Hiwa rejected the tailscale link).
- Do NOT access Magister.

## Recovery
Old branch preserved as tag `archive/von-bfv-v2` (`git switch -c tmp archive/von-bfv-v2` to inspect).
