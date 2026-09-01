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
