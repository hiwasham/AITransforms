#!/usr/bin/env python3
"""Author + commit EMPOWER Level-1 SOPs for the Bayan proc 14/15 cores.

Run from the repo root (for_business resolves .stage3/ relative to cwd):
    python3 .claude/skills/stage3-ops/scripts/build_bayan_sops.py

Idempotent: a core that already has SOP content is skipped, not duplicated.
Content is authored here because the AI-generate path is feature-gated off on
this plan (pennantFeatures.workflows = False).
"""
import sys
sys.path.insert(0, '.claude/skills/stage3-ops/scripts')
from stage3_client import Stage3

SOPS = {
    255: ("SOP — Self-Serve Onboarding & First Value", """
<h2>Purpose</h2>
<p>A newly registered free user reaches first "exam-ready" value inside session
one. First value is defined as: the learner has seen a personalised weak-area
result and started practice on the matching question bank.</p>

<h2>Scope</h2>
<p>Motion A (self-serve B2C) only. Applies to all four live tracks: Gulf
Licensing, Medical Students, Postgraduate, Nursing. Institutional cohorts are
out of scope — see core 257.</p>

<h2>Procedure</h2>
<ol>
  <li><strong>Capture registration + exam track.</strong> At signup the learner
      selects a target exam (OMSB / DHA / MOH / SCFHS / QCHP / NHRA, Arab Board
      / MRCP / ABIM, or OEN / SNLE / Prometric / NCLEX-RN). Track selection is
      mandatory — it keys everything downstream.</li>
  <li><strong>Run the weak-area diagnostic.</strong> Five questions drawn from
      the selected track. Short by design: the goal is a signal, not an
      assessment.</li>
  <li><strong>Show the personalised gap screen.</strong> State the weak areas
      in the learner's own words and route straight to the matching question
      bank. Target language: "I stopped guessing what to study."</li>
  <li><strong>Day-1 next-action nudge.</strong> One email or push with exactly
      one next action. Fire the "reached first value" event so proc 22 can
      measure it.</li>
  <li><strong>Segment and log the cohort.</strong> Tag Oman vs international at
      registration. Bayan is free for all users in Oman (Play adds Yemen), so
      unsegmented data will not produce a readable conversion rate.</li>
</ol>

<h2>RACI</h2>
<p>R: growth / product. A: founder. C: clinician reviewer. I: CEO (weekly
metric review).</p>

<h2>Integrity line</h2>
<p>AI assists with drafting — humans own what reaches learners. No shortcut
claims: the product helps learners actually learn the material.</p>

<h2>KPIs</h2>
<p>Register to first-value rate [TBD]. Time to first value [TBD]. Both blocked
on proc 22 funnel instrumentation.</p>
"""),

    256: ("SOP — Subscription Fulfilment & Trial Setup", """
<h2>Purpose</h2>
<p>Turn intent into a correctly provisioned trial, then into a paid
subscription, without pricing or entitlement errors.</p>

<h2>Live pricing (observed 2026-09-25 — USD, not OMR)</h2>
<ul>
  <li>Physician $199/yr ($29.99/mo)</li>
  <li>Nurse $129/yr ($19.99/mo)</li>
  <li>Student $59&ndash;69/yr ($9.99/mo)</li>
  <li>Gulf Licensing track: one-time purchase, no subscription</li>
  <li>Free tier: 5 questions/day, 1 OSCE/day, 5 articles/month</li>
  <li>30-day free trial; free for all users in Oman</li>
</ul>

<h2>Procedure</h2>
<ol>
  <li><strong>Select tier by exam track.</strong> Tier follows the track chosen
      at registration. Gulf Licensing is a one-time purchase and must not be
      sold as a subscription.</li>
  <li><strong>Provision the trial.</strong> 30 days, no card required. Confirm
      entitlements unlock beyond the free-tier caps.</li>
  <li><strong>Apply discount codes.</strong> <code>Oman@2026</code> gives 20%
      outside Oman. Inside Oman the product is free — do not stack.</li>
  <li><strong>Convert trial to paid.</strong> Trigger the conversion sequence
      before day 30, anchored on the learner's own progress, not a deadline
      scare.</li>
  <li><strong>Handle payment failure and refunds.</strong> Retry, notify, and
      log the reason code. Reasons feed the pricing review in core 259.</li>
</ol>

<h2>RACI</h2>
<p>R: growth lead. A: founder. C: clinician reviewer (claims in offer copy).
I: CEO.</p>

<h2>KPIs</h2>
<p>Trial start rate [TBD]. Trial-to-paid conversion [TBD]. Blocked on proc 22.</p>
"""),

    257: ("SOP — Institutional Pilot Onboarding", """
<h2>Purpose</h2>
<p>Stand up a hospital, university, or training-board pilot after a signed
agreement, with a written success metric agreed before the pilot starts.</p>

<h2>Institutional pricing (observed 2026-09-25)</h2>
<p>$35 student / $69 nurse / $99 physician per seat. Minimum 20 seats, 50% off
individual pricing, invoice-based. Selected institutions are currently on free
one-year trials, so pilot-to-paid is the open question, not pilot-to-live.
Contact: info@medresearch-academy.om.</p>

<h2>Procedure</h2>
<ol>
  <li><strong>Confirm seat count and cohort.</strong> Minimum 20. Record the
      cohort's exam track and start date.</li>
  <li><strong>Provision seats and admin access.</strong> Institution admin gets
      a roster view. Verify entitlements on a test seat before handover.</li>
  <li><strong>Run the kickoff session.</strong> Walk the cohort through the
      weak-area diagnostic so the pilot's first week produces usable data.</li>
  <li><strong>Agree the pilot success metric in writing.</strong> One metric,
      one threshold, one date. Without this the renewal conversation has no
      anchor — this is the step most often skipped.</li>
  <li><strong>Schedule the mid-pilot and renewal review.</strong> Book both
      dates at kickoff, not later.</li>
</ol>

<h2>RACI</h2>
<p>R: founder. A: CEO (Dr. Abdullah Al-Alawi). C: clinician reviewer. I: growth
lead.</p>

<h2>KPIs</h2>
<p>Pilot seat activation rate [TBD]. Pilot-to-paid conversion [TBD — no pilot
has converted yet].</p>
"""),

    258: ("SOP — Activation & PQL Scoring", """
<h2>Purpose</h2>
<p>Identify which free users are product-qualified leads, so the paywall is
shown to learners who have already felt value.</p>

<h2>Procedure</h2>
<ol>
  <li><strong>Define the PQL signal set.</strong> Candidate signals: completed
      the weak-area diagnostic, sessions in week one, questions attempted
      against the free cap (5/day), OSCE attempted, articles read, return on
      day 2 and day 7.</li>
  <li><strong>Instrument the signals.</strong> Hard dependency on proc 22. No
      funnel data exists today — installs 50+, zero store ratings — so this
      step gates the rest of the core.</li>
  <li><strong>Score and threshold.</strong> Weighted score; set the threshold
      from observed data once it exists, not from a guess.</li>
  <li><strong>Route PQLs to the paywall moment.</strong> Hand off to core 259 at
      the point the learner hits a free-tier cap mid-session.</li>
  <li><strong>Segment Oman vs international.</strong> Non-negotiable. Oman is
      free, so blended conversion rates are meaningless.</li>
</ol>

<h2>RACI</h2>
<p>R: growth lead. A: founder. C: AI / product team. I: CEO.</p>

<h2>KPIs</h2>
<p>PQL rate [TBD]. PQL-to-trial rate [TBD]. Blocked on proc 22.</p>
"""),

    259: ("SOP — Paywall, Offer & Price Testing", """
<h2>Purpose</h2>
<p>Convert product-qualified free users into paying subscribers, and establish
the first real price signal. This core sits on Bayan's stated number-one
problem: converting early free adoption into sustainable paid revenue.</p>

<h2>Procedure</h2>
<ol>
  <li><strong>Design the paywall moment.</strong> Trigger at the free-tier cap
      inside a session the learner is already invested in, showing what they
      are one step away from.</li>
  <li><strong>Run the time-boxed Founder's Offer.</strong> Offer to a slice of
      the existing free base, not the whole base. Time-boxed, single cohort,
      measured.</li>
  <li><strong>Hold the integrity line in all offer copy.</strong> No shortcut or
      guaranteed-pass claims. Clinician reviewer signs off before anything
      ships. CEO's standing position: there are no shortcuts, the point is that
      learners actually learn the material.</li>
  <li><strong>Test price and packaging by track.</strong> Physician $199/yr,
      Nurse $129/yr, Student $59&ndash;69/yr, Gulf Licensing one-time. Test one
      variable at a time.</li>
  <li><strong>Report plan mix and ARPU.</strong> Monthly, split Oman vs
      international.</li>
</ol>

<h2>RACI</h2>
<p>R: growth lead. A: CEO (Dr. Abdullah Al-Alawi). C: clinician reviewer.
I: founder.</p>

<h2>KPIs</h2>
<p>Paywall-view-to-trial rate [TBD]. Founder's Offer take rate [TBD — offer not
yet run]. ARPU [TBD — no paid revenue data exists].</p>
"""),

    260: ("SOP — Lifecycle Messaging & Nurture", """
<h2>Purpose</h2>
<p>Move learners between funnel stages with messaging that reflects how they
actually study, rather than a generic drip sequence.</p>

<h2>Procedure</h2>
<ol>
  <li><strong>Map the sequences to funnel stages.</strong> One sequence per
      transition: registered to first value, first value to trial, trial to
      paid, lapsed to winback. No orphan sequences.</li>
  <li><strong>Write in the learner's own language.</strong> Use the product's
      real vocabulary: weak areas, spaced repetition, board/exam-style
      questions, exam-ready, clinical reasoning, question bank, flashcard.</li>
  <li><strong>Tie cadence to spaced repetition.</strong> The engine is SM-2 with
      adaptive difficulty. Nudges should align with the learner's review
      schedule instead of fighting it.</li>
  <li><strong>Suppress and cap.</strong> Frequency cap per learner; suppress on
      conversion, on active study streaks, and on unsubscribe.</li>
  <li><strong>Review sequence performance monthly.</strong> Retire sequences
      that do not move their stage metric.</li>
</ol>

<h2>RACI</h2>
<p>R: growth lead. A: founder. C: AI / product team and clinician reviewer.
I: CEO.</p>

<h2>Integrity line</h2>
<p>AI assists with drafting — humans own what reaches learners. Approved AI
framing: we use AI to make medical education and career pathways easier.</p>

<h2>KPIs</h2>
<p>Sequence stage-advance rate [TBD]. Unsubscribe rate.</p>
"""),

    261: ("SOP — Institutional Lead Qualification & Proposal", """
<h2>Purpose</h2>
<p>Qualify and close institutional buyers: hospitals, clinics, universities,
training boards, pharma. This is the legitimate home of the CRM, proposal, and
qualification motion, and where the CEO's 20%-of-confirmed-sale commission
pays out.</p>

<h2>Scope</h2>
<p>Motion B only. Entity: BAYAN AI TECHNOLOGIES LLC (KOM incubator).
Institutional contact: info@medresearch-academy.om.</p>

<h2>Procedure</h2>
<ol>
  <li><strong>Qualify the institution.</strong> Confirm cohort size (20-seat
      minimum), exam tracks in scope, budget owner, and procurement route.
      Invoice-based, so procurement timing drives the close date.</li>
  <li><strong>Score MQL to SQL.</strong> Qualified means a named budget owner
      and a cohort that clears the seat minimum. Everything else stays an
      MQL.</li>
  <li><strong>Build the proposal.</strong> Per-seat pricing: $35 student / $69
      nurse / $99 physician, 50% off individual. Ground every claim in verified
      product facts — 23 licensing and board exams, 470+ articles, 250+ drug
      monographs, 16 courses, 55+ countries. Question count is [TBD] pending
      resolution; never use the 10,000+ figure.</li>
  <li><strong>Negotiate and close.</strong> CEO leads. Current institutional
      trials are free for one year — any new pilot states its paid terms up
      front.</li>
  <li><strong>Log the pipeline.</strong> Stage, owner, next action, and date for
      every open institutional deal.</li>
</ol>

<h2>RACI</h2>
<p>R: founder. A: CEO (Dr. Abdullah Al-Alawi). C: clinician reviewer.
I: growth lead.</p>

<h2>KPIs</h2>
<p>Institutional SQL count. Proposal win rate [TBD — no closed institutional
deal yet].</p>
"""),
}

