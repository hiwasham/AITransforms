/**
 * PGLite schema for the Rule of 100 Outreach Engine (data-model.md).
 *
 * Owned exclusively by api/ + domain/ (the core service) — jobs/ MUST
 * NEVER import this module (research.md §11, plan.md Process Boundaries &
 * Data Flow).
 *
 * IDs are TEXT (UUIDs generated in application code via crypto.randomUUID())
 * rather than a Postgres extension, per Constitution Principle III (avoid
 * unnecessary dependencies).
 */

import type { PGlite } from "@electric-sql/pglite";

export async function applySchema(db: PGlite): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS prospects (
      id TEXT PRIMARY KEY,
      business_name TEXT NOT NULL,
      source_url TEXT NOT NULL,
      normalized_domain TEXT NOT NULL UNIQUE,
      first_processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      current_outcome_status TEXT NOT NULL DEFAULT 'not_yet_sent'
        CHECK (current_outcome_status IN (
          'not_yet_sent', 'sent', 'replied', 'call_booked', 'closed', 'unresponsive'
        )),
      attempt_count INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS outreach_attempts (
      id TEXT PRIMARY KEY,
      prospect_id TEXT NOT NULL REFERENCES prospects(id),
      attempt_number INTEGER NOT NULL,
      batch_date DATE NOT NULL,
      workflow_state TEXT NOT NULL DEFAULT 'generated'
        CHECK (workflow_state IN (
          'generated', 'quality_checked', 'revision_requested', 'needs_manual_draft',
          'needs_attention', 'human_review_queue', 'approved',
          'dispatching', 'dispatch_failed', 'sent', 'response_tracking'
        )),
      provider_thread_id TEXT UNIQUE,
      dispatch_attempts INTEGER NOT NULL DEFAULT 0,
      last_dispatch_error TEXT,
      dispatching_since TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS scraped_site_snapshots (
      id TEXT PRIMARY KEY,
      outreach_attempt_id TEXT NOT NULL UNIQUE REFERENCES outreach_attempts(id),
      scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      status TEXT NOT NULL CHECK (status IN ('complete', 'insufficient', 'unreachable')),
      raw_content_ref TEXT,
      extracted_facts JSONB
    );

    CREATE TABLE IF NOT EXISTS bfv_deliverables (
      id TEXT PRIMARY KEY,
      outreach_attempt_id TEXT NOT NULL UNIQUE REFERENCES outreach_attempts(id),
      telegram_deep_link_token TEXT NOT NULL UNIQUE,
      context_ref TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'pending_verification'
        CHECK (verification_status IN ('pending_verification', 'verified', 'verification_failed')),
      verified_at TIMESTAMPTZ,
      verification_attempts INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS outreach_scripts (
      id TEXT PRIMARY KEY,
      outreach_attempt_id TEXT NOT NULL REFERENCES outreach_attempts(id),
      revision_number INTEGER NOT NULL,
      is_current BOOLEAN NOT NULL DEFAULT true,
      body_text TEXT NOT NULL,
      generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS lint_reports (
      id TEXT PRIMARY KEY,
      outreach_script_id TEXT NOT NULL REFERENCES outreach_scripts(id),
      verdict TEXT NOT NULL CHECK (verdict IN ('pass', 'fail')),
      reading_grade_score NUMERIC,
      jargon_terms_found JSONB NOT NULL DEFAULT '[]',
      specificity_verdict TEXT NOT NULL CHECK (specificity_verdict IN ('pass', 'fail')),
      structure_verdict TEXT NOT NULL CHECK (structure_verdict IN ('pass', 'fail')),
      revision_feedback TEXT,
      checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS follow_up_cadence_states (
      id TEXT PRIMARY KEY,
      outreach_attempt_id TEXT NOT NULL UNIQUE REFERENCES outreach_attempts(id),
      send_date DATE NOT NULL,
      exhausted_at TIMESTAMPTZ,
      reengagement_eligible_date DATE
    );

    CREATE TABLE IF NOT EXISTS webhook_events (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL CHECK (provider IN ('instantly', 'unipile')),
      provider_event_id TEXT NOT NULL,
      signature_verified BOOLEAN NOT NULL,
      matched_outreach_attempt_id TEXT REFERENCES outreach_attempts(id),
      resulted_in_transition BOOLEAN NOT NULL DEFAULT false,
      received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      raw_payload_ref TEXT,
      UNIQUE (provider, provider_event_id)
    );

    -- Review dashboard (specs/002-operator-review-dashboard, MVP-0).
    -- Deliberately NO foreign key to prospects/outreach_attempts: review
    -- packages are CSV-imported and never touch the workflow state
    -- machine (spec 002 FR-018, plan Two-Queues). "source" is the
    -- reserved convergence column (plan §MVP-0 Build Scope).
    CREATE TABLE IF NOT EXISTS review_packages (
      id TEXT PRIMARY KEY,
      dedup_key TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'first100_csv',
      source_name TEXT NOT NULL,
      position INTEGER NOT NULL,
      company TEXT NOT NULL,
      contact TEXT,
      research_summary TEXT NOT NULL DEFAULT '',
      pain_point TEXT NOT NULL DEFAULT '',
      message_body TEXT NOT NULL DEFAULT '',
      bfv_link_telegram TEXT NOT NULL DEFAULT '',
      video_url TEXT,
      generator_flag TEXT,
      decision TEXT NOT NULL DEFAULT 'pending'
        CHECK (decision IN ('pending', 'approved', 'rejected')),
      decided_at TIMESTAMPTZ,
      passed_over_at TIMESTAMPTZ,
      rejection_reason TEXT
        CHECK (rejection_reason IN ('generic', 'false_claim', 'bad_fit', 'creepy', 'other')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Q011 rejection-reason capture (specs/002 D5, G7/FR-021). Idempotent
    -- evolution so an existing datadir gains the column without losing the
    -- first batch's decision history; NULL passes the CHECK (untagged
    -- rejections and all non-rejected rows). Full-word values; the UI maps
    -- g/f/b/c/o to these. IF NOT EXISTS won't repair a wrong-typed
    -- pre-existing column (hand-mutated dev DBs only, accepted risk).
    ALTER TABLE review_packages
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
      CHECK (rejection_reason IN ('generic', 'false_claim', 'bad_fit', 'creepy', 'other'));
  `);
}
