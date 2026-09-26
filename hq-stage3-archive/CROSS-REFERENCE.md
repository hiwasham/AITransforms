---
title: "Cross-reference — Stage 3 (hq.stage3.app) vs. local cohort content"
source: "https://hq.stage3.app"
---

# Cross-reference — Stage 3 vs. cohort content

Maps every item in the Stage 3 premium control panel (`hq.stage3.app`, curriculum
**101 "Empower Fundamentals"**) to its counterpart in the locally-archived cohort
content (`empower-curriculum/01-cohort-4-curriculum/`, from `community.empowerlabs.ai`),
and flags the differences.

## The one-paragraph summary

Stage 3's curriculum 101 is a **re-sequenced, self-serve rebuild of the cohort's
first three live sessions**. The teaching content is substantially the same, but
Stage 3 wraps each exercise in the **Maya** in-app chatbot (a "magic button" that
launches a guided assistant, capped at 70 messages on trial) where the cohort
version tells you to run the identical exercise **in Claude yourself** (copy a
prompt from a Google Doc into your Master Prompt Claude Project). Stage 3 also adds
platform-native surfaces the cohort has no equivalent for: a **Dashboard**, an
in-app **Master Prompt** manager, **Knowledge Documents**, and a **Business Process
Framework** editor (RACI / Visual / Swimlane / KPIs / SOP tabs). The cohort, in
turn, has **12 live sessions**; Stage 3 curriculum 101 covers only the first three.

## Scope at a glance

| | Stage 3 (101 Fundamentals) | Local cohort (cohort-4) |
|---|---|---|
| Sessions | 3 | 12 live sessions (+ getting-started, FAQs, office hours) |
| Session-1 items | 3 | 4 |
| Session-2 items | 9 | 9 |
| Session-3 items | 8 | 9 |
| Exercise runner | **Maya** chatbot (in-app, 70-msg trial cap) | **Claude** (your own Project) |
| Prompt delivery | embedded in app | external Google Docs links |
| Extra surfaces | Dashboard, Master Prompts, Knowledge Docs, BP Framework | — (community/Discussion instead) |

## Session 1 — "Video Overview" / "Tech Setup and Overview"

| Stage 3 lesson | Type | Local counterpart | Notes |
|---|---|---|---|
| [Session 1: Video Overview](curriculum/session-1/01-session-1-video-overview.md) | text | `02-session-1-tech-setup-and-overview` (+ `01-live-session-1-replay`) | Same overview; local splits the replay video into its own item. |
| [Exercise 1.1: Create Your Master Prompt v.1](curriculum/session-1/02-exercise-1-1-master-prompt.md) | exercise | `03-exercise-1-1-create-your-master-prompt-v-1` | **Maya** vs. Claude. Stage 3 output feeds the in-app *Master Prompt* record (see [ai/](ai/master-prompt-217-bayan.md)); local output lives in your Claude Project. |
| [Managing Your Master Prompts](curriculum/session-1/03-managing-master-prompts.md) | text | `04-google-drive-master-prompt-archive-protocol-optional` | **Divergent.** Stage 3 manages prompt *versions in-app*; the cohort teaches a *Google Drive* archive protocol (marked optional). |

## Session 2 — "Invisible Structure of Business"

| Stage 3 lesson | Type | Local counterpart | Notes |
|---|---|---|---|
| [Session 2](curriculum/session-2/01-session-2.md) | text | `01-live-session-2-replay` | Session intro / replay. |
| [Exercise 2.1: Know Your Customer Lifecycle](curriculum/session-2/02-exercise-2-1-customer-lifecycle.md) | text | `02-exercise-2-1-know-your-customer-lifecycle` | Same. |
| [Quiz 2.1](curriculum/session-2/03-quiz-2-1-customer-lifecycle.md) | quiz | `03-quiz-2-1-...customer-lifecycle` | Same. |
| [Exercise 2.2: Three Layers of Business Processes](curriculum/session-2/04-exercise-2-2-three-layers.md) | text | `04-exercise-2-2-explore-the-three-layers-of-business-processes` | Same. Maps to the 3 layers in the [BP Framework](business-processes/README.md). |
| [Quiz 2.2](curriculum/session-2/05-quiz-2-2-three-layers.md) | quiz | `05-quiz-2-2-...three-layers` | Same. |
| [Exercise 2.3: How RACI Connects People and Process](curriculum/session-2/06-exercise-2-3-raci.md) | text | `06-exercise-2-3-learn-how-raci-connects-people-and-process` | Same. RACI is a live tab in the BP core editor. |
| [Quiz 2.3](curriculum/session-2/07-quiz-2-3-raci.md) | quiz | `07-quiz-2-3-...raci-charts` | Same. |
| [Exercise 2.4: Add Your Resources to Your Master Prompt](curriculum/session-2/08-exercise-2-4-resources.md) | exercise | `09-exercise-2-5-add-your-resources-to-your-master-prompt` | **Renumbered** (Stage 3 2.4 = local 2.5). |
| [Exercise 2.5: Working with Your Knowledge Documents](curriculum/session-2/09-working-with-knowledge-documents.md) | text | *(no direct local item)* | **Stage 3-native** — the in-app Knowledge Documents feature. |
| *(none)* | — | `08-exercise-2-4-add-shared-language-to-your-master-prompt` | **Dropped in Stage 3** — the cohort's "add shared language" step has no Stage 3 lesson. |

## Session 3 — "The Empower Operating System"

