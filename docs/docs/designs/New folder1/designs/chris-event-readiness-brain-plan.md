# Chris Event Readiness Brain Plan

Generated on 2026-07-03 from the user's rough prompt, then executed with GStack-style autoplan, CEO review, eng review, design consultation, browse research, design-html, and QA routing.

## Perfected Prompt

You are running an autonomous GStack revenue sprint for the $500 goal.

Read Chris Burris's latest workshop email and the prior Hormozi guidance. Use the current Chris relationship as the priority lead. Do not hunt broad cold leads until the Chris wedge has been sharpened.

Research the live event pages with GStack browse:

- UK Creating Healing Circles event: `https://burriscounseling.com/event/england-uk-creating-healing-circles-in-person-experiential-workshop-on-using-the-ifs-model-in-a-group-format/`
- Burris workshops listing.
- Bali Creating Healing Circles retreat page and its external IFSBali registration page if relevant.

Run the decision pipeline:

1. CEO review: find the highest-leverage Chris-specific paid pilot that can create a $100 deposit now and a $500 micro-prototype next.
2. Design consultation: choose a visual and interaction direction that matches a premium therapy/training operation, not a generic SaaS page.
3. Eng review: keep the first build static, browser-testable, and directly reusable in a message to Chris.
4. Build with design-html: create a polished static prototype Chris can inspect immediately.
5. QA with GStack browse: verify load, responsiveness, no console errors, and that the interactive states work.

Autopilot rules:

- Make decisions without waiting for the user unless there is a destructive action or a true blocker.
- Prefer a concrete artifact Chris can see today.
- Reduce time delay, effort, and perceived risk.
- Use real page findings and cite the exact event facts.
- Do not invent clinical claims or answer therapy questions beyond the provided workshop/event material.

## Source Findings

### UK Workshop Page

- Event: Creating Healing Circles: in-person experiential workshop using IFS in group format.
- Dates: July 25-28, 2027.
- Location: Bristol, England, Penny Brohn Centre.
- Price: $1,650 USD.
- Capacity: max 40 participants.
- Registration form is embedded on Chris's site.
- Page has no console errors in browse.
- Measured load in browse: about 4.9s.
- Friction: long text, registration appears above and below the explanation depending on viewport, but the page does not help a buyer decide fit, compare Bali vs UK, or ask logistics questions.

### Workshops Listing

- Six events were listed.
- Several events are sold out, including $2,800 Creating Healing Circles trainings.
- The UK 2027 event is the visible open Creating Healing Circles event on Chris's own site.
- Scarcity exists. The problem is not generic demand generation. The better wedge is qualification, conversion support, and support-load reduction.

### Bali Retreat

- Event: Bali Creating Healing Circles group facilitation retreat.
- Dates: November 1-6, 2026.
- External registration: `https://ifsbali.com/products/chris`.
- Deposit product: 995 USD, shown as Rp 18,000,000 IDR in the current browser region.
- Full price: $2,995 standard.
- Friction: external checkout, currency region selector, many logistics, travel timing, deposit/balance rules, no embedded Burris-site form.
- Console: Shopify page reports a blocked `shop.app` frame and 403 resource, not a blocking registration issue in the inspected flow.

## Hormozi Filter

The best pilot must:

- Use the existing warm lead, not distract with broad prospecting.
- Show Chris his own event system and methodology reflected back.
- Give a fast win within seconds.
- Reverse risk: $100 pilot credited toward a $500 build, refund if it does not help.
- Reduce hidden costs: no scheduling hoops, no full site rebuild, no request for proprietary book content before trust is earned.
- Demonstrate safe refusal: the assistant answers event/logistics/methodology-context questions only when grounded in supplied sources.

## CEO Review

Verdict: build a "Creating Healing Circles Event Readiness Brain" prototype.

This is stronger than another generic close page because Chris's live pages already show demand and multiple premium events. The pain is the buyer's uncertainty and Chris's repeated support burden:

- Am I qualified?
- Should I choose Bali or UK?
- What is included?
- What is not included?
- What timing matters?
- Can this answer from Chris's materials without hallucinating?

