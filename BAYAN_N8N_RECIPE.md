# Bayan n8n Recipe — Jev Sales Scoring Workflow

**Purpose:** Automate the 4 Bayan sales decisions (warmth, readiness, timing, priority) in n8n.

**Runs:** Daily at 9am Oman time (batch scoring of warm book)

**Input:** Supabase `institutions` table (60 free-trial institutions)

**Output:** Scored institutions with routing actions (CEO tasks, Nasim tasks, nurture queue)

---

## Workflow Architecture

```
[Schedule Trigger: Daily 9am]
    ↓
[Supabase: Query warm book] — SELECT * FROM institutions WHERE status='trial'
    ↓
[Loop over institutions]
    ↓
[HTTP Request: Call Jev API] — POST /v1/systemone with 4 questions
    ↓
[Function: Parse Jev response] — Extract .score/.confidence/.choice
    ↓
[Switch: Route on scores]
    ├─ Hot + Ready + Critical → [Slack: Notify CEO] + [Google Calendar: Book slot]
    ├─ Warm + Ready + High → [Slack: Notify Nasim] + [Gmail: Send outreach template]
    ├─ Cool/Medium → [Supabase: Add to nurture queue]
    └─ Cold/Low → [Supabase: Archive with reason]
    ↓
[Supabase: Update institution scores] — warmth_score, readiness_noul, priority_score, last_scored_at
```

---

## Node Configuration

### 1. Schedule Trigger
```json
{
  "name": "Daily 9am Oman Time",
  "type": "n8n-nodes-base.scheduleTrigger",
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "cronExpression",
          "expression": "0 9 * * *"
        }
      ],
      "timezone": "Asia/Muscat"
    }
  }
}
```

---

### 2. Supabase: Query Warm Book
```json
{
  "name": "Read Trial Institutions",
  "type": "n8n-nodes-base.supabase",
  "credentials": {
    "supabaseApi": "Bayan Supabase"
  },
  "parameters": {
    "operation": "getAll",
    "tableId": "institutions",
    "returnAll": true,
    "filters": {
      "conditions": [
        {
          "keyName": "status",
          "value": "trial"
        }
      ]
    }
  }
}
```

**Expected columns:**
- `id` (UUID)
- `name` (text)
- `trial_seats` (int)
- `active_seats_30d` (int)
- `relationship_notes` (text, nullable)
- `trial_start_date` (date)
- `renewal_date` (date, nullable)

---

### 3. Loop Over Institutions
```json
{
  "name": "Loop Institutions",
  "type": "n8n-nodes-base.splitInBatches",
  "parameters": {
    "batchSize": 1,
    "options": {}
  }
}
```

---

### 4. HTTP Request: Call Jev API
```json
{
  "name": "Jev Scoring API",
  "type": "n8n-nodes-base.httpRequest",
  "credentials": {
    "httpHeaderAuth": "OpenRouter API Key"
  },
  "parameters": {
    "method": "POST",
    "url": "https://openrouter.ai/api/v1/systemone",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "httpHeaderAuth",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "state",
          "value": "={{ { \"institution\": $json.name, \"trial_seats\": $json.trial_seats, \"active_seats_30d\": $json.active_seats_30d, \"relationship\": $json.relationship_notes || \"none\", \"renewal_in_days\": $json.renewal_date ? Math.floor((new Date($json.renewal_date) - new Date()) / (1000*60*60*24)) : null } }}"
        },
        {
          "name": "questions",
          "value": "={{ { \"warmth\": { \"type\": \"score\", \"instructions\": \"Score lead warmth 0-3: cold (no usage, no relationship) → cool (inactive trial) → warm (active trial or relationship) → hot (high engagement + renewal window)\", \"criteria\": [\"cold\", \"cool\", \"warm\", \"hot\"] }, \"readiness\": { \"type\": \"noul\", \"instructions\": \"Probability this lead is ready for CEO discovery call (relationship-first style, 45min). Consider: active usage, decision-maker relationship, renewal timing.\" }, \"priority\": { \"type\": \"score\", \"instructions\": \"Renewal/expansion priority 0-3: low (dormant, far from expiry) → medium (standard renewal) → high (active, renewing soon) → critical (lighthouse contract opportunity)\", \"criteria\": [\"low\", \"medium\", \"high\", \"critical\"] }, \"timing\": { \"type\": \"choice\", \"instructions\": \"If CEO had discovery call, when to send proposal: send_now (budget confirmed, decision soon) | send_after_followup (interest but need to qualify) | nurture_and_wait (not ready) | disqualify (humanitarian free-access)\", \"criteria\": { \"send_now\": \"Send tailored one-pager now\", \"send_after_followup\": \"Nasim follow-up first\", \"nurture_and_wait\": \"Quarterly check-in\", \"disqualify\": \"Archive (humanitarian or no authority)\" } } } }}"
        },
        {
          "name": "model",
          "value": "typesafe/jev-1.13"
        }
      ]
    },
    "options": {
      "timeout": 30000
    }
  }
}
```

