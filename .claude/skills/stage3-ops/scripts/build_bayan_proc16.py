#!/usr/bin/env python3
"""
Build Proc 16: Delivery to Success - Customer Success & Onboarding for Bayan.

This covers the post-purchase handoff: payment processed, account activated,
customer guided through first 90 days until they're self-sufficient.

4 Cores:
- 262: Payment & Account Provisioning
- 263: Onboarding Handoff
- 264: Weekly Progress Tracking
- 265: Exam Milestone Support
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from stage3_client import Session

PROC_ID = 16

CORES = [
    {
        "id": 262,
        "name": "Payment & Account Provisioning",
        "description": "When subscription payment clears (Stripe webhook), immediately provision account: activate premium features, send welcome email with login link, unlock full content library. Oman users skip payment but still get provisioned. Handoff to onboarding within 5 minutes of payment.",
        "owner": "Developer (automated), CEO monitors",
        "category": "Account Activation",
    },
    {
        "id": 263,
        "name": "Onboarding Handoff & First-Week Guidance",
        "description": "Guide new subscriber through first 7 days: Day 0 welcome email (how to start), Day 1 nudge (try first MCQ), Day 3 feature tour (OSCE/articles), Day 7 check-in (reaching aha moment?). Goal: 3 features used in first week. Automated email sequence + in-app tooltips.",
        "owner": "CEO (designs sequence), Developer (implements)",
        "category": "Customer Success Onboarding",
    },
    {
        "id": 264,
        "name": "Weekly Progress Tracking & Re-Engagement",
        "description": "Track active vs inactive subscribers: power users (5+ days/week), regular (2-4), at-risk (<2 days). Automated weekly email for at-risk: 'We noticed you haven't logged in' + personalized next step. Manual outreach for high-value accounts (institutions). Churn prevention.",
        "owner": "Nasim (monitors), CEO (high-touch outreach)",
        "category": "Retention & Engagement",
    },
    {
        "id": 265,
        "name": "Exam Milestone Support & Success Celebration",
        "description": "When subscriber reports exam date (via profile or email), send prep reminders: 30 days out, 7 days out, 1 day out. After exam: congrats email + request testimonial (if passed). This closes the loop: signup → study → pass → referral. Builds trust + social proof.",
        "owner": "Nasim (exam calendar), CEO (testimonial capture)",
        "category": "Milestone Management",
    },
]

# L2 Blueprints
BLUEPRINTS = {
    262: ("Payment & Account Provisioning Blueprint", """<h1>Payment & Account Provisioning</h1>

<h2>Trigger Events</h2>
<ul>
<li><strong>Stripe webhook:</strong> <code>customer.subscription.created</code> or <code>invoice.paid</code></li>
<li><strong>Oman user signup:</strong> Geo-detected OR manual override by CEO</li>
<li><strong>Institutional bulk purchase:</strong> CSV import of seat emails (Motion B)</li>
</ul>

<h2>Provisioning Steps (Automated)</h2>
<ol>
<li><strong>Database update:</strong> Set <code>user.subscription_status = 'active'</code>, <code>tier = 'premium'</code></li>
<li><strong>Feature unlock:</strong> Remove daily limits (unlimited MCQs, OSCEs, articles)</li>
<li><strong>Welcome email:</strong> Subject: "Welcome to Bayan Premium!" + login link + getting started guide</li>
<li><strong>Slack/Discord notification:</strong> Alert CEO + Nasim: "New subscriber: [name], [role], [plan]"</li>
<li><strong>Log event:</strong> <code>subscription_activated</code> → feeds Core 263 (KPI Dashboard)</li>
</ol>

<h2>Exception Handling</h2>
<ul>
<li><strong>Payment fails:</strong> Stripe retries 3x over 7 days → email user → if still fails, downgrade to free</li>
<li><strong>Duplicate account:</strong> Same email already premium → extend subscription, don't double-charge</li>
<li><strong>Webhook delay:</strong> If provisioning takes >5 min, manual fallback (CEO checks Stripe dashboard)</li>
</ul>

<h2>Quality Gates</h2>
<ul>
<li>User can log in and access premium content within 5 minutes of payment</li>
<li>Welcome email arrives within 10 minutes</li>
<li>Zero manual intervention for 95%+ of subscriptions</li>
</ul>
"""),

    263: ("Onboarding Handoff Blueprint", """<h1>Onboarding Handoff & First-Week Guidance</h1>

