#!/usr/bin/env python3
"""
Build Proc 22: Financial Performance Management - Funnel Instrumentation & Unit Economics for Bayan.

This is the CRITICAL enabler - without measurement, optimization is blind.

3 Cores:
- 268: Analytics Implementation (GA4/Mixpanel setup)
- 269: KPI Dashboard (real-time metrics)
- 270: Unit Economics Tracking (LTV/CAC/cohort analysis)
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from stage3_client import Session

PROC_ID = 22

# Core definitions
CORES = [
    {
        "id": 268,
        "name": "Analytics Implementation & Event Instrumentation",
        "description": "Install and configure analytics tracking (GA4, Mixpanel, or Amplitude) to capture every user action from landing to churn. Without this, every optimization is a guess. Tracks: page views, feature usage, paywall hits, conversion events, drop-offs.",
        "owner": "CEO (delegates to developer)",
        "category": "Measurement Infrastructure",
    },
    {
        "id": 269,
        "name": "KPI Dashboard & Real-Time Monitoring",
        "description": "Live dashboard showing AARRR metrics: reach→follower, follower→trial, trial→paid, MRR, churn. Updates daily. CEO + Nasim see same numbers. Replaces manual reporting. Tools: Mixpanel dashboard, Google Looker Studio, or custom.",
        "owner": "CEO (reads daily), Nasim (maintains)",
        "category": "Reporting & Visibility",
    },
    {
        "id": 270,
        "name": "Unit Economics & Cohort Analysis",
        "description": "Track LTV (lifetime value), CAC (customer acquisition cost), payback period, and cohort retention curves. Per motion (A vs B), per role (physician/nurse/student), per geo. This tells you which channels work and which burn money.",
        "owner": "CEO (reviews weekly)",
        "category": "Financial Analytics",
    },
]

# L1 RACI HTML (one per core)
RACI_HTML = {
    268: """<h2>Analytics Implementation & Event Instrumentation</h2>

<h3>RACI Matrix</h3>
<table border="1" cellpadding="8">
<tr><th>Activity</th><th>Responsible</th><th>Accountable</th><th>Consulted</th><th>Informed</th></tr>
<tr>
  <td>Choose analytics tool (GA4, Mixpanel, Amplitude)</td>
  <td>CEO</td>
  <td>CEO</td>
  <td>Developer</td>
  <td>Nasim</td>
</tr>
<tr>
  <td>Define event taxonomy (page views, clicks, conversions)</td>
  <td>CEO + Nasim</td>
  <td>CEO</td>
  <td>-</td>
  <td>Developer</td>
</tr>
<tr>
  <td>Install tracking code on bayan.edu.om + bayanai.tech</td>
  <td>Developer</td>
  <td>CEO</td>
  <td>-</td>
  <td>Nasim</td>
</tr>
<tr>
  <td>Test events fire correctly (QA)</td>
  <td>Developer</td>
  <td>Developer</td>
  <td>CEO</td>
  <td>Nasim</td>
</tr>
<tr>
  <td>Document event catalog (what fires when)</td>
  <td>Developer</td>
  <td>CEO</td>
  <td>Nasim</td>
  <td>-</td>
</tr>
</table>

<h3>KPIs</h3>
<ul>
<li><strong>Event coverage</strong>: 100% of conversion funnel instrumented (landing → trial → paid)</li>
<li><strong>Data latency</strong>: Events appear in dashboard within 5 minutes</li>
<li><strong>Uptime</strong>: 99%+ (tracking must not break)</li>
</ul>

<h3>Integration Points</h3>
<ul>
<li>Feeds Core 269 (KPI Dashboard) - events → metrics</li>
<li>Feeds Core 270 (Unit Economics) - conversion events → LTV/CAC</li>
<li>Feeds all Layer 2 cores - every process gets measurable</li>
</ul>
""",

    269: """<h2>KPI Dashboard & Real-Time Monitoring</h2>

<h3>RACI Matrix</h3>
<table border="1" cellpadding="8">
<tr><th>Activity</th><th>Responsible</th><th>Accountable</th><th>Consulted</th><th>Informed</th></tr>
<tr>
  <td>Design dashboard layout (which metrics, how grouped)</td>
  <td>CEO + Nasim</td>
  <td>CEO</td>
  <td>-</td>
  <td>Developer</td>
