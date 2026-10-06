#!/usr/bin/env python3
"""
Build Bayan Proc 17: Success to Referral
Create cores + attach L2 Blueprints via category pattern.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from stage3_client import Session

PROC_ID = 17

CORES = [
    {
        "name": "Peer Invite Mechanics",
        "description": "When a successful user wants to invite peers (post-exam pass or after using for 30+ days): generate unique referral codes, track attribution, apply discounts to both inviter and invitee, and measure referral funnel conversion.",
        "owner": "Developer (mechanics), CEO (incentive design), Nasim (outreach)",
        "category": "Referral Acquisition",
    },
    {
        "name": "Testimonial & Case Study Capture",
        "description": "When a user reports exam success or high engagement: request testimonial (written + optional video), capture success metrics (exam score, study duration), publish on website/social with permission, and convert into case study for B2B sales.",
        "owner": "CEO (requests + approval), Nasim (outreach + capture), Developer (automation)",
        "category": "Social Proof",
    },
]

BLUEPRINTS = {
    0: ("Peer Invite Mechanics Blueprint", """<h1>Peer Invite Mechanics</h1>

<h2>Sub-Processes</h2>

<h3>1. Referral Code Generation</h3>
<p><strong>Trigger:</strong> User clicks "Invite Friends" in dashboard</p>
<ul>
<li>Generate unique 8-character code: <code>BAYAN-{user_id}-{random}</code></li>
<li>Create referral link: <code>bayan.edu.om/join/{code}</code></li>
<li>Store in DB: <code>referrals</code> table (code, user_id, created_at, uses, conversions)</li>
<li>Display copy-paste link + social share buttons</li>
</ul>

<h3>2. Landing Page & Attribution</h3>
<p><strong>When invitee clicks link:</strong></p>
<ul>
<li>Store <code>ref_code</code> in session cookie (7-day TTL)</li>
<li>Pre-fill signup form with inviter's specialty (if physician→physician pipeline)</li>
<li>Show banner: "Dr. [Name] invited you! Both get 1 month free when you subscribe"</li>
<li>Track: <code>referral_clicks</code> event in Mixpanel</li>
</ul>

<h3>3. Signup Attribution</h3>
<p><strong>When invitee completes signup:</strong></p>
<ul>
<li>Read <code>ref_code</code> from cookie</li>
<li>Write to user record: <code>referred_by_user_id</code>, <code>referred_by_code</code></li>
<li>Increment: <code>referrals.uses</code></li>
<li>Send email to inviter: "Your friend [Name] just signed up!"</li>
</ul>

<h3>4. Conversion Tracking & Rewards</h3>
<p><strong>When invitee subscribes (trial→paid):</strong></p>
<ul>
<li>Increment: <code>referrals.conversions</code></li>
<li>Apply rewards:
  <ul>
  <li><strong>Inviter:</strong> Add 1 month credit (<code>subscription_end_date</code> += 30 days)</li>
  <li><strong>Invitee:</strong> Apply 1-month coupon code via Stripe</li>
  </ul>
</li>
<li>Send celebration emails to both</li>
<li>Track: <code>referral_conversion</code> event in Mixpanel</li>
</ul>

<h3>5. Referral Dashboard</h3>
<p><strong>User-facing stats:</strong></p>
<ul>
<li>Total invites sent</li>
<li>Friends signed up</li>
<li>Friends subscribed</li>
<li>Months earned</li>
</ul>

<h2>Incentive Tiers</h2>
<table border="1">
<tr><th>Milestone</th><th>Reward (Inviter)</th><th>Reward (Invitee)</th></tr>
<tr><td>1st conversion</td><td>1 month free</td><td>1 month free</td></tr>
<tr><td>3rd conversion</td><td>Bonus: 2 months free</td><td>Standard</td></tr>
<tr><td>5th conversion</td><td>Lifetime VIP badge</td><td>Standard</td></tr>
</table>