**Credentials setup:**
- Type: `Header Auth`
- Name: `Authorization`
- Value: `Bearer sk-or-v1-...` (paste your OpenRouter key from `../jev/.env`)

---

### 5. Function: Parse Jev Response
```json
{
  "name": "Parse Scores",
  "type": "n8n-nodes-base.function",
  "parameters": {
    "functionCode": "const ans = $input.item.json.answers;\n\nconst warmth = ans.warmth.score;\nconst warmth_conf = ans.warmth.confidence;\nconst warmth_bucket = warmth >= 2.5 ? 'hot' : warmth >= 1.5 ? 'warm' : warmth >= 0.5 ? 'cool' : 'cold';\n\nconst readiness = ans.readiness.noul;\nconst readiness_bucket = readiness >= 0.7 ? 'ready' : readiness >= 0.3 ? 'review' : 'not_ready';\n\nconst priority = ans.priority.score;\nconst priority_conf = ans.priority.confidence;\nconst priority_bucket = priority >= 2.5 ? 'critical' : priority >= 1.5 ? 'high' : priority >= 0.5 ? 'medium' : 'low';\n\nconst timing = ans.timing.choice;\nconst timing_conf = ans.timing.confidence;\n\n// Review flags (confidence < 0.7)\nconst review_flags = [];\nif (warmth_conf < 0.7) review_flags.push('warmth');\nif (priority_conf < 0.7) review_flags.push('priority');\nif (timing_conf < 0.7) review_flags.push('timing');\nif (readiness >= 0.3 && readiness < 0.7) review_flags.push('readiness');\n\nreturn {\n  json: {\n    institution_id: $input.item.json.id,\n    institution_name: $input.item.json.name,\n    warmth_score: warmth,\n    warmth_conf: warmth_conf,\n    warmth_bucket: warmth_bucket,\n    readiness_noul: readiness,\n    readiness_bucket: readiness_bucket,\n    priority_score: priority,\n    priority_conf: priority_conf,\n    priority_bucket: priority_bucket,\n    timing_choice: timing,\n    timing_conf: timing_conf,\n    review_flags: review_flags.join(', ') || 'none',\n    scored_at: new Date().toISOString()\n  }\n};"
  }
}
```

---

### 6. Switch: Route on Scores
```json
{
  "name": "Route Actions",
  "type": "n8n-nodes-base.switch",
  "parameters": {
    "rules": {
      "rules": [
        {
          "conditions": {
            "string": [
              {
                "value1": "={{ $json.warmth_bucket }}",
                "value2": "hot"
              },
              {
                "value1": "={{ $json.readiness_bucket }}",
                "value2": "ready"
              },
              {
                "value1": "={{ $json.priority_bucket }}",
                "operation": "regex",
                "value2": "critical|high"
              }
            ]
          },
          "renameOutput": "CEO Priority"
        },
        {
          "conditions": {
            "string": [
              {
                "value1": "={{ $json.warmth_bucket }}",
                "operation": "regex",
                "value2": "hot|warm"
              },
              {
                "value1": "={{ $json.readiness_bucket }}",
                "operation": "regex",
                "value2": "ready|review"
              }
            ]
          },
          "renameOutput": "Nasim Outreach"
        },
        {
          "conditions": {
            "string": [
              {
                "value1": "={{ $json.warmth_bucket }}",
                "value2": "cool"
              }
            ]
          },
          "renameOutput": "Nurture Queue"
        }
      ]
    },
    "fallbackOutput": "Skip/Archive"
  }
}
```

---

### 7a. CEO Priority → Slack Notification
```json
{
  "name": "Notify CEO (Slack)",
  "type": "n8n-nodes-base.slack",
  "credentials": {
    "slackApi": "Bayan Slack"
  },
  "parameters": {
    "resource": "message",
    "operation": "post",
    "channel": "#bayan-ceo-priority",
    "text": "🔥 **Hot Lead — CEO Action Required**\n\n**Institution:** {{ $json.institution_name }}\n**Warmth:** {{ $json.warmth_score }}/3 ({{ $json.warmth_bucket }})\n**Readiness:** {{ $json.readiness_noul * 100 }}% ready for discovery call\n**Priority:** {{ $json.priority_score }}/3 ({{ $json.priority_bucket }})\n\n**Review flags:** {{ $json.review_flags }}\n\n**Next:** Book discovery call (relationship-first, 45min)",
    "otherOptions": {
      "sendAsUser": "Jev Bot"
    }
  }
}
```

