# SOP-262: Attribution Tracking & Source Instrumentation

**Process:** Proc 22 - Financial Performance Management
**Core:** 262 - Analytics Implementation & Event Instrumentation
**Owner:** Marketer (Nasim)
**Accountable:** CEO (Dr. Abdullah Al Alawi)
**Version:** 1.1
**Last Updated:** 2026-10-09

> **Core-ID note (2026-10-09):** This SOP was written as "SOP-266 - Marketing
> Attribution" against an unverified core ID. The live Proc 22 core set is
> **262** (Analytics Implementation & Event Instrumentation), **263** (KPI
> Dashboard & Real-Time Monitoring), **264** (Unit Economics & Cohort Analysis).
> There is no separate "Marketing Attribution" core — attribution is the
> *acquisition* half of Core 262's instrumentation surface, so this SOP lives
> inside Core 262 alongside `SOP-262-event-instrumentation.md`. Event plumbing
> is that sibling SOP; this one owns UTM capture, source resolution, and
> channel-level reports.

---

## Purpose

Track every user's acquisition source from first touch through conversion to calculate accurate CAC per channel and optimize marketing spend.

---

## Scope

**In Scope:**
- UTM parameter capture and persistence
- Referral code attribution
- Offline-to-online attribution (QR codes, print)
- Cross-domain tracking (website → payment gateway)
- Attribution reporting and analysis

**Out of Scope:**
- Post-conversion attribution (covered in SOP-264-unit-economics)
- Event tracking implementation (covered in SOP-262-event-instrumentation)
- Ad platform management (separate marketing SOP)

---

## Roles & Responsibilities

| Role | Responsibility |
|------|----------------|
| Marketer (Nasim) | Campaign setup, UTM creation, attribution analysis |
| Developer | Technical implementation, tracking code maintenance |
| CEO | Attribution model selection, budget allocation decisions |
| Data Analyst | Report building, attribution accuracy validation |

---

## Prerequisites

- [ ] Mixpanel account set up with project token
- [ ] UTM parameter taxonomy agreed (see Appendix A)
- [ ] Attribution window defined (default: 30 days)
- [ ] Referral system live with unique codes per user

---

## Procedure

### 1. Campaign Planning & UTM Creation

**Frequency:** Before launching any marketing campaign  
**Owner:** Marketer (Nasim)

**Steps:**

1.1. **Define campaign details:**
   - Campaign objective (awareness, consideration, conversion)
   - Target audience (specialty, geography, exam type)
   - Channel (google, facebook, instagram, email, organic)
   - Budget and duration

1.2. **Generate UTM parameters** following taxonomy:
   ```
   utm_source: [google|facebook|instagram|linkedin|twitter|email|organic|referral|qr]
   utm_medium: [cpc|display|social|email|organic|referral|offline]
   utm_campaign: [YYYYMM]-[objective]-[audience]-[creative-variant]
   utm_content: [ad-id or email-id for A/B testing]
   utm_term: [keyword for search ads, optional]
   ```

1.3. **Build campaign URLs** using UTM builder:
   ```
   https://bayan.edu.om/?utm_source=google&utm_medium=cpc&utm_campaign=202610-awareness-medicine-video1&utm_content=ad123
   ```

1.4. **Document in campaign tracker** (Google Sheet):
   - Campaign name
   - Start/end dates
   - UTM full URL
   - Budget
   - Expected signups

1.5. **Share UTM URLs** with Developer (for email templates) or upload to ad platform.

**Output:** Campaign URLs with correct UTM parameters

---

### 2. UTM Capture & Persistence (Technical)

**Frequency:** Automatic on every page load  
**Owner:** Developer

**Steps:**

2.1. **Capture UTM parameters** on landing:
   ```javascript
   // On page load
   const urlParams = new URLSearchParams(window.location.search);
   const utmParams = {
       utm_source: urlParams.get('utm_source') || 'direct',
       utm_medium: urlParams.get('utm_medium') || 'none',
       utm_campaign: urlParams.get('utm_campaign') || null,
       utm_content: urlParams.get('utm_content') || null,
       utm_term: urlParams.get('utm_term') || null
   };
   ```