The $100 wedge:

> I built a small event assistant around your public event pages. It answers fit and logistics questions with sources, routes people to Bali or UK, and refuses questions outside the event material. If it feels useful, I will seal it around your approved workshop materials for a $100 pilot and credit that toward the $500 event-support brain.

## Design Review

Direction: quiet training-operations console.

Principles:

- First screen should be the product, not a sales hero.
- Use real Burris/IFS event imagery.
- Show source-grounded answers and safe refusal as the central trust mechanism.
- Make the copy useful for Chris, not performative for strangers.
- Keep cards shallow and purposeful. Avoid nested cards.
- Use calm neutrals with teal, sage, amber, and red accents. Avoid a one-note blue or purple palette.

## Eng Review

Architecture:

```text
site/chris-event-readiness-brain.html
  static HTML
  CSS variables
  remote event images
  sample answer data
  question buttons
  answer renderer
  copy-to-clipboard outreach text
  responsive layout
```

Failure modes and handling:

| Failure | Handling |
|---|---|
| Remote images blocked | Layout still works with alt text and color background |
| Clipboard API unavailable | Fallback to textarea selection and `execCommand` |
| JavaScript disabled | Prototype content remains readable in static sections |
| Mobile narrow viewport | Single-column layout, fixed button heights, no text overflow |
| Clinical overreach | Explicit scope note: event assistant, not therapy advice |

QA plan:

- Serve `site/` locally.
- Open `/chris-event-readiness-brain.html` with GStack browse.
- Verify console has no errors.
- Verify question buttons update the answer.
- Verify copy button state changes.
- Capture desktop/mobile screenshots.
- Check page text includes UK, Bali, $100, $500, and safe refusal.

## Not In Scope

- Payment processing.
- Real RAG backend.
- Telegram deployment changes.
- Scraping or ingesting Chris's proprietary book.
- Rewriting Chris's WordPress site.
- Clinical advice generation.

## Plan Design Review

Scope reviewed: `site/chris-event-readiness-brain.html` as the implemented static prototype, and this plan as the build-control artifact.

System audit:

- UI scope: one static, browser-testable prototype page with a sticky action bar, event signal area, interactive assistant simulation, proof flow, close-message copy block, and pilot terms.
- Plan type: hybrid. The first viewport is app-like because the assistant simulation is the product proof. The lower sections are conversion support for Chris.
- Design system: no `DESIGN.md` exists in the repo. This review calibrates against universal design principles and the page's local CSS variables.
- Existing patterns to reuse: shallow 8px cards, IBM Plex Sans for operational text, Source Serif 4 for major headings, source chips, active prompt buttons, visible visited link styling, and single-column mobile collapse.
- Prior review context: `gstack-review-read` shows one fresh `/review` row with three non-blocking informational findings. No fresh logged CEO, eng, or design-plan review rows were present before this run.

Initial design completeness: 7/10.

A 10/10 for this plan would define the exact first-screen hierarchy, every visible interaction state, the emotional arc for Chris and the event buyer, anti-slop constraints, responsive and accessibility behavior, and a clear line between the prototype and the future production event-support brain.

### Pass 1: Information Architecture

Rating before: 8/10.
Rating after: 9/10.

The plan's strongest decision is putting the assistant simulation in the first viewport instead of burying it below a sales hero. The buyer sees the product proof first: event facts, prompt buttons, sourced answer, and the $100 pilot path.

First-screen hierarchy:

```text
Sticky topbar
  Burris logo + prototype identity
  Pilot terms link
  Telegram proof link

Main workspace
  Left: event context and proof signals
    Chris-specific wedge label
    Creating Healing Circles readiness brain headline
    $995 / $1,650 / 40 proof metrics
    Bali 2026 card
    Bristol 2027 card
  Right: assistant simulation
    Grounded mode status
    Buyer question rail
    Source-bound answer pane
    Copy Chris close action

Support bands
  What this does for Chris
  The $100 ask and refund terms
```

Constraint decision: if only three things can be shown above the fold, keep the assistant simulation, the event demand signals, and the `Copy Chris close` action. Everything else is secondary.

### Pass 2: Interaction State Coverage

Rating before: 6/10.
Rating after: 9/10.

The implementation already covers the happy path and clipboard fallback. The plan now makes those states explicit so the next build does not regress them.

| Feature | Loading | Empty | Error | Success | Partial |
|---|---|---|---|---|---|
| Event images | Reserve stable media slots; show alt text if remote image is blocked | Event card still shows title, price, date, and tags | No broken layout; image failure does not hide event facts | Image supports recognition of Burris/IFS event context | One image missing still leaves both event paths readable |
| Prompt buttons | Default `fit` answer is rendered before interaction | If no prompts are available, show "No event prompts loaded yet" plus source-scope note | Unknown `data-answer` does nothing and preserves current answer | Active button changes visual state and answer updates | Some prompts missing should not break the remaining buttons |
| Answer pane | Default answer visible without waiting for network | If answer body is absent, show safe refusal text | Out-of-scope questions render refusal, not a guess | Answer has title, explanation, source chips, and guardrail | Missing source chip should downgrade to refusal in the real build |
| Copy close | Button label starts as `Copy Chris close` | If close text is empty, button should be disabled in future build | Clipboard failure selects text and labels `Text selected` | Clipboard success labels `Copied` then resets | In non-secure contexts, textarea fallback handles copy |
| JavaScript disabled | Static HTML still presents the initial fit answer and close text | Prompt switching unavailable, but core proof remains readable | No blank app shell | Chris can still inspect the prototype and message copy | Future production build should include a `<noscript>` note |

### Pass 3: User Journey And Emotional Arc

Rating before: 8/10.
Rating after: 9/10.

| Step | User does | User feels | Plan specifies |
|---|---|---|---|
| 1 | Chris opens the prototype | "This is about my events, not generic AI." | Burris logo, Creating Healing Circles name, Bali and UK event facts |
| 2 | Chris presses buyer questions | "This could answer repeated questions without embarrassing me." | Grounded mode, source chips, guardrail language |
| 3 | Chris tries the trick question | "It knows when to stop." | Safe refusal answer and no clinical advice promise |
| 4 | Chris reads the $100 ask | "This is small, reversible, and close to revenue." | $100 pilot, $500 credit, refund if not useful |
| 5 | Future buyer asks fit/logistics questions | "I can decide without digging through long event pages." | Fit, route, and logistics prompts around live event facts |

Time horizon:

- First 5 seconds: recognizable Chris event context and assistant proof, not a pitch deck.
- First 5 minutes: Chris can interrogate fit, route, logistics, and refusal behavior.
- Five-year trust: the design promise is source-bound answers and quiet refusal, not a generic chatbot persona.

### Pass 4: AI Slop Risk

Rating before: 8/10.
Rating after: 9/10.

Classifier: hybrid. Apply app UI rules to the assistant workspace and landing-page rules only to the conversion support sections.

Hard rejection scan:

- Generic SaaS card grid as first impression: no. Cards hold real event facts and are not the primary product proof.
- Beautiful image with weak brand: no. The Burris logo and Creating Healing Circles name are first-viewport signals.
- Strong headline with no clear action: no. The prompt buttons and copy action are visible.
- Busy imagery behind text: no. Images stay inside event cards.
- Sections repeating the same mood statement: no. Each section has a different job.
- Carousel with no narrative purpose: no.
- App UI made of stacked cards instead of layout: mostly no. The assistant uses a two-column rail and answer pane.

Litmus checks:

| Check | Result |
|---|---|
| Brand/product unmistakable in first screen? | Yes |
| One strong visual anchor present? | Yes, the assistant simulation |
| Page understandable by scanning headlines only? | Mostly yes |
| Each section has one job? | Yes |
| Are cards actually necessary? | Yes for event facts and terms; avoid adding more |
| Does motion improve hierarchy or atmosphere? | No motion currently, acceptable for a static prototype |
| Would design feel premium with all decorative shadows removed? | Yes, because hierarchy and content carry it |

Anti-slop constraints for future edits:

- Do not add a centered marketing hero above the assistant.
- Do not add a three-column feature grid with icon circles.
- Do not move source chips into decorative badges without source meaning.
- Do not expand copy unless it helps Chris decide to pay the $100 pilot.
- Keep cards shallow and content-bearing. No nested cards.

### Pass 5: Design System Alignment

Rating before: 6/10.
Rating after: 8/10.

No repo-level `DESIGN.md` exists. Until `/design-consultation` creates one, this prototype's local system is the authority:

| Token | Current value | Use |
|---|---|---|
| `--ink` | `#181817` | Primary text and high-trust surfaces |
| `--paper` | `#f6f5ef` | Page background |
| `--surface` | `#fffef9` | Assistant, cards, message blocks |
| `--teal-dark` | `#005b67` | Primary action and source-bound emphasis |
| `--sage` | `#6c7b59` | Grounded status |
| `--amber` | `#b9812d` | Guardrail and caution state |
| `--red` | `#9c3f32` | Sold/unavailable or risk state |
| `--radius` | `8px` | Buttons, cards, panels |

Component vocabulary:

- Topbar: brand identity plus two actions.
- Event card: image, event title, short context, factual tags.
- Assistant shell: header, question rail, answer pane, footer action.
- Source chip: cited source label only, not decorative metadata.
- Guardrail block: scope, refusal, or caution text.
- Terms panel: pilot economics and risk reversal.

Recommendation: run `/design-consultation` later only if this becomes a reusable Burris-site embed or a portfolio surface. It is not required to close the $100 pilot.

### Pass 6: Responsive And Accessibility

Rating before: 7/10.
Rating after: 9/10.

Responsive behavior:

- Desktop >= 981px: two-column workspace, event context left, assistant right. Assistant remains the strongest visual anchor.
- Tablet 721px to 980px: workspace collapses to one column, proof strip and flow use two columns, event cards stay compact.
- Mobile 461px to 720px: topbar stacks, nav buttons stretch, assistant rail moves above answer pane, prompt grid uses two columns.
- Narrow mobile <= 460px: brand copy hides, event cards become one column, prompt buttons become one column, terms definition list becomes one column.

Accessibility requirements:

- Preserve semantic landmarks: header, nav, main, sections, footer.
- Keep visible labels for action areas; do not rely on placeholder-only labels in future forms.
- Maintain `aria-live="polite"` on the answer pane for prompt changes.
- Keep focus-visible outlines on buttons and links.
- Maintain 44px minimum touch targets for buttons and prompt choices.
- Preserve visited link distinction.
- Body text stays at 16px or larger with contrast at or above 4.5:1.
- Do not place text over event images.

### Pass 7: Unresolved Design Decisions

Rating before: 7/10.
Rating after: 9/10.

| Decision | Resolution |
|---|---|
| Is the prototype a sales page or a product demo? | Product demo first, sales support second. |
| Does it need a full landing-page hero? | No. The assistant is the hero. |
| Should it answer clinical or proprietary IFS method questions? | No. It refuses unless Chris-approved material is in the sealed corpus. |
| Should production start as Telegram or website embed? | Telegram first for the $100 pilot, website embed later if Chris asks. |
| Should new visual variants be generated now? | No. This plan review locks the current direction; `/design-review` is the better next visual audit for the implemented page. |

No unresolved design decisions remain for this static prototype.

## What Already Exists

- A built static prototype at `site/chris-event-readiness-brain.html`.
- A design plan with source findings, Hormozi filter, CEO review, design direction, eng review, and QA plan.
- A 30-second wow experience spec at `docs/designs/chris-30-second-wow-experience.md`.
- A local CSS system in the HTML with defined color, type, spacing, radius, and responsive behavior.
- JavaScript state handling for prompt selection and copy-to-clipboard fallback.
- Documentation generated under `docs/` for tutorial, how-to QA, reference, and explanation.
- A Chris opportunity backlog at `docs/chris-opportunity-backlog.md`.
- A NotebookLM-based Chris research tool can inform internal personalization and audit drafts, but production answers still require approved source citations.
- GStack routing guidance in `CLAUDE.md`.

