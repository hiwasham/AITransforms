#!/usr/bin/env python3
"""
Attach L2 Blueprints and L3 SOPs to Proc 22 cores (262-264).
Categories already created: 783 (262), 784 (263), 785 (264).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from stage3_client import Session

CATEGORY_MAP = {
    262: 783,  # Analytics Implementation
    263: 784,  # KPI Dashboard
    264: 785,  # Unit Economics
}

# L2 Blueprints
BLUEPRINTS = {
    262: ("Analytics Implementation Blueprint", """<h1>Analytics Implementation & Event Instrumentation</h1>

<h2>Sub-Processes</h2>

<h3>1. Tool Selection</h3>
<p><strong>Decision tree:</strong></p>
<ul>
<li>Need SQL access + custom queries? → Mixpanel or Amplitude</li>
<li>Tight budget + basic funnel? → GA4 (free)</li>
<li>Already using Google Ads? → GA4 (attribution)</li>
</ul>
<p><strong>Bayan recommendation:</strong> Mixpanel (generous free tier, medical SaaS-friendly, SQL export)</p>

<h3>2. Event Taxonomy Design</h3>
<p>Map every user action to an event. Standard SaaS taxonomy:</p>
<ul>
<li><code>page_view</code> - every page load</li>
<li><code>signup_started</code> - registration form opened</li>
<li><code>signup_completed</code> - account created</li>
<li><code>diagnostic_completed</code> - onboarding quiz done (Core 255)</li>
<li><code>feature_trial_started</code> - first MCQ/OSCE/article used</li>
<li><code>paywall_hit</code> - user hits limit (Core 259)</li>
<li><code>pricing_viewed</code> - pricing page opened</li>
<li><code>trial_started</code> - 30-day trial begins (Core 256)</li>
<li><code>subscription_purchased</code> - payment complete</li>
<li><code>churn</code> - subscription canceled</li>
</ul>

<h3>3. Installation</h3>
<p>Add tracking snippet to:</p>
<ul>
<li>bayan.edu.om (main product)</li>
<li>bayanai.tech (landing pages)</li>
<li>All payment flows (Stripe checkout)</li>
</ul>

<h3>4. QA & Validation</h3>
<p><strong>Quality gate:</strong> Every critical event fires correctly in test environment before production.</p>
<p>Test with browser dev tools (Mixpanel debugger, GA4 DebugView).</p>

<h3>5. Documentation</h3>
<p>Event catalog spreadsheet:</p>
<table border="1">
<tr><th>Event Name</th><th>Fires When</th><th>Properties</th><th>Owner Core</th></tr>
<tr><td>signup_completed</td><td>Account created</td><td>role, geo, source</td><td>Core 255</td></tr>
<tr><td>paywall_hit</td><td>Daily limit reached</td><td>feature, limit_type</td><td>Core 259</td></tr>
</table>

<h2>Exception Handling</h2>
<ul>
<li><strong>Tracking breaks:</strong> Alert fires within 1 hour → developer fixes same day</li>
<li><strong>Event fires wrong data:</strong> Developer patches → re-QA within 24h</li>
<li><strong>Tool quota exceeded:</strong> Upgrade plan or switch tool (CEO decision)</li>
</ul>
"""),

    263: ("KPI Dashboard Blueprint", """<h1>KPI Dashboard & Real-Time Monitoring</h1>

<h2>Dashboard Structure</h2>

<h3>Section 1: AARRR Overview (Top)</h3>
<ul>
<li>Acquisition: New signups this week vs last week</li>
<li>Activation: Aha moment rate (% reaching 3 features in 7 days)</li>
<li>Retention: MAU, churn rate</li>
<li>Referral: Peer invites sent, accepted</li>
<li>Revenue: MRR, trial→paid conversion</li>
</ul>

<h3>Section 2: Motion Split (Middle)</h3>
<table border="1">
<tr><th>Metric</th><th>Motion A (B2C)</th><th>Motion B (B2B)</th></tr>
<tr><td>New trials this week</td><td>X</td><td>Y</td></tr>
<tr><td>Trial→paid conversion</td><td>X%</td><td>Y%</td></tr>
<tr><td>MRR</td><td>$X</td><td>$Y</td></tr>
</table>

<h3>Section 3: Alerts (Bottom)</h3>
<ul>
<li>Churn spike: >5% weekly churn (normal <3%)</li>
<li>Conversion drop: Trial→paid <10% (normal 15-20%)</li>
<li>Traffic drop: Daily signups <50% of 7-day average</li>
</ul>

