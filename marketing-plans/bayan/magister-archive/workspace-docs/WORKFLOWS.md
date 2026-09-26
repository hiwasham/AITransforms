# Workflows configured for this project

<!-- Managed by Magister. Do not edit. Next regen overwrites any edits. -->

## Active

- **Social Content Calendar** — `id=434795b7-7d81-4b1e-8d65-3616c90b136d` (fork of template `social-content-calendar`)
  - Last run: never
  - Schedule: none (on-demand)
  - Inputs: brand_name=Edu, topic_focus=Medical board exam preparation, Gulf licensing question banks, OMSB preparation, and ABG clinical education (required: platforms — not yet set)
  - Status: ⚠ needs configuration

- **AI Search Optimization** — `id=ccba5b3a-81c6-4949-96fc-72ad6fda967d` (fork of template `ai-search-optimization`)
  - Last run: never
  - Schedule: none (on-demand)
  - Inputs: website_url=https://bayan.edu.om/, target_topics=ABG courses, Gulf medical licensing question banks, OMSB preparation, Arab Board preparation, Prometric preparation, OEN and SNLE exam preparation
  - Status: ✓ ready to run

## Available templates (not yet forked)
- `monthly-marketing-report` — Summarize traffic, conversions, and KPIs into an executive marketing report.
- `posthog-funnel-analysis` — Identify the biggest drop-off in your PostHog funnel and get CRO recommendations.
- `blog-post` — Research, write, and format an SEO-optimized blog post targeting a specific keyword.
- `product-launch-campaign` — Coordinate a blog post, social content, email, and ad copy for a product launch.
- `wordpress-blog-publisher` — Write an SEO-optimized post and publish it directly to WordPress.
- `landing-page-copy` — Write a full landing page from hero to final CTA, optimized for conversion.
- `marketing-psychology-copy-review` — Apply psychological triggers to existing copy to reduce friction and increase trust.
- `ab-test-design` — Design a structured A/B test with clear variants, hypothesis, and measurement plan.
- `cro-audit` — Audit a page for conversion friction and rewrite key sections to lift conversion rate.
- `email-newsletter` — Draft a newsletter from recent content with subject line variants and a clear CTA.
- `kit-email-campaign` — Draft, configure, and schedule an email campaign to a segment in Kit.
- `lead-nurture-sequence` — Write a 5-email nurture sequence guiding leads from awareness to conversion.
- `free-tool-strategy` — Brainstorm, evaluate, and spec a free tool that drives traffic and qualified leads.
- `audit-refresh-loop` — Runs weekly by default. Refreshes the marketing audit and score snapshots, then queues live-plan recompilation from fresh evidence.
- `plan-execution-loop` — Runs weekly by default. Claims due marketing-plan tasks and launches child workflow runs. Briefs and analytics then report on the work and impact.
- `impact-checkpoint-loop` — Runs weekly by default. Captures impact checkpoints for completed measurable plan items and updates plan impact status.
- `default-brief-orchestrator` — Synthesizes findings, chooses today's actions, and emails the configured recipients. Run it now or manage its user-local 8am schedule in Briefs.
- `tracker-checkins-weekly` — Runs once a week. Iterates all active experiment trackers on the project, gathers current metric values, computes deltas vs baseline, and writes a check-in row. Feeds progression data into /analytics?tab=trackers and the daily-brief orchestrator.
- `apollo-prospect-list` — Build an enriched prospect list in Apollo matching your ICP criteria.
- `cold-outreach-campaign` — Write a 5-step cold email sequence tailored to your ICP and value proposition.
- `instantly-outreach-campaign` — Write and launch a personalized cold email sequence in Instantly.
- `ad-copy-generation` — Generate headlines, descriptions, and copy variants for paid ad campaigns.
- `google-ads-performance-review` — Identify wasted spend in Google Ads and write new copy for underperforming campaigns.
- `competitor-analysis` — Research competitor positioning, content, and SEO to identify differentiation opportunities.
- `churn-prevention-campaign` — Write a cancellation flow, save offers, and win-back sequence for at-risk users.
- `hubspot-pipeline-review` — Analyze HubSpot pipeline stage conversions and write nurture recommendations.
- `ahrefs-keyword-research` — Pull keyword data from Ahrefs and cluster by intent into a prioritized content plan.
- `programmatic-seo-batch` — Generate 20+ SEO-optimized pages at scale from a template and data source.
- `schema-markup-audit` — Identify missing structured data and generate JSON-LD markup for your top pages.
- `site-architecture-audit` — Review your URL structure, navigation, and internal links for SEO and usability.
- `buffer-social-queue` — Plan and schedule a week of social content across platforms in Buffer.
- `pricing-strategy-review` — Benchmark your pricing against competitors and recommend tier and positioning improvements.
- `seo-page-map-url-structure-planner-dataforseo` — Analyze a website with DataforSEO keyword data and output an execution-ready SEO page plan: pages to add, pages to update, target keyword mapping, and recommended URL structures.
- `seo-site-audit` — Crawl a website, analyze on-page SEO factors, check meta tags, and generate a comprehensive audit report.

## How to use this file

1. When the user names a workflow, find it under **Active**. Use that `id` with `magister_run_workflow`. The gateway binds the verified current chat turn, creates the canonical progress card, and runs all steps durably. Never emit `<json-render>`, print card markup, execute steps inline, or call completion endpoints yourself.
2. If it's only under **Available templates**, call `magister_fork_workflow_template` with its slug and user-supplied `inputs`. The gateway returns `{status, workflow}` — either an existing fork (if inputs match) or a new fork. Then call `magister_run_workflow` with `workflow.id`.
3. Never use `exec`, `curl`, or raw HTTP for workflow discovery, forking, or execution. Never compare templates and forks yourself; the typed fork action owns deduplication.