</tr>
<tr>
  <td>Build dashboard (Mixpanel/Looker Studio/custom)</td>
  <td>Developer</td>
  <td>CEO</td>
  <td>Nasim</td>
  <td>-</td>
</tr>
<tr>
  <td>Test dashboard accuracy (spot-check vs raw data)</td>
  <td>Developer</td>
  <td>Developer</td>
  <td>CEO</td>
  <td>Nasim</td>
</tr>
<tr>
  <td>Set up alerts (e.g. churn spike, conversion drop)</td>
  <td>CEO</td>
  <td>CEO</td>
  <td>Developer</td>
  <td>Nasim</td>
</tr>
<tr>
  <td>Daily check-in (read metrics, flag anomalies)</td>
  <td>CEO + Nasim</td>
  <td>CEO</td>
  <td>-</td>
  <td>-</td>
</tr>
</table>

<h3>KPIs</h3>
<ul>
<li><strong>Dashboard uptime</strong>: 99%+ (must load fast, always)</li>
<li><strong>Metric freshness</strong>: Updates daily (or hourly for critical metrics)</li>
<li><strong>CEO engagement</strong>: Checked daily (metric: dashboard views/week)</li>
</ul>

<h3>Dashboard Metrics (AARRR + Bayan-specific)</h3>
<ul>
<li><strong>Acquisition</strong>: Website visitors, new signups, source breakdown</li>
<li><strong>Activation</strong>: Aha moment rate (3 features in 7 days)</li>
<li><strong>Retention</strong>: MAU, DAU, churn rate</li>
<li><strong>Referral</strong>: Peer invites sent, accepted</li>
<li><strong>Revenue</strong>: MRR, ARPU, trial→paid conversion</li>
<li><strong>Motion split</strong>: Motion A (B2C) vs Motion B (B2B) performance</li>
</ul>
""",

    270: """<h2>Unit Economics & Cohort Analysis</h2>

<h3>RACI Matrix</h3>
<table border="1" cellpadding="8">
<tr><th>Activity</th><th>Responsible</th><th>Accountable</th><th>Consulted</th><th>Informed</th></tr>
<tr>
  <td>Define unit economics model (LTV, CAC, payback)</td>
  <td>CEO</td>
  <td>CEO</td>
  <td>-</td>
  <td>Nasim</td>
</tr>
<tr>
  <td>Track acquisition cost per channel (ads, content, referral)</td>
  <td>Nasim</td>
  <td>CEO</td>
  <td>-</td>
  <td>-</td>
</tr>
<tr>
  <td>Calculate LTV (avg subscription length × ARPU)</td>
  <td>CEO</td>
  <td>CEO</td>
  <td>Developer (pulls data)</td>
  <td>Nasim</td>
</tr>
<tr>
  <td>Build cohort retention curves (monthly)</td>
  <td>Developer</td>
  <td>CEO</td>
  <td>-</td>
  <td>Nasim</td>
</tr>
<tr>
  <td>Weekly review: which channels are profitable?</td>
  <td>CEO</td>
  <td>CEO</td>
  <td>Nasim</td>
  <td>-</td>
</tr>
</table>

<h3>KPIs</h3>
<ul>
<li><strong>LTV/CAC ratio</strong>: Target 3:1 (healthy SaaS), minimum 1.5:1 (survival)</li>
<li><strong>Payback period</strong>: Target <12 months (how long to recover CAC)</li>
<li><strong>Cohort retention</strong>: Month-3 retention >40%, Month-12 >20%</li>
</ul>

<h3>Segmentation</h3>
<ul>
<li><strong>By motion</strong>: Motion A (self-serve) vs Motion B (institutional)</li>
<li><strong>By role</strong>: Physician ($199/yr) vs Nurse ($129) vs Student ($59)</li>
<li><strong>By geo</strong>: Oman (free) vs international (paid)</li>
<li><strong>By channel</strong>: Organic, paid ads, referral, content</li>
</ul>