<h2>Email Sequence (Automated)</h2>

<h3>Day 0: Welcome (within 10 min of provisioning)</h3>
<p><strong>Subject:</strong> "Welcome to Bayan Premium! Here's how to start"</p>
<p><strong>Content:</strong></p>
<ul>
<li>Confirm subscription active</li>
<li>Login link</li>
<li>Recommended first step: "Try 5 MCQs in your specialty"</li>
<li>Link to feature tour video (2 min)</li>
</ul>

<h3>Day 1: First-Feature Nudge</h3>
<p><strong>Subject:</strong> "Ready for your first question?"</p>
<p><strong>Content:</strong></p>
<ul>
<li>Direct link to MCQ quiz</li>
<li>"Most new users start here"</li>
<li>Reminder: unlimited questions now</li>
</ul>

<h3>Day 3: Feature Tour</h3>
<p><strong>Subject:</strong> "3 features you should try this week"</p>
<p><strong>Content:</strong></p>
<ul>
<li>MCQs (you've tried), OSCEs (interactive cases), Articles (specialty deep-dives)</li>
<li>Direct links to each</li>
<li>"Aha moment = using all 3 in first 7 days"</li>
</ul>

<h3>Day 7: Check-In</h3>
<p><strong>Subject:</strong> "How's your first week going?"</p>
<p><strong>Content:</strong></p>
<ul>
<li>Personal stats: X questions answered, Y articles read</li>
<li>If <3 features used: "Try [missing feature] today"</li>
<li>If ≥3: "You're on track! Keep going"</li>
<li>Link to feedback form (optional)</li>
</ul>

<h2>In-App Guidance</h2>
<ul>
<li><strong>First login:</strong> Modal tour (skip-able) showing MCQ/OSCE/Articles tabs</li>
<li><strong>Tooltips:</strong> Appear once per feature, dismissable</li>
<li><strong>Progress bar:</strong> "2/3 features tried — unlock your aha moment!"</li>
</ul>

<h2>Success Metric</h2>
<p><strong>Aha moment rate:</strong> % of new subscribers using 3+ features in first 7 days. Target: 60%+</p>
"""),

    264: ("Weekly Progress Tracking Blueprint", """<h1>Weekly Progress Tracking & Re-Engagement</h1>

<h2>Engagement Tiers (Defined)</h2>
<table border="1">
<tr><th>Tier</th><th>Login Frequency</th><th>Action</th></tr>
<tr><td>Power User</td><td>5+ days/week</td><td>No intervention (they're happy)</td></tr>
<tr><td>Regular</td><td>2-4 days/week</td><td>Monitor, no immediate action</td></tr>
<tr><td>At-Risk</td><td><2 days/week</td><td>Re-engagement email (automated)</td></tr>
<tr><td>Churned</td><td>0 logins in 14 days</td><td>Manual outreach (CEO/Nasim)</td></tr>
</table>

<h2>Automated Re-Engagement (At-Risk)</h2>

<h3>Week 1 (No logins in 7 days)</h3>
<p><strong>Subject:</strong> "We noticed you haven't logged in"</p>
<p><strong>Content:</strong></p>
<ul>
<li>"Your subscription is active, but we haven't seen you lately"</li>
<li>Direct link to [last feature used or most popular feature]</li>
<li>"Need help getting started? Reply to this email"</li>
</ul>

<h3>Week 2 (Still inactive)</h3>
<p><strong>Subject:</strong> "Is everything OK with your Bayan account?"</p>
<p><strong>Content:</strong></p>
<ul>
<li>"We want to make sure you're getting value"</li>
<li>Quick survey: "What's holding you back?" (1-click options: too busy, technical issue, content not relevant)</li>
<li>CEO email signature (humanize)</li>
</ul>

<h3>Week 3 (Last attempt)</h3>
<p><strong>Subject:</strong> "Should we pause your subscription?"</p>
<p><strong>Content:</strong></p>
<ul>
<li>Offer to pause (no charge) for 1 month</li>
<li>Or: "Try [specific content] that matches your specialty"</li>
<li>If no response → escalate to manual churn call (CEO)</li>
</ul>

<h2>Manual Outreach (High-Value)</h2>
<ul>
<li><strong>Institutional accounts (Motion B):</strong> CEO calls personally if 0 logins in 7 days</li>
<li><strong>Physician accounts:</strong> Nasim sends personalized WhatsApp/email if inactive 14 days</li>
<li><strong>Referrers:</strong> Anyone who invited 2+ peers gets priority re-engagement</li>
</ul>

<h2>Dashboard View (Nasim checks daily)</h2>
<ul>
<li>At-risk subscribers this week: [count]</li>
<li>Emails sent: [count]</li>
<li>Re-activated: [count] (logged in after email)</li>
<li>Churned anyway: [count]</li>
</ul>
"""),

    265: ("Exam Milestone Support Blueprint", """<h1>Exam Milestone Support & Success Celebration</h1>

<h2>Exam Date Capture</h2>
<ul>
<li><strong>Profile field:</strong> "When's your exam?" (optional, date picker)</li>
<li><strong>Email ask:</strong> Day 7 onboarding email includes: "Tell us your exam date → get personalized reminders"</li>
<li><strong>Survey:</strong> Quarterly email: "Update your exam timeline"</li>
</ul>

<h2>Prep Reminder Sequence (Automated)</h2>

<h3>30 Days Out</h3>
<p><strong>Subject:</strong> "30 days to [exam name] — here's your study plan"</p>
<p><strong>Content:</strong></p>
<ul>
<li>Suggested daily schedule: 50 MCQs + 1 OSCE + 2 articles</li>
<li>Link to high-yield topics for this exam</li>
<li>"You've got this!"</li>
</ul>

<h3>7 Days Out</h3>
<p><strong>Subject:</strong> "Final week: focus on weak areas"</p>
<p><strong>Content:</strong></p>
<ul>
<li>Personal analytics: "Your weakest topics are [X, Y, Z]"</li>
<li>Direct link to practice questions in those areas</li>
<li>"Most students see biggest gains in last week"</li>
</ul>

<h3>1 Day Before</h3>
<p><strong>Subject:</strong> "Good luck tomorrow! You're ready."</p>
<p><strong>Content:</strong></p>
<ul>
<li>Motivational message</li>
<li>"You've answered [X] questions — more than 90% of test-takers"</li>
<li>"Trust your prep. We're rooting for you."</li>
</ul>

<h2>Post-Exam Follow-Up</h2>

<h3>3 Days After Exam</h3>
<p><strong>Subject:</strong> "How did it go?"</p>
<p><strong>Content:</strong></p>
<ul>
<li>"We hope your exam went well!"</li>
<li>Quick survey: Pass/Fail/Waiting for results</li>
<li>If passed: "Share your success story?" (testimonial request)</li>
<li>If failed: "We're here to help you prep for next time" (discount offer or extended trial)</li>
</ul>

<h2>Testimonial Capture (Passed)</h2>
<p><strong>Email:</strong> "Can we share your success?"</p>
<ul>
<li>Request: Name, specialty, exam name, 2-sentence quote</li>
<li>Offer: Featured on website + LinkedIn shoutout</li>
<li>Incentive: 1 month free extension OR referral bonus ($20 credit per invite)</li>
</ul>

<h2>Success Metrics</h2>
<ul>
<li><strong>Exam date capture rate:</strong> % of subscribers who share exam date (target: 40%+)</li>
<li><strong>Testimonial conversion:</strong> % of passers who give testimonial (target: 20%+)</li>
<li><strong>Referral from passers:</strong> Avg invites per passer (target: 1.5+)</li>
</ul>
"""),
}

# L3 SOPs
SOPS = {
    262: ("Payment & Account Provisioning SOP", """<h1>Payment & Account Provisioning SOP</h1>

<h2>Step 1: Set Up Stripe Webhook</h2>
<ol>
<li>Developer logs into Stripe dashboard</li>
<li>Webhooks → Add endpoint → <code>https://bayan.edu.om/api/webhooks/stripe</code></li>
<li>Subscribe to events: <code>customer.subscription.created</code>, <code>invoice.paid</code></li>
<li>Save webhook secret for verification</li>
</ol>

<h2>Step 2: Build Provisioning Handler</h2>
<ol>
<li>Developer creates endpoint: <code>POST /api/webhooks/stripe</code></li>
<li>Verify webhook signature (Stripe SDK)</li>
<li>On <code>invoice.paid</code>:
<pre>
user = get_user_by_stripe_customer_id(event.customer)
user.subscription_status = 'active'
user.tier = 'premium'
user.save()
send_welcome_email(user)
log_event('subscription_activated', user)
</pre>
</li>
</ol>

<h2>Step 3: Build Welcome Email Template</h2>
<ol>
<li>Subject: "Welcome to Bayan Premium!"</li>
<li>Body:
  <ul>
  <li>Confirm subscription active</li>
  <li>Login link: <code>https://bayan.edu.om/login</code></li>
  <li>Getting started guide (PDF or inline)</li>
  <li>CEO signature</li>
  </ul>
</li>
<li>Send via Mailgun/SendGrid</li>
</ol>

<h2>Step 4: Test End-to-End</h2>
<ol>
<li>Developer uses Stripe test mode</li>
<li>Make test purchase → webhook fires → user provisioned → email sent</li>
<li>Verify: Can log in? Premium features unlocked? Email arrived?</li>
</ol>

<h2>Step 5: Monitor in Production</h2>
<ol>
<li>CEO checks Slack channel: "New subscriber" notifications</li>
<li>If provisioning fails → developer investigates Stripe webhook logs</li>
<li>Manual fallback: CEO updates user tier in Django admin</li>
</ol>

<h2>Troubleshooting</h2>
<ul>
<li><strong>Webhook not firing:</strong> Check Stripe dashboard → Webhooks → verify endpoint URL</li>
<li><strong>Email not sent:</strong> Check Mailgun logs, verify SMTP credentials</li>
<li><strong>User still has limits:</strong> Database update failed → run provisioning script manually</li>
</ul>
"""),

    263: ("Onboarding Handoff SOP", """<h1>Onboarding Handoff SOP</h1>

<h2>Step 1: Design Email Sequence</h2>
<ol>
<li>CEO + Nasim draft emails in Google Doc:
  <ul>
  <li>Day 0: Welcome</li>
  <li>Day 1: First-feature nudge</li>
  <li>Day 3: Feature tour</li>
  <li>Day 7: Check-in</li>
  </ul>
</li>
<li>Review: Does each email have ONE clear CTA? Is copy conversational?</li>
</ol>

<h2>Step 2: Implement Email Automation</h2>
<ol>
<li>Developer sets up drip campaign in Mailgun/Customer.io:
<pre>
Trigger: user.subscription_status = 'active'
Day 0: Send "welcome.html"
Day 1: Send "first_feature.html"
Day 3: Send "feature_tour.html"
Day 7: Send "checkin.html"
</pre>
</li>
<li>Personalize with merge tags: <code>{{user.name}}</code>, <code>{{user.role}}</code></li>
</ol>

<h2>Step 3: Build In-App Tour</h2>
<ol>
<li>Developer adds modal on first login:
<pre>
if (user.login_count === 1) {
  showTour(['MCQ tab', 'OSCE tab', 'Articles tab']);
}
</pre>
</li>
<li>Include "Skip" button (don't force)</li>
<li>Track completion: <code>log_event('tour_completed', user)</code></li>
</ol>

<h2>Step 4: Add Progress Bar</h2>
<ol>
<li>Dashboard widget: "2/3 features tried"</li>
<li>Updates when user:
  <ul>
  <li>Completes 1 MCQ → feature_mcq = true</li>
  <li>Completes 1 OSCE → feature_osce = true</li>
  <li>Reads 1 article → feature_article = true</li>
  </ul>
</li>
<li>When 3/3 → show celebration confetti + badge</li>
</ol>

<h2>Step 5: Monitor Aha Moment Rate</h2>
<ol>
<li>Weekly: Nasim pulls metric from Mixpanel dashboard</li>
<li>Formula: (Users with 3+ features in 7 days) / (New subscribers) × 100</li>
<li>Target: 60%+</li>
<li>If below → A/B test email copy or in-app nudges</li>
</ol>

<h2>Troubleshooting</h2>
<ul>
<li><strong>Low open rates:</strong> A/B test subject lines, send time</li>
<li><strong>Low click-through:</strong> CTAs not clear → simplify to one action per email</li>
<li><strong>Tour annoying users:</strong> Add "Don't show again" option</li>
</ul>
"""),

    264: ("Weekly Progress Tracking SOP", """<h1>Weekly Progress Tracking SOP</h1>

<h2>Step 1: Define Engagement Tiers (Code)</h2>
<ol>
<li>Developer writes daily cron job:
<pre>
for user in active_subscribers:
    logins_last_7_days = count_logins(user, days=7)

    if logins_last_7_days >= 5:
        user.engagement_tier = 'power'
    elif logins_last_7_days >= 2:
        user.engagement_tier = 'regular'
    elif logins_last_7_days >= 1:
        user.engagement_tier = 'at_risk'
    else:
        user.engagement_tier = 'churned'

    user.save()
</pre>
</li>
<li>Run daily at midnight UTC</li>
</ol>

<h2>Step 2: Set Up Re-Engagement Emails</h2>
<ol>
<li>Developer configures drip campaign:
<pre>
Trigger: user.engagement_tier = 'at_risk'
Week 1 (Day 7 inactive): Send "noticed_you_havent_logged_in.html"
Week 2 (Day 14 inactive): Send "is_everything_ok.html"
Week 3 (Day 21 inactive): Send "pause_subscription.html"
</pre>
</li>
<li>Stop sending if user logs in (tier changes)</li>
</ol>

<h2>Step 3: Build Dashboard for Nasim</h2>
<ol>
<li>Developer creates <code>/admin/engagement</code> page showing:
  <ul>
  <li>At-risk subscribers this week: [list with names, last login]</li>
  <li>Re-engagement emails sent: [count]</li>
  <li>Re-activated: [count] (logged in after email)</li>
  <li>Churned anyway: [count]</li>
  </ul>
</li>
<li>Nasim checks daily, flags high-value accounts for manual outreach</li>
</ol>

<h2>Step 4: Manual Outreach (High-Value)</h2>
<ol>
<li>Nasim exports at-risk list filtered by:
  <ul>
  <li>Institutional accounts (Motion B)</li>
  <li>Physicians (high ARPU)</li>
  <li>Referrers (invited 2+ peers)</li>
  </ul>
</li>
<li>Send personalized WhatsApp/email: "Hey [name], haven't seen you on Bayan lately. Need any help?"</li>
<li>Log outcome in CRM: Re-engaged / Churned / Needs follow-up</li>
</ol>

<h2>Step 5: Weekly Review (CEO + Nasim)</h2>
<ol>
<li>Every Monday: Review engagement dashboard together</li>
<li>Questions:
  <ul>
  <li>Churn rate this week: Up or down?</li>
  <li>Re-engagement email working? (% who come back)</li>
  <li>Any patterns in at-risk users? (specialty, geo, plan)</li>
  </ul>
</li>
<li>Action items: e.g. "Nurses churning more → test nurse-specific content"</li>
</ol>

<h2>Troubleshooting</h2>
<ul>
<li><strong>High churn despite emails:</strong> Content not valuable → survey churned users for feedback</li>
<li><strong>Re-engagement emails going to spam:</strong> Check email authentication (SPF, DKIM, DMARC)</li>
<li><strong>Manual outreach not scaling:</strong> Hire customer success person OR automate more</li>
</ul>
"""),

    265: ("Exam Milestone Support SOP", """<h1>Exam Milestone Support SOP</h1>

<h2>Step 1: Add Exam Date Field</h2>
<ol>
<li>Developer adds to user profile:
<pre>
exam_date: Date (optional)
exam_name: String (e.g. "USMLE Step 1", "PLAB Part 1")
</pre>
</li>
<li>UI: Date picker on profile page + onboarding email link</li>
</ol>

<h2>Step 2: Build Reminder Automation</h2>
<ol>
<li>Developer writes daily cron job:
<pre>
for user in users_with_exam_date:
    days_until_exam = (user.exam_date - today).days

    if days_until_exam == 30:
        send_email('exam_30days.html', user)
    elif days_until_exam == 7:
        send_email('exam_7days.html', user)
    elif days_until_exam == 1:
        send_email('exam_1day.html', user)
    elif days_until_exam == -3:  # 3 days after exam
        send_email('exam_followup.html', user)
</pre>
</li>
<li>Run daily at 8am user's timezone (if known, else UTC)</li>
</ol>

<h2>Step 3: Personalize 30-Day Email</h2>
<ol>
<li>Subject: "30 days to {{exam_name}} — here's your study plan"</li>
<li>Content:
  <ul>
  <li>Suggested daily schedule: 50 MCQs + 1 OSCE + 2 articles</li>
  <li>Link to high-yield topics: <code>https://bayan.edu.om/exams/{{exam_name}}/high-yield</code></li>
  <li>"You've got this!"</li>
  </ul>
</li>
</ol>

<h2>Step 4: Capture Post-Exam Feedback</h2>
<ol>
<li>3 days after exam: Send survey email</li>
<li>Survey questions:
  <ul>
  <li>How did it go? [Pass / Fail / Waiting for results]</li>
  <li>If passed: Would you share a testimonial? [Yes / No]</li>
  <li>If failed: Want help prepping for next attempt? [Yes / No]</li>
  </ul>
</li>
<li>Store responses in database for follow-up</li>
</ol>

<h2>Step 5: Request Testimonials (Passed)</h2>
<ol>
<li>If user clicked "Yes" on testimonial → Nasim sends personalized email:
  <ul>
  <li>Subject: "Congrats on passing {{exam_name}}! Can we share your story?"</li>
  <li>Request: Name, specialty, 2-sentence quote about Bayan</li>
  <li>Incentive: Featured on website + 1 month free extension</li>
  </ul>
</li>
<li>Nasim collects responses in Google Sheet</li>
<li>CEO publishes testimonials on website + social media</li>
</ol>

<h2>Step 6: Support Failed Attempts</h2>
<ol>
<li>If user marked "Fail" → CEO sends personal email:
  <ul>
  <li>Subject: "We're here to help you succeed next time"</li>
  <li>Offer: 20% discount on next month OR free study plan consultation</li>
  <li>Empathy: "Failing is part of learning. Let's get you ready for round 2."</li>
  </ul>
</li>
<li>Track retake rate: How many come back and pass?</li>
</ol>

<h2>Troubleshooting</h2>
<ul>
<li><strong>Low exam date capture:</strong> Make field more visible (modal on dashboard)</li>
<li><strong>Low testimonial rate:</strong> Increase incentive (referral bonus instead of free month)</li>
<li><strong>Reminders sent to wrong timezone:</strong> Store user timezone on signup</li>
</ul>
"""),
}


def main():
    s = Session()
    print("Login...")
    s.login()
    print("✓\n")

    print("=== Creating Proc 16 Cores ===\n")

    # Create cores
    created_cores = []
    for core_def in CORES:
        core_id = core_def["id"]
        print(f"Core {core_id}: {core_def['name']}")

        st, body = s.json(
            f"/business-processes/{PROC_ID}/cores",
            method="POST",
            data={
                "name": core_def["name"],
                "description": core_def["description"],
                "owner": core_def["owner"],
            }
        )

        if st in (200, 302):
            print(f"  ✓ Created\n")
            created_cores.append(core_id)
        else:
            print(f"  ✗ Failed: {st}\n")

    # Create categories and attach blueprints
    print("\n=== Attaching Blueprints ===\n")
    category_map = {}

    for core_id in created_cores:
        cat_name = [c for c in CORES if c["id"] == core_id][0]["category"]
        print(f"Core {core_id}: Creating category '{cat_name}'...")

        # Create marker activity to create category
        st, body = s.json(
            f"/business-processes/{PROC_ID}/cores/{core_id}/activities",
            method="POST",
            data={
                "name": f"__MARKER__{cat_name}",
                "category": cat_name
            }
        )

        if st not in (200, 302):
            print(f"  ✗ Category creation failed: {st}\n")
            continue

        # Get category_id
        d = s.inertia(f'/business-processes/{PROC_ID}/cores/{core_id}')
        activities = d.get('props', {}).get('activities', [])
        marker = next((a for a in activities if a['name'].startswith('__MARKER__')), None)

        if not marker:
            print(f"  ✗ Marker not found\n")
            continue

        cat = marker.get('category')
        cat_id = cat.get('id') if isinstance(cat, dict) else marker.get('activity_category_id')

        if not cat_id:
            print(f"  ✗ No category_id\n")
            continue

        category_map[core_id] = cat_id
        print(f"  ✓ Category {cat_id}")

        # Attach blueprint
        title, html = BLUEPRINTS[core_id]
        st2, body2 = s.json(
            f"/content/blueprint/category/{cat_id}",
            method="POST",
            data={"title": title, "content": html}
        )

        if st2 in (200, 302):
            print(f"  ✓ Blueprint attached")
        else:
            print(f"  ✗ Blueprint failed: {st2}")

        # Delete marker
        s.json(f"/business-processes/activities/{marker['id']}", method="DELETE")
        print(f"  ✓ Marker cleaned\n")

    # Attach SOPs (skip - 404 endpoint issue, will document separately)
    print("\n✅ Proc 16 cores created with L2 Blueprints")
    print("L3 SOPs: Documented above, attach via UI or separate script")
    print("\nView at: https://hq.stage3.app/business-processes/16")


if __name__ == "__main__":
    main()
