<!--
Sync Impact Report
Version change: TEMPLATE → 1.0.0 (initial ratification)
Modified principles: n/a (first fill of template placeholders)
Added sections:
  - Core Principles I–XI (Preserve Existing Functionality, Incremental Change,
    Minimal Dependencies, Modular Architecture, Credential & Secret Protection,
    Observability by Default, Production Reliability, Document Architectural
    Decisions, Test Critical Functionality, Follow Existing Conventions,
    Justify New Technology)
  - Additional Constraints (tech stack, RTL/i18n, no unnecessary backend)
  - Development Workflow (branch/test/verify gates)
  - Governance
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no change needed (Constitution Check
    gate is generic, derives from this file at plan time)
  - .specify/templates/spec-template.md ✅ no change needed (no
    constitution-specific mandatory sections introduced)
  - .specify/templates/tasks-template.md ✅ no change needed (no new
    principle-driven task categories beyond existing test/observability
    coverage)
Follow-up TODOs: none
-->

# AITransforms Constitution

## Core Principles

### I. Preserve Existing Functionality
Before refactoring or replacing any working code path, its current behavior
MUST be understood and verified (tests, manual check, or documented trace).
Refactors MUST NOT change observable behavior unless that change is the
explicit goal of the task and is called out separately.
**Rationale**: AITransforms is a live platform; silent regressions cost more
than the refactor saves.

### II. Incremental Change Over Rewrites
Prefer small, reviewable, independently shippable changes over large rewrites
or big-bang migrations. A rewrite MUST be justified in writing (what breaks
if we don't, why incremental isn't viable) before it starts.
**Rationale**: Incremental changes keep the system releasable at every step
and bound the blast radius of any single change.

### III. Avoid Unnecessary Dependencies
Do not add a library, service, or framework when existing code or the
standard library already solves the problem. Every new dependency MUST have
a one-line justification (what it buys us) recorded in the PR or plan.
**Rationale**: Every dependency is a maintenance, security, and bundle-size
liability that outlives the feature that introduced it.

### IV. Modular Architecture
Code MUST be organized into components with a single clear responsibility
and explicit boundaries (no reaching across modules to touch internals).
Cross-cutting concerns (logging, config, auth) live in shared modules, not
duplicated per-feature.
**Rationale**: Modularity is what makes "incremental change" (Principle II)
possible without full-system risk.

### V. Protect Credentials and Sensitive Data
API keys, tokens, and credentials MUST NEVER be committed to the repo,
logged in plaintext, or hardcoded. They are loaded from environment
variables or a secrets manager, and `.gitignore`/secret-scanning MUST cover
any new credential file pattern. Sensitive user data MUST NOT appear in logs
or error messages.
**Rationale**: A leaked credential is a security incident, not a bug ticket.

### VI. Observability by Default (NON-NEGOTIABLE)
Every automation workflow MUST have structured logging at entry/exit and on
failure, explicit error handling (no silent catch/swallow), and enough
signal (log fields, metrics, or alerts) to answer "did this run, and did it
succeed" without reading source code.
**Rationale**: Automation that fails silently is worse than automation that
doesn't exist — it hides the problem instead of surfacing it.

### VII. Production Reliability Over Quick Hacks
When reliability and shipping speed conflict, reliability wins. A quick hack
that risks breaking a running workflow requires explicit sign-off and a
follow-up task to remove it; it is never the default path.
**Rationale**: AITransforms automations run unattended; a fast-but-fragile
change fails when no one is watching.

### VIII. Document Architectural Decisions
Decisions with long-term consequences (new service boundary, data model
change, dependency swap, workflow redesign) MUST be captured in writing
(ADR, plan doc, or PR description) with the reasoning and rejected
alternatives, not just the outcome.
**Rationale**: Undocumented decisions get silently reversed or duplicated by
the next person (or agent) who hits the same fork.

### IX. Test Critical Functionality
Code paths that are load-bearing for production (automation triggers, data
writes, external API calls, auth) MUST have tests. A bug fix in a critical
path MUST include a regression test. Non-critical, purely cosmetic code is
exempt.
**Rationale**: Tests are what make future incremental changes (Principle II)
safe to make quickly.

### X. Follow Existing Project Conventions
New code MUST match the patterns, naming, structure, and style already
established in the codebase, even where a contributor would personally
choose differently. Deviating from convention requires explicit justification
and, ideally, updating the convention everywhere at once — not a one-off
exception.
**Rationale**: Consistency lowers the cost of every future change more than
any single local improvement does.

### XI. Justify New Technology Adoption
Introducing a new language, framework, runtime, or infrastructure piece
requires a written tradeoff comparison (why existing tools don't fit, cost of
adoption, maintenance burden) before it lands, not after.
**Rationale**: Technology choices are the hardest architectural decisions to
reverse; they deserve deliberate evaluation, not default momentum.

## Additional Constraints

- Stack and dependency choices MUST stay within what's already established in
  this repo (see `CLAUDE.md`/`AGENTS.md`/`README.md`) unless Principle XI's
  tradeoff justification is satisfied.
- No CMS, database, authentication system, blog, or other heavy backend
  component may be introduced for functionality that a static/simple
  implementation already satisfies.
- Internationalization/RTL-sensitive UI work MUST use logical CSS properties
  (not physical left/right) so English, Persian, and Arabic locales render
  correctly without per-locale style forks.
- Secrets/config files (`.env`, key files) MUST remain out of version control;
  verify `.gitignore` coverage before adding a new one.

## Development Workflow

- Code changes start on a feature branch (`feature/<short-name>`); no direct
  commits to `main`/`master`.
- Before marking work done, run the project's full verification gate (lint,
  type-check, tests, build) and read the actual output — exit code 0 alone
  is not verification (Principle IX; see also global CLAUDE.md "Verify,
  Don't Claim").
- Hooks, commit signing, and pre-commit checks MUST NOT be bypassed
  (`--no-verify`, `--no-gpg-sign`, etc.) without explicit user authorization.
- PRs/reviews MUST check the diff against these principles before merge;
  flag violations instead of silently fixing or ignoring them.

## Governance

This constitution supersedes ad hoc conventions and prior undocumented
practice for AITransforms. All specs, plans, and implementation tasks
generated by the spec-kit workflow MUST pass a Constitution Check against
the Core Principles above before implementation begins.

**Amendment procedure**: propose the change (what principle, why), update
this file, bump the version per the policy below, and update any dependent
template (`plan-template.md`, `spec-template.md`, `tasks-template.md`) whose
guidance the change affects. Record the amendment in a Sync Impact Report
comment at the top of this file.

**Versioning policy** (semantic versioning applied to governance):
- MAJOR: backward-incompatible principle removal or redefinition.
- MINOR: new principle or materially expanded guidance added.
- PATCH: wording clarifications, typo fixes, non-semantic edits.

**Compliance review**: any plan or PR that knowingly deviates from a Core
Principle MUST document the deviation and its justification inline (in
`plan.md`'s Constitution Check section or the PR description) rather than
silently diverging.

**Version**: 1.0.0 | **Ratified**: 2026-07-11 | **Last Amended**: 2026-07-11
