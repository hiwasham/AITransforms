# Current Marketing Plan

<!-- Managed by Magister. Do not edit. The gateway rewrites this snapshot from the live plan. -->

_Last refreshed: 2026-09-26T17:08:17.782155+00:00_

Status: active
Version: 1
Source audit: audits/2026-09-23-222353-light-audit.md
Audit history: audits/
Objective: Increase AI and search discoverability, then improve activation, referral readiness, and revenue-path clarity for Bayan's medical exam-preparation platform.
Primary focus: AI visibility
Secondary focuses: GEO, SEO
Execution style: Top-down, evidence-scaled, draft-first, and approval-gated.
Autonomy level: Autonomous execution of ready tasks with approval gates for publication, deployment, and manual decisions.
Constraints: Use only cited audit evidence; do not infer rankings, competitors, pricing, outcomes, or unsupported product claims., Paid tasks are not active because the monthly paid-media cap is 0 cents and paid spend is not allowed., Retention is unsupported by the evidence and remains an explicit roadmap gap., Publish, deploy, or distribute only through the approval specified on each task.
Website platform: Next.js hosted on Vercel (high confidence)

## Summary

The biggest lever is turning Bayan's educational depth into direct, evidence-backed answer pages and AI-readable guidance, addressing 0/3 AI mentions and the 0/10 Google top-100 baseline before scaling distribution.

## Audit overview

**Health:** The overall health score is 25→54 (+29), with AI search at 10→42, Google Search at 0→28, and website/content at 73→100. [health.summary]
**SEO:** Google Search is 0→28, with 0 of 10 target searches in the top 100 and cited volumes reaching 170 and 110 monthly searches. [channel.google_search.scores] [channel.google_search.framing] [google_search.keyword.3] [google_search.keyword.4]
**AI visibility:** AI probes mention Edu in 0/3 prompts and cite it in 1/3, while Claude missed ABG, Gulf question-bank, and OMSB answers. [ai_visibility.summary] [ai_visibility.probe.0] [ai_visibility.probe.1] [ai_visibility.probe.2]
**GEO:** GEO is 71→90 (+19), but llms files, FAQ/Q&A, BLUF answers, and a compliant meta description are missing. [channel.geo.scores] [channel.geo.audit_checks]
**Site & content:** The site has 60 discovered pages and passing CTA, schema, hierarchy, H1, mobile viewport, and metadata checks, but mobile Lighthouse performance is 71/100 with approximately 780ms redirects and 600ms unused JavaScript opportunities. [channel.website_and_content.framing] [website_and_content.checklist.0] [website_and_content.checklist.1] [website_and_content.checklist.2] [website_and_content.checklist.3] [website_and_content.checklist.4] [website_and_content.checklist.5] [channel.google_search.web_vitals]
**Opportunity:** Direct-answer ABG and Gulf-exam pages, AI guidance files,...

## Brand

Bayan is a clinician-built medical education platform helping physicians, nurses, and medical students prepare for licensing, board, and clinical examinations through evidence-based questions, structured courses, and practical learning tools. It combines exam-focused preparation with applied clinical practice, including OSCE stations, virtual patients, drug monographs, and calculators.
Voice: evidence-led, structured, clinical, practical, encouraging
Ideal customer: Bayan is for healthcare learners and professionals preparing for licensing, board, and clinical examinations who want structured, clinically relevant preparation rather than an unorganized question bank. It particularly serves medical students, postgraduate physicians, nurses, and candidates for Gulf licensing exams.
Positioning: Bayan gives physicians, nurses, and medical students a clinician-built, evidence-based platform for exam preparation and clinical learning, combining structured question banks with courses, OSCEs, virtual patients, drug references, calculators, and spaced-repetition tools.

## Answer high-value AI questions

AI probes found 0/3 mentions and missed ABG, Gulf question-bank, and OMSB questions, so answer pages can address the largest visibility failure first. [ai_visibility.summary] [channel.ai_search.findings]

## Make Bayan AI-readable

The GEO audit found no llms files or FAQ/Q&A and no BLUF opening, directly limiting AI quoting despite a 71→90 GEO opportunity. [channel.geo.scores] [channel.geo.audit_checks]

