# Bayan — BLUF + Meta Fixes (draft)

**Work item:** `2d8224b8` Draft BLUF and meta fixes · **Target:** GEO 71→90 (fixes 301-char meta, missing BLUF, missing noscript)
**Type:** copy fixes for existing pages + a crawl fallback.
**Human-review note:** draft. Confirm final copy before shipping. No outcome guarantees.

---

## Fix 1 — Meta descriptions (301 chars → 50–160)

Current homepage meta description is ~301 characters and gets truncated. Replace with compliant versions.

| Page | Meta title (≤60) | Meta description (≤160) |
|---|---|---|
| Home | Bayan — Medical Exam Preparation & Question Banks | Clinician-built medical exam prep: 5,589 reviewed questions, courses, OSCEs, and clinical tools for Gulf licensing and board exams. |
| Gulf licensing | Gulf Licensing Exam Preparation — Bayan | Prepare for Gulf medical licensing exams with structured, clinician-reviewed questions and study paths. Explore exam preparation. |
| ABG course | ABG Interpretation Course — Bayan | Learn a step-by-step arterial blood gas method and practise with clinician-reviewed questions. For Gulf licensing and board exams. |
| Question banks | Medical Question Banks — Bayan | 5,589 clinician-reviewed practice questions across 20+ exams, organized by exam with structured explanations. |
| OMSB prep | OMSB Exam Preparation — Bayan | Structured OMSB preparation with clinician-reviewed questions and explanations. Delivered via Pearson VUE. |
| Arab Board prep | Arab Board Exam Preparation — Bayan | Arab Board specialty exam preparation with clinician-reviewed question banks and structured explanations. |
| OEN prep | OEN (Oman Nurse) Exam Preparation — Bayan | OEN nursing licensure preparation with clinician-reviewed questions and timed practice across core domains. |
| SNLE prep | SNLE (Saudi Nurse) Exam Preparation — Bayan | SNLE nursing licensure preparation with clinician-reviewed questions and timed practice across core domains. |

*(Verify each against the live route map. Keep the char counts within limits at final edit.)*

---

## Fix 2 — BLUF openings (currently ~25% of pages have one)

Add a bottom-line-up-front sentence as the first visible paragraph on each key page. Template:

> **[Direct answer sentence — the plain answer to the page's question.] [One sentence of support with a verified fact.]**

Examples:

- **Home:** "Bayan is a clinician-built platform for medical exam preparation, with 5,589 reviewed questions and courses for Gulf licensing and board exams."
- **Question banks:** "Bayan's question banks give you 5,589 clinician-reviewed questions across 20+ exams, each with a structured explanation."
- **ABG course:** "Arterial blood gas interpretation is a core clinical skill; Bayan's ABG course teaches a repeatable method and lets you practise it."

Rule: the first 40 words must answer the page's core question without the reader scrolling. Answer engines quote this block.

---

## Fix 3 — noscript fallback

Where the site renders content client-side, search and AI crawlers that skip JS may see an empty page. Add a `<noscript>` block to key pages with the core text.

```html
<noscript>
  <h1>Bayan — Medical Exam Preparation</h1>
  <p>Bayan is a clinician-built medical education platform with 5,589 clinician-reviewed
  practice questions for Gulf licensing and board exams. It serves physicians, nurses,
  and medical students across 55+ countries. Explore exam preparation courses and
  question banks at /get-started.</p>
  <ul>
    <li>Gulf Licensing Exam Preparation</li>
    <li>OMSB preparation (via Pearson VUE)</li>
    <li>Arab Board preparation</li>
    <li>OEN and SNLE nursing licensure</li>
    <li>ABG clinical course</li>
  </ul>
</noscript>
```

---

## Fix 4 — Heading hygiene (quick pass)

- One `<h1>` per page; page `<h1>` states the answer topic, not the brand alone.
- Logical `<h2>`/`<h3>` nesting; no skipped levels.
- Every image has a descriptive `alt` naming the topic.

---

## Verification checklist before shipping

- [ ] All meta descriptions 50–160 chars (count them).
- [ ] Every key page has a BLUF first paragraph.
- [ ] noscript present on client-rendered routes.
- [ ] One h1 per page; alts on all images.
- [ ] Re-run the GEO/AEO audit after ship to confirm 71→90 movement.