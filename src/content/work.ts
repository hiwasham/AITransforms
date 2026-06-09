// AITransforms — portfolio / "/work" content (Phase 4 redesign).
//
// Dedicated case-study section. Each project is a self-contained, forward-able
// case an ops/transformation lead can send upward without exposing a client.
// Same content-split as modules.ts: locale-independent metadata (accent, icon,
// category, route slug) lives in PROJECT_META; translated prose lives per-locale
// in TEXT; getWorkProject() merges them. EN is authored; fa/ar are English
// placeholders pending native translation (the /fa and /ar work routes are NOT
// wired until that prose lands — see CLAUDE.md sequencing).
//
// Confidentiality: no client names, no logos. Metrics are real and defensible
// (P5: every number is one Hiwa will defend verbatim in a call). Any number not
// yet confirmed is marked "TBD" in EN prose rather than invented — abstain beats
// invent. Proper nouns kept across locales: AITransforms, vTiger, Mizito, Claude.

import type { IconName } from "@/components/icons";
import type { Locale } from "@/content/site";

export type WorkSlug =
  | "support-transformation"
  | "competitive-intelligence"
  | "proposal-turnaround";

export const workSlugs: readonly WorkSlug[] = [
  "support-transformation",
  "competitive-intelligence",
  "proposal-turnaround",
] as const;

export type WorkCategory = "revenue" | "knowledge" | "operations";

// Reuses the modules ModuleMetric shape ({ value, label }).
export type WorkMetric = { value: string; label: string };

export type WorkProject = {
  slug: WorkSlug;
  accent: string;
  headerIcon: IconName;
  category: WorkCategory;
  num: string;
  // Translated prose (per-locale):
  sector: string;
  title: string;
  problem: string;
  workflowBefore: string;
  systemDelivered: string;
  metric: WorkMetric;
  metricNote: string; // how the number was measured / what it is
  whatChanged: string;
  constraints: string[];
  founderRole: string;
  method: string[]; // Map → Structure → Implement → Adapt
  whyAnonymized: string;
  diagram: { inputs: string; processing: string; outputs: string };
};

export type WorkLabels = {
  eyebrow: string;
  intro: string;
  categoryLabels: Record<WorkCategory, string>;
  sectorLabel: string;
  problemLabel: string;
  beforeLabel: string;
  systemLabel: string;
  resultLabel: string;
  changedLabel: string;
  constraintsLabel: string;
  roleLabel: string;
  methodLabel: string;
  whyAnonymizedLabel: string;
  diagramLabel: string;
  diagramInputs: string;
  diagramProcessing: string;
  diagramOutputs: string;
  viewCase: string;
  backToWork: string;
  ctaTitle: string;
  ctaBody: string;
  ctaLabel: string;
};

// ─── Locale-independent metadata ────────────────────────────────────────────
const PROJECT_META: Record<
  WorkSlug,
  { accent: string; headerIcon: IconName; category: WorkCategory; num: string }
> = {
  "support-transformation": {
    accent: "#185FA5",
    headerIcon: "ti-topology-ring",
    category: "operations",
    num: "01",
  },
  "competitive-intelligence": {
    accent: "#1D9E75",
    headerIcon: "ti-eye",
    category: "knowledge",
    num: "02",
  },
  "proposal-turnaround": {
    accent: "#534AB7",
    headerIcon: "ti-file-text",
    category: "revenue",
    num: "03",
  },
};

// ─── Per-locale prose ───────────────────────────────────────────────────────
type ProjectText = Omit<
  WorkProject,
  "slug" | "accent" | "headerIcon" | "category" | "num"
>;
type LocaleText = {
  labels: WorkLabels;
  projects: Record<WorkSlug, ProjectText>;
};

// A reusable, anonymization rationale — one policy line, not per-project.
const WHY_ANON_EN =
  "Client identity is withheld under engagement confidentiality. The metrics are real and verifiable in a private reference call.";