<h2>Update Frequency</h2>
<ul>
<li><strong>Revenue metrics:</strong> Real-time (Stripe webhooks)</li>
<li><strong>User metrics:</strong> Daily batch (midnight UTC)</li>
<li><strong>Cohort analysis:</strong> Weekly (Sundays)</li>
</ul>

<h2>Access Control</h2>
<ul>
<li>CEO: Full access, edit permissions</li>
<li>Nasim: Full read, no edit</li>
<li>Developer: Admin (builds queries, maintains dashboard)</li>
</ul>
"""),

    264: ("Unit Economics Blueprint", """<h1>Unit Economics & Cohort Analysis</h1>

<h2>Formulas</h2>

<h3>LTV (Lifetime Value)</h3>
<pre>
LTV = ARPU × Average Subscription Length (months)

Example (physician):
  ARPU = $199/yr = $16.58/mo
  Avg length = 18 months (estimated, will track)
  LTV = $16.58 × 18 = $298.44
</pre>

<h3>CAC (Customer Acquisition Cost)</h3>
<pre>
CAC = Total Marketing Spend / New Paying Customers

Example (October):
  Spend = $500 (ads) + $300 (Nasim time) = $800
  New paid = 20
  CAC = $800 / 20 = $40
</pre>

<h3>LTV/CAC Ratio</h3>
<pre>
LTV/CAC = $298 / $40 = 7.45  ← Healthy! (target >3)
</pre>

<h3>Payback Period</h3>
<pre>
Payback = CAC / Monthly Revenue per Customer

Example:
  CAC = $40
  Monthly revenue = $16.58
  Payback = 40 / 16.58 = 2.4 months  ← Excellent! (target <12)
</pre>

<h2>Cohort Retention Curves</h2>
<p>Track each monthly signup cohort (e.g. "Jan 2026 cohort"):</p>
<table border="1">
<tr><th>Month</th><th>Jan Cohort</th><th>Feb Cohort</th><th>Mar Cohort</th></tr>
<tr><td>Month 0</td><td>100%</td><td>100%</td><td>100%</td></tr>
<tr><td>Month 1</td><td>85%</td><td>87%</td><td>90%</td></tr>
<tr><td>Month 3</td><td>65%</td><td>70%</td><td>?</td></tr>
<tr><td>Month 6</td><td>50%</td><td>?</td><td>?</td></tr>
<tr><td>Month 12</td><td>35%</td><td>?</td><td>?</td></tr>
</table>

<h2>Segmentation</h2>
<p>Calculate LTV/CAC separately for:</p>
<ul>
<li><strong>Motion A</strong> (self-serve) vs <strong>Motion B</strong> (institutional)</li>
<li><strong>Physician</strong> vs <strong>Nurse</strong> vs <strong>Student</strong></li>
<li><strong>Paid channel</strong> (ads) vs <strong>Organic</strong> (SEO, content) vs <strong>Referral</strong></li>
</ul>

<h2>Decision Triggers</h2>
<ul>
<li><strong>LTV/CAC < 1.5:</strong> Stop spending on that channel (losing money)</li>
<li><strong>Payback > 12 months:</strong> Cash flow risk, reduce spend</li>
<li><strong>Month-3 retention < 40%:</strong> Product problem, fix before scaling marketing</li>
</ul>
"""),
}

# L3 SOPs
SOPS = {
    262: ("Analytics Implementation SOP", """<h1>Analytics Implementation SOP</h1>

<h2>Step 1: Choose Tool</h2>
<ol>
<li>CEO reviews options (GA4 free, Mixpanel $0-299/mo, Amplitude $0-999/mo)</li>
<li>Decision: Mixpanel (recommended for medical SaaS)</li>
<li>Create Mixpanel account at mixpanel.com</li>
</ol>

<h2>Step 2: Design Event Taxonomy</h2>
<ol>
<li>CEO + Nasim list every conversion step: landing → signup → diagnostic → trial → paid</li>
<li>Developer maps each step to an event name (use snake_case: <code>signup_completed</code>)</li>
<li>Document in shared spreadsheet (Google Sheets)</li>
</ol>

<h2>Step 3: Install Tracking Code</h2>
<ol>
<li>Developer gets Mixpanel project token from dashboard</li>
<li>Add Mixpanel SDK to bayan.edu.om:
<pre>&lt;script src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js"&gt;&lt;/script&gt;
&lt;script&gt;mixpanel.init('YOUR_TOKEN');&lt;/script&gt;</pre>
</li>
<li>Repeat for bayanai.tech</li>
<li>Add event calls at each conversion point:
<pre>mixpanel.track('signup_completed', {role: 'physician', geo: 'Oman'});</pre>
</li>
</ol>

