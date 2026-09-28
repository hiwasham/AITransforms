# GEO fix #4 — Meta description (currently 301 chars → too long)

**Problem (from audit):** the homepage meta description is 301 characters. Google
truncates around 155–160; anything past that is wasted and can read as keyword
stuffing to AI answer engines.

**Fix:** replace the current homepage `<meta name="description">` with the line
below (147 chars), and add page-specific descriptions to the pathway pages.

## Homepage (147 chars)

```html
<meta name="description" content="Clinician-built exam prep for Gulf licensing, board, and nursing exams — question banks, OSCEs, drug monographs and courses reviewed by physicians.">
```

## Pathway pages (each ≤160 chars)

**Gulf licensing / Prometric**
```html
<meta name="description" content="Prometric exam prep for DHA, MOH, SCFHS/SMLE, QCHP, OMSB and NHRA — blueprint-mapped, clinician-reviewed question banks and clinical cases.">
```

**Nursing**
```html
<meta name="description" content="Nursing exam prep for OEN, SNLE, DHA nursing and NCLEX-RN — clinician-reviewed questions with rationales and structured progression.">
```

**Postgraduate / board**
```html
<meta name="description" content="Board exam prep for residents and postgraduate physicians — adaptive, blueprint-aligned question banks, clinical cases and OSCE practice.">
```

**Medical students**
```html
<meta name="description" content="Preclinical and clinical question banks and structured courses for medical students — clinician-reviewed, with flashcards and spaced repetition.">
```

## Verify

- View source on each page; confirm the description length is ≤160 characters.
- Re-run the Magister AEO audit; the "meta description length" check should pass.