## Build the SEO demand map

Edu is outside the top 100 for all 10 target searches, including 170- and 110-volume terms, so structured SEO targeting is the next acquisition layer. [channel.google_search.framing] [google_search.keyword.3] [google_search.keyword.4]

## Improve activation performance

A 71/100 mobile performance score, approximately 780ms of redirects, approximately 600ms of unused JavaScript, and broad homepage messaging can weaken activation. [channel.google_search.web_vitals] [channel.website_and_content.framing]

## Activate referral distribution

X and Telegram are present but have no stated posting rhythm or exam-specific social offer, leaving a supported referral channel underused. [social.inventory] [channel.social.framing]

## Clarify the revenue path

The site has a Get started CTA and promotes preparation for 20+ exams, but broad messaging may weaken sign-ups, so audit the revenue path before changing offers. [website_and_content.checklist.0] [channel.ads.framing] [channel.website_and_content.framing]

## Open questions

- Budget: What monthly paid-media budget, if any, should replace the current zero-cap policy?
- Unit economics: What are the baseline conversion, revenue, margin, and customer-value figures needed to prioritize Revenue work?
- Sequencing: If execution capacity is constrained, should AI answer pages, GEO files and FAQ, SEO mapping, performance work, social distribution, or the revenue-path audit take precedence?

## Active Plan Items

- [waiting_approval] Answer the ABG course question due 2026-09-23T22:26:17.529094+00:00
  - phase=today; stage=Acquisition; channel=AI visibility; workflow=landing-page-copy; chat_session_id=48d8d958-649c-4fd8-a67b-4c3d10c816e2; approval=publish; blocked=Approval is required before this item can be completed. A team member approves it in this task's chat or on the Plan tab with "Approve & complete" (or sends it back with "Reopen"...
  - prompt: Inspect the existing site and approved course materials for the ABG offering. Draft one direct-answer page covering the certificate, clinical cases, intended learners, format, and what learners can do after completion; do not invent missing details and flag gaps.
  - expected impact: Supports AI-search score moving from 10 toward projected 42 and addresses the ABG probe's no-mention, no-citation baseline.
  - evidence channel.ai_search.opportunity.0: Answer the ABG course question on one page — State the certificate, clinical-case experience, intended learners, format, and what learners can do after completing the course.
  - evidence ai_visibility.probe.0: claude: ABG interpretation course with certificate and clinical cases — mentioned=no; cited=no
  - evidence channel.ai_search.finding.1: The ABG course is not being matched to its key benefits — A search specifically asking for a certificate and clinical cases did not surface Edu, so those course benefits are not r...
- [running] Publish a Gulf exam guide due 2026-09-24T22:26:17.529094+00:00
  - phase=tomorrow; stage=Acquisition; channel=AI visibility; workflow=blog-post; chat_session_id=c921c81c-249e-4e18-96ca-8ba5c74fa0f7; approval=publish
  - prompt: Create an honest Gulf licensing question-bank guide using verified Bayan information. Compare only the named exam coverage, explain where Bayan fits using supported facts, and identify unknowns rather than making comparative or effectiveness claims.
  - expected impact: Supports AI-search score moving from 10 toward projected 42 and addresses the Gulf prompt's no-mention, no-citation baseline.
  - evidence channel.ai_search.opportunity.1: Publish a Gulf licensing question-bank guide — Create an honest comparison covering OMSB, Arab Board, Prometric, OEN, SNLE, and other relevant exams, then explain where Edu fits.
  - evidence ai_visibility.probe.1: claude: Best question banks for Gulf medical licensing exams — mentioned=no; cited=no
  - evidence channel.ai_search.finding.2: Gulf exam coverage is not visible enough — Edu was not mentioned for question banks covering Gulf licensing exams, leaving learners without a clear reason to choose Edu for their...
