#!/usr/bin/env python3
"""Build Bayan cores for proc 15 (Sale to Delivery) and proc 14 (Lead to Sale).

Grounded in marketing-plans/bayan/{research,growth-engine-design}.md.
Two motions per the design doc: A = self-serve B2C (flagship), B = institutional.
KPI targets are [TBD] until proc 22 funnel instrumentation ships.

Idempotent-ish: skips a core whose exact name already exists.
Run from the repo root (for_business resolves .stage3/ from cwd).
"""
import sys
sys.path.insert(0, ".claude/skills/stage3-ops/scripts")
from stage3_client import Stage3, Stage3Error, level1_html, raci  # noqa: E402

OWNER = 210          # Silad Bazin8 — only valid responsible_user_id on this team
GROWTH = "Growth lead"
FOUNDER = "Founder"
CEO = "CEO (Dr. Abdullah Al-Alawi)"
CLIN = "Clinician reviewer"
PROD = "AI/product team"

# ---------------------------------------------------------------- proc 15
P15 = [
    {
        "name": "Self-Serve Onboarding & First Value (Motion A)",
        "description": (
            "A newly-registered free user reaches first exam-ready value inside "
            "session 1. Job-to-be-done (VOC): \"I stopped guessing what to "
            "study.\" Free tier = 5 Q/day, 1 OSCE/day, 5 articles/mo; free "
            "outright inside Oman (and Yemen on Play), so Oman and international "
            "cohorts must be segmented from day one."),
        "steps": [
            ("Capture registration + exam track",
             "On signup, record exam track (Gulf Licensing / Postgraduate / "
             "Medical Student / Nursing) and country. Country drives the "
             "Oman-free vs international-paid split.",
             raci(r=GROWTH, a=FOUNDER, c=PROD, i=CEO)),
            ("Run the weak-area diagnostic",
             "5-question adaptive diagnostic on first login, scored against the "
             "learner's declared exam blueprint (23 licensing/board exams).",
             raci(r=PROD, a=FOUNDER, c=CLIN, i=CEO)),
            ("Show the personalised gap screen",
             "Render \"your weak areas\" and route into the matching question "
             "bank. This is the first-value moment — fire the "
             "first-value-reached event here.",
             raci(r=PROD, a=FOUNDER, c=CLIN, i=CEO)),
            ("Day-1 next-action nudge",
             "Single-action email/push: the one next study block. No digest, no "
             "feature tour.",
             raci(r=GROWTH, a=FOUNDER, c=PROD, i=CEO)),
            ("Segment and log the cohort",
             "Write register / first-value-reached events tagged Oman vs "
             "international into the funnel instrumentation built in proc 22.",
             raci(r=GROWTH, a=FOUNDER, c=PROD, i=CEO)),
        ],
        "kpis": [
            ("Register to first-value rate [TBD - awaiting proc 22 instrumentation]",
             "Share of new registrations that reach the gap screen in session 1",
             "weekly", "maximize", "%"),
            ("Time to first value [TBD - awaiting proc 22 instrumentation]",
             "Median minutes from registration to first-value-reached event",
             "weekly", "minimize", "min"),
        ],
    },
    {
        "name": "Subscription Fulfilment & Trial Setup (Motion A)",
        "description": (
            "Turn an activated user into a provisioned trial, then a paid "
            "subscriber. Live tiers (observed 2026-09-25, [confirm] against "
            "Sept-7 canonical): Physician $199/yr or $29.99/mo, Nurse $129/yr or "
            "$19.99/mo, Student $59-69/yr or $9.99/mo; 30-day free trial. "
            "Prometric campaign runs a 7-day no-card trial. Oman is free, so "
            "fulfilment must not bill Omani users."),
        "steps": [
            ("Select tier by exam track",
             "Map declared track to Physician / Nurse / Student tier. Suppress "
             "billing entirely for Oman (and Yemen on Play).",
             raci(r=GROWTH, a=FOUNDER, c=PROD, i=CEO)),
            ("Provision the trial",
             "Start 30-day trial (card-required on Bayan Learning) or the 7-day "
             "no-card trial for the Prometric landing path. Record which variant.",
             raci(r=PROD, a=FOUNDER, c=GROWTH, i=CEO)),
            ("Apply discount codes",
             "Honour the 20% international code Oman@2026. Log code usage as an "
             "attribution signal.",
             raci(r=GROWTH, a=FOUNDER, c=PROD, i=CEO)),
            ("Convert trial to paid",
             "Day-before-expiry prompt tied to the learner's own progress, not a "
             "generic upsell. Fire trial-start and trial-to-paid events.",
             raci(r=GROWTH, a=CEO, c=PROD, i=FOUNDER)),
            ("Handle payment failure and refunds",
             "Retry ladder, dunning, and the refund path. Keep store-billing "
             "(iOS/Play) and web billing reconciled.",
             raci(r=FOUNDER, a=CEO, c=PROD, i=GROWTH)),
        ],
        "kpis": [
            ("Trial start rate [TBD - awaiting proc 22 instrumentation]",
             "Activated users who start a trial, split Oman vs international",
             "weekly", "maximize", "%"),
            ("Trial to paid conversion [TBD - awaiting proc 22 instrumentation]",
             "Paid conversions divided by trials started, by tier",
             "monthly", "maximize", "%"),
        ],
    },
    {
        "name": "Institutional Pilot Onboarding (Motion B)",
        "description": (
            "Stand up a hospital / university / training-board pilot after a "
            "signed agreement. Institutional pricing (observed 2026-09-25): $35 "
            "student, $69 nurse, $99 physician per seat, minimum 20 seats, 50% "
            "off individual, invoice-based. Selected institutions are currently "
            "on free 1-year trials, so pilot-to-paid is the real question."),
        "steps": [
            ("Confirm seat count and cohort",
             "Lock seats (min 20), learner mix, and the exam tracks in scope. "
             "Invoice-based, not card.",
             raci(r=FOUNDER, a=CEO, c=GROWTH, i=PROD)),
            ("Provision seats and admin access",
             "Bulk-create accounts, assign tracks, grant the institution's L&D "
             "lead an admin view.",
             raci(r=PROD, a=FOUNDER, c=GROWTH, i=CEO)),
            ("Run the kickoff session",
             "Walk the cohort through the diagnostic and the first study block. "
             "Attendance is the pilot's activation proxy.",
             raci(r=GROWTH, a=FOUNDER, c=CLIN, i=CEO)),
            ("Agree the pilot success metric in writing",
             "One number the institution will judge the pilot on, agreed before "
             "the pilot starts. Without it a free trial never converts.",
             raci(r=FOUNDER, a=CEO, c=GROWTH, i=PROD)),
            ("Schedule the mid-pilot and renewal review",
             "Mid-point checkpoint plus a dated renewal conversation. Feeds "
             "proc 16 Delivery to Success.",
             raci(r=FOUNDER, a=CEO, c=GROWTH, i=PROD)),
        ],
        "kpis": [
            ("Pilot seat activation rate [TBD - awaiting proc 22 instrumentation]",
             "Provisioned seats that reach first value within 14 days",
             "monthly", "maximize", "%"),
            ("Pilot to paid conversion [TBD - no pilot has converted yet]",
             "Free 1-year institutional trials that convert to invoiced seats",
             "quarterly", "maximize", "%"),
        ],
    },
]