<h2>Exception Handling</h2>
<ul>
<li><strong>Self-referral:</strong> Block if <code>ref_code.user_id</code> == signup email domain (fraud prevention)</li>
<li><strong>Duplicate signup:</strong> If invitee email already exists, no credit (show "already registered")</li>
<li><strong>Expired cookie:</strong> Invitee loses attribution after 7 days → no credit</li>
<li><strong>Coupon failure:</strong> Retry Stripe API 3 times, then manual credit via support</li>
</ul>

<h2>Fraud Signals</h2>
<ul>
<li>Same IP for inviter + invitee within 5 minutes</li>
<li>10+ signups from one code in 24 hours</li>
<li>Invitee churns within 48 hours (refund + reverse credit)</li>
</ul>
<p><strong>Action:</strong> Flag for manual CEO review before applying rewards.</p>
"""),

    1: ("Testimonial & Case Study Capture Blueprint", """<h1>Testimonial & Case Study Capture</h1>

<h2>Sub-Processes</h2>

<h3>1. Success Signal Detection</h3>
<p><strong>Triggers:</strong></p>
<ul>
<li>User marks exam date as passed (Core 268)</li>
<li>User active for 60+ days with >20 sessions</li>
<li>User replies "I passed!" to post-exam survey</li>
<li>CEO manually flags a user</li>
</ul>

<h3>2. Testimonial Request (Automated)</h3>
<p><strong>Email sent 3 days after success signal:</strong></p>
<blockquote>
<p>Subject: "Congrats on passing! Share your story?"</p>
<p>Hi [Name],</p>
<p>We're so proud you passed! Your success is what keeps us going.</p>
<p>Would you mind sharing a quick testimonial? It helps other physicians discover Bayan.</p>
<p><strong>[Share Your Story]</strong> (button → form)</p>
<p>Takes 2 minutes. As thanks, we'll extend your subscription by 1 month free.</p>
</blockquote>

<h3>3. Testimonial Form</h3>
<p><strong>Fields:</strong></p>
<ul>
<li>Your name (public)</li>
<li>Role (Physician / Nurse / Student)</li>
<li>Exam passed (e.g. "OMFS Board Exam 2026")</li>
<li>Your score (optional)</li>
<li>How Bayan helped (150-300 words)</li>
<li>Permission to publish? (Yes / Anonymous / No)</li>
<li>Would you record a 30-second video? (Yes / No)</li>
</ul>

<h3>4. Video Request (Manual Follow-Up)</h3>
<p><strong>If "Yes" on video:</strong></p>
<ul>
<li>Nasim sends personal email with Loom/Calendly link</li>
<li>Record 30-60s testimonial via Zoom call</li>
<li>CEO edits video: add captions, Bayan logo, export for social</li>
</ul>

<h3>5. Testimonial Approval</h3>
<p><strong>CEO reviews every submission:</strong></p>
<ul>
<li><strong>Approve:</strong> Publish on website testimonials page + social media</li>
<li><strong>Edit:</strong> Request clarification (Nasim follows up)</li>
<li><strong>Reject:</strong> Thank user, don't publish (still give 1-month credit)</li>
</ul>

<h3>6. Case Study Development (B2B)</h3>
<p><strong>For testimonials with strong metrics:</strong></p>
<ul>
<li>CEO writes 1-page case study:
  <ul>
  <li><strong>Challenge:</strong> "Dr. [Name] had 60 days to prepare for OMFS boards..."</li>
  <li><strong>Solution:</strong> "Used Bayan's MCQ bank + spaced repetition..."</li>
  <li><strong>Results:</strong> "Passed on first attempt with 89% score"</li>
  </ul>
</li>
<li>Get user permission for B2B use</li>
<li>Publish on website: <code>bayan.edu.om/case-studies/[slug]</code></li>
<li>Use in Motion B pitches (hospital procurement)</li>
</ul>

<h2>Reward Structure</h2>
<table border="1">
<tr><th>Action</th><th>Reward</th></tr>
<tr><td>Written testimonial</td><td>1 month free</td></tr>
<tr><td>Video testimonial</td><td>2 months free</td></tr>
<tr><td>Full case study (with metrics)</td><td>3 months free + VIP badge</td></tr>
</table>