---

### 7b. Nasim Outreach → Gmail Draft
```json
{
  "name": "Draft Nasim Email",
  "type": "n8n-nodes-base.gmail",
  "credentials": {
    "gmailOAuth2": "Bayan Gmail"
  },
  "parameters": {
    "resource": "draft",
    "operation": "create",
    "message": {
      "subject": "Bayan Exam Platform — Following up on your trial",
      "body": "Hi {{ $json.institution_name }} team,\n\nI noticed you've been using Bayan's exam platform during your trial period. I wanted to check in and see if you have any questions about the platform or if there's anything we can help with.\n\nWe're here to support your medical education programs.\n\nBest regards,\nNasim"
    },
    "additionalFields": {
      "labelIds": ["Draft", "Bayan-Warm-Leads"]
    }
  }
}
```

---

### 7c. Nurture Queue → Supabase Update
```json
{
  "name": "Add to Nurture Queue",
  "type": "n8n-nodes-base.supabase",
  "credentials": {
    "supabaseApi": "Bayan Supabase"
  },
  "parameters": {
    "operation": "update",
    "tableId": "institutions",
    "id": "={{ $json.institution_id }}",
    "fieldsToSend": "defineBelow",
    "fieldsUi": {
      "fieldValues": [
        {
          "fieldName": "sales_status",
          "fieldValue": "nurture"
        },
        {
          "fieldName": "nurture_reason",
          "fieldValue": "cool warmth ({{ $json.warmth_score }}/3)"
        }
      ]
    }
  }
}
```

---

### 8. Supabase: Update Institution Scores (Final)
```json
{
  "name": "Save Scores",
  "type": "n8n-nodes-base.supabase",
  "credentials": {
    "supabaseApi": "Bayan Supabase"
  },
  "parameters": {
    "operation": "update",
    "tableId": "institutions",
    "id": "={{ $json.institution_id }}",
    "fieldsToSend": "defineBelow",
    "fieldsUi": {
      "fieldValues": [
        {
          "fieldName": "warmth_score",
          "fieldValue": "={{ $json.warmth_score }}"
        },
        {
          "fieldName": "warmth_confidence",
          "fieldValue": "={{ $json.warmth_conf }}"
        },
        {
          "fieldName": "readiness_noul",
          "fieldValue": "={{ $json.readiness_noul }}"
        },
        {
          "fieldName": "priority_score",
          "fieldValue": "={{ $json.priority_score }}"
        },
        {
          "fieldName": "priority_confidence",
          "fieldValue": "={{ $json.priority_conf }}"
        },
        {
          "fieldName": "timing_choice",
          "fieldValue": "={{ $json.timing_choice }}"
        },
        {
          "fieldName": "review_flags",
          "fieldValue": "={{ $json.review_flags }}"
        },
        {
          "fieldName": "last_scored_at",
          "fieldValue": "={{ $json.scored_at }}"
        }
      ]
    }
  }
}
```

---

## Database Schema Changes

Add these columns to `institutions` table:

```sql
ALTER TABLE institutions
ADD COLUMN warmth_score DECIMAL(3,2),
ADD COLUMN warmth_confidence DECIMAL(3,2),
ADD COLUMN readiness_noul DECIMAL(3,2),
ADD COLUMN priority_score DECIMAL(3,2),
ADD COLUMN priority_confidence DECIMAL(3,2),
ADD COLUMN timing_choice TEXT,
ADD COLUMN review_flags TEXT,
ADD COLUMN last_scored_at TIMESTAMP,
ADD COLUMN sales_status TEXT DEFAULT 'unknown',
ADD COLUMN nurture_reason TEXT;

CREATE INDEX idx_institutions_warmth ON institutions(warmth_score DESC);
CREATE INDEX idx_institutions_priority ON institutions(priority_score DESC);
CREATE INDEX idx_institutions_review ON institutions(review_flags) WHERE review_flags != 'none';
```

---

## Testing Procedure

### Phase 1: Single Institution Test (Week 1)
1. Disable the schedule trigger
2. Replace Supabase query with manual input (JSON node)
3. Test with 3 known institutions: OMSB (hot), DHA (hot), small clinic (cool)
4. Verify Jev API call returns scores
5. Check Switch routing (should send OMSB/DHA to CEO, clinic to nurture)
6. Verify Supabase update writes scores correctly

### Phase 2: Dry Run (Week 2)
1. Enable schedule trigger (daily 9am)
2. Comment out action nodes (Slack/Gmail/Calendar)
3. Only run Jev scoring + Supabase save
4. Collect 7 days of scores
5. CEO reviews accuracy vs manual ranking
6. Retune confidence threshold if needed (default 0.7)

### Phase 3: Full Production (Week 3)
1. Enable all action nodes
2. Monitor CEO/Nasim workload
3. Measure: CEO time before (10 hr/week) vs after (target 7-8 hr/week)
4. Track discovery call quality (are hot leads actually converting?)
5. Adjust routing rules based on feedback

---

## Cost & Performance

**API calls per run:**
- 60 institutions × 1 Jev call = 60 calls/day
- Each call: ~400-500 tokens input = ~$0.000020/call
- Daily cost: 60 × $0.000020 = **$0.0012/day = $0.44/year**

**Execution time:**
- Jev API latency: ~400ms/call
- Total workflow runtime: 60 × 0.4s = **24 seconds**
- n8n execution limit: 5 minutes (safe)

**Rate limits:**
- OpenRouter: 1000 req/min (we use 60/day = well below limit)
- Supabase: 500 req/min (safe)
- No throttling needed

---

## Error Handling

Add error workflow trigger:

```json
{
  "name": "On Workflow Error",
  "type": "n8n-nodes-base.errorTrigger",
  "parameters": {}
}
```

Connected to:

```json
{
  "name": "Notify Admin (Slack)",
  "type": "n8n-nodes-base.slack",
  "parameters": {
    "channel": "#bayan-alerts",
    "text": "⚠️ Jev scoring workflow failed\n\nError: {{ $json.error.message }}\nInstitution: {{ $json.institution_name }}\nTime: {{ $now.toISO() }}"
  }
}
```

**Common errors:**
- **401 Unauthorized:** Check OpenRouter API key in credentials
- **Rate limit exceeded:** Add `Wait` node between batches (unlikely at 60 calls/day)
- **Supabase timeout:** Check institution table schema (missing columns?)
- **Jev API error 400:** Invalid question format (check JSON syntax in HTTP Request body)

---

## Monitoring Dashboard

Create Supabase view for CEO:

```sql
CREATE VIEW warm_book_dashboard AS
SELECT
  name,
  warmth_score,
  warmth_confidence,
  readiness_noul,
  priority_score,
  review_flags,
  last_scored_at,
  CASE
    WHEN warmth_score >= 2.5 AND readiness_noul >= 0.7 AND priority_score >= 2.5 THEN 'CEO Priority'
    WHEN warmth_score >= 1.5 AND readiness_noul >= 0.3 THEN 'Nasim Outreach'
    WHEN warmth_score >= 0.5 THEN 'Nurture'
    ELSE 'Skip/Archive'
  END AS action_bucket
FROM institutions
WHERE status = 'trial'
ORDER BY priority_score DESC, warmth_score DESC;
```

Query this view in Bayan CEO dashboard (Metabase/Supabase Studio).

---

## Next Steps

1. **Import this workflow into n8n:**
   - Copy the node configs above
   - Set up credentials (OpenRouter, Supabase, Slack, Gmail)
   - Test with 3 sample institutions first

2. **Deploy to production:**
   - Enable schedule trigger (daily 9am)
   - Monitor for 2 weeks
   - Measure CEO time saved

3. **Iterate based on feedback:**
   - Retune confidence threshold (0.7 → 0.6 or 0.8)
   - Adjust routing rules (e.g. warm + review → CEO instead of Nasim)
   - Add more actions (calendar booking, CRM updates)

4. **Scale to other decisions:**
   - Add objection-handling scoring (from discovery call notes)
   - Contract value prediction (ARR forecast per institution)
   - Churn risk scoring (for existing customers)

---

## Files in This Integration

```
AITransforms/
├── src/lib/
│   ├── jev-client.ts              # Portable TypeScript client
│   └── demo-jev-bayan-sales.ts    # Demo script (test before n8n)
├── BAYAN_PRODUCTION_WIRING.md     # 3 integration paths (this is Path A)
└── BAYAN_N8N_RECIPE.md            # This file (n8n workflow config)
```

**Status:** Ready for import into n8n and testing.