- [planned] Assemble OMSB effectiveness proof due 2026-09-26T22:26:17.529094+00:00
  - phase=this_week; stage=Acquisition; channel=AI visibility; workflow=landing-page-copy; approval=publish
  - prompt: Audit the site for public learner experiences, outcomes, or clear value explanations tied to OMSB preparation. Draft a proof section only from verified evidence and list missing proof instead of inferring effectiveness.
  - expected impact: Addresses the OMSB probe's 0/3 mention baseline while preserving its existing 1/3 citation and avoiding unsupported effectiveness claims.
  - evidence channel.ai_search.finding.3: Bayan has no discoverable effectiveness proof — Claude did not connect Bayan with an answer about OMSB preparation, so public results, learner experiences, or a clear explanation...
  - evidence ai_visibility.probe.2: claude: How effective is Bayan for OMSB exam prep — mentioned=no; cited=yes
  - evidence channel.ai_search.opportunity.1: Publish a Gulf licensing question-bank guide — Create an honest comparison covering OMSB, Arab Board, Prometric, OEN, SNLE, and other relevant exams, then explain where Edu fits.
- [ready] Create AI guidance files due 2026-09-23T22:26:17.529094+00:00
  - phase=today; stage=Acquisition; channel=GEO; workflow=ai-search-optimization; approval=publish
  - prompt: Create llms.txt and llms-full.txt for Bayan using verified information about its purpose, medical exam-preparation offerings, audiences, important pages, and contact details. Validate that both files are accurate before requesting publication.
  - expected impact: Supports GEO moving from 71 toward 90 by fixing the missing AI guidance files.
  - evidence channel.geo.finding.0: No guidance file for AI tools — Edu has no llms.txt or llms-full.txt file, so AI tools get no preferred summary of its medical education platform, audiences, or key pages.
  - evidence channel.geo.opportunity.0: Create clear AI guidance files — Add llms.txt and llms-full.txt with Edu’s purpose, board exam preparation offerings, audience, important pages, and accurate contact details.
  - evidence channel.geo.audit_checks: llms.txt — No llms.txt file found. This file tells AI models about your site's purpose and preferred content. llms-full.txt — No llms-full.txt found. This extended file provides d...
- [planned] Add exam-prep FAQ answers due 2026-09-24T22:26:17.529094+00:00
  - phase=tomorrow; stage=Activation; channel=GEO; workflow=schema-markup-audit; approval=publish
  - prompt: Draft an Edu-specific FAQ covering exam preparation, courses, users, subjects, how the platform works, and getting started. Use verified site facts only, then prepare matching FAQ markup for validation and approval.
  - expected impact: Supports GEO moving from 71 toward 90 by fixing the missing FAQ and direct-answer content.
  - evidence channel.geo.finding.1: No question-and-answer content — The site has no FAQ section or matching markup. Clear answers about board exam preparation, courses, users, and outcomes would give AI tools usefu...
  - evidence channel.geo.opportunity.1: Publish an Edu-specific FAQ — Answer common questions from physicians, nurses, and students about exam preparation, available subjects, how the platform works, and getting started.
  - evidence channel.geo.audit_checks: llms.txt — No llms.txt file found. This file tells AI models about your site's purpose and preferred content. llms-full.txt — No llms-full.txt found. This extended file provides d...
- [planned] Rewrite direct opening and description due 2026-09-26T22:26:17.529094+00:00
  - phase=this_week; stage=Activation; channel=GEO; workflow=landing-page-copy; approval=publish
  - prompt: Draft a BLUF opening that clearly states what Bayan offers and who it helps, a 50–160 character meta description, and a noscript fallback using verified site facts. Keep all changes approval-gated.
  - expected impact: Addresses the 301-character description, missing BLUF, and missing noscript findings supporting GEO's projected 90 score.
  - evidence channel.geo.finding.2: The page does not answer visitors quickly enough — The opening lacks a short, direct explanation of what Edu offers and who it helps. Visitors and AI tools must work harder to und...
  - evidence channel.geo.finding.3: Search description is too long — The description is 301 characters, while 50–160 is recommended. Search results may cut off the most important explanation and call to action.
  - evidence channel.geo.audit_checks: llms.txt — No llms.txt file found. This file tells AI models about your site's purpose and preferred content. llms-full.txt — No llms-full.txt found. This extended file provides d...