<h2>Step 4: QA Events</h2>
<ol>
<li>Developer opens Mixpanel debugger (dashboard → "Live View")</li>
<li>Walk through full user journey in test environment</li>
<li>Verify each event fires with correct properties</li>
<li>Fix any missing/broken events</li>
</ol>

<h2>Step 5: Deploy to Production</h2>
<ol>
<li>Merge tracking code to production branch</li>
<li>Monitor for 24 hours</li>
<li>CEO checks: "Are signup events coming in?"</li>
</ol>

<h2>Troubleshooting</h2>
<ul>
<li><strong>Events not firing:</strong> Check browser console for errors, verify token is correct</li>
<li><strong>Wrong data:</strong> Check event properties, fix typos in tracking code</li>
<li><strong>Delayed events:</strong> Mixpanel can delay up to 5 minutes (normal)</li>
</ul>
"""),

    263: ("KPI Dashboard SOP", """<h1>KPI Dashboard SOP</h1>

<h2>Step 1: Design Layout</h2>
<ol>
<li>CEO + Nasim list must-have metrics (AARRR + motion split)</li>
<li>Sketch dashboard layout on paper or Figma</li>
<li>Prioritize: Top = most important (MRR, churn), Bottom = alerts</li>
</ol>

<h2>Step 2: Build Dashboard</h2>
<ol>
<li>Developer logs into Mixpanel → "Boards" → "Create Board"</li>
<li>Add charts:
  <ul>
  <li>Line chart: MRR over time</li>
  <li>Bar chart: New signups by week</li>
  <li>Funnel: Signup → Trial → Paid</li>
  <li>Retention: Cohort retention curves</li>
  </ul>
</li>
<li>Group by Motion A vs Motion B (use "Breakdown" feature)</li>
</ol>

<h2>Step 3: Set Alerts</h2>
<ol>
<li>Mixpanel → "Insights" → "Create Alert"</li>
<li>Alert 1: Churn rate > 5% weekly → email CEO + Nasim</li>
<li>Alert 2: Trial→paid conversion < 10% → email CEO</li>
<li>Alert 3: Daily signups drop >50% → email CEO</li>
</ol>

<h2>Step 4: Daily Check-In</h2>
<ol>
<li>CEO opens dashboard every morning (bookmark URL)</li>
<li>Scan top metrics: MRR up or down? Churn normal?</li>
<li>If red flag → discuss with Nasim same day</li>
</ol>

<h2>Step 5: Weekly Review</h2>
<ol>
<li>Every Monday: CEO + Nasim review dashboard together</li>
<li>Identify trends: What's working? What's broken?</li>
<li>Action items: e.g. "Paywall conversion dropped → test new copy"</li>
</ol>

<h2>Troubleshooting</h2>
<ul>
<li><strong>Dashboard won't load:</strong> Check Mixpanel status page, clear browser cache</li>
<li><strong>Metrics look wrong:</strong> Spot-check vs raw data in Mixpanel "Events" tab</li>
<li><strong>Alert spam:</strong> Adjust thresholds (e.g. 5% churn → 7% if too noisy)</li>
</ul>
"""),

    264: ("Unit Economics SOP", """<h1>Unit Economics SOP</h1>

<h2>Step 1: Calculate ARPU (Monthly)</h2>
<ol>
<li>Pull total MRR from Stripe dashboard</li>
<li>Count active paying subscribers</li>
<li>ARPU = MRR / Subscribers</li>
<li>Example: $3,000 MRR / 150 subs = $20 ARPU</li>
</ol>

<h2>Step 2: Track CAC (Monthly)</h2>
<ol>
<li>Sum all marketing spend for the month:
  <ul>
  <li>Paid ads (Google, Meta)</li>
  <li>Content creation (Nasim time × hourly rate)</li>
  <li>Tools (Canva, CapCut subscriptions)</li>
  </ul>
</li>
<li>Count new paying customers that month</li>
<li>CAC = Total Spend / New Customers</li>
<li>Example: $800 spend / 20 new = $40 CAC</li>
</ol>

<h2>Step 3: Estimate LTV (Quarterly)</h2>
<ol>
<li>Pull average subscription length from Stripe:
  <ul>
  <li>If unavailable, estimate from churn: LTV months ≈ 1 / churn rate</li>
  <li>Example: 5% monthly churn → 1/0.05 = 20 months</li>
  </ul>