const EN: LocaleText = {
  labels: {
    eyebrow: "Selected work",
    intro:
      "Anonymized engagements with real, defensible outcomes. Names and identifying details are omitted to respect client confidentiality; the numbers are ones we stand behind.",
    categoryLabels: {
      revenue: "Revenue",
      knowledge: "Knowledge",
      operations: "Operations",
    },
    sectorLabel: "Sector",
    problemLabel: "The problem",
    beforeLabel: "How it worked before",
    systemLabel: "What we built",
    resultLabel: "Result",
    changedLabel: "What changed",
    constraintsLabel: "Constraints",
    roleLabel: "Our role",
    methodLabel: "Method",
    whyAnonymizedLabel: "Why this is anonymized",
    diagramLabel: "System shape",
    diagramInputs: "Inputs",
    diagramProcessing: "Processing",
    diagramOutputs: "Outputs",
    viewCase: "View the case",
    backToWork: "All work",
    ctaTitle: "Have an operational document you want analyzed?",
    ctaBody:
      "We do not run standard sales calls. Send your most complex operational document and an engineer will return a clear model of what automating it is worth.",
    ctaLabel: "Request an operational diagnostic",
  },
  projects: {
    "support-transformation": {
      sector: "EdTech / software support",
      title: "A founder-dependent support desk, rebuilt as an AI ticketing system",
      problem:
        "A support operation buried in 38,000 historical tickets and 85,000 messages, with the CEO acting as the manual translation layer between scattered shadow systems.",
      workflowBefore:
        "Support agents granted concessions through unstandardized channels. A heavily customized vTiger CRM had drifted into a dozen shadow systems, and onboarding knowledge was scattered across Mizito. Routine answers depended on the founder.",
      systemDelivered:
        "A distributed-agent ticketing system with a semantic memory layer (PGLite / pgvector). 'Smart ticketing' surfaces similar resolved tickets at submit time and is built to deflect routine queries before they reach a human.",
      metric: { value: "38,000", label: "tickets migrated into a structured knowledge base" },
      metricNote:
        "Migration scope is documented: 38,000 tickets / 85,000 messages / 123,000 data points. Automation is a Target KPI — 80% of routine queries — not a realized result: the engagement is active (Phase 2), deploying against the 38,000-ticket backlog, so a final deflection rate is not published yet.",
      whatChanged:
        "The support desk moved from founder-dependent and improvised toward an AI-augmented model, with the historical ticket corpus turned into a searchable knowledge base instead of tribal memory.",
      constraints: [
        "Persian / RTL language throughout",
        "123,000 distinct data points migrated securely",
        "Local data-security compliance (AFTA certification)",
      ],
      founderRole: "Transformation lead and strategic advisor to the CEO",
      method: [
        "Map: AI-led audit of the support operation to surface the CEO bottleneck and shadow systems",
        "Structure: a 4-level documentation framework; 38,000 tickets moved into a structured knowledge base",
        "Implement: distributed-agent architecture over a PGLite / pgvector semantic memory layer",
        "Adapt: an exception-handling rule protocol so the system retrains on edge cases instead of escalating them",
      ],
      whyAnonymized: WHY_ANON_EN,
      diagram: {
        inputs: "38,000 historical tickets / 85,000 messages",
        processing: "Semantic memory + classification over a vector store",
        outputs: "Pre-submit ticket deflection + suggested knowledge-base answers",
      },
    },
    "competitive-intelligence": {
      sector: "Non-profit / education",
      title: "Enterprise-grade competitive intelligence for a team with no time for it",
      problem:
        "The operations director could not name more than one competitor, because strategic research was permanently crowded out by daily operations.",
      workflowBefore:
        "Strategic and competitive research simply did not get done. With lean resources, positioning work was pushed aside indefinitely in favor of operational firefighting.",
      systemDelivered:
        "A documented prompt-and-analysis workflow that runs competitive positioning on demand — pulling and synthesizing sources into a single structured intelligence artifact.",
      metric: { value: "25 min", label: "to a competitive analysis that used to take weeks" },
      metricNote:
        "Client-reported: 171 sources synthesized into one competitive artifact in roughly 25 minutes. Reported by the client; framed as time-to-artifact, not a business-outcome metric.",
      whatChanged:
        "A resource-constrained team gained strategic intelligence — competitor strengths, weaknesses, and positioning gaps — that previously would have required weeks of work or outside consultants.",
      constraints: ["Non-profit-level resources and staffing"],
      founderRole:
        "Acted as lead operator, directly extracting tribal knowledge and configuring the AI architecture.",
      method: [
        "Map: identify that strategic research was the missing capability, not a missing tool",
        "Structure: encode the positioning questions into a documented, repeatable prompt workflow",
        "Implement: run multi-source synthesis into a single competitive artifact",
        "Adapt: rerun on demand as the market and competitor set change",
      ],
      whyAnonymized: WHY_ANON_EN,
      diagram: {
        inputs: "Basic positioning inputs + a defined competitor set",
        processing: "Documented prompt workflow + multi-source synthesis",
        outputs: "One structured competitive-intelligence artifact (171 sources)",
      },
    },
    "proposal-turnaround": {
      sector: "Consulting firm (14 people)",
      title: "A stuck close rate, fixed by documenting the proposal, not changing the offer",
      problem:
        "A close rate stuck at 18% despite a strong offer and warm leads — caused by a proposal process improvised from scratch every time.",
      workflowBefore:
        "Every proposal was improvised, taking 2–4 hours each, with no template and no consistent decision logic for scope or pricing.",
      systemDelivered:
        "A documented proposal template with a 5-decision mental checklist and a short customization checklist — so each proposal is consistent and fast without losing fit.",
      metric: { value: "18% → 31%", label: "close rate, within one quarter" },
      metricNote:
        "Internal company sales tracking over one quarter. Proposal turnaround also dropped from 2–4 hours to under one hour. The offer itself was unchanged.",
      whatChanged:
        "Proposal turnaround fell from 2–4 hours to under an hour, and the close rate rose from 18% to 31% — without touching the underlying offer or pricing.",
      constraints: [],
      founderRole:
        "Acted as lead operator, directly extracting tribal knowledge and configuring the AI architecture.",
      method: [
        "Map: locate the bottleneck at the proposal step, not the lead or the offer",
        "Structure: capture the implicit proposal decisions as a 5-point checklist + template",
        "Implement: roll the template into the team's proposal workflow",
        "Adapt: refine the checklist against won/lost outcomes over the quarter",
      ],
      whyAnonymized: WHY_ANON_EN,
      diagram: {
        inputs: "Qualified lead + discovery context",
        processing: "Documented template + 5-decision checklist",
        outputs: "A consistent, customized proposal in under an hour",
      },
    },
  },
};