CORE_PROC = {255: 15, 256: 15, 257: 15, 258: 14, 259: 14, 260: 14, 261: 14}


def main():
    s = Stage3.for_business('bayan')
    print("login:", s.login())

    for core_id in sorted(SOPS):
        proc = CORE_PROC[core_id]
        title, body = SOPS[core_id]

        _, existing, _ = s.sop_content(proc, core_id)
        if existing:
            print(f"  = core {core_id}: SOP already present ({len(existing)}), skipping")
            continue

        s.sop_create(core_id, title)
        sop, contents, versions = s.sop_content(proc, core_id)
        if not contents:
            print(f"  !! core {core_id}: no content row after create")
            continue

        content_id = contents[0]['id'] if isinstance(contents[0], dict) else contents[0]
        if not versions:
            print(f"  !! core {core_id}: content {content_id} has no version")
            continue
        version_id = versions[0]['id'] if isinstance(versions[0], dict) else versions[0][0]

        s.sop_save(proc, core_id, content_id, version_id, body.strip())
        s.sop_commit(content_id)
        print(f"  + core {core_id}: SOP {content_id} v{version_id} saved + committed")

    print("\n--- verify ---")
    for core_id in sorted(SOPS):
        proc = CORE_PROC[core_id]
        sop, contents, versions = s.sop_content(proc, core_id)
        n = len(sop or "") if isinstance(sop, str) else len(str(sop or ""))
        print(f"  core {core_id}: contents={len(contents)} versions={len(versions)} body_chars={n}")


if __name__ == '__main__':
    main()