2.2. **Store in session** (persist across pages):
   ```javascript
   if (!sessionStorage.getItem('utm_source')) {
       sessionStorage.setItem('attribution', JSON.stringify(utmParams));
   }
   ```

2.3. **Write to database on signup**:
   ```python
   user = User.create(
       email=email,
       utm_source=session.get('utm_source', 'direct'),
       utm_medium=session.get('utm_medium', 'none'),
       utm_campaign=session.get('utm_campaign'),
       utm_content=session.get('utm_content'),
       utm_term=session.get('utm_term'),
       first_touch_at=datetime.now()
   )
   ```

2.4. **Track in Mixpanel**:
   ```javascript
   mixpanel.track('signup_complete', {
       'utm_source': utmParams.utm_source,
       'utm_medium': utmParams.utm_medium,
       'utm_campaign': utmParams.utm_campaign,
       'utm_content': utmParams.utm_content,
       'utm_term': utmParams.utm_term
   });
   ```

**Output:** Attribution data persisted in database + Mixpanel

---

### 3. Referral Attribution

**Frequency:** Automatic on referral link click  
**Owner:** Developer

**Steps:**

3.1. **Generate referral links** (see SOP-260 for full referral process):
   ```
   https://bayan.edu.om/signup?ref=ABC123
   ```

3.2. **Capture referral code**:
   ```javascript
   const referralCode = urlParams.get('ref');
   if (referralCode) {
       sessionStorage.setItem('referral_code', referralCode);
       // Look up referrer
       const referrer = await fetch(`/api/users/by-referral-code/${referralCode}`);
       sessionStorage.setItem('referred_by', referrer.user_id);
   }
   ```

3.3. **Store on signup**:
   ```python
   if referral_code:
       user.referred_by = get_user_by_referral_code(referral_code)
       user.utm_source = 'referral'  # Override utm_source
       user.utm_medium = 'referral'
       user.utm_campaign = f'referral-{referrer.id}'
   ```

3.4. **Track conversion event**:
   ```javascript
   mixpanel.track('referral_signup', {
       'referral_code': referralCode,
       'referrer_id': referrerId
   });
   ```

**Output:** Referral signups attributed to referrer

---

### 4. Offline Attribution (QR Codes)

**Frequency:** Per offline campaign (conferences, print ads, billboards)  
**Owner:** Marketer (Nasim)

**Steps:**

4.1. **Generate unique QR code** per material:
   ```
   https://bayan.edu.om/?utm_source=qr&utm_medium=offline&utm_campaign=202610-conference-dubai&utm_content=booth-banner
   ```

4.2. **Create QR code** using qr-code generator:
   ```bash
   qrencode -o booth-banner-qr.png "https://bayan.edu.om/?utm_source=qr&utm_medium=offline&utm_campaign=202610-conference-dubai&utm_content=booth-banner"
   ```

4.3. **Embed in materials** (flyers, posters, banners).

4.4. **Track scans** (automatic via UTM capture above).

4.5. **Post-event report**:
   - QR scans (page views with utm_source=qr)
   - Signups from QR (utm_source=qr + signup_complete event)
   - CAC for offline campaign

**Output:** Offline campaigns trackable same as digital

---

### 5. Cross-Domain Tracking (Website → Stripe)

**Frequency:** Automatic on checkout  
**Owner:** Developer

**Steps:**

5.1. **Pass client_reference_id to Stripe Checkout**:
   ```python
   stripe.checkout.Session.create(
       client_reference_id=user.id,  # Links Stripe session to user
       customer_email=user.email,
       line_items=[...],
       success_url='https://bayan.edu.om/success',
       cancel_url='https://bayan.edu.om/cancel'
   )
   ```

5.2. **Handle Stripe webhook** (payment success):
   ```python
   @app.route('/webhooks/stripe', methods=['POST'])
   def stripe_webhook():
       event = stripe.Webhook.construct_event(request.data, sig_header, webhook_secret)
       
       if event['type'] == 'checkout.session.completed':
           session = event['data']['object']
           user_id = session['client_reference_id']
           
           # Attribution already stored on user record during signup
           user = User.get(user_id)
           
           # Track conversion with attribution
           mixpanel.track(user_id, 'payment_success', {
               'utm_source': user.utm_source,
               'utm_medium': user.utm_medium,
               'utm_campaign': user.utm_campaign,
               'amount': session['amount_total'] / 100
           })
   ```

