#!/usr/bin/env python3
"""
Build EMPOWER Level-2 (Blueprint) content for the 7 Bayan cores (proc 14/15).

Categories are created via POST /activities with category field.
PUT does NOT create categories (confirmed via test).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from stage3_client import Session

PROC_MAP = {255: 15, 256: 15, 257: 15, 258: 14, 259: 14, 260: 14, 261: 14}

# Category names (one per core)
CATEGORIES = {
    255: "Motion A - Onboarding",
    256: "Motion A - Subscription",
    257: "Motion B - Institutional Pilot",
    258: "Motion A - Activation",
    259: "Motion A - Paywall",
    260: "Motion A - Lifecycle",
    261: "Motion B - Institutional Sales",
}

# Blueprint content
BLUEPRINTS = {
    255: ("Self-Serve Onboarding Blueprint", """<h1>Self-Serve Onboarding</h1>

<h2>Diagnostic Flow</h2>
<p>5-question intake → personalized gap screen → route to feature trial.</p>

<h2>Free Tier Boundaries</h2>
<ul>
<li>5 MCQs/day, 1 OSCE/day, 5 articles/month</li>
<li>Paywall trigger: 3 days OR 3x limit hits in one session</li>
</ul>

<h2>Activation Metric</h2>
<p>Aha moment = 3 features used in first 7 days.</p>
"""),
    256: ("Subscription Conversion Blueprint", """<h1>Subscription Conversion</h1>

<h2>Pricing Display</h2>
<ul>
<li>Physician: $199/yr or $29.99/mo</li>
<li>Nurse: $129/yr or $19.99/mo</li>
<li>Student: $59/yr or $9.99/mo</li>
</ul>
<p>Annual = default. Oman users = free.</p>

<h2>30-Day Trial</h2>
<p>First purchase gets trial; charge on day 31.</p>
"""),
    257: ("Institutional Pilot Blueprint", """<h1>Institutional Pilot (Motion B)</h1>

<h2>Discovery</h2>
<p>Who are learners? How many (min 20)? Timeline? Budget?</p>

<h2>Pricing</h2>
<p>$35-99/seat depending on role, 3-month pilot term.</p>
"""),
    258: ("Activation Campaign Blueprint", """<h1>Activation Campaign</h1>

<p>User completed diagnostic but didn't reach 3-feature aha moment in 14 days.</p>

<h2>Email Sequence</h2>
<p>Day 3, 7, 14 nudges. Max 3 emails, then stop.</p>
"""),
    259: ("Paywall Optimization Blueprint", """<h1>Paywall Optimization</h1>

<h2>Interstitial Design</h2>
<p>"You've used your 5 free questions today"</p>
<p>Primary CTA: "See Plans", Secondary: "Remind me tomorrow"</p>

<h2>Frequency Cap</h2>
<p>Once per day maximum.</p>
"""),
    260: ("Lifecycle & Retention Blueprint", """<h1>Lifecycle & Retention</h1>

<h2>Engagement Tiers</h2>
<p>Power (5+ days/week), Regular (2-4), Inactive (&lt;2, churn risk)</p>

<h2>Re-Engagement</h2>
<p>Week 1, 2, 3 emails for inactive subscribers.</p>
"""),
    261: ("Institutional Lead Qualification Blueprint", """<h1>Institutional Lead Qualification (Motion B)</h1>

<h2>Qualification Criteria</h2>
<p>Authority, Need, Budget, Timeline → score 0-4</p>

<h2>Scoring</h2>
<p>4 = immediate proposal, 2-3 = nurture, 0-1 = polite decline.</p>
"""),
}


def get_activities(s, proc, core):
    """Get activities for a core."""
    d = s.inertia(f"/business-processes/{proc}/cores/{core}")
    return d.get("props", {}).get("activities", [])


def create_categories(s):
    """Create category by POSTing a marker activity, then delete it. Return {core_id: category_id}."""
    result = {}

    for core_id, cat_name in CATEGORIES.items():
        proc = PROC_MAP[core_id]
        acts = get_activities(s, proc, core_id)

        if not acts:
            print(f"  ⚠️  core {core_id}: no activities")
            continue

        # Check if category already exists
        existing = [a for a in acts if a.get("activity_category_id")]
        if existing:
            cat_id = existing[0]["activity_category_id"]
            print(f"  ✓ core {core_id}: category exists (id {cat_id})")
            result[core_id] = cat_id
            continue

        # POST creates categories, PUT doesn't (confirmed via test)
        print(f"  + core {core_id}: creating category '{cat_name}'")

        st, body = s.json(
            f"/business-processes/{proc}/cores/{core_id}/activities",
            method="POST",
            data={"name": f"__MARKER__{cat_name}", "category": cat_name}
        )

        if st not in (200, 302):
            print(f"    ⚠️  POST failed: {st}")
            continue

        # Re-read to get the new activity + category_id
        acts = get_activities(s, proc, core_id)
        marker = next((a for a in acts if a["name"].startswith("__MARKER__")), None)

        if not marker:
            print(f"    ⚠️  marker activity not found")
            continue

        # Extract category_id from the category dict
        cat = marker.get("category")
        if isinstance(cat, dict):
            cat_id = cat.get("id")
        else:
            cat_id = marker.get("activity_category_id")

        if not cat_id:
            print(f"    ⚠️  category_id still None")
            continue

        result[core_id] = cat_id
        print(f"    → category_id {cat_id}")

        # Delete marker activity
        s.json(f"/business-processes/activities/{marker['id']}", method="DELETE")
        print(f"    (cleaned up marker)")

    return result


def create_blueprints(s, categories):
    """Create Blueprint content for each category."""
    for core_id, cat_id in categories.items():
        proc = PROC_MAP[core_id]
        title, content = BLUEPRINTS[core_id]

        print(f"\n  core {core_id} / cat {cat_id}: '{title}'")

        # POST /content/blueprint/category/{cat_id}
        st, body = s.json(
            f"/content/blueprint/category/{cat_id}",
            method="POST",
            data={"title": title, "content": content}
        )

        print(f"    POST -> {st}")

        if st not in (200, 302):
            print(f"    ⚠️  failed: {body[:200]}")
            continue

        print(f"    ✅ created")


def verify(s, categories):
    """Re-read activities to check categories exist."""
    print("\n--- verify ---")
    for core_id, cat_id in categories.items():
        proc = PROC_MAP[core_id]
        acts = get_activities(s, proc, core_id)
        cat_count = sum(1 for a in acts if a.get("activity_category_id") == cat_id)
        print(f"  core {core_id}: {len(acts)} activities, {cat_count} in category {cat_id}")


def main():
    s = Session()
    if not s.login():
        print("login failed")
        return 1

    print("login: True\n")

    print("=== Creating categories ===")
    categories = create_categories(s)

    if len(categories) != 7:
        print(f"\n⚠️  Expected 7, got {len(categories)}")
        return 1

    print("\n=== Creating Blueprints ===")
    create_blueprints(s, categories)

    verify(s, categories)

    print("\n✅ Done")
    return 0


if __name__ == "__main__":
    sys.exit(main())