// fa/ar are English placeholders until native translation lands. The /fa and
// /ar work routes are intentionally NOT created yet, so these are dormant — they
// exist only to satisfy the Record<Locale, ...> shape without faking translation.
const TEXT: Record<Locale, LocaleText> = {
  en: EN,
  fa: EN,
  ar: EN,
};

// ─── Builder ────────────────────────────────────────────────────────────────
export function getWorkProject(locale: Locale, slug: WorkSlug): WorkProject {
  const meta = PROJECT_META[slug];
  const text = TEXT[locale].projects[slug];
  return {
    slug,
    accent: meta.accent,
    headerIcon: meta.headerIcon,
    category: meta.category,
    num: meta.num,
    ...text,
  };
}

export function getWorkLabels(locale: Locale): WorkLabels {
  return TEXT[locale].labels;
}

export function listWorkProjects(locale: Locale): WorkProject[] {
  return workSlugs.map((slug) => getWorkProject(locale, slug));
}

// Localized link list for the work pages, for nav/footer menus.
export function workLinks(
  locale: Locale,
  basePath: "" | "/fa" | "/ar",
): { label: string; href: string }[] {
  return workSlugs.map((slug) => ({
    label: TEXT[locale].projects[slug].title,
    href: `${basePath}/work/${slug}`,
  }));
}