**Output:** Payment events carry original attribution

---

### 6. Attribution Reporting

**Frequency:** Weekly (quick check), Monthly (full report)  
**Owner:** Data Analyst

**Steps:**

6.1. **Weekly Quick Report** (email to Marketer (Nasim) + CEO):
   ```sql
   -- Top 5 sources by signups (last 7 days)
   SELECT 
       utm_source,
       utm_medium,
       COUNT(*) as signups,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
   FROM users
   WHERE created_at >= NOW() - INTERVAL '7 days'
   GROUP BY utm_source, utm_medium
   ORDER BY signups DESC
   LIMIT 5;
   ```

6.2. **Monthly Full Report** (Google Sheet + email):

   **Sheet Structure:**
   | Source | Medium | Campaign | Signups | Conversions | Ad Spend | CAC | Conv Rate |
   |--------|--------|----------|---------|-------------|----------|-----|-----------|
   | google | cpc | 202610-awareness-medicine-video1 | 45 | 12 | $850 | $70.83 | 26.7% |

   **Queries:**
   ```sql
   -- Signups per campaign
   SELECT 
       utm_source,
       utm_medium,
       utm_campaign,
       COUNT(*) as signups
   FROM users
   WHERE created_at >= DATE_TRUNC('month', NOW())
   GROUP BY utm_source, utm_medium, utm_campaign;
   
   -- Conversions per campaign (signup → paid)
   SELECT 
       u.utm_campaign,
       COUNT(DISTINCT CASE WHEN s.status = 'active' THEN u.id END) as conversions
   FROM users u
   LEFT JOIN subscriptions s ON u.id = s.user_id
   WHERE u.created_at >= DATE_TRUNC('month', NOW())
   GROUP BY u.utm_campaign;
   ```

6.3. **Pull ad spend** from platforms:
   - Google Ads API: `google_ads_spend.py`
   - Facebook Ads API: `facebook_ads_spend.py`
   - Manual entry for offline/other channels

6.4. **Calculate CAC per campaign**:
   ```python
   cac = total_ad_spend / total_conversions
   ```

6.5. **Build visualization** (Mixpanel Insights or Google Data Studio):
   - Funnel by source: Landing → Signup → Trial → Paid
   - CAC trend over time by channel
   - Source mix pie chart (% of signups per source)

6.6. **Email report** to CEO + Marketer (Nasim) with insights:
   - Best performing campaign (lowest CAC)
   - Worst performing campaign (highest CAC or zero conversions)
   - Recommendations (pause, scale, optimize)

**Output:** Monthly attribution report with CAC per campaign

---

### 7. Attribution Validation & Cleanup

**Frequency:** Weekly (spot-check), Monthly (audit)  
**Owner:** Marketer (Nasim)

**Steps:**

7.1. **Spot-check recent campaigns**:
   - Click own campaign link → verify UTMs captured
   - Complete signup flow → verify attribution in database
   - Check Mixpanel for signup_complete event with correct UTMs

7.2. **Identify attribution gaps**:
   ```sql
   -- Users with missing attribution (utm_source = 'direct' but suspicious)
   SELECT id, email, created_at, referrer_url
   FROM users
   WHERE utm_source = 'direct'
   AND referrer_url LIKE '%google%'  -- Came from Google but no UTM
   AND created_at >= NOW() - INTERVAL '7 days';
   ```

7.3. **Clean up typos/variations**:
   ```sql
   -- Find campaigns with similar names (likely typos)
   SELECT utm_campaign, COUNT(*) as signups
   FROM users
   WHERE utm_campaign LIKE '202610-awareness%'
   GROUP BY utm_campaign;
   
   -- Example output:
   -- 202610-awareness-medicine-video1  →  45 signups
   -- 202610-awreness-medicine-video1   →  2 signups (typo)
   ```

7.4. **Standardize in database** (if typo <5% of total):
   ```sql
   UPDATE users
   SET utm_campaign = '202610-awareness-medicine-video1'
   WHERE utm_campaign = '202610-awreness-medicine-video1';
   ```