- [ready] Map all target search pages due 2026-09-23T22:26:17.529094+00:00
  - phase=today; stage=Acquisition; channel=SEO; workflow=seo-page-map-url-structure-planner-dataforseo; approval=manual
  - prompt: Build a prioritized SEO page map for all 10 audited searches. Record each query, cited volume, current ranking status, intended page type, and evidence-safe content angle without asserting competitor rankings or inventing URLs.
  - expected impact: Prioritizes currently unranked demand, led by 170- and 110-monthly-search terms, against the 0/10 top-100 baseline.
  - evidence channel.google_search.framing: Edu ranks in the top 100 for 0 of 10 target searches, including terms with up to 170 monthly searches.
  - evidence google_search.keyword.0: Keyword "medical board exam prep" — volume 40; not ranking.
  - evidence google_search.keyword.1: Keyword "medical exam question bank" — volume 10; not ranking.
- [planned] Draft highest-volume SEO briefs due 2026-09-26T22:26:17.529094+00:00
  - phase=this_week; stage=Acquisition; channel=SEO; workflow=blog-post; approval=publish
  - prompt: Draft evidence-safe content briefs for the 170-volume "usmle question bank" query and the 110-volume "arab board exam questions" query. Do not claim rankings, competitor positions, or product features that are not verified.
  - expected impact: Creates content plans for the 170- and 110-monthly-search queries, totaling 280 cited monthly searches, where both queries currently lack top-100 visibility against the 0/10 baseline.
  - evidence google_search.keyword.3: Keyword "usmle question bank" — volume 170; not ranking.
  - evidence google_search.keyword.4: Keyword "arab board exam questions" — volume 110; not ranking.
  - evidence channel.google_search.framing: Edu ranks in the top 100 for 0 of 10 target searches, including terms with up to 170 monthly searches.
- [ready] Prepare mobile performance fixes due 2026-09-23T22:26:17.529094+00:00
  - phase=today; stage=Activation; channel=Website & content; workflow=seo-site-audit; approval=manual
  - prompt: Audit the mobile experience and prepare a safe change set for the cited redirect and unused-JavaScript opportunities. Inspect the Vercel deployment context, validate the changes, and do not deploy without approval.
  - expected impact: Addresses the 71/100 mobile baseline and the cited approximately 780ms redirect and 600ms unused-JavaScript opportunities.
  - evidence channel.google_search.web_vitals: Lab Lighthouse (mobile): performance 71/100, SEO 92/100 Speed opportunity: Avoid multiple page redirects (~780ms) Speed opportunity: Reduce unused JavaScript (~600ms)
  - evidence website_and_content.checklist.6: Page speed — Lighthouse performance 71/100 (lab; no real-user field data for this site yet). — status=fail
  - evidence site.platform: Detected site platform: vercel
- [planned] Draft focused homepage messaging due 2026-09-26T22:26:17.529094+00:00
  - phase=this_week; stage=Activation; channel=Website & content; workflow=landing-page-copy; approval=publish
  - prompt: Review the existing homepage H1 and Get started CTA, then draft focused messaging that clarifies Bayan's audience, medical exam-preparation value, and next step. Preserve verified claims and keep publication approval-gated.
  - expected impact: Addresses broad homepage messaging risk while preserving the existing Get started CTA and passing H1 check.
  - evidence channel.website_and_content.framing: Bayan has strong educational depth across 60 discovered pages, but slow mobile loading and broad homepage messaging may weaken sign-ups.
  - evidence website_and_content.checklist.0: Clear call to action — Found: Get started — status=pass
  - evidence website_and_content.checklist.3: Hero section — Primary H1: Medical Education Platform — Board Exam Prep for Physicians, Nurses & Students — status=pass
- [ready] Create X and Telegram content calendar due 2026-09-26T22:26:17.529094+00:00
  - phase=this_week; stage=Referral; channel=Social media; workflow=social-content-calendar; approval=publish
  - prompt: Create a social content calendar for Bayan's existing X and Telegram profiles using verified exam-preparation answers, course information, and approved pages. Define a proposed rhythm without claiming that a current rhythm exists.
  - expected impact: Addresses the missing social rhythm and exam-specific offer against the social score baseline of 44 and projected 69.
  - evidence social.inventory: [{"platform": "x", "url": "https://x.com/Medresearch_om"}, {"platform": "telegram", "url": "https://t.me/BayanMedEd"}]
  - evidence channel.social.framing: Bayan visibly links to X (@Medresearch_om) and Telegram (BayanMedEd), with no stated posting rhythm or exam-specific social offer.
  - evidence channel.ai_search.opportunities: Answer the ABG course question on one page — State the certificate, clinical-case experience, intended learners, format, and what learners can do after completing the course. Publ...