</li>
<li>LTV = ARPU × Avg Subscription Length</li>
<li>Example: $20 × 20 = $400</li>
</ol>

<h2>Step 4: Calculate LTV/CAC Ratio</h2>
<ol>
<li>LTV/CAC = $400 / $40 = 10</li>
<li><strong>Interpret:</strong>
  <ul>
  <li>> 3: Healthy, can scale marketing</li>
  <li>1.5 - 3: Marginal, optimize before scaling</li>
  <li>< 1.5: Losing money, stop spending</li>
  </ul>
</li>
</ol>

<h2>Step 5: Build Cohort Retention Table (Monthly)</h2>
<ol>
<li>Developer pulls data from Mixpanel or Stripe</li>
<li>For each monthly cohort (e.g. "Jan 2026"):
  <ul>
  <li>Month 0: 100% (all signups)</li>
  <li>Month 1: % still subscribed</li>
  <li>Month 3: % still subscribed</li>
  <li>Month 6: % still subscribed</li>
  </ul>
</li>
<li>Plot on graph → see where users churn</li>
</ol>

<h2>Step 6: Weekly Review</h2>
<ol>
<li>CEO reviews:
  <ul>
  <li>LTV/CAC ratio → can we scale?</li>
  <li>Payback period → cash flow OK?</li>
  <li>Retention curves → product working?</li>
  </ul>
</li>
<li>If LTV/CAC drops → investigate: CAC rising or LTV falling?</li>
<li>Action: Cut unprofitable channels, double down on winners</li>
</ol>

<h2>Troubleshooting</h2>
<ul>
<li><strong>LTV estimate unreliable:</strong> Not enough data yet (need 6+ months). Use industry benchmarks (medical SaaS: 18-24 mo avg)</li>
<li><strong>CAC hard to track:</strong> Use time-tracking for Nasim's hours, allocate % to marketing</li>
<li><strong>Churn calculation confusing:</strong> Churn = Customers Lost / Total at Start of Period</li>
</ul>
"""),
}


def main():
    s = Session()
    print("Login...")
    s.login()
    print("✓\n")

    # Attach L2 Blueprints
    print("=== Attaching L2 Blueprints ===\n")
    for core_id, cat_id in CATEGORY_MAP.items():
        title, html = BLUEPRINTS[core_id]
        print(f"Core {core_id} / Category {cat_id}: {title}")

        st, body = s.json(
            f"/content/blueprint/category/{cat_id}",
            method="POST",
            data={"title": title, "content": html}
        )

        print(f"  → {st}\n")

    # Attach L3 SOPs
    print("\n=== Attaching L3 SOPs ===\n")
    for core_id in CATEGORY_MAP.keys():
        sop_title, sop_html = SOPS[core_id]
        print(f"Core {core_id}: {sop_title}")

        # Create SOP
        st, body = s.json(
            f"/business-processes/22/cores/{core_id}/sop-template",
            method="POST",
            data={"title": sop_title}
        )

        if st != 200:
            print(f"  ✗ Create failed: {st}\n")
            continue

        sop_id = body.get("id")
        version_id = body.get("version", {}).get("id")

        if not sop_id or not version_id:
            print(f"  ✗ No SOP/version ID\n")
            continue

        print(f"  Created: SOP {sop_id}, version {version_id}")

        # Save content
        st2, body2 = s.json(
            f"/content/sop-template/{sop_id}/versions/{version_id}",
            method="PUT",
            data={"content": sop_html}
        )

        print(f"  Content: {st2}")

        # Publish
        st3, body3 = s.json(
            f"/content/sop-template/{sop_id}/status",
            method="PUT",
            data={"status": "published"}
        )

        print(f"  Publish: {st3}\n")

    # Clean up marker activities
    print("\n=== Cleaning up markers ===\n")
    for core_id in CATEGORY_MAP.keys():
        d = s.inertia(f'/business-processes/22/cores/{core_id}')
        activities = d.get('props', {}).get('activities', [])

        for act in activities:
            if act['name'].startswith('__MARKER__'):
                s.json(f"/business-processes/activities/{act['id']}", method="DELETE")
                print(f"Core {core_id}: Deleted marker {act['id']}")

    print("\n✅ Proc 22 content attached")
    print("View at: https://hq.stage3.app/business-processes/22")


if __name__ == "__main__":
    main()