| Stage 3 lesson | Type | Local counterpart | Notes |
|---|---|---|---|
| [Session 3](curriculum/session-3/01-session-3.md) | text | `01-live-session-3-replay` | Session intro / replay. |
| [Exercise 3.1: Run the Assessment (Sale to Delivery)](curriculum/session-3/02-exercise-3-1-assessment.md) | exercise | `02-exercise-3-1-run-the-assessment-sale-to-delivery` | **Flagship Maya difference — see deep-dive below.** |
| [Exercise 3.2: Discover the 4-Level Documentation Framework](curriculum/session-3/03-exercise-3-2-4-level-framework.md) | text | `03-exercise-3-2-discover-the-4-level-documentation-framework` | Same. |
| [Quiz 3.2](curriculum/session-3/04-quiz-3-2-4-level-framework.md) | quiz | `04-quiz-3-2-...4-level-documentation-framework` | Same. |
| [Exercise 3.3: Explore AI-First Process Creation](curriculum/session-3/05-exercise-3-3-ai-first.md) | text | `06-exercise-3-4-explore-ai-first-process-creation` | **Renumbered** (Stage 3 3.3 = local 3.4). |
| [Quiz 3.3](curriculum/session-3/06-quiz-3-3-ai-first.md) | quiz | `07-quiz-3-4-...ai-first-process-creation` | **Renumbered** (Stage 3 3.3 = local 3.4). |
| [Exercise 3.4: Create the Level 1 & 2 SOP (Sale to Delivery)](curriculum/session-3/07-exercise-3-4-create-sop.md) | exercise | `08-exercise-3-5-create-the-level-1-and-2-sop-sale-to-delivery` | **Renumbered** (Stage 3 3.4 = local 3.5). Output maps to the SOP tab of a BP core. |
| [Lesson 3.5: Where Do You Go From Here](curriculum/session-3/08-lesson-3-5-next-steps.md) | text | *(no direct local item)* | **Stage 3-native** wrap-up / next steps. |
| *(none)* | — | `05-exercise-3-3-add-the-4-level-documentation-framework-to-your-master-prompt` | **Dropped in Stage 3.** |
| *(none)* | — | `09-exercise-3-6-register-your-organization` | **Dropped in Stage 3** — cohort admin step. |

## Deep-dive: the Maya difference (Exercise 3.1 assessment)

This is the clearest example of how the two platforms diverge on an identical
exercise. Same purpose ("assess the Sale-to-Delivery process, gauge owner
dependence, find improvements"); different runner.

| | Stage 3 (Maya) | Local cohort (Claude) |
|---|---|---|
| How you start | Click the **Start Assessment** magic button in the lesson | Copy a prompt into a **new chat in your Master Prompt Claude Project** |
| Who guides you | **Maya**, the in-app "Sessions Coach", one question at a time | **Claude**, in your own Project |
| Prompt location | Embedded in the app (no external link) | External **Google Doc** link |
| Question count | 9 questions (stated in the welcome) | Same assessment, unstated count |
| Output | Maya generates a report → save to **Knowledge Documents** | Claude creates an **artifact** → "Copy to Project" |
| Stated time | **45 minutes** | 10–15 minutes |
| Usage limit | **Maya trial cap: 70 messages** (this account: 30 used / 40 remaining); on exhaustion: *"Continue with the curriculum or upgrade to keep chatting with Maya."* | None (your own Claude usage) |
| Community | "post in the Discussion space" (generic) | links to the actual `community.empowerlabs.ai` Discussion |

Every Stage 3 exercise lesson carries the same Maya scaffolding in its payload:
a `button_label` (e.g. "Start Assessment"), a `welcome_title` /
`welcome_description`, and a `mayaUsage` block (limit 70, used/remaining, and the
exhaustion message). Those fields are rendered into each exercise's
"Exercise configuration" and "Maya chatbot (Stage 3 only)" sections.

## Stage 3-native surfaces (no cohort equivalent)

These exist only in the premium control panel — the cohort teaches the *concepts*
but you execute them in Claude/Docs rather than in a dedicated tool.

- **[Dashboard](dashboard.md)** — role, quick stats (processes owned, workflows,
  completion rate), assessment progress (0/12), and curriculum progress. The
  cohort has no dashboard.
- **[Master Prompt manager](ai/master-prompt-217-bayan.md)** — versioned master
  prompt ("Bayan Master Prompt", generated from Exercise 1.1), token counts,
  linked Knowledge Documents, and the full compiled prompt text. The cohort's
  equivalent is a Claude Project + an optional Google Drive archive.
- **[Business Process Framework](business-processes/README.md)** — the 3 layers
  taught in Session 2 (Strategic Planning, Customer Lifecycle, Enabling) become a
  live 13-process editor. Each process holds *cores*, and each core has
  **RACI / Visual / Swimlane / KPIs / SOP** tabs. On this account the three
  user-created cores are still **blank drafts** (schema captured, no data — see
  [GAPS.md](GAPS.md)); Session 3's SOP and RACI exercises are meant to fill them.
- **Knowledge Documents** — an in-app document store the master prompt draws from.
  Its index route (`/ai/knowledge`) 404s on this trial (see GAPS.md).

## How to use this archive

- Start at [README.md](README.md) for the layout and provenance.
- The rendered Markdown is safe to read/commit; **account PII is scrubbed** and the
  verbatim `raw-json/` capture is gitignored.
- To compare a specific lesson, open the Stage 3 file linked above and its local
  counterpart under
  `empower-curriculum/01-cohort-4-curriculum/0{2,3,4}-live-session-{1,2,3}-*/`.
