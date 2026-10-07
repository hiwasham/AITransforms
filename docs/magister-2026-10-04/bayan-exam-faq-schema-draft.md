# Bayan — Exam Preparation FAQ + Schema (draft)

**Work item:** `a727bc1a` Draft an exam preparation FAQ · **Target:** GEO 71→90 (adds missing Q&A + schema)
**Type:** on-page FAQ block + valid FAQPage JSON-LD.
**Human-review note:** draft. Confirm every answer before publishing. No outcome guarantees.

---

## On-page FAQ block (visible copy)

**What is Bayan?**
Bayan is a clinician-built medical education platform for licensing, board, and clinical exam preparation — question banks, structured courses, OSCE stations, virtual patients, drug monographs, and calculators.

**Which exams does Bayan prepare me for?**
Bayan prepares candidates for Gulf Licensing Exam Preparation (including OMSB, delivered via Pearson VUE), Arab Board, OEN, SNLE, ABG clinical education, and 20+ regional exams.

**How many practice questions are there?**
5,589 clinician-reviewed questions, organized by exam with structured explanations. (Confirmed 2026-09-27.)

**Who writes the questions?**
Clinicians. Questions are clinician-authored and evidence-based. AI may assist with internal drafting, but all learner-facing content is owned and reviewed by clinicians.

**Which countries is Bayan used in?**
Candidates across 55+ countries use Bayan.

**Does Bayan guarantee I will pass my exam?**
No. Bayan does not guarantee passing any exam or passing on a first attempt. Exam outcomes depend on the individual candidate. Bayan provides structured preparation.

**Is Bayan only for doctors?**
No. Bayan serves physicians, nurses, and medical students — including nursing licensure candidates (OEN and SNLE).

**How do I start?**
Create an account and choose your exam, or explore exam preparation courses to see the study paths.

---

## FAQPage JSON-LD (schema)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Bayan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bayan is a clinician-built medical education platform for licensing, board, and clinical exam preparation — question banks, structured courses, OSCE stations, virtual patients, drug monographs, and calculators."
      }
    },
    {
      "@type": "Question",
      "name": "Which exams does Bayan prepare me for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bayan prepares candidates for Gulf Licensing Exam Preparation (including OMSB, delivered via Pearson VUE), Arab Board, OEN, SNLE, ABG clinical education, and 20+ regional exams."
      }
    },
    {
      "@type": "Question",
      "name": "How many practice questions are there?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "5,589 clinician-reviewed questions, organized by exam with structured explanations."
      }
    },
    {
      "@type": "Question",
      "name": "Who writes the questions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Clinicians. Questions are clinician-authored and evidence-based. AI may assist with internal drafting, but all learner-facing content is owned and reviewed by clinicians."
      }
    },
    {
      "@type": "Question",
      "name": "Which countries is Bayan used in?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Candidates across 55+ countries use Bayan."
      }
    },
    {
      "@type": "Question",
      "name": "Does Bayan guarantee I will pass my exam?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Bayan does not guarantee passing any exam or passing on a first attempt. Exam outcomes depend on the individual candidate. Bayan provides structured preparation."
      }
    },
    {
      "@type": "Question",
      "name": "Is Bayan only for doctors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Bayan serves physicians, nurses, and medical students — including nursing licensure candidates (OEN and SNLE)."
      }
    },
    {
      "@type": "Question",
      "name": "How do I start?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Create an account and choose your exam, or explore exam preparation courses to see the study paths."
      }
    }
  ]
}
```

---

## Implementation notes

1. The visible FAQ text and the JSON-LD `text` values must match — Google and AI engines flag mismatches.
2. Place the JSON-LD in a `<script type="application/ld+json">` tag in the page `<head>` or `<body>`.
3. Keep the "no guarantee" Q&A in — it protects against outcome-guarantee exposure while still ranking for the question.
4. Validate before shipping: Google Rich Results Test + Schema.org validator.