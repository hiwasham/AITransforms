# Prometric long-tail pages — Bayan (Days 0–30 item 3 + Days 31–60 item 4)

Ten page drafts targeting the **difficulty-0, near-zero-competition** Prometric
keyword cluster confirmed by DataForSEO (2026-09-28). Bayan currently ranks for
**0** commercial keywords, so these are the fastest wins available.

## The pages

**Authority pages (00–06)** — verified scope (physicians, nurses, students):

| File | Target keyword | Vol / Diff | Role |
|---|---|---|---|
| `00-…-HUB.md` | prometric exam questions | 90 / 0 | Hub — links to all authorities |
| `01-dha-…` | dha prometric exam questions | ~10–30 / 0 | Dubai |
| `02-scfhs-smle-…` | scfhs / smle prometric questions | ~10–30 / 0 | Saudi |
| `03-qchp-…` | qchp prometric exam questions | ~10–30 / 0 | Qatar |
| `04-nursing-…` | nursing prometric exam questions | ~10–30 / 0 | Nursing (strongest AI pathway) |
| `05-oman-moh-…` | oman moh prometric exam questions | ~10–30 / 0 | Oman (home market) |
| `06-nhra-…` | nhra prometric exam questions | ~10–30 / 0 | Bahrain |

**Profession pages (07–09)** — ⚠️ **SCOPE UNCONFIRMED, do not publish yet:**

| File | Target keyword | Vol / Diff | Scope risk |
|---|---|---|---|
| `07-pharmacist-…` | pharmacist prometric exam questions | ~10–30 / 0 | Pharmacist bank not confirmed |
| `08-physiotherapist-…` | physiotherapist prometric exam questions | ~10–30 / 0 | Physio bank not confirmed |
| `09-lab-technician-…` | lab technician prometric exam questions | ~10–30 / 0 | Lab-tech bank not confirmed |

**Why 07–09 are gated:** verified brand data covers physicians, nurses, and
students only. These allied-health pages are drafted and ready, but publishing
one before Bayan confirms that pathway exists would be an unsupported claim
(brand rule). Confirm the bank exists → then publish.

## Internal linking (do this — it's how the hub ranks)

- Hub links **down** to all four authority pages.
- Each authority page links **up** to the hub.
- Link each page from the existing Gulf licensing track page.

## Every page already follows the GEO fixes

- **BLUF** — first sentence answers "what is this / what does it cover".
- **FAQ** — each page's FAQ block feeds `faq-schema.jsonld` (add matching JSON-LD).
- **Meta** — front-matter `meta:` is ≤160 chars, ready for `<meta name="description">`.
- **Voice** — evidence-led, names the exam, **no pass guarantees** (brand rule).

## Before publishing (confirm — I could not verify these)

1. Each authority's exam scope claim is accurate for the current product.
2. The URL paths match live routes (adjust the `/…` links if different).
3. Nursing page: confirm OEN/SNLE/DHA-nursing/NCLEX-RN are all live.
4. **Pages 07–09 (pharmacist/physio/lab-tech): confirm each bank exists before
   publishing — verified scope is physicians/nurses/students only.**

## Verify after publishing

```
# pages resolve
for p in prometric-exam-questions dha-prometric-exam-questions \
  scfhs-smle-prometric-questions qchp-prometric-exam-questions \
  nursing-prometric-exam-questions oman-moh-prometric-exam-questions \
  nhra-prometric-exam-questions pharmacist-prometric-exam-questions \
  physiotherapist-prometric-exam-questions lab-technician-prometric-exam-questions; do
  curl -sSI "https://www.bayan.edu.om/$p" | head -1
done
```

Then track rank for "prometric exam questions" and re-run keyword_research in
~4–6 weeks to confirm movement (difficulty 0 means page 1 is realistic).
