# TODOS

Roadmap captured from /office-hours (2026-10-04). V1 scope is the Client Work
Index (see `docs/designs/client-work-index.md`); everything below is deferred,
not forgotten.

## Now — Bayan Client Work Index (v1, from the design doc)

- [ ] **Write the outcome strip** — 3–5 "what changed for Bayan" items, each with the
      number + source, at the claims-gate bar. This is the critical path (P1). Blocks
      the top of the index.
- [ ] **Author `marketing-plans/bayan/bayan-manifest.md`** — one row per artifact:
      `path` · `title` · `category` · `status` · `one_line` · `outcome`. ~1–2 hrs.
- [ ] **Build the generator** (`portal/build.mjs`) → `portal/index.html` from the
      manifest.
- [ ] **Decide hosting** — GitHub Pages (private repo) vs Vercel random subdomain vs
      local+PDF fallback.
- [ ] **Publish + send the link** — rides with a real CEO send, not as a naked link.

## Next — Index & status layers (the deferred pains)

- [ ] **Workspace index layer** — a map of the whole workspace + status column, so
      "where does everything stand" is a glance, not a re-read. Feeds the manifest.
- [ ] **Readiness/status workflow** — formalize `drafted / ready / sent / approved` so
      showing work becomes a decision-by-glance instead of a deliberation.

## Later — Reuse & expansion

- [ ] **Per-client template** — generalize the manifest + generator into a reusable
      "client work index" for every AITransforms client, not just Bayan.
- [ ] **Gated web app with real auth** — ONLY if a client's confidentiality genuinely
      requires it (was Approach D in the design doc; correctly deferred for v1).