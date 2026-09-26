# Chris Event Readiness Brain Reference

The Chris Event Readiness Brain is a static HTML prototype at `site/chris-event-readiness-brain.html`.

It demonstrates a future event-support assistant for Chris Burris's UK Creating Healing Circles workshop. The prototype does not run retrieval or call an AI model. It uses fixed, source-derived answer states to show the intended buyer experience and trust contract.

## Public Surface

| Surface | Location | Type | Purpose |
|---|---|---|---|
| Static page | `site/chris-event-readiness-brain.html` | HTML/CSS/JS | Main prototype. |
| Plan doc | `docs/designs/chris-event-readiness-brain-plan.md` | Markdown | Strategy, design, engineering, QA plan. |
| Telegram proof link | `https://t.me/wslalphaclawbot` | External link | Existing Telegram proof CTA. |
| Source event listing | `https://burriscounseling.com/workshops-trainings/` | External link | Event listing used as source context. |

## Page Sections

### Top Bar

The top bar contains:

- Burris Counseling logo from `https://burriscounseling.com/wp-content/uploads/2022/02/Burris-Counseling-Logo.jpg`
- Prototype label: `Event Readiness Brain`
- `Pilot terms` anchor link to `#pilot`
- `Open Telegram proof` link to `https://t.me/wslalphaclawbot`

### Workspace

The first viewport is the main product surface.

It contains:

- Literal offer headline: `UK workshop registration friction brain`
- Three observed event signals:
  - `$1,650` UK registration
  - `40` UK max participant count
  - `21` day refund timing signal
- Two context cards:
  - Approved-source proof path
  - Bristol UK workshop, July 25-28, 2027
- Assistant simulation panel

### Assistant Simulation

The assistant is a static simulation with four prompt buttons.

| Button | `data-answer` | Answer title | Intended proof |
|---|---|---|---|
| `Why hesitate?` | `hesitation` | `Registration friction map` | 30-second BFV proof. |
| `Am I a fit?` | `fit` | `Participant fit check` | Eligibility and scope guardrail. |
| `What logistics matter?` | `logistics` | `Logistics support` | Hidden-cost reduction. |
| `Ask a trick question` | `refusal` | `Safe refusal` | Refuses when no source exists. |

The buttons update:

- `#questionTitle`
- `#questionSubtitle`
- `#answerContent`

The answer container uses `aria-live="polite"` so screen readers can announce changed answer content without interrupting the user.

### Value Section

The `What this does for Chris` section lists the four business outcomes:

1. Qualifies premium buyers
2. Protects trust
3. Names registration friction
4. Creates the $500 path

### Pilot Section

The `#pilot` section contains:

- A copy-ready message for Chris in `#closeText`
- Pilot terms:
  - Price: `$100`, credited toward the `$500` build
  - Sources: `3-5 approved event pages or handouts`
  - Channel: Telegram first, website embed later
  - Proof: fit answer, logistics answer, safe refusal
  - Risk: refund if it does not help

## JavaScript Behavior

The page has two behaviors.

### Answer Switching

`#promptList` listens for clicks on `button[data-answer]`.

When a valid answer key is clicked:

1. The clicked button receives the `active` class.
2. The previous active button loses the `active` class.
3. `#questionTitle` changes to the answer title.
4. `#questionSubtitle` changes to the answer subtitle.
5. `#answerContent` is replaced with the matching answer HTML.

### Copy Close Text

`#copyButton` tries to copy `#closeText`.

Behavior:

1. If `navigator.clipboard` is available in a secure context, it writes the text to the clipboard.
2. Otherwise it creates a temporary `<textarea>`, selects it, and calls `document.execCommand("copy")`.
3. If copying fails, it selects the `#closeText` content in the document and changes the button label to `Text selected`.

## Design Tokens

The page uses CSS custom properties in `:root`.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#181817` | Primary text and dark surfaces. |
| `--paper` | `#f6f5ef` | Page background. |
| `--surface` | `#fffef9` | Panels and cards. |
| `--surface-2` | `#ecefe7` | Secondary panel background. |
| `--muted` | `#5e625d` | Supporting text. |
| `--line` | `#d9d8cd` | Borders. |
| `--teal` | `#007f8e` | Accent. |
| `--teal-dark` | `#005b67` | Primary CTA and headings. |
| `--sage` | `#6c7b59` | Grounded status. |
| `--amber` | `#b9812d` | Guardrail accent. |
| `--red` | `#9c3f32` | Risk/sold-out accent. |
| `--plum` | `#5d4a66` | Visited links. |
| `--radius` | `8px` | Rounded controls and panels. |
| `--max` | `1240px` | Page max width. |

Fonts:

- Body: `IBM Plex Sans`
- Display headings: `Source Serif 4`

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `max-width: 980px` | Main workspace, close panel, and section title become single-column. Proof and flow grids become two columns. |
| `max-width: 720px` | Top bar stacks. Assistant grid becomes single-column. Prompt buttons become two columns. |
| `max-width: 460px` | Brand copy hides. Prompt buttons become one column. Event cards become single-column. Pilot terms become one-column. |

## External Assets

| Asset | Source |
|---|---|
| Burris logo | `https://burriscounseling.com/wp-content/uploads/2022/02/Burris-Counseling-Logo.jpg` |
| Burris event artwork | `https://burriscounseling.com/wp-content/uploads/2022/03/775DC25C-525E-42BA-B159-29B5979B4577-e1658946121503-845x321.jpeg` |
| Google Fonts stylesheet | `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans...` |

If remote images fail, the text and layout still render. The prototype does not bundle local image fallbacks.

## Constraints

- No backend.
- No real retrieval.
- No payment processing.
- No proprietary Chris Burris source ingestion.
- No clinical advice generation.
- No persistent client-side state.

## Related

- [How to QA the Chris Event Readiness Brain](howto-qa-chris-event-readiness-brain.md)
- [Build the Chris Event Readiness Brain locally](tutorial-chris-event-readiness-brain.md)
- [Why the Chris Event Readiness Brain exists](explanation-chris-event-readiness-brain.md)
- [Chris Event Readiness Brain plan](designs/chris-event-readiness-brain-plan.md)
