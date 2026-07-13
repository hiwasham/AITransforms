# Resource: Rule of 100 Follow-Up Cadence & Scripts

**Status**: Reference material supplied by the operator. Informs
`spec.md` functional requirements and will inform future content-generation
logic in `/speckit-plan` / `/speckit-tasks`. Not itself a spec section — kept
verbatim here so exact wording/timing survives for planning and content
generation, without bloating `spec.md` with prose script templates.

**Source**: Operator-supplied appendix, 2026-07-11.

## Core Outreach Principles to Enforce

- **3rd Grade Reading Level**: Keep all generated scripts incredibly simple.
  Lowering the reading level bumps response rates by up to 50%.
- **Big Fast Value (BFV)**: Strangers have zero trust. Must blow their minds
  in under 30 seconds by giving away something they would normally pay for
  (the custom OpenClaw Telegram bot). See `bfv-concept.md` for the full
  concept.
- **Volume Negates Luck**: Nearly half of all salespeople give up after the
  first attempt because they assume the prospect isn't interested. In
  reality, prospects get busy and forget to reply. The system must
  relentlessly execute the sequence below.

## The 4-Day Sequence for Non-Responders

### Day 1: The Initial BFV Drop

**Logic**: Deliver the custom Telegram bot link immediately to reverse all
risk and prove the technology works.
**Trigger**: Immediate — this is the first message sent to the prospect.
**Framework**: Hook (Personalize) → Pain/Outcome → BFV (Bot Link) →
Low-Friction Ask.

**Script Template**:
> Hey [Name], I saw your recent post about [Specific Topic].
> I noticed your team handles a massive amount of inbound DMs.
> I built a custom AI trained exclusively on your website's data and
> deployed it to this private Telegram link.
> Click here to try trying to break it: [Telegram Link].
> Open to testing it out?

### Day 2: The Bump

**Logic**: Most communication fails simply because the prospect was busy. A
simple bump brings the Day 1 message back to the top of their inbox/DMs.
**Trigger**: No reply detected within 24 hours of Day 1.

**Script Template**:
> Hey [Name], just bumping this up ^. Did you get a chance to play with the
> Telegram bot?

### Day 3: The Video Demo (Value Message)

**Logic**: If they haven't clicked the bot link, they might need to see it
in action to believe it. Provide a visual demonstration of the value.
**Trigger**: No reply detected 24 hours after the Day 2 bump.

**Script Template**:
> Hey [Name] - thought of you when I saw this. Here is a quick 30-second
> screen-recording of the bot actually closing a fake lead for your
> business. Thought you'd want to see this before we reconnect:
> [Video Link].

### Day 4: The Takeaway (Priority Check)

**Logic**: Use a takeaway close to provoke a response. Professional
curiosity and fear of missing out will often trigger a reply here.
**Trigger**: No reply detected 24 hours after the Day 3 video message.

**Script Template**:
> [Name] - should I assume this isn't a priority right now?

## Post-Sequence Action (The 3-6 Month Rule)

**Logic**: If the prospect completes the 4-day sequence without responding,
their current circumstances or timing are not aligned — not a permanent no.
**Action**: Mark the prospect "Unresponsive" in the pipeline. Do not delete
them. Set a delayed trigger to re-enter them into a new outreach campaign
3–6 months later.

**Spec impact**: captured as FR-016 through FR-018 and the "Unresponsive"
outcome state in `spec.md`.