7.5. **Update UTM taxonomy** if new patterns emerge.

**Output:** Clean, standardized attribution data

---

## Edge Cases

**Case 1: User clears cookies between landing and signup**
- **Problem:** Attribution lost
- **Solution:** Email link in welcome email carries UTM (backup attribution)
- **Frequency:** ~5% of users

**Case 2: User clicks multiple campaigns before signing up**
- **Problem:** Which campaign gets credit?
- **Current Model:** First-touch attribution (first campaign wins)
- **Alternative:** Last-touch (most recent campaign wins) — requires localStorage, not sessionStorage

**Case 3: Organic search after clicking ad**
- **Problem:** User clicked ad (utm_source=google, utm_medium=cpc) but returns days later via organic search
- **Current Model:** First-touch wins (ad gets credit)
- **Note:** This is why CAC looks higher for branded search (users already aware from ads)

**Case 4: Referral + UTM conflict**
- **Problem:** User clicks referral link that also has UTM parameters
- **Solution:** Referral overrides UTM (utm_source forced to 'referral')
- **Reason:** Referrals are more valuable (negative CAC)

**Case 5: Missing ad spend data**
- **Problem:** Can't calculate CAC if spend unknown
- **Solution:** Manual entry required; flag campaign as "CAC incomplete"

---

## KPIs & Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Attribution Coverage | >95% | - | - |
| Direct Traffic | <20% | - | - |
| CAC (Paid Channels) | <$50 | - | - |
| CAC (Organic) | <$10 | - | - |
| Attribution Data Quality | >98% | - | - |

**Data Quality Definition:**
- UTM parameters present for >98% of non-direct signups
- No typos in utm_campaign (standardized naming)
- Ad spend data available for >95% of paid campaigns

---

## Appendix A: UTM Parameter Taxonomy

**utm_source** (where traffic originates):
- `google` - Google Ads
- `facebook` - Facebook/Instagram Ads
- `linkedin` - LinkedIn Ads
- `twitter` - Twitter Ads
- `email` - Email campaigns
- `organic` - Organic search
- `referral` - Referral program
- `qr` - Offline QR codes
- `direct` - No source (typed URL, bookmark)

**utm_medium** (how traffic arrives):
- `cpc` - Cost-per-click ads
- `display` - Display/banner ads
- `social` - Organic social posts
- `email` - Email
- `organic` - Organic search
- `referral` - Referral link
- `offline` - Offline materials (QR)

**utm_campaign** (specific campaign identifier):
- Format: `[YYYYMM]-[objective]-[audience]-[creative-variant]`
- Example: `202610-awareness-medicine-video1`
- Keep <50 chars, lowercase, hyphens only

**utm_content** (A/B testing):
- Ad ID, email variant, creative version
- Example: `ad123`, `email-variant-a`, `banner-top`

**utm_term** (search keywords - optional):
- Only for search ads
- Example: `usmle+step+1+prep`

---

## Appendix B: Attribution Model Comparison

| Model | Definition | Pros | Cons | Bayan Choice |
|-------|------------|------|------|--------------|
| **First-Touch** | Credit first campaign | Simple, rewards awareness | Ignores nurture | ✅ Current |
| **Last-Touch** | Credit last campaign | Rewards conversion driver | Ignores awareness | - |
| **Linear** | Equal credit to all | Fair to all touchpoints | Complex, dilutes insight | - |
| **Time-Decay** | More credit to recent | Balances awareness + conversion | Complex | Future |

**Why First-Touch for Bayan:**
- Most users convert within 7 days (short lifecycle)
- We want to know which channel brings new users (awareness focus)
- Simpler to implement and explain

**When to switch to Time-Decay:**
- When average time-to-conversion >30 days
- When multi-touch journeys common (email nurture, retargeting)

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-10-06 | Initial SOP | Stage 3 Ops Team |

---

## Approval

**Reviewed By:**
- [ ] CEO (Dr. Abdullah Al Alawi) - Strategy, KPI targets
- [ ] Marketer (Nasim) - UTM taxonomy, reporting
- [ ] Developer - Technical implementation
- [ ] Data Analyst - Report accuracy

**Approved:** _____________ **Next Review:** Q1 2027
