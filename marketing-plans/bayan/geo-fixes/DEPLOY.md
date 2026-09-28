# Bayan GEO fixes — deployment guide

Six ready-to-deploy artifacts that clear the GEO/AEO audit failures for
**https://www.bayan.edu.om/**. All content is grounded in Bayan's verified brand
profile and audit (Magister, 2026-09-28). No pass guarantees, evidence-led voice.

**Status:** drafted, not deployed. Applying these to the live site needs file or
template access to bayan.edu.om (or its CMS). I don't have that access from here,
and deploying is an outward-facing change — so these are handoff artifacts for
whoever controls the site. Confirm every factual claim and every URL path against
the live product before publishing.

## The six fixes

| # | Audit failure | File | Where it goes |
|---|---|---|---|
| 1 | `llms.txt` missing | `llms.txt` | Served at `https://www.bayan.edu.om/llms.txt` |
| 2 | `llms-full.txt` missing | `llms-full.txt` | Served at `https://www.bayan.edu.om/llms-full.txt` |
| 3 | FAQ schema missing | `faq-schema.jsonld` | `<script>` in `<head>` of homepage + pathway pages |
| 4 | Meta description 301 chars | `meta-description.md` | Replace `<meta name="description">` per page |
| 5 | BLUF < 25% | `bluf-homepage-rewrite.md` | Rewrite page/section opening sentences |
| 6 | `noscript` missing | `noscript-fallback.html` | `<noscript>` block inside `<body>` |

## Step-by-step

1. **llms.txt / llms-full.txt** — upload both to the web root so they resolve at
   the domain root. Static files; no build step. Fix the pathway URLs inside them
   to point at real routes (they currently point at the homepage as a safe
   placeholder).
2. **FAQ schema** — paste the `<script type="application/ld+json">` block into
   `<head>`. Only keep Q&As whose answers are also visible in the page text
   (Google requires the visible copy to match the schema).
3. **Meta descriptions** — swap the homepage description for the 155-char version;
   add the per-pathway descriptions.
4. **BLUF** — apply the answer-first rewrites to the homepage hero and each
   pathway section; then sweep the top 10 pages using the checklist.
5. **noscript** — insert the block right after `<body>`; correct the href paths.

## Verify (after deploy)

```
# 1–2: files resolve
curl -sSI https://www.bayan.edu.om/llms.txt | head -1        # expect 200
curl -sSI https://www.bayan.edu.om/llms-full.txt | head -1   # expect 200

# 3: FAQ schema valid — paste page URL into
#    https://search.google.com/test/rich-results

# 4: meta length
curl -s https://www.bayan.edu.om/ | grep -o '<meta name="description"[^>]*>'
#    confirm content ≤160 chars

# 6: noscript present in raw HTML
curl -s https://www.bayan.edu.om/ | grep -c '<noscript'      # expect ≥1
```

Then re-run the Magister AEO audit and compare against the 2026-09-28 baseline
(GEO 71/100). The six checks above should flip to pass, and the projected
website-and-content subscore moves toward 100.

## Order of effort

Fixes 1, 2, 4, 6 are quick static/head edits (hours). Fix 3 needs matching
visible copy. Fix 5 (BLUF) is the largest — start with the homepage and the four
pathway pages, then extend.