## NOT In Scope For This Review

- Rebuilding the live Burris WordPress page.
- Generating new mockup variants with `/design-shotgun`.
- Creating a repo-wide `DESIGN.md`.
- Changing the prototype HTML.
- Adding payment, authentication, Telegram backend, or RAG ingestion.
- Updating `TODOS.md`; its current tasks target a broader founder-brain sandbox and are not Chris-design-specific.

Deferred Chris expansions now live in `docs/chris-opportunity-backlog.md`:

- Full Chris operating brain.
- Bali + UK + all trainings assistant.
- Multi-user company brain.
- Website embed after Telegram proof.

NotebookLM is not parked. It is a research lane: use it to understand Chris, draft internal audit/persona notes, and identify candidate approved sources. Do not expose NotebookLM-derived claims directly in Telegram unless the underlying source is approved and cited.

## Implementation Tasks

Synthesized from this review's findings. Each task derives from a specific finding above. Run with Claude Code or Codex; checkbox as you ship.

- [ ] **T1 (P2, human: ~30min / CC: ~5min)** - Plan docs - Add a `<noscript>` note if this prototype becomes a sent HTML artifact rather than a hosted page.
  - Surfaced by: Pass 2 - JavaScript disabled state remains readable, but future production should make the limitation explicit.
  - Files: `site/chris-event-readiness-brain.html`
  - Verify: Disable JavaScript and confirm Chris still sees the initial answer, close copy, and a clear note.
- [ ] **T2 (P3, human: ~2h / CC: ~20min)** - Design system - Create a small `DESIGN.md` only if this becomes a reusable Burris embed or portfolio template.
  - Surfaced by: Pass 5 - No repo-level design system exists.
  - Files: `DESIGN.md`
  - Verify: Future UI changes can cite shared tokens, components, and anti-slop rules.

## Completion Summary

```text
  +====================================================================+
  |         DESIGN PLAN REVIEW - COMPLETION SUMMARY                    |
  +====================================================================+
  | System Audit         | No DESIGN.md; UI scope is one hybrid page    |
  | Step 0               | 7/10 initial; focus on states and a11y       |
  | Pass 1  (Info Arch)  | 8/10 -> 9/10 after hierarchy spec           |
  | Pass 2  (States)     | 6/10 -> 9/10 after state table              |
  | Pass 3  (Journey)    | 8/10 -> 9/10 after emotional storyboard     |
  | Pass 4  (AI Slop)    | 8/10 -> 9/10 after anti-slop constraints    |
  | Pass 5  (Design Sys) | 6/10 -> 8/10; DESIGN.md still deferred      |
  | Pass 6  (Resp/A11y)  | 7/10 -> 9/10 after viewport/a11y spec       |
  | Pass 7  (Decisions)  | 5 resolved, 0 deferred                      |
  +--------------------------------------------------------------------+
  | NOT in scope         | written (6 items)                           |
  | What already exists  | written                                     |
  | TODOS.md updates     | 0 items proposed                            |
  | Approved Mockups     | 0 generated, 0 approved                     |
  | Decisions made       | 5 added to plan                             |
  | Decisions deferred   | 0                                           |
  | Overall design score | 7/10 -> 9/10                                |
  +====================================================================+
```

Plan is design-complete for the static prototype. Run `/design-review` after any HTML changes for live visual QA.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 logged | Not logged | Plan contains a CEO review section, but no fresh review-log row was present. |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 logged | Not run | No Codex review row found. |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 logged | Not cleared | Plan contains an eng review section, but no fresh eng review-log row was present. |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR | Score: 7/10 -> 9/10, 5 decisions added, 0 unresolved. |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 logged | Not run | No DX review row found. |

**VERDICT:** DESIGN CLEARED for the static prototype; eng review required before shipping.

NO UNRESOLVED DECISIONS