<h2>Publishing Channels</h2>
<ul>
<li><strong>Website:</strong> /testimonials page (rotating carousel)</li>
<li><strong>Social:</strong> LinkedIn, Twitter, Instagram (with user tag if permitted)</li>
<li><strong>Email:</strong> Weekly newsletter "Success Story" section</li>
<li><strong>B2B:</strong> Case study PDFs for hospital pitches</li>
</ul>

<h2>Exception Handling</h2>
<ul>
<li><strong>User changes mind:</strong> Remove published content within 48h of request</li>
<li><strong>Negative testimonial:</strong> Don't publish, CEO follows up to resolve issue</li>
<li><strong>Anonymous request:</strong> Use initials only (Dr. A.K.), hide photo</li>
</ul>
"""),
}

def main():
    s = Session()
    print("Login...")
    s.login()
    print("✓\n")

    print(f"=== Creating Proc {PROC_ID} Cores ===\n")

    core_ids = []
    for spec in CORES:
        print(f"Creating: {spec['name']}")

        st, body = s.json(
            f"/business-processes/{PROC_ID}/cores",
            method="POST",
            data=spec
        )

        if st == 302:
            # Success - fetch cores via JSON endpoint (inertia fails with 404)
            import time
            time.sleep(0.5)

            st2, cores_data = s.json(f"/business-processes/{PROC_ID}/cores", method="GET")

            if st2 == 200 and cores_data:
                # Find newest core (last in list)
                core_id = cores_data[-1]['id']
                core_ids.append(core_id)
                print(f"  ✓ Core {core_id}\n")
            else:
                print(f"  ✗ Fetch failed: {st2}\n")
        else:
            print(f"  ✗ Status {st}\n")

    if len(core_ids) != len(CORES):
        print(f"ERROR: Expected {len(CORES)} cores, got {len(core_ids)}")
        return

    print(f"\n=== Attaching L2 Blueprints ===\n")

    for idx, core_id in enumerate(core_ids):
        core_name = CORES[idx]["name"]
        category_name = CORES[idx]["category"]
        title, html = BLUEPRINTS[idx]

        print(f"Core {core_id} ({core_name}):")
        print(f"  Creating category: {category_name}")

        # Create category via marker activity
        st, body = s.json(
            f"/business-processes/{PROC_ID}/cores/{core_id}/activities",
            method="POST",
            data={
                "name": f"__MARKER__{category_name}",
                "category": category_name
            }
        )

        if st != 302:
            print(f"  ✗ Marker failed: {st}\n")
            continue

        # Extract category ID via JSON endpoint (inertia fails)
        st_fetch, cores_data = s.json(f'/business-processes/{PROC_ID}/cores', method='GET')

        if st_fetch != 200:
            print(f"  ✗ Fetch cores failed: {st_fetch}\n")
            continue

        core_data = next((c for c in cores_data if c['id'] == core_id), None)
        if not core_data:
            print(f"  ✗ Core {core_id} not found in list\n")
            continue

        activities = core_data.get('activities', [])
        marker = next((a for a in activities if '__MARKER__' in a['name']), None)

        if not marker:
            print(f"  ✗ Marker not found\n")
            continue

        cat_id = marker.get('category', {}).get('id')
        if not cat_id:
            print(f"  ✗ No category ID\n")
            continue

        print(f"  Category {cat_id} created")

        # Attach blueprint
        st2, body2 = s.json(
            f"/content/blueprint/category/{cat_id}",
            method="POST",
            data={"title": title, "content": html}
        )

        print(f"  Blueprint: {st2}")

        # Clean up marker
        marker_id = marker['id']
        s.json(f"/business-processes/activities/{marker_id}", method="DELETE")
        print(f"  Marker cleaned\n")

    print(f"\n✅ Proc {PROC_ID} complete")
    print(f"View at: https://hq.stage3.app/business-processes/{PROC_ID}")
    print(f"\nNext: Document L1 RACI + L3 SOPs in bayan-proc-success-to-referral.md")


if __name__ == "__main__":
    main()