<h3>Integration Points</h3>
<ul>
<li>Pulls from Core 268 (Analytics) - conversion events</li>
<li>Pulls from Core 269 (Dashboard) - revenue/churn data</li>
<li>Informs all marketing decisions - tells you where to invest</li>
</ul>
""",
}

# L2 Blueprints (functional breakdown)
BLUEPRINTS = {
    268: ("Analytics Implementation Blueprint", """<h1>Analytics Implementation & Event Instrumentation</h1>

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
<table>
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

    269: ("KPI Dashboard Blueprint", """<h1>KPI Dashboard & Real-Time Monitoring</h1>

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
<table>
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

    270: ("Unit Economics Blueprint", """<h1>Unit Economics & Cohort Analysis</h1>

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
<table>
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

# L3 SOPs (step-by-step execution)
SOPS = {
    268: ("Analytics Implementation SOP", """<h1>Analytics Implementation SOP</h1>

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

    269: ("KPI Dashboard SOP", """<h1>KPI Dashboard SOP</h1>

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

    270: ("Unit Economics SOP", """<h1>Unit Economics SOP</h1>

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
    print("✓ Logged in\n")

    # Create 3 cores
    for core_def in CORES:
        core_id = core_def["id"]

        print(f"Creating Core {core_id}: {core_def['name']}...")

        # Create core
        st, body = s.json(
            f"/business-processes/{PROC_ID}/cores",
            method="POST",
            data={
                "name": core_def["name"],
                "description": core_def["description"],
                "owner": core_def["owner"],
            }
        )

        if st != 200:
            print(f"✗ Failed to create core {core_id}: {st} {body}")
            continue

        print(f"✓ Core {core_id} created")

        # Attach L1 RACI
        print(f"  Attaching L1 RACI...")
        st2, body2 = s.json(
            f"/content/raci-template/cores/{core_id}",
            method="POST",
            data={"content": RACI_HTML[core_id]}
        )
        if st2 == 200:
            print(f"  ✓ RACI attached")
        else:
            print(f"  ✗ RACI failed: {st2}")

        # Create category + attach L2 Blueprint
        category_name = core_def["category"]
        print(f"  Creating category: {category_name}...")

        st3, body3 = s.json(
            f"/business-processes/{PROC_ID}/cores/{core_id}/activities",
            method="POST",
            data={
                "name": f"Marker for {category_name}",
                "category": category_name,
            }
        )

        if st3 != 200:
            print(f"  ✗ Category creation failed: {st3}")
            continue

        # Extract category_id
        try:
            category_id = body3.get("activity_category_id") or body3.get("category_id")
            if not category_id:
                print(f"  ✗ No category_id in response")
                continue
        except:
            print(f"  ✗ Failed to parse category response")
            continue

        print(f"  ✓ Category {category_id} created")

        # Attach Blueprint
        blueprint_title, blueprint_html = BLUEPRINTS[core_id]
        print(f"  Attaching L2 Blueprint...")

        st4, body4 = s.json(
            f"/content/blueprint/category/{category_id}",
            method="POST",
            data={
                "title": blueprint_title,
                "content": blueprint_html,
            }
        )

        if st4 == 200:
            print(f"  ✓ Blueprint attached")
        else:
            print(f"  ✗ Blueprint failed: {st4}")

        # Create L3 SOP
        sop_title, sop_html = SOPS[core_id]
        print(f"  Creating L3 SOP...")

        st5, body5 = s.json(
            f"/business-processes/{PROC_ID}/cores/{core_id}/sop-template",
            method="POST",
            data={"title": sop_title}
        )

        if st5 != 200:
            print(f"  ✗ SOP creation failed: {st5}")
            continue

        sop_id = body5.get("id")
        version_id = body5.get("version", {}).get("id")

        if not sop_id or not version_id:
            print(f"  ✗ No SOP ID in response")
            continue

        print(f"  ✓ SOP {sop_id} created")

        # Save SOP content
        st6, body6 = s.json(
            f"/content/sop-template/{sop_id}/versions/{version_id}",
            method="PUT",
            data={"content": sop_html}
        )

        if st6 == 200:
            print(f"  ✓ SOP content saved")
        else:
            print(f"  ✗ SOP content failed: {st6}")

        # Publish SOP
        st7, body7 = s.json(
            f"/content/sop-template/{sop_id}/status",
            method="PUT",
            data={"status": "published"}
        )

        if st7 == 200:
            print(f"  ✓ SOP published")
        else:
            print(f"  ✗ SOP publish failed: {st7}")

        print()

    print("=" * 60)
    print("PROC 22 COMPLETE: Financial Performance Management")
    print("=" * 60)
    print("\n3 cores created with L1 RACI + L2 Blueprint + L3 SOP:")
    print("  268: Analytics Implementation")
    print("  269: KPI Dashboard")
    print("  270: Unit Economics")
    print("\nView at: https://hq.stage3.app/business-processes/22")


if __name__ == "__main__":
    main()