- [planned] Draft referral-ready answer snippets due 2026-10-07T22:26:17.529094+00:00
  - phase=this_month; stage=Referral; channel=Social media; workflow=social-content-calendar; approval=publish
  - prompt: Draft concise X and Telegram snippets that point learners to approved ABG, Gulf-exam, FAQ, or homepage answer content. Keep each snippet evidence-backed and leave links as placeholders until the destination is approved.
  - expected impact: Extends approved answer content into X and Telegram, addressing the absence of an exam-specific social offer.
  - evidence social.inventory: [{"platform": "x", "url": "https://x.com/Medresearch_om"}, {"platform": "telegram", "url": "https://t.me/BayanMedEd"}]
  - evidence channel.social.framing: Bayan visibly links to X (@Medresearch_om) and Telegram (BayanMedEd), with no stated posting rhythm or exam-specific social offer.
  - evidence channel.ai_search.opportunities: Answer the ABG course question on one page — State the certificate, clinical-case experience, intended learners, format, and what learners can do after completing the course. Publ...
- [ready] Audit the revenue conversion path due 2026-09-23T22:26:17.529094+00:00
  - phase=today; stage=Revenue; channel=Website & content; workflow=cro-audit; approval=manual
  - prompt: Trace the current Get started path from the homepage through available exam-preparation offer or signup pages. Record friction, missing proof, unclear audience fit, and CTA handoffs without changing prices or claiming conversion improvements.
  - expected impact: Clarifies the purchase path for preparation across 20+ exams while preserving the existing CTA and avoiding unsupported pricing claims.
  - evidence website_and_content.checklist.0: Clear call to action — Found: Get started — status=pass
  - evidence channel.ads.framing: Edu has X and Telegram profiles, while its site promotes preparation for 20+ medical exams worldwide.
  - evidence channel.website_and_content.framing: Bayan has strong educational depth across 60 discovered pages, but slow mobile loading and broad homepage messaging may weaken sign-ups.
- [planned] Draft exam-specific conversion brief due 2026-09-26T22:26:17.529094+00:00
  - phase=this_week; stage=Revenue; channel=Website & content; workflow=landing-page-copy; approval=publish
  - prompt: Using the revenue-path audit and verified site content, draft an exam-specific landing-page brief with audience, supported preparation scope, verified proof, CTA treatment, and required content gaps. Do not add pricing or unsupported outcomes.
  - expected impact: Makes the existing Get started path more relevant to 20+ exam preparation; pricing and unit-economic impact remain unquantified.
  - evidence channel.ads.framing: Edu has X and Telegram profiles, while its site promotes preparation for 20+ medical exams worldwide.
  - evidence brand.profile: {"essence": "Bayan is a clinician-built medical education platform helping physicians, nurses, and medical students prepare for licensing, board, and clinical examinations through...
  - evidence website_and_content.checklist.0: Clear call to action — Found: Get started — status=pass

## Recent Plan Activity

- 2026-09-26T17:08:11.857715+00:00 [item_started] item=258bb9bd-50c2-4f05-bfea-2f2dcefcb65b: Plan item started.
- 2026-09-26T14:54:51.576658+00:00 [item_waiting_approval] item=4144724f-eb0e-4c9d-a006-b9db97599f17: Plan item moved to waiting approval before completion.
- 2026-09-26T14:52:45.206766+00:00 [item_started] item=4144724f-eb0e-4c9d-a006-b9db97599f17: Plan item started.
- 2026-09-26T14:52:03.669846+00:00 [item_started] item=4144724f-eb0e-4c9d-a006-b9db97599f17: Plan item started.
- 2026-09-23T22:26:19.33575+00:00 [metric_baseline_captured]: Impact baselines captured for measurable plan items.
- 2026-09-23T22:26:18.963416+00:00 [plan_created]: Live marketing plan created from audit evidence.
