---
title: "Case Study: An AI-Enabled Operation - Automated Call Tracking"
space: "Case Studies"
post_number: 1
author: "Dale Meador"
status: "published"
post_id: 28468269
space_id: 2345699
slug: "ai-enabled-operations-how-andi-automated-call-tracking"
url: "https://community.empowerlabs.ai/c/case-studies/ai-enabled-operations-how-andi-automated-call-tracking"
topics: null
attachments: 1
images: 0
comments: 1
published_at: "2026-01-12T11:32:00.000Z"
updated_at: "2026-07-23T15:39:11.722Z"
fetched_at: "2026-09-03T00:30:13+00:00"
---

# Case Study: An AI-Enabled Operation - Automated Call Tracking

> Case Studies › Post 1 › by Dale Meador › 2026-01-12

[Open on Circle](https://community.empowerlabs.ai/c/case-studies/ai-enabled-operations-how-andi-automated-call-tracking)

## Files

- [01-Automating-Call-Quality-at-Acquira.pdf](./assets/01-Automating-Call-Quality-at-Acquira.pdf) (2.0 MB)

## Content

📎 **[01-Automating-Call-Quality-at-Acquira.pdf](assets/01-Automating-Call-Quality-at-Acquira.pdf)**

**Introduction**

Andi, Acquira’s Accelerator Operations Manager, went from AI novice to building a working automation system in just two days. This is a real implementation with actual tools and results—including the mistakes and learning along the way.

We’ll walk through the problems encountered, the solutions implemented, and the hands-on learning process that made it all work.

**The Business Context**

Acquira’s Accelerator Program guides aspiring business owners through buying an existing business over 8-18 months. Andi manages operations, specifically:

- **Customer onboarding**: Getting new clients oriented
- **Progress tracking**: Ensuring clients move forward
- **Deal review calls**: Helping clients evaluate businesses
- **Customer satisfaction**: Ensuring clients feel supported

The program has key touchpoints: onboarding calls (explaining how everything works), deal review calls (evaluating potential acquisitions), and follow-up calls (tracking progress).

**Andi’s Journey to Being “AI Enabled”**

**Starting Point: ChatGPT Like Google**

Like most people, Andi started using ChatGPT like a search engine—ask a question, get an answer, move on. This worked for simple queries but didn’t fundamentally change how he worked.

**The Turning Point: The Master Prompt**

Everything changed when Hayden (Acquira’s CEO) introduced “Master Prompts”—comprehensive instructions you give AI that include:

- What your company does
- Your specific role and responsibilities
- How you want information formatted
- What standards you follow

The real breakthrough came when Andi made it personal rather than just copying Hayden’s version. He created his own Master Prompt specific to Accelerator operations, including how his work connects to adjacent teams, his format preferences, and what information matters most for tracking client success.

This personalization transformed AI from a generic tool into something that understood his specific role and spoke his language.

**Continuing Education**

Andi learned through multiple channels:

- Second Brain Enterprise Beta Curriculum (formal training)
- YouTube videos (self-guided learning about workflows)
- Trial and error (hands-on experimentation)
- Real projects (learning by building actual solutions)

**The Starting Point: Structured But Painfully Manual**

Before automation, Acquira’s operations were organized but time-consuming:

**The Manual Process:**

1. Conduct the call
2. Hope someone remembered to record
3. Take notes manually after
4. Update multiple systems by hand
5. Track progress manually
6. Chase down missing information

**The Pain Points:**

Calls weren’t always recorded, and follow-ups were inconsistent. AEs often left without clear expectations. The team spent 30+ minutes per call chasing down notes and trying to piece together what happened—because recordings and transcripts didn’t exist or were scattered across different people’s drives.

The team had no visibility into where each client stood in their journey. Answering simple questions like “What did we discuss on their last call?” required hunting through notes and relying on whoever hosted to remember details.

**Quality Issues:**

At least one client complained that expectations weren’t set properly during their onboarding call. Sometimes team members simply forgot to cover important topics, and there was no systematic way to catch these gaps before they became customer complaints.

**Pre-AI Automations**

Andi had already built basic automations showing he could learn these tools:

- **Deal flow**: Scraped business listings automatically flowed into client workspaces via: In-house scraper → Airtable → Zapier → ClickUp
- **Task automation**: When clients marked deals as “interested,” ClickUp auto-populated required next steps like submitting NDAs and requesting financial documents

These proved automation could work, but didn’t solve the core problem: understanding what actually happened on calls.

**The Trigger: A Specific Problem**

Hayden suggested a “mini project” to fix a clear gap: lack of visibility into customer calls.

**The Goal:** Automatically record, analyze, and track every call to ensure consistent quality and team-wide visibility without manual work.

**Building the Solution**

**Step 1: Defining Success**

Andi spent two days building the system with a clear goal: document every call, reinforce SOP quality, and ensure clients left each conversation confident about the next steps.

**Step 2: Updating the Foundation**

Before building automation, Andi updated the SOPs (Standard Operating Procedures) to define exactly what quality looks like—what topics must be covered, what questions must be asked, what next steps should be defined.

You can’t automate quality if you haven’t first defined what quality means.

**Step 3: Choosing Tools**

**Core Stack:**

- **Bubbles Note Taker**: Auto-records and transcribes meetings
- **Zapier**: Connects tools without coding
- **Google Sheets**: Stores structured data
- **Google Drive**: Organizes transcripts
- **ChatGPT via Zapier**: Analyzes transcripts
- **Slack** (Already using): Team notifications

**Why These Tools:**

- Bubbles integrates seamlessly with Google Calendar
- Zapier offers user-friendly interface with pre-built integrations
- Google Workspace was already in use, team familiar with it
- ChatGPT built into Zapier, excellent at text analysis

Andi initially explored N8N (more powerful, with webhook capabilities) but chose Zapier because N8N didn’t support Bubbles at the time. Sometimes the best tool is the one that works with what you already have.

**Step 4: The 10-Step Workflow**

**Setup:** Andi is added as co-host on every call (even ones he doesn’t attend) so Bubbles automatically records everything. Think of it like having a reliable assistant who never forgets to hit record.

**The Automation:**

1. **Trigger**: Bubbles finishes recording → signals Zapier
2. **Filter**: Only process “Onboarding” or “Deal Review” calls, ignore other meetings
3. **Log basics**: Save call details (date, time, duration, participants) to Google Sheet
4. **Download transcript**: Get full text from Bubbles
5. **Save to Drive**: Store in organized folders.
6. **Add to sheet**: Put transcript in spreadsheet for quick reference
7. **Convert format**: Change to Google Doc (text files didn’t work with ChatGPT)
8. **AI analysis**: ChatGPT checks transcript against SOP requirements:
  - Platform access confirmed?
  - Deal flow explained?
  - Financial documents discussed?
  - Follow-up scheduled?
  - Questions answered?
  - Scores each element (1 = covered, 0 = missed)
9. **Update sheet**: Write analysis results back to spreadsheet with scores and next steps
10. **Slack notification**: Send summary to team channel

The team receives an automatic notification in Slack with key information from the call—who completed what type of call, what was covered, and what the next steps are. Everyone sees this within minutes of the call ending.

The spreadsheet creates a complete record showing at a glance how well each call went, which topics were covered, and what happens next.

**Step 5: Testing and Learning**

The workflow didn’t work perfectly on the first try. Here are the issues Andi encountered:

- **Text files didn’t work with ChatGPT integration** Andi initially tried using plain text files for the transcripts, but discovered that Zapier’s built-in ChatGPT integration didn’t process them reliably. He experimented and found that converting to Google Docs format first solved the compatibility problem.
- **N8N didn’t support Bubbles** Andi explored N8N as an automation platform because it offered more flexibility and webhook capabilities. However, he discovered it didn’t support Bubbles Note Taker at the time. Rather than switching recording tools and retraining the whole team, he chose to use Zapier with its pre-built Bubbles integration.

These are the kinds of obstacles that come up in real automation projects—the key is problem-solving your way through them rather than giving up.

**The Results**

**Time Savings**

**Before:** 30+ minutes per call chasing down recordings and information

**After:** ~5 minutes to verify automation ran successfully

**Impact:** 85% reduction in administrative time per call

This translates to significant time savings across multiple calls each week—time now spent on actually helping clients succeed rather than on administrative work.

**Visibility Improvements**

**Before:** Team members had to ask around to find out what happened on calls. Information lived in different places or just in people’s memories.

**After:** Real-time visibility for everyone. As soon as a call ends, the entire team knows what happened through automatic Slack notifications and centralized tracking.

No more hunting for information or depending on who remembered what.

**Quality Improvements**

**Before:** No way to verify topics were covered until customers complained. Quality depended entirely on individual team members remembering everything.

**After:** Objective scoring reveals exactly which topics were covered and which were missed.

This now enables:

- Immediate gap identification when required topics are missed
- Proactive follow-up on missed items before clients notice
- Data-driven coaching based on actual call performance
- Consistent evaluation across all team members

**Future Enhancements**

Andi is still exploring ways to improve the system:

**Customer Satisfaction Integration**: He plans to integrate customer satisfaction surveys with the workflow. After each call, automatically send a survey to collect feedback on how helpful the call was and how confident the client feels about buying a business.

**Expand to Other Call Types**: The same workflow could be applied to sales calls and other tasks that involve repeated conversations that need tracking and quality control.

**Improve Readability**: Change the Boolean scoring (1/0) to Yes/No format to make the spreadsheet data easier to scan and understand at a glance.

AI solved Acquira’s visibility and consistency problem by doing what humans couldn’t sustain—analyzing every single call against quality standards without fatigue or oversight. The system catches gaps immediately, provides objective scoring, and surfaces exactly what needs follow-up. This is AI’s practical value: turning inconsistent manual processes into reliable, measurable systems.


## Discussion (1 comment)

- **Scott Newkirk** · 2026-07-23
  Amazing! Just re-watched the video Hayden did covering this. Great stuff!!