# ---------------------------------------------------------------- proc 14
P14 = [
    {
        "name": "Activation & PQL Scoring (Motion A)",
        "description": (
            "Self-serve replacement for lead scoring: score product behaviour, "
            "not firmographics. Nobody sends an IMG exam candidate a proposal, "
            "so the \"lead\" here is a registered free user and the qualifying "
            "signal is study behaviour. Pre-traction baseline: 50+ installs, 0 "
            "ratings on both stores (observed 2026-09-25)."),
        "steps": [
            ("Define the PQL signal set",
             "Candidate signals: diagnostic completed, questions attempted per "
             "week, streak length, OSCE or calculator use, hitting the free-tier "
             "cap (5 Q/day).",
             raci(r=GROWTH, a=FOUNDER, c=PROD, i=CEO)),
            ("Instrument the signals",
             "Emit the events through proc 22 instrumentation. Until that ships "
             "this core cannot be scored at all.",
             raci(r=PROD, a=FOUNDER, c=GROWTH, i=CEO)),
            ("Score and threshold",
             "Weighted score with a PQL cut-off. Review the threshold monthly "
             "against observed trial starts.",
             raci(r=GROWTH, a=FOUNDER, c=PROD, i=CEO)),
            ("Route PQLs to the paywall moment",
             "Hand a PQL to the Paywall & Offer core at the point of peak intent "
             "(typically the free-tier cap).",
             raci(r=GROWTH, a=FOUNDER, c=PROD, i=CEO)),
            ("Segment Oman vs international",
             "Omani users are free, so they must never be scored into a paid "
             "motion. Report the two cohorts separately.",
             raci(r=GROWTH, a=CEO, c=PROD, i=FOUNDER)),
        ],
        "kpis": [
            ("PQL rate [TBD - awaiting proc 22 instrumentation]",
             "Registered users crossing the PQL threshold per week",
             "weekly", "maximize", "%"),
            ("PQL to trial rate [TBD - awaiting proc 22 instrumentation]",
             "Share of PQLs that start a trial within 7 days",
             "weekly", "maximize", "%"),
        ],
    },
    {
        "name": "Paywall, Offer & Price Testing (Motion A)",
        "description": (
            "Convert the existing free base with no new ad spend - the fastest "
            "path to first real MRR. Levers: a time-boxed Founder's Offer to a "
            "slice of the free base, the 20% international code Oman@2026, and "
            "the Gulf Licensing one-time purchase. Integrity rule is absolute: "
            "never a pass guarantee. CEO's own line: \"There are NO shortcuts "
            "... we help you actually LEARN the material.\""),
        "steps": [
            ("Design the paywall moment",
             "Trigger at the free-tier cap with the learner's own weak-area "
             "progress on screen, not a feature matrix.",
             raci(r=GROWTH, a=FOUNDER, c=PROD, i=CEO)),
            ("Run the time-boxed Founder's Offer",
             "Offer a defined slice of the free base a dated founder price. "
             "Purpose is price-sensitivity data plus first conversions.",
             raci(r=GROWTH, a=CEO, c=FOUNDER, i=PROD)),
            ("Hold the integrity line in all offer copy",
             "No pass guarantee, no shortcut framing. Approved AI line: \"AI "
             "assists with drafting - humans own what reaches learners.\"",
             raci(r=CLIN, a=CEO, c=GROWTH, i=FOUNDER)),
            ("Test price and packaging by track",
             "Physician / Nurse / Student tiers and annual-vs-monthly mix. "
             "[confirm] live USD tiers against the Sept-7 canonical set before "
             "any public copy.",
             raci(r=GROWTH, a=CEO, c=FOUNDER, i=PROD)),
            ("Report plan mix and ARPU",
             "Plan mix, ARPU, and elasticity are all [TBD] until instrumentation "
             "and the first offer cohort land.",
             raci(r=GROWTH, a=FOUNDER, c=PROD, i=CEO)),
        ],
        "kpis": [
            ("Paywall view to trial rate [TBD - awaiting proc 22 instrumentation]",
             "Trials started per paywall view",
             "weekly", "maximize", "%"),
            ("Founder's Offer take rate [TBD - offer not yet run]",
             "Accepted offers divided by the free-base slice it was shown to",
             "monthly", "maximize", "%"),
            ("ARPU [TBD - no paid revenue data exists]",
             "Monthly recurring revenue divided by paying subscribers",
             "monthly", "maximize", "USD"),
        ],
    },
    {
        "name": "Lifecycle Messaging & Nurture (Motion A)",
        "description": (
            "Email / push / in-app sequences that move a registered user toward "
            "a trial and a trial toward paid. Product vocabulary is Bayan's own: "
            "weak areas, spaced repetition, board-style questions, exam-ready, "
            "clinical reasoning. Engine is SM-2 spaced repetition, so cadence "
            "messaging is a real product feature, not a marketing fiction."),
        "steps": [
            ("Map the sequences to funnel stages",
             "Three tracks: not-yet-activated, activated-not-trialling, "
             "trialling-not-paid.",
             raci(r=GROWTH, a=FOUNDER, c=PROD, i=CEO)),
            ("Write in the learner's own language",
             "Use the VOC line \"I stopped guessing what to study\" and Bayan's "
             "product vocabulary. No generic SaaS nurture copy.",
             raci(r=GROWTH, a=FOUNDER, c=CLIN, i=CEO)),
            ("Tie cadence to spaced repetition",
             "Send on the learner's actual SM-2 review schedule so the nudge is "
             "the study plan rather than an interruption.",
             raci(r=PROD, a=FOUNDER, c=GROWTH, i=CEO)),
            ("Suppress and cap",
             "Frequency caps, unsubscribe handling, and full suppression of paid "
             "messaging to Oman.",
             raci(r=GROWTH, a=CEO, c=PROD, i=FOUNDER)),
            ("Review sequence performance monthly",
             "Per-sequence open, click, and stage-advance rates. Retire anything "
             "that does not move the stage.",
             raci(r=GROWTH, a=FOUNDER, c=PROD, i=CEO)),
        ],
        "kpis": [
            ("Sequence stage-advance rate [TBD - awaiting proc 22 instrumentation]",
             "Recipients advancing a funnel stage within 14 days of a sequence",
             "monthly", "maximize", "%"),
            ("Unsubscribe rate",
             "Unsubscribes divided by messages delivered",
             "monthly", "minimize", "%"),
        ],
    },
    {
        "name": "Institutional Lead Qualification & Proposal (Motion B)",
        "description": (
            "The legitimate home for the CRM / proposal / qualification motion: "
            "hospitals, clinics, universities, training boards, pharma. This is "
            "where the CEO's 20%-of-confirmed-sale commission pays out and where "
            "the raise ladder gets earned. Entity is BAYAN AI TECHNOLOGIES LLC "
            "(KOM incubator); institutional contact "
            "info@medresearch-academy.om."),
        "steps": [
            ("Qualify the institution",
             "Seat potential (min 20), exam tracks, budget cycle, and whether an "
             "L&D owner exists. Relationship-led, not cold outreach.",
             raci(r=FOUNDER, a=CEO, c=GROWTH, i=PROD)),
            ("Score MQL to SQL",
             "Advance only on a named owner plus a stated cohort size. Everything "
             "else stays a lead.",
             raci(r=GROWTH, a=FOUNDER, c=CEO, i=PROD)),
            ("Build the proposal",
             "Per-seat pricing, pilot scope, the agreed success metric, and the "
             "credibility spine: Falling Walls Lab Oman 2026 1st place, Ejada "
             "Innovation Award 2026, 23 licensing and board exams, "
             "clinician-reviewed content.",
             raci(r=FOUNDER, a=CEO, c=CLIN, i=GROWTH)),
            ("Negotiate and close",
             "Invoice terms, seat minimum, pilot length, and the renewal date. "
             "Hand the signed agreement to proc 15 Motion B.",
             raci(r=CEO, a=CEO, c=FOUNDER, i=GROWTH)),
            ("Log the pipeline",
             "One source of truth for institutional pipeline, stage, and expected "
             "seats. No pipeline data exists today - this starts it.",
             raci(r=GROWTH, a=FOUNDER, c=CEO, i=PROD)),
        ],
        "kpis": [
            ("Institutional SQL count",
             "Qualified institutions with a named owner and a stated cohort size",
             "monthly", "maximize", "count"),
            ("Proposal win rate [TBD - no closed institutional deals yet]",
             "Signed agreements divided by proposals sent",
             "quarterly", "maximize", "%"),
        ],
    },
]


def build(s, proc, specs):
    existing = {c["name"]: c["id"] for c in s.cores(proc)}
    out = []
    for spec in specs:
        name = spec["name"]
        if name in existing:
            cid = existing[name]
            print(f"  = core {cid} exists: {name}")
        else:
            cid = s.core_add(proc, name, spec["description"])
            print(f"  + core {cid}: {name}")
        out.append((cid, spec))
    return out


def fill(s, proc, built):
    for cid, spec in built:
        acts = s.activities(proc, cid)
        if acts:
            print(f"  = core {cid} already has {len(acts)} activities, skipping RACI")
        else:
            st, errs = s.import_html_raci(proc, cid, level1_html(spec["steps"]))
            got = s.activities(proc, cid)
            if len(got) != len(spec["steps"]):
                raise Stage3Error(
                    f"core {cid} RACI: wanted {len(spec['steps'])} got "
                    f"{len(got)} (st={st} errs={errs})")
            print(f"  + core {cid}: {len(got)} activities w/ RACI")

        have = {k.get("success_metric") for k in s.kpis(proc, cid)}
        for metric, method, freq, direction, unit in spec["kpis"]:
            if metric in have:
                print(f"    = kpi exists: {metric[:50]}")
                continue
            st, errs = s.kpi_add(cid, metric, OWNER, method, freq, 0,
                                 direction, unit)
            now = {k.get("success_metric") for k in s.kpis(proc, cid)}
            if metric not in now:
                raise Stage3Error(f"kpi not created (st={st} errs={errs})")
            print(f"    + kpi: {metric[:50]}")


if __name__ == "__main__":
    s = Stage3.for_business("bayan")
    print("login:", s.login())
    for proc, specs in ((15, P15), (14, P14)):
        print(f"\n=== proc {proc} ===")
        fill(s, proc, build(s, proc, specs))
    print("\n--- final state ---")
    for proc in (14, 15):
        for c in s.cores(proc):
            a = s.activities(proc, c["id"])
            k = s.kpis(proc, c["id"])
            print(f"  proc {proc} core {c['id']:>3} "
                  f"act={len(a)} kpi={len(k)}  {c['name']}")
