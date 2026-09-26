// AITransforms — module detail content (Phase 4 redesign).
//
// Three department module pages ported from the EMPOWER reference set:
// Growth Engine, Operations Core, People OS. Each page has four AI modules
// rendered as an interactive tabbed panel (see ModulePanel.tsx).
//
// Structure note: locale-independent metadata (accent colour, icons, tab tags,
// route slug) is hoisted into PAGE_META so it lives in exactly one place. The
// translated prose lives per-locale in TEXT. buildModulePage() merges them by
// index into the typed shape the panel consumes. fa/ar are V1 translations —
// flagged for native review, same standard as the rest of the site. Proper
// nouns from the source examples (Hamkelasi, Evea, Vtiger, Mizito, n8n) are
// kept as-is across locales.

import type { IconName } from "@/components/icons";
import type { Locale } from "@/content/site";

export type ModuleSlug = "growth-engine" | "operations-core" | "people-os";

export const moduleSlugs: readonly ModuleSlug[] = [
  "growth-engine",
  "operations-core",
  "people-os",
] as const;

export type ModuleMetric = { value: string; label: string };

export type ModuleEntry = {
  tag: string;
  icon: IconName;
  label: string;
  sub: string;
  desc: string;
  how: string;
  impact: string;
  example?: string;
  metrics: ModuleMetric[];
  flow: string[];
  hitl?: string;
};

export type ModuleLabels = {
  moduleWord: string;
  howItWorks: string;
  impact: string;
  example: string;
  workflow: string;
  humanInLoop: string;
  moduleActive: string;
  prev: string;
  next: string;
};

export type ModulePage = {
  slug: ModuleSlug;
  accent: string;
  headerIcon: IconName;
  num: string;
  eyebrow: string;
  title: string;
  intro: string;
  labels: ModuleLabels;
  modules: ModuleEntry[];
};

// ─── Locale-independent metadata ────────────────────────────────────────────
const PAGE_META: Record<
  ModuleSlug,
  {
    accent: string;
    headerIcon: IconName;
    num: string;
    modules: { icon: IconName; tag: string }[];
  }
> = {
  "growth-engine": {
    accent: "#1D9E75",
    headerIcon: "ti-rocket",
    num: "01",
    modules: [
      { icon: "ti-target", tag: "01" },
      { icon: "ti-file-text", tag: "02" },
      { icon: "ti-database", tag: "03" },
      { icon: "ti-send", tag: "04" },
    ],
  },
  "operations-core": {
    accent: "#185FA5",
    headerIcon: "ti-adjustments-horizontal",
    num: "02",
    modules: [
      { icon: "ti-list-check", tag: "A" },
      { icon: "ti-shield-check", tag: "B" },
      { icon: "ti-contract", tag: "C" },
      { icon: "ti-topology-ring", tag: "D" },
    ],
  },
  "people-os": {
    accent: "#534AB7",
    headerIcon: "ti-users",
    num: "03",
    modules: [
      { icon: "ti-user-search", tag: "A" },
      { icon: "ti-arrow-bar-right", tag: "B" },
      { icon: "ti-chart-line", tag: "C" },
      { icon: "ti-school", tag: "D" },
    ],
  },
};

// ─── Per-locale prose ───────────────────────────────────────────────────────
type ModuleText = Omit<ModuleEntry, "tag" | "icon">;
type PageText = { eyebrow: string; title: string; intro: string; modules: ModuleText[] };
type LocaleText = { labels: ModuleLabels; pages: Record<ModuleSlug, PageText> };

const TEXT: Record<Locale, LocaleText> = {
  en: {
    labels: {
      moduleWord: "Module",
      howItWorks: "How it works",
      impact: "Operational impact",
      example: "Real example",
      workflow: "Workflow",
      humanInLoop: "Human in the loop",
      moduleActive: "Module active",
      prev: "Prev",
      next: "Next",
    },
    pages: {
      "growth-engine": {
        eyebrow: "Revenue & Market Expansion",
        title: "Growth Engine",
        intro:
          "Four revenue modules that turn documented sales processes into AI-augmented systems — lead scoring, proposal generation, CRM enrichment, and outreach at scale.",
        modules: [
          {
            label: "Lead Scoring",
            sub: "Qualification criteria",
            desc: "AI automatically evaluates every prospect against your ICP and documented qualification rules — before a salesperson ever speaks to them.",
            how: "AI agents analyze data from web forms, call transcripts, or scraped sources to score each lead on budget, urgency, authority, and need. A 30-minute Zoom transcript is processed and returned as a binary yes/no qualification status.",
            impact: "Eliminates time wasted on unqualified leads and no-shows. Salespeople focus exclusively on high-value conversations — every call is worth showing up for.",
            metrics: [
              { value: "0", label: "Unqualified calls passed through" },
              { value: "100%", label: "Rep time on high-value leads" },
              { value: "<2 min", label: "Transcript to score time" },
            ],
            flow: [
              "Web form / Call transcript",
              "AI analysis",
              "ICP scoring",
              "Yes / No status",
              "CRM record updated",
            ],
          },
          {
            label: "Proposal Generation",
            sub: "Service offerings",
            desc: "Transforms proposal creation from a manual, hours-long task into a sub-20-minute process — without losing personalization or quality.",
            how: "AI is given your documented service offerings plus the specific context from a discovery call transcript. It drafts a hyper-personalized proposal scoped to the prospect's exact pain points and budget signals.",
            impact: "Eliminates the proposal bottleneck — the gap between 'great call' and 'signed contract' that kills deals. One documented case compressed an 8–10 hour process to under 20 minutes.",
            metrics: [
              { value: "20 min", label: "Draft time (was 8–10 hrs)" },
              { value: "80%", label: "AI-generated content" },
              { value: "20%", label: "Human refinement (pricing & scope)" },
            ],
            flow: [
              "Discovery transcript",
              "Service docs",
              "AI drafts proposal",
              "Human review (20%)",
              "Sent to prospect",
            ],
            hitl: "The final 20% — high-stakes pricing, scope edge cases, and relationship nuance — is always completed by a human before the proposal leaves the building.",
          },
          {
            label: "CRM Enrichment",
            sub: "Sales process",
            desc: "Automates the administrative drag of keeping sales data accurate and current — recovering roughly 20% of every salesperson's working day.",
            how: "AI scrapes and enriches lead lists with missing contact data (emails, phone numbers, LinkedIn URLs) from web sources. After every call, it auto-updates CRM records with notes, action items, and updated lead scores — zero manual entry.",
            impact: "Moves reporting cadence from weekly to daily, sharpening decision speed. No more stale pipelines or missing follow-up context. Every record reflects the last interaction accurately.",
            metrics: [
              { value: "20%", label: "Salesperson day recovered" },
              { value: "Daily", label: "Reporting cadence (was weekly)" },
              { value: "0", label: "Manual CRM entries required" },
            ],
            flow: [
              "Post-call AI analysis",
              "Notes + action items",
              "Lead score update",
              "CRM auto-updated",
              "Pipeline view refreshed",
            ],
          },
          {
            label: "Automated Outreach",
            sub: "Brand voice",
            desc: "Scales outreach from thousands to hundreds of thousands of touches per month — while keeping every message sounding unmistakably like you.",
            how: "Your Business DNA and Master Prompt train the AI on your brand voice. It then drafts personalized emails, texts, or Loom-style video scripts tailored to individual prospects at volume — 2,000 to 100,000 per month with no degradation in quality.",
            impact: "Replaces expensive paid ad spend with a predictable, AI-driven flow of qualified introductions. Reply rates hold because messages are hyper-personalized — not broadcast blasts.",
            metrics: [
              { value: "100K", label: "Outreach per month at capacity" },
              { value: "0%", label: "Drop in reply rate with scale" },
              { value: "$0", label: "Paid ad dependency replaced" },
            ],
            flow: [
              "Business DNA / Master Prompt",
              "Prospect list",
              "AI drafts messages",
              "Multi-channel send",
              "Qualified replies to CRM",
            ],
          },
        ],
      },
      "operations-core": {
        eyebrow: "Efficiency & Governance",
        title: "Operations Core",
        intro:
          "Four operations modules that systematize execution across departments — SOP execution, quality management, contract analysis, and workflow integration, with AI enforcement built in.",
        modules: [
          {
            label: "SOP Execution",
            sub: "Following documented procedures",
            desc: "Automates the shift from 'knowing what to do' to 'it happens automatically.' Events trigger work — not managers asking the next question.",
            how: "An AI workflow monitors live business events (contract signatures, form submissions, status changes). When a trigger fires, it automatically populates the correct subtasks in the task manager — no human handoff required.",
            impact: "Eliminates the 'permanent co-pilot' problem. The operations manager no longer shadows the founder step-by-step; instead they manage a pre-built execution engine that runs itself.",
            example: "When a new school signs a contract in Hamkelasi's Sale to Delivery process, a Zapier workflow detects the signature and automatically populates the required subtasks in Mizito — the team's task manager.",
            metrics: [
              { value: "0", label: "Manual task assignments needed" },
              { value: "Instant", label: "Subtask creation after trigger" },
              { value: "100%", label: "SOP steps covered" },
            ],
            flow: [
              "Contract signed",
              "Zapier detects event",
              "SOP template loaded",
              "Subtasks auto-created in Mizito",
              "Team notified",
            ],
          },
          {
            label: "Quality Management",
            sub: "Based on documented requirements",
            desc: "Deploys AI as a 24/7 auditor across every customer interaction — so standards are enforced at scale without anyone manually reviewing calls.",
            how: "AI analyzes support call transcripts against documented quality criteria: brand voice adherence, correct escalation routing, resolution accuracy. Each interaction receives a score. Only scores below threshold trigger a human alert.",
            impact: "Enables leadership by exception. The founder only receives a notification when something falls below a 7/10 — everything above runs silently. Scales quality oversight from 10 calls to 10,000 without adding headcount.",
            example: "At Hamkelasi (700+ schools), AI scores support calls on whether the agent used the 'Hamkelasi Voice' and routed customers to a Level 3 Guide before escalating to a human. Omid only sees interactions that score below 7.",
            metrics: [
              { value: "700+", label: "Schools audited automatically" },
              { value: "7/10", label: "Score threshold for human alert" },
              { value: "0", label: "Manual call reviews by founder" },
            ],
            flow: [
              "Support call ends",
              "Transcript generated",
              "AI scores vs. criteria",
              "Score ≥7: silent pass",
              "Score <7: alert to founder",
            ],
          },
          {
            label: "Contract Analysis",
            sub: "Against documented standards",
            desc: "AI compares every incoming request against your documented rules of engagement — externalizing founder judgment so the team can say yes or no without waiting for approval.",
            how: "When a client submits a non-standard request or a new contract arrives, AI scans it against your documented service scope and pricing rules. It returns a verdict: standard package, custom exception needed, or flag for review.",
            impact: "Solves scope creep at the source. The team can respond to a 'can you also do X?' request immediately — with a documented standard behind them, not a personal judgment call. Founder is only pulled in for genuine edge cases.",
            example: "When a Hamkelasi school complex requests a non-standard LMS integration, AI scans the request against documented service offerings and flags whether it falls under the standard package or requires a custom pricing exception.",
            metrics: [
              { value: "<5 min", label: "Scope verdict turnaround" },
              { value: "0", label: "Scope creep passing undetected" },
              { value: "100%", label: "Decisions backed by a standard" },
            ],
            flow: [
              "Incoming request / contract",
              "AI scans vs. service docs",
              "Standard scope?",
              "Yes: auto-approve",
              "No: flag + pricing exception",
            ],
          },
          {
            label: "Workflow Integration",
            sub: "Between documented systems",
            desc: "Builds the digital backbone that connects fragmented tools into a single source of truth — eliminating duplicate data entry across every platform.",
            how: "Data entered in one system (e.g. CRM during discovery) is automatically pushed to downstream systems (task manager for onboarding, success dashboard for reporting). AI enforces field hygiene and naming conventions across all integrations.",
            impact: "No staff member enters the same school name, student count, or contact detail twice. Solves the 'CRM chaos' problem where every user defines their own fields — AI enforces a single data standard across all connected platforms.",
            example: "At Hamkelasi, data entered in Vtiger during a discovery call is auto-pushed to Mizito for onboarding and then to a Customer Success dashboard. The same school name and student count flows through every system untouched.",
            metrics: [
              { value: "0", label: "Duplicate data entries per record" },
              { value: "3+", label: "Systems connected in one backbone" },
              { value: "Daily", label: "Reporting cadence (was weekly)" },
            ],
            flow: [
              "Data entered in Vtiger CRM",
              "Auto-push to Mizito",
              "Onboarding tasks created",
              "Success dashboard updated",
              "Single source of truth",
            ],
          },
        ],
      },
      "people-os": {
        eyebrow: "Talent & Culture",
        title: "People OS",
        intro:
          "Four people modules that turn documented role frameworks into AI-augmented HR — recruiting, onboarding, performance reviews, and personalized learning pathways.",
        modules: [
          {
            label: "Recruiting",
            sub: "Aligned to documented role requirements",
            desc: "AI screens every applicant against your documented role scorecard before a human spends a single minute reviewing a CV — so only qualified candidates reach the interview stage.",
            how: "Job requirements are documented into a structured scorecard (skills, experience, culture signals). AI screens applications, scores each candidate against criteria, and ranks them. Hiring managers only see the top tier — every rejection below threshold is handled automatically.",
            impact: "Removes the founder or manager from first-pass screening entirely. Cuts time-to-shortlist from days to minutes. Ensures every hiring decision is anchored to a documented standard rather than gut feel or whoever happened to apply first.",
            example: "A model agency posting for a content coordinator receives 80 applications. AI scores each against documented criteria (English fluency, content tools, availability) and surfaces the top 8 with a scorecard breakdown — the founder reviews for 20 minutes, not 8 hours.",
            metrics: [
              { value: "<10 min", label: "Time to shortlist" },
              { value: "Top 10%", label: "Only scored candidates reviewed" },
              { value: "100%", label: "Decisions against documented criteria" },
            ],
            flow: [
              "Application received",
              "AI scores vs. role scorecard",
              "Below threshold: auto-decline",
              "Above threshold: ranked shortlist",
              "Hiring manager reviews top tier",
            ],
          },
          {
            label: "Onboarding",
            sub: "Following documented workflows",
            desc: "Converts onboarding from a founder-dependent hand-holding exercise into a self-executing workflow — new hires get consistent, complete, and trackable ramp-up every time.",
            how: "When a new team member is confirmed, an AI workflow triggers their full onboarding sequence: account provisioning, task assignments, training module scheduling, and checkpoint reminders. Progress is tracked against a documented timeline automatically.",
            impact: "Eliminates tribal knowledge dependency — the onboarding experience no longer lives in one person's head. A new hire on day one gets the same quality experience as the tenth hire. Managers are only pinged when a step is overdue or blocked.",
            example: "When Evea onboards a new model, a workflow triggers: Instagram warm-up SOP assigned, persona document shared, ManyChat training scheduled, and a 7-day check-in reminder set — all without Hiwa manually sending a single message.",
            metrics: [
              { value: "Day 1", label: "Full task sequence launched" },
              { value: "0", label: "Onboarding steps missed per hire" },
              { value: "7 days", label: "Time to first independent output" },
            ],
            flow: [
              "Hire confirmed",
              "AI triggers onboarding sequence",
              "Accounts provisioned",
              "Tasks + training assigned",
              "Progress tracked vs. timeline",
            ],
          },
          {
            label: "Performance Reviews",
            sub: "Using documented frameworks",
            desc: "Replaces memory-based, recency-biased reviews with data-driven assessments pulled directly from documented KPIs and observed work — giving every team member a fair, consistent evaluation.",
            how: "AI aggregates performance data from connected tools (task completion rates, response times, output counts, quality scores) and maps them against each role's documented KPI framework. It drafts the review, flags gaps, and surfaces talking points — the manager adds context and delivers.",
            impact: "Managers stop dreading review season. Reviews take 20 minutes instead of 2 hours. Every team member is evaluated against the same documented standard — not whoever made the most impression in the last two weeks.",
            example: "For Evea's Audience Relationship Manager, AI pulls DM response time, conversion rate from free to paid, and fan retention rate — then drafts a review against the documented KPIs, flagging that response time improved but upsell conversion dropped 12% this month.",
            metrics: [
              { value: "20 min", label: "Review draft time (was 2 hrs)" },
              { value: "100%", label: "KPIs pulled from live data" },
              { value: "0", label: "Recency bias in scoring" },
            ],
            flow: [
              "Review cycle opens",
              "AI pulls data from connected tools",
              "Maps to role KPI framework",
              "Review draft generated",
              "Manager adds context + delivers",
            ],
          },
          {
            label: "L&D Pathways",
            sub: "Supporting documented skills",
            desc: "Transforms learning from a generic, one-size-fits-all training library into a personalized skill-gap map — each team member gets a pathway built around what their role requires and what they currently lack.",
            how: "AI compares each person's current skill profile (from reviews, outputs, and self-assessments) against their role's documented skill requirements. It generates a prioritized learning pathway: which skills to develop first, in what sequence, and via which resources.",
            impact: "Training budget stops being wasted on courses nobody needs. Every development hour is directed at the specific gap between where a person is and what their role demands. Skill progression becomes measurable, not assumed.",
            example: "An Evea content model scores low on 'AI video scripting' against the documented content creator skill framework. AI generates a 3-week pathway: two ComfyUI tutorials, one prompt engineering module, and a peer review session with the photographer — with weekly output milestones.",
            metrics: [
              { value: "100%", label: "Training tied to documented gaps" },
              { value: "3 weeks", label: "Avg pathway to close a gap" },
              { value: "0", label: "Generic training assigned by default" },
            ],
            flow: [
              "Skill profile assessed",
              "AI maps vs. role requirements",
              "Gap identified",
              "Personalized pathway generated",
              "Weekly milestones tracked",
            ],
          },
        ],
      },
    },
  },

  fa: {
    labels: {
      moduleWord: "ماژول",
      howItWorks: "چطور کار می‌کند",
      impact: "تأثیر عملیاتی",
      example: "نمونه واقعی",
      workflow: "گردش کار",
      humanInLoop: "انسان در حلقه",
      moduleActive: "ماژول فعال",
      prev: "قبلی",
      next: "بعدی",
    },
    pages: {
      "growth-engine": {
        eyebrow: "درآمد و گسترش بازار",
        title: "موتور رشد",
        intro:
          "چهار ماژول درآمدی که فرآیندهای مستندِ فروش را به سیستم‌های تقویت‌شده با هوش مصنوعی تبدیل می‌کنند — امتیازدهی سرنخ، تولید پیشنهاد، غنی‌سازی CRM و ارتباط‌گیری در مقیاس.",
        modules: [
          {
            label: "امتیازدهی سرنخ",
            sub: "معیارهای صلاحیت",
            desc: "هوش مصنوعی هر مشتری بالقوه را به‌صورت خودکار در برابر ICP و قواعد مستند صلاحیت ارزیابی می‌کند — پیش از آنکه فروشنده حتی با او صحبت کند.",
            how: "عامل‌های هوش مصنوعی داده‌های فرم‌های وب، رونوشت تماس‌ها یا منابع استخراج‌شده را تحلیل می‌کنند تا هر سرنخ را بر اساس بودجه، فوریت، اختیار و نیاز امتیاز دهند. یک رونوشت ۳۰ دقیقه‌ای زوم پردازش و به‌صورت وضعیت صلاحیتِ بله/خیر بازگردانده می‌شود.",
            impact: "زمان تلف‌شده روی سرنخ‌های فاقد صلاحیت و غیبت‌ها را حذف می‌کند. فروشنده‌ها تنها روی گفت‌وگوهای پرارزش تمرکز می‌کنند — هر تماس ارزش حاضر شدن دارد.",
            metrics: [
              { value: "۰", label: "تماس فاقد صلاحیتِ عبورکرده" },
              { value: "۱۰۰٪", label: "زمان فروشنده روی سرنخ‌های پرارزش" },
              { value: "< ۲ دقیقه", label: "زمان رونوشت تا امتیاز" },
            ],
            flow: [
              "فرم وب / رونوشت تماس",
              "تحلیل هوش مصنوعی",
              "امتیازدهی ICP",
              "وضعیت بله / خیر",
              "به‌روزرسانی رکورد CRM",
            ],
          },
          {
            label: "تولید پیشنهاد",
            sub: "بسته‌های خدمات",
            desc: "ساخت پیشنهاد را از یک کار دستیِ چندساعته به فرآیندی کمتر از ۲۰ دقیقه تبدیل می‌کند — بدون از دست دادن شخصی‌سازی یا کیفیت.",
            how: "بسته‌های خدمات مستند شما به‌همراه زمینه مشخصِ رونوشت تماس کشف به هوش مصنوعی داده می‌شود. سپس پیشنهادی به‌شدت شخصی‌سازی‌شده، متناسب با نقاط درد و سیگنال‌های بودجه مشتری، پیش‌نویس می‌کند.",
            impact: "گلوگاه پیشنهاد را حذف می‌کند — فاصله میان «تماس عالی» و «قرارداد امضاشده» که معامله‌ها را از بین می‌برد. یک نمونه مستند، فرآیند ۸ تا ۱۰ ساعته را به کمتر از ۲۰ دقیقه فشرد.",
            metrics: [
              { value: "۲۰ دقیقه", label: "زمان پیش‌نویس (پیش‌تر ۸–۱۰ ساعت)" },
              { value: "۸۰٪", label: "محتوای تولیدشده با هوش مصنوعی" },
              { value: "۲۰٪", label: "اصلاح انسانی (قیمت و دامنه)" },
            ],
            flow: [
              "رونوشت کشف",
              "اسناد خدمات",
              "پیش‌نویس پیشنهاد با هوش مصنوعی",
              "بازبینی انسانی (۲۰٪)",
              "ارسال به مشتری",
            ],
            hitl: "آن ۲۰٪ پایانی — قیمت‌گذاری پرریسک، موارد مرزی دامنه و ظرافت‌های رابطه — همیشه پیش از خروج پیشنهاد توسط یک انسان تکمیل می‌شود.",
          },
          {
            label: "غنی‌سازی CRM",
            sub: "فرآیند فروش",
            desc: "بار اداری نگه‌داشتن داده‌های فروش به‌صورت دقیق و به‌روز را خودکار می‌کند — و حدود ۲۰٪ از روز کاری هر فروشنده را بازمی‌گرداند.",
            how: "هوش مصنوعی فهرست سرنخ‌ها را با داده‌های تماسِ گمشده (ایمیل، شماره تلفن، نشانی لینکدین) از منابع وب استخراج و غنی می‌کند. پس از هر تماس، رکوردهای CRM را با یادداشت‌ها، اقلام اقدام و امتیازهای به‌روز خودکار به‌روزرسانی می‌کند — بدون ورود دستی.",
            impact: "آهنگ گزارش‌دهی را از هفتگی به روزانه می‌برد و سرعت تصمیم را تیزتر می‌کند. دیگر خبری از خط‌لوله‌های کهنه یا زمینه پیگیریِ گمشده نیست. هر رکورد دقیقاً آخرین تعامل را بازتاب می‌دهد.",
            metrics: [
              { value: "۲۰٪", label: "روز فروشنده بازیافته" },
              { value: "روزانه", label: "آهنگ گزارش‌دهی (پیش‌تر هفتگی)" },
              { value: "۰", label: "ورودی دستی CRM لازم" },
            ],
            flow: [
              "تحلیل هوش مصنوعی پس از تماس",
              "یادداشت‌ها + اقلام اقدام",
              "به‌روزرسانی امتیاز سرنخ",
              "به‌روزرسانی خودکار CRM",
              "تازه‌سازی نمای خط‌لوله",
            ],
          },
          {
            label: "ارتباط‌گیری خودکار",
            sub: "صدای برند",
            desc: "ارتباط‌گیری را از هزاران به صدها هزار تماس در ماه مقیاس می‌دهد — در حالی که هر پیام به‌روشنی شبیه خودِ شما باقی می‌ماند.",
            how: "DNA کسب‌وکار و Master Prompt شما، هوش مصنوعی را روی صدای برندتان آموزش می‌دهند. سپس ایمیل‌ها، پیامک‌ها یا اسکریپت‌های ویدئویی شخصی‌سازی‌شده برای هر مشتری را در حجم بالا پیش‌نویس می‌کند — ۲٬۰۰۰ تا ۱۰۰٬۰۰۰ در ماه بدون افت کیفیت.",
            impact: "هزینه گرانِ تبلیغات پولی را با جریانی پیش‌بینی‌پذیر و مبتنی بر هوش مصنوعی از معرفی‌های واجد شرایط جایگزین می‌کند. نرخ پاسخ حفظ می‌شود چون پیام‌ها به‌شدت شخصی‌اند — نه پخش انبوه.",
            metrics: [
              { value: "۱۰۰هزار", label: "ارتباط در ماه در اوج ظرفیت" },
              { value: "۰٪", label: "افت نرخ پاسخ با مقیاس" },
              { value: "۰ دلار", label: "وابستگی به تبلیغات پولیِ جایگزین‌شده" },
            ],
            flow: [
              "DNA کسب‌وکار / Master Prompt",
              "فهرست مشتریان بالقوه",
              "پیش‌نویس پیام با هوش مصنوعی",
              "ارسال چندکاناله",
              "پاسخ‌های واجد شرایط به CRM",
            ],
          },
        ],
      },
      "operations-core": {
        eyebrow: "کارایی و حاکمیت",
        title: "هسته عملیات",
        intro:
          "چهار ماژول عملیاتی که اجرا را در میان دپارتمان‌ها سامان‌مند می‌کنند — اجرای SOP، مدیریت کیفیت، تحلیل قرارداد و یکپارچه‌سازی گردش کار، با اعمال خودکار هوش مصنوعی.",
        modules: [
          {
            label: "اجرای SOP",
            sub: "پیروی از رویه‌های مستند",
            desc: "گذار از «دانستن اینکه چه باید کرد» به «خودکار اتفاق می‌افتد» را ممکن می‌کند. رویدادها کار را آغاز می‌کنند — نه مدیرانی که پرسش بعدی را می‌پرسند.",
            how: "یک گردش کار هوش مصنوعی رویدادهای زنده کسب‌وکار (امضای قرارداد، ارسال فرم، تغییر وضعیت) را پایش می‌کند. وقتی محرکی فعال شود، زیروظایف درست را به‌صورت خودکار در مدیر وظیفه پر می‌کند — بدون نیاز به تحویل انسانی.",
            impact: "مشکل «خلبان دومِ همیشگی» را حذف می‌کند. مدیر عملیات دیگر گام‌به‌گام سایه بنیان‌گذار نیست؛ بلکه موتوری از پیش‌ساخته را مدیریت می‌کند که خود اجرا می‌شود.",
            example: "وقتی مدرسه‌ای جدید در فرآیند «فروش تا تحویل» همکلاسی قرارداد امضا می‌کند، یک گردش کار Zapier امضا را تشخیص می‌دهد و زیروظایف لازم را به‌صورت خودکار در میزیتو — مدیر وظیفه تیم — پر می‌کند.",
            metrics: [
              { value: "۰", label: "تخصیص دستی وظیفه لازم" },
              { value: "آنی", label: "ساخت زیروظیفه پس از محرک" },
              { value: "۱۰۰٪", label: "گام‌های SOP پوشش‌داده‌شده" },
            ],
            flow: [
              "قرارداد امضا شد",
              "Zapier رویداد را تشخیص می‌دهد",
              "قالب SOP بارگذاری شد",
              "ساخت خودکار زیروظایف در میزیتو",
              "اطلاع به تیم",
            ],
          },
          {
            label: "مدیریت کیفیت",
            sub: "بر اساس الزامات مستند",
            desc: "هوش مصنوعی را به‌عنوان حسابرسی ۲۴ ساعته در هر تعامل با مشتری به‌کار می‌گیرد — تا استانداردها در مقیاس اعمال شوند، بی‌آنکه کسی تماس‌ها را دستی بازبینی کند.",
            how: "هوش مصنوعی رونوشت تماس‌های پشتیبانی را در برابر معیارهای مستند کیفیت تحلیل می‌کند: پایبندی به صدای برند، مسیریابی درست ارجاع، و دقت در حل مسئله. هر تعامل امتیاز می‌گیرد. تنها امتیازهای زیر آستانه، هشدار انسانی فعال می‌کنند.",
            impact: "رهبری مبتنی بر استثنا را ممکن می‌کند. بنیان‌گذار تنها وقتی اعلان می‌گیرد که چیزی زیر ۷ از ۱۰ بیفتد — هرچه بالاتر باشد بی‌صدا اجرا می‌شود. نظارت کیفیت را از ۱۰ تماس به ۱۰٬۰۰۰ بدون افزایش نیرو مقیاس می‌دهد.",
            example: "در همکلاسی (۷۰۰+ مدرسه)، هوش مصنوعی تماس‌های پشتیبانی را بر اساس استفاده از «صدای همکلاسی» و هدایت مشتری به راهنمای سطح ۳ پیش از ارجاع به انسان امتیاز می‌دهد. امید تنها تعامل‌هایی را می‌بیند که زیر ۷ امتیاز گرفته‌اند.",
            metrics: [
              { value: "۷۰۰+", label: "مدرسه به‌صورت خودکار حسابرسی‌شده" },
              { value: "۷/۱۰", label: "آستانه امتیاز برای هشدار انسانی" },
              { value: "۰", label: "بازبینی دستی تماس توسط بنیان‌گذار" },
            ],
            flow: [
              "تماس پشتیبانی پایان یافت",
              "رونوشت تولید شد",
              "امتیازدهی در برابر معیارها",
              "امتیاز ≥۷: عبور بی‌صدا",
              "امتیاز <۷: هشدار به بنیان‌گذار",
            ],
          },
          {
            label: "تحلیل قرارداد",
            sub: "در برابر استانداردهای مستند",
            desc: "هوش مصنوعی هر درخواست ورودی را با قواعد مستندِ تعامل شما مقایسه می‌کند — قضاوت بنیان‌گذار را بیرونی می‌کند تا تیم بدون انتظار برای تأیید بتواند بله یا خیر بگوید.",
            how: "وقتی مشتری درخواستی غیراستاندارد می‌فرستد یا قراردادی جدید می‌رسد، هوش مصنوعی آن را در برابر دامنه خدمات و قواعد قیمت‌گذاری مستند می‌سنجد. حکمی بازمی‌گرداند: بسته استاندارد، نیاز به استثنای سفارشی، یا علامت‌گذاری برای بازبینی.",
            impact: "خزش دامنه را از ریشه حل می‌کند. تیم می‌تواند فوراً به درخواست «می‌توانید X را هم انجام دهید؟» پاسخ دهد — با یک استاندارد مستند پشت خود، نه یک قضاوت شخصی. بنیان‌گذار تنها برای موارد مرزی واقعی درگیر می‌شود.",
            example: "وقتی مجتمع مدرسه‌ای در همکلاسی درخواست یکپارچه‌سازی غیراستاندارد LMS می‌دهد، هوش مصنوعی درخواست را در برابر بسته‌های خدمات مستند می‌سنجد و علامت می‌زند که آیا زیر بسته استاندارد است یا نیازمند استثنای قیمتیِ سفارشی.",
            metrics: [
              { value: "< ۵ دقیقه", label: "زمان صدور حکم دامنه" },
              { value: "۰", label: "خزش دامنه ناشناخته‌مانده" },
              { value: "۱۰۰٪", label: "تصمیم‌های متکی بر استاندارد" },
            ],
            flow: [
              "درخواست / قرارداد ورودی",
              "سنجش در برابر اسناد خدمات",
              "دامنه استاندارد؟",
              "بله: تأیید خودکار",
              "خیر: علامت‌گذاری + استثنای قیمتی",
            ],
          },
          {
            label: "یکپارچه‌سازی گردش کار",
            sub: "میان سیستم‌های مستند",
            desc: "ستون فقرات دیجیتالی را می‌سازد که ابزارهای پراکنده را به یک منبع واحد حقیقت متصل می‌کند — و ورود تکراری داده را در هر سکو حذف می‌کند.",
            how: "داده‌ای که در یک سیستم وارد می‌شود (مثلاً CRM هنگام کشف) به‌صورت خودکار به سیستم‌های پایین‌دستی (مدیر وظیفه برای ورود، داشبورد موفقیت برای گزارش) منتقل می‌شود. هوش مصنوعی بهداشت فیلد و قواعد نام‌گذاری را در همه یکپارچه‌سازی‌ها اعمال می‌کند.",
            impact: "هیچ کارمندی نام مدرسه، تعداد دانش‌آموز یا جزئیات تماس را دو بار وارد نمی‌کند. مشکل «آشفتگی CRM» را که هر کاربر فیلدهای خود را تعریف می‌کرد حل می‌کند — هوش مصنوعی یک استاندارد داده واحد را در همه سکوهای متصل اعمال می‌کند.",
            example: "در همکلاسی، داده‌ای که هنگام تماس کشف در Vtiger وارد می‌شود، به‌صورت خودکار به میزیتو برای ورود و سپس به داشبورد موفقیت مشتری منتقل می‌شود. همان نام مدرسه و تعداد دانش‌آموز دست‌نخورده در همه سیستم‌ها جریان می‌یابد.",
            metrics: [
              { value: "۰", label: "ورودی تکراری داده در هر رکورد" },
              { value: "۳+", label: "سیستم متصل در یک ستون فقرات" },
              { value: "روزانه", label: "آهنگ گزارش‌دهی (پیش‌تر هفتگی)" },
            ],
            flow: [
              "ورود داده در Vtiger CRM",
              "انتقال خودکار به میزیتو",
              "ساخت وظایف ورود",
              "به‌روزرسانی داشبورد موفقیت",
              "منبع واحد حقیقت",
            ],
          },
        ],
      },
      "people-os": {
        eyebrow: "استعداد و فرهنگ",
        title: "سیستم‌عامل افراد",
        intro:
          "چهار ماژول منابع انسانی که چارچوب‌های مستندِ نقش را به منابع انسانیِ تقویت‌شده با هوش مصنوعی تبدیل می‌کنند — استخدام، ورود، ارزیابی عملکرد و مسیرهای یادگیری شخصی‌سازی‌شده.",
        modules: [
          {
            label: "استخدام",
            sub: "همسو با الزامات مستند نقش",
            desc: "هوش مصنوعی هر متقاضی را در برابر کارت‌امتیاز مستندِ نقش غربال می‌کند، پیش از آنکه انسانی حتی یک دقیقه صرف بررسی رزومه کند — تا تنها نامزدهای واجد شرایط به مرحله مصاحبه برسند.",
            how: "الزامات شغل در قالب یک کارت‌امتیاز ساختاریافته (مهارت، تجربه، سیگنال‌های فرهنگی) مستند می‌شود. هوش مصنوعی درخواست‌ها را غربال، هر نامزد را در برابر معیارها امتیاز و آن‌ها را رتبه‌بندی می‌کند. مدیران استخدام تنها رده برتر را می‌بینند — هر رد زیر آستانه به‌صورت خودکار انجام می‌شود.",
            impact: "بنیان‌گذار یا مدیر را به‌کلی از غربال مرحله اول حذف می‌کند. زمان تا فهرست کوتاه را از روزها به دقیقه‌ها می‌رساند. تضمین می‌کند هر تصمیم استخدام به یک استاندارد مستند گره خورده باشد، نه به حس درونی یا کسی که اول درخواست داده.",
            example: "یک آژانس مدلینگ برای جذب هماهنگ‌کننده محتوا ۸۰ درخواست دریافت می‌کند. هوش مصنوعی هرکدام را در برابر معیارهای مستند (تسلط انگلیسی، ابزارهای محتوا، در دسترس بودن) امتیاز می‌دهد و ۸ نفر برتر را با تفکیک کارت‌امتیاز نمایان می‌کند — بنیان‌گذار ۲۰ دقیقه بازبینی می‌کند، نه ۸ ساعت.",
            metrics: [
              { value: "< ۱۰ دقیقه", label: "زمان تا فهرست کوتاه" },
              { value: "۱۰٪ برتر", label: "تنها نامزدهای امتیازگرفته بازبینی‌شده" },
              { value: "۱۰۰٪", label: "تصمیم در برابر معیارهای مستند" },
            ],
            flow: [
              "دریافت درخواست",
              "امتیازدهی در برابر کارت‌امتیاز نقش",
              "زیر آستانه: رد خودکار",
              "بالای آستانه: فهرست کوتاهِ رتبه‌بندی‌شده",
              "بازبینی رده برتر توسط مدیر استخدام",
            ],
          },
          {
            label: "ورود",
            sub: "پیروی از گردش‌های کاری مستند",
            desc: "ورود را از یک تمرینِ دست‌به‌دست و وابسته به بنیان‌گذار به گردش کاری خوداجرا تبدیل می‌کند — نیروهای جدید هر بار شتاب‌گیریِ منسجم، کامل و قابل‌ردیابی می‌گیرند.",
            how: "وقتی عضو جدید تیم تأیید می‌شود، یک گردش کار هوش مصنوعی کل توالی ورود او را آغاز می‌کند: تأمین حساب، تخصیص وظایف، زمان‌بندی ماژول آموزش و یادآور نقاط بازبینی. پیشرفت به‌صورت خودکار در برابر یک جدول‌زمانی مستند ردیابی می‌شود.",
            impact: "وابستگی به دانش ضمنی را حذف می‌کند — تجربه ورود دیگر در ذهن یک نفر زندگی نمی‌کند. نیروی جدید در روز اول همان تجربه باکیفیتِ نیروی دهم را می‌گیرد. مدیران تنها وقتی مطلع می‌شوند که گامی به تأخیر افتاده یا مسدود شده باشد.",
            example: "وقتی Evea مدلی جدید را وارد می‌کند، گردشی فعال می‌شود: SOP گرم‌کردن اینستاگرام تخصیص می‌یابد، سند پرسونا به اشتراک گذاشته می‌شود، آموزش ManyChat زمان‌بندی می‌شود و یادآور بازبینی ۷ روزه تنظیم می‌شود — همه بدون آنکه Hiwa حتی یک پیام دستی بفرستد.",
            metrics: [
              { value: "روز ۱", label: "آغاز کامل توالی وظایف" },
              { value: "۰", label: "گام ورودِ ازدست‌رفته در هر استخدام" },
              { value: "۷ روز", label: "زمان تا اولین خروجی مستقل" },
            ],
            flow: [
              "استخدام تأیید شد",
              "آغاز توالی ورود توسط هوش مصنوعی",
              "تأمین حساب‌ها",
              "تخصیص وظایف + آموزش",
              "ردیابی پیشرفت در برابر جدول‌زمانی",
            ],
          },
          {
            label: "ارزیابی عملکرد",
            sub: "با استفاده از چارچوب‌های مستند",
            desc: "ارزیابی‌های حافظه‌محور و سوگیری‌شده به‌سمت رویدادهای اخیر را با ارزیابی‌های داده‌محور — برگرفته مستقیم از KPIهای مستند و کار مشاهده‌شده — جایگزین می‌کند و به هر عضو تیم ارزیابی‌ای منصفانه و منسجم می‌دهد.",
            how: "هوش مصنوعی داده‌های عملکرد را از ابزارهای متصل (نرخ تکمیل وظیفه، زمان پاسخ، تعداد خروجی، امتیاز کیفیت) گرد می‌آورد و در برابر چارچوب KPI مستندِ هر نقش نگاشت می‌کند. ارزیابی را پیش‌نویس، شکاف‌ها را علامت‌گذاری و نکات گفت‌وگو را نمایان می‌کند — مدیر زمینه را می‌افزاید و ارائه می‌دهد.",
            impact: "مدیران دیگر از فصل ارزیابی نمی‌هراسند. ارزیابی‌ها به‌جای ۲ ساعت، ۲۰ دقیقه طول می‌کشد. هر عضو تیم در برابر همان استاندارد مستند ارزیابی می‌شود — نه کسی که در دو هفته اخیر بیشترین تأثیر را گذاشته.",
            example: "برای «مدیر ارتباط با مخاطب» در Evea، هوش مصنوعی زمان پاسخ به دایرکت، نرخ تبدیل از رایگان به پولی و نرخ حفظ هوادار را می‌کشد — سپس ارزیابی‌ای در برابر KPIهای مستند پیش‌نویس می‌کند و علامت می‌زند که زمان پاسخ بهبود یافته اما تبدیل فروشِ مکمل این ماه ۱۲٪ افت کرده.",
            metrics: [
              { value: "۲۰ دقیقه", label: "زمان پیش‌نویس ارزیابی (پیش‌تر ۲ ساعت)" },
              { value: "۱۰۰٪", label: "KPI کشیده‌شده از داده زنده" },
              { value: "۰", label: "سوگیری به رویداد اخیر در امتیازدهی" },
            ],
            flow: [
              "آغاز چرخه ارزیابی",
              "کشیدن داده از ابزارهای متصل",
              "نگاشت به چارچوب KPI نقش",
              "تولید پیش‌نویس ارزیابی",
              "افزودن زمینه + ارائه توسط مدیر",
            ],
          },
          {
            label: "مسیرهای آموزش و توسعه",
            sub: "پشتیبانی از مهارت‌های مستند",
            desc: "یادگیری را از یک کتابخانه آموزشیِ عمومی و یک‌اندازه‌برای‌همه به نقشه شکافِ مهارتِ شخصی‌سازی‌شده تبدیل می‌کند — هر عضو تیم مسیری می‌گیرد ساخته‌شده حول آنچه نقشش می‌طلبد و آنچه اکنون کم دارد.",
            how: "هوش مصنوعی نمایه مهارت کنونی هر فرد (از ارزیابی‌ها، خروجی‌ها و خودسنجی‌ها) را با الزامات مهارتی مستندِ نقش او مقایسه می‌کند. مسیر یادگیریِ اولویت‌بندی‌شده تولید می‌کند: کدام مهارت‌ها اول، با چه ترتیبی و از طریق چه منابعی توسعه یابند.",
            impact: "بودجه آموزش دیگر صرف دوره‌هایی که کسی نیاز ندارد نمی‌شود. هر ساعت توسعه به‌سوی شکاف مشخص میان جایگاه فرد و آنچه نقشش می‌طلبد هدایت می‌شود. پیشرفت مهارت سنجش‌پذیر می‌شود، نه فرض‌شده.",
            example: "یک مدلِ محتوای Evea در «اسکریپت‌نویسی ویدئوی هوش مصنوعی» در برابر چارچوب مهارتِ مستندِ سازنده محتوا امتیاز پایینی می‌گیرد. هوش مصنوعی مسیری ۳ هفته‌ای تولید می‌کند: دو آموزش ComfyUI، یک ماژول مهندسی پرامپت و یک جلسه بازبینی همتا با عکاس — با نقاط عطفِ خروجیِ هفتگی.",
            metrics: [
              { value: "۱۰۰٪", label: "آموزش گره‌خورده به شکاف‌های مستند" },
              { value: "۳ هفته", label: "میانگین مسیر بستن یک شکاف" },
              { value: "۰", label: "آموزش عمومیِ پیش‌فرض تخصیص‌یافته" },
            ],
            flow: [
              "سنجش نمایه مهارت",
              "نگاشت در برابر الزامات نقش",
              "شناسایی شکاف",
              "تولید مسیر شخصی‌سازی‌شده",
              "ردیابی نقاط عطف هفتگی",
            ],
          },
        ],
      },
    },
  },

  ar: {
    labels: {
      moduleWord: "وحدة",
      howItWorks: "كيف تعمل",
      impact: "الأثر التشغيلي",
      example: "مثال واقعي",
      workflow: "سير العمل",
      humanInLoop: "إنسان ضمن الحلقة",
      moduleActive: "الوحدة نشطة",
      prev: "السابق",
      next: "التالي",
    },
    pages: {
      "growth-engine": {
        eyebrow: "الإيرادات وتوسّع السوق",
        title: "محرك النمو",
        intro:
          "أربع وحدات للإيرادات تحوّل عمليات البيع الموثّقة إلى أنظمة معزّزة بالذكاء الاصطناعي — تقييم العملاء المحتملين، وتوليد العروض، وإثراء CRM، والتواصل على نطاق واسع.",
        modules: [
          {
            label: "تقييم العملاء المحتملين",
            sub: "معايير التأهيل",
            desc: "يقيّم الذكاء الاصطناعي كل عميل محتمل تلقائيًا مقابل ملف العميل المثالي وقواعد التأهيل الموثّقة — قبل أن يتحدث معه مندوب المبيعات أصلًا.",
            how: "تحلّل وكلاء الذكاء الاصطناعي بيانات نماذج الويب أو محاضر المكالمات أو المصادر المستخرجة لتقييم كل عميل محتمل من حيث الميزانية والإلحاح والصلاحية والحاجة. يُعالَج محضر زووم مدته 30 دقيقة ويُعاد كحالة تأهيل ثنائية نعم/لا.",
            impact: "يلغي الوقت المهدور على العملاء غير المؤهلين وحالات عدم الحضور. يركّز المندوبون حصريًا على المحادثات عالية القيمة — كل مكالمة تستحق الحضور.",
            metrics: [
              { value: "0", label: "مكالمات غير مؤهلة عابرة" },
              { value: "100%", label: "وقت المندوب على عملاء ذوي قيمة" },
              { value: "< دقيقتان", label: "من المحضر إلى الدرجة" },
            ],
            flow: [
              "نموذج ويب / محضر مكالمة",
              "تحليل الذكاء الاصطناعي",
              "تقييم مقابل العميل المثالي",
              "حالة نعم / لا",
              "تحديث سجل CRM",
            ],
          },
          {
            label: "توليد العروض",
            sub: "باقات الخدمات",
            desc: "يحوّل إنشاء العرض من مهمة يدوية تستغرق ساعات إلى عملية أقل من 20 دقيقة — دون فقدان التخصيص أو الجودة.",
            how: "يُعطى الذكاء الاصطناعي باقات خدماتك الموثّقة بالإضافة إلى السياق المحدد من محضر مكالمة الاستكشاف. ثم يصوغ عرضًا مخصصًا للغاية موجّهًا لنقاط ألم العميل وإشارات ميزانيته بدقة.",
            impact: "يلغي عنق الزجاجة في العروض — الفجوة بين «مكالمة رائعة» و«عقد موقّع» التي تقتل الصفقات. ضغطت حالة موثّقة عملية من 8–10 ساعات إلى أقل من 20 دقيقة.",
            metrics: [
              { value: "20 دقيقة", label: "زمن المسودة (كان 8–10 ساعات)" },
              { value: "80%", label: "محتوى مولّد بالذكاء الاصطناعي" },
              { value: "20%", label: "تنقيح بشري (التسعير والنطاق)" },
            ],
            flow: [
              "محضر الاستكشاف",
              "مستندات الخدمات",
              "الذكاء الاصطناعي يصوغ العرض",
              "مراجعة بشرية (20%)",
              "يُرسل إلى العميل",
            ],
            hitl: "الـ20% الأخيرة — التسعير عالي المخاطر، وحالات النطاق الحدّية، ودقّة العلاقة — يُكملها إنسان دائمًا قبل أن يغادر العرض.",
          },
          {
            label: "إثراء CRM",
            sub: "عملية البيع",
            desc: "يؤتمت العبء الإداري لإبقاء بيانات المبيعات دقيقة ومحدّثة — مستعيدًا نحو 20% من يوم عمل كل مندوب.",
            how: "يستخرج الذكاء الاصطناعي قوائم العملاء ويثريها ببيانات الاتصال الناقصة (بريد، هواتف، روابط لينكدإن) من مصادر الويب. بعد كل مكالمة، يحدّث سجلات CRM تلقائيًا بالملاحظات وبنود الإجراء والدرجات المحدّثة — دون إدخال يدوي.",
            impact: "ينقل وتيرة التقارير من أسبوعية إلى يومية، ما يشحذ سرعة القرار. لا مزيد من خطوط أنابيب قديمة أو سياق متابعة مفقود. كل سجل يعكس آخر تفاعل بدقة.",
            metrics: [
              { value: "20%", label: "يوم المندوب مُستعاد" },
              { value: "يوميًا", label: "وتيرة التقارير (كانت أسبوعية)" },
              { value: "0", label: "إدخالات CRM يدوية مطلوبة" },
            ],
            flow: [
              "تحليل بالذكاء الاصطناعي بعد المكالمة",
              "ملاحظات + بنود إجراء",
              "تحديث درجة العميل",
              "تحديث CRM تلقائيًا",
              "تحديث عرض خط الأنابيب",
            ],
          },
          {
            label: "التواصل المؤتمت",
            sub: "صوت العلامة",
            desc: "يوسّع التواصل من آلاف إلى مئات آلاف اللمسات شهريًا — مع إبقاء كل رسالة تبدو وكأنها أنت بلا لبس.",
            how: "يدرّب «الحمض النووي لعملك» و«الموجّه الرئيسي» الذكاء الاصطناعي على صوت علامتك. ثم يصوغ رسائل بريد ونصوصًا أو سكربتات فيديو مخصصة لكل عميل بكمّيات كبيرة — من 2,000 إلى 100,000 شهريًا دون تراجع في الجودة.",
            impact: "يستبدل إنفاق الإعلانات المدفوعة المكلف بتدفق متوقّع ومدفوع بالذكاء الاصطناعي من التعريفات المؤهلة. تبقى معدلات الرد ثابتة لأن الرسائل مخصصة للغاية — لا بثّ جماعي.",
            metrics: [
              { value: "100 ألف", label: "تواصل شهريًا عند الطاقة القصوى" },
              { value: "0%", label: "انخفاض في معدل الرد مع التوسّع" },
              { value: "0 دولار", label: "اعتماد على الإعلانات المدفوعة مُستبدَل" },
            ],
            flow: [
              "الحمض النووي للعمل / الموجّه الرئيسي",
              "قائمة العملاء المحتملين",
              "الذكاء الاصطناعي يصوغ الرسائل",
              "إرسال متعدد القنوات",
              "ردود مؤهلة إلى CRM",
            ],
          },
        ],
      },
      "operations-core": {
        eyebrow: "الكفاءة والحوكمة",
        title: "نواة العمليات",
        intro:
          "أربع وحدات تشغيلية تنظّم التنفيذ عبر الأقسام — تنفيذ إجراءات التشغيل، وإدارة الجودة، وتحليل العقود، وتكامل سير العمل، مع فرض رقابة الذكاء الاصطناعي.",
        modules: [
          {
            label: "تنفيذ إجراءات التشغيل",
            sub: "اتباع الإجراءات الموثّقة",
            desc: "يؤتمت الانتقال من «معرفة ما يجب فعله» إلى «يحدث تلقائيًا». الأحداث تُطلق العمل — لا المديرون الذين يسألون السؤال التالي.",
            how: "يراقب سير عمل بالذكاء الاصطناعي أحداث العمل الحية (توقيع العقود، إرسال النماذج، تغيّر الحالة). عند إطلاق محفّز، يملأ المهام الفرعية الصحيحة تلقائيًا في مدير المهام — دون تسليم بشري.",
            impact: "يلغي مشكلة «المساعد الدائم». لم يعد مدير العمليات يلازم المؤسس خطوة بخطوة؛ بل يدير محرك تنفيذ جاهزًا يشغّل نفسه.",
            example: "عندما توقّع مدرسة جديدة عقدًا في عملية «البيع إلى التسليم» في همكلاسي، يكتشف سير عمل Zapier التوقيع ويملأ المهام الفرعية المطلوبة تلقائيًا في ميزيتو — مدير مهام الفريق.",
            metrics: [
              { value: "0", label: "تعيينات مهام يدوية مطلوبة" },
              { value: "فوري", label: "إنشاء مهمة فرعية بعد المحفّز" },
              { value: "100%", label: "خطوات الإجراء المغطّاة" },
            ],
            flow: [
              "تم توقيع العقد",
              "Zapier يكتشف الحدث",
              "تحميل قالب الإجراء",
              "إنشاء المهام تلقائيًا في ميزيتو",
              "إخطار الفريق",
            ],
          },
          {
            label: "إدارة الجودة",
            sub: "بناءً على المتطلبات الموثّقة",
            desc: "ينشر الذكاء الاصطناعي كمدقّق على مدار الساعة عبر كل تفاعل مع العميل — لتُفرض المعايير على نطاق واسع دون أن يراجع أحد المكالمات يدويًا.",
            how: "يحلّل الذكاء الاصطناعي محاضر مكالمات الدعم مقابل معايير الجودة الموثّقة: التزام صوت العلامة، والتصعيد الصحيح، ودقة الحل. يحصل كل تفاعل على درجة. الدرجات دون الحد فقط تُطلق تنبيهًا بشريًا.",
            impact: "يتيح القيادة بالاستثناء. لا يتلقى المؤسس إشعارًا إلا حين يهبط شيء دون 7/10 — وكل ما فوق ذلك يجري بصمت. يوسّع رقابة الجودة من 10 مكالمات إلى 10,000 دون زيادة العمالة.",
            example: "في همكلاسي (700+ مدرسة)، يقيّم الذكاء الاصطناعي مكالمات الدعم بناءً على استخدام «صوت همكلاسي» وتوجيه العميل إلى دليل المستوى الثالث قبل التصعيد إلى إنسان. لا يرى أوميد إلا التفاعلات التي تحصل على أقل من 7.",
            metrics: [
              { value: "700+", label: "مدارس مدقّقة تلقائيًا" },
              { value: "7/10", label: "حد الدرجة للتنبيه البشري" },
              { value: "0", label: "مراجعات مكالمات يدوية من المؤسس" },
            ],
            flow: [
              "انتهت مكالمة الدعم",
              "تم توليد المحضر",
              "تقييم مقابل المعايير",
              "الدرجة ≥7: مرور صامت",
              "الدرجة <7: تنبيه للمؤسس",
            ],
          },
          {
            label: "تحليل العقود",
            sub: "مقابل المعايير الموثّقة",
            desc: "يقارن الذكاء الاصطناعي كل طلب وارد بقواعد التعامل الموثّقة لديك — مُخرِجًا حكم المؤسس ليتمكن الفريق من قول نعم أو لا دون انتظار الموافقة.",
            how: "حين يرسل عميل طلبًا غير قياسي أو يصل عقد جديد، يفحصه الذكاء الاصطناعي مقابل نطاق خدماتك وقواعد التسعير الموثّقة. يعيد حكمًا: باقة قياسية، أو حاجة لاستثناء مخصص، أو وضع علامة للمراجعة.",
            impact: "يحل زحف النطاق من المنبع. يستطيع الفريق الرد فورًا على طلب «هل يمكنكم فعل X أيضًا؟» — بمعيار موثّق خلفه، لا بحكم شخصي. لا يُستدعى المؤسس إلا للحالات الحدّية الحقيقية.",
            example: "حين يطلب مجمّع مدارس في همكلاسي تكامل LMS غير قياسي، يفحص الذكاء الاصطناعي الطلب مقابل باقات الخدمات الموثّقة ويحدد ما إذا كان ضمن الباقة القياسية أم يتطلب استثناء تسعير مخصص.",
            metrics: [
              { value: "< 5 دقائق", label: "زمن إصدار حكم النطاق" },
              { value: "0", label: "زحف نطاق يمر دون كشف" },
              { value: "100%", label: "قرارات مدعومة بمعيار" },
            ],
            flow: [
              "طلب / عقد وارد",
              "فحص مقابل مستندات الخدمة",
              "نطاق قياسي؟",
              "نعم: موافقة تلقائية",
              "لا: علامة + استثناء تسعير",
            ],
          },
          {
            label: "تكامل سير العمل",
            sub: "بين الأنظمة الموثّقة",
            desc: "يبني العمود الفقري الرقمي الذي يربط الأدوات المجزأة في مصدر حقيقة واحد — مُلغيًا الإدخال المكرر للبيانات عبر كل منصة.",
            how: "البيانات المُدخلة في نظام واحد (مثل CRM أثناء الاستكشاف) تُدفع تلقائيًا إلى الأنظمة اللاحقة (مدير المهام للإعداد، لوحة النجاح للتقارير). يفرض الذكاء الاصطناعي نظافة الحقول وقواعد التسمية عبر كل التكاملات.",
            impact: "لا يُدخل أي موظف اسم المدرسة أو عدد الطلاب أو تفاصيل الاتصال مرتين. يحل مشكلة «فوضى CRM» حيث يعرّف كل مستخدم حقوله الخاصة — يفرض الذكاء الاصطناعي معيار بيانات واحدًا عبر كل المنصات المتصلة.",
            example: "في همكلاسي، البيانات المُدخلة في Vtiger أثناء مكالمة استكشاف تُدفع تلقائيًا إلى ميزيتو للإعداد ثم إلى لوحة نجاح العميل. يتدفق اسم المدرسة وعدد الطلاب ذاته عبر كل نظام دون تغيير.",
            metrics: [
              { value: "0", label: "إدخالات بيانات مكررة لكل سجل" },
              { value: "3+", label: "أنظمة متصلة في عمود فقري واحد" },
              { value: "يوميًا", label: "وتيرة التقارير (كانت أسبوعية)" },
            ],
            flow: [
              "إدخال بيانات في Vtiger CRM",
              "دفع تلقائي إلى ميزيتو",
              "إنشاء مهام الإعداد",
              "تحديث لوحة النجاح",
              "مصدر حقيقة واحد",
            ],
          },
        ],
      },
      "people-os": {
        eyebrow: "المواهب والثقافة",
        title: "نظام الأفراد",
        intro:
          "أربع وحدات للموارد البشرية تحوّل أطر الأدوار الموثّقة إلى موارد بشرية معزّزة بالذكاء الاصطناعي — التوظيف، والإعداد، وتقييمات الأداء، ومسارات تعلّم مخصصة.",
        modules: [
          {
            label: "التوظيف",
            sub: "متوائم مع متطلبات الدور الموثّقة",
            desc: "يفحص الذكاء الاصطناعي كل متقدّم مقابل بطاقة تقييم الدور الموثّقة قبل أن يقضي إنسان دقيقة واحدة في مراجعة سيرة ذاتية — ليصل المؤهلون فقط إلى مرحلة المقابلة.",
            how: "تُوثّق متطلبات الوظيفة في بطاقة تقييم منظمة (مهارات، خبرة، إشارات ثقافية). يفحص الذكاء الاصطناعي الطلبات، ويقيّم كل مرشح مقابل المعايير، ويرتّبهم. لا يرى مديرو التوظيف إلا الفئة العليا — كل رفض دون الحد يُعالَج تلقائيًا.",
            impact: "يزيل المؤسس أو المدير من الفرز الأول تمامًا. يقلّص الوقت حتى القائمة المختصرة من أيام إلى دقائق. يضمن أن كل قرار توظيف مرتبط بمعيار موثّق لا بالحدس أو بمن تقدّم أولًا.",
            example: "وكالة عارضين تنشر عن منسّق محتوى تتلقى 80 طلبًا. يقيّم الذكاء الاصطناعي كلًا منها مقابل معايير موثّقة (إتقان الإنجليزية، أدوات المحتوى، التوافر) ويُظهر الأفضل الثمانية مع تفصيل البطاقة — يراجع المؤسس 20 دقيقة لا 8 ساعات.",
            metrics: [
              { value: "< 10 دقائق", label: "الوقت حتى القائمة المختصرة" },
              { value: "أعلى 10%", label: "مراجعة المرشحين المقيّمين فقط" },
              { value: "100%", label: "قرارات مقابل معايير موثّقة" },
            ],
            flow: [
              "استلام الطلب",
              "تقييم مقابل بطاقة الدور",
              "دون الحد: رفض تلقائي",
              "فوق الحد: قائمة مختصرة مرتّبة",
              "مدير التوظيف يراجع الفئة العليا",
            ],
          },
          {
            label: "الإعداد",
            sub: "اتباع سير العمل الموثّق",
            desc: "يحوّل الإعداد من تمرين يعتمد على المؤسس إلى سير عمل ذاتي التنفيذ — يحصل المعيّنون الجدد على انطلاقة متسقة وكاملة وقابلة للتتبّع في كل مرة.",
            how: "عند تأكيد عضو فريق جديد، يُطلق سير عمل بالذكاء الاصطناعي تسلسل إعداده الكامل: تجهيز الحسابات، وتعيين المهام، وجدولة وحدات التدريب، وتذكيرات نقاط المراجعة. يُتتبّع التقدّم مقابل جدول زمني موثّق تلقائيًا.",
            impact: "يلغي الاعتماد على المعرفة الضمنية — لم تعد تجربة الإعداد في رأس شخص واحد. يحصل المعيّن في اليوم الأول على التجربة ذاتها التي يحصل عليها العاشر. لا يُنبَّه المديرون إلا حين تتأخر خطوة أو تُعطَّل.",
            example: "عندما تُعِدّ Evea عارضًا جديدًا، يُطلق سير عمل: تعيين إجراء إحماء إنستغرام، ومشاركة مستند الشخصية، وجدولة تدريب ManyChat، وضبط تذكير مراجعة بعد 7 أيام — كل ذلك دون أن يرسل Hiwa رسالة واحدة يدويًا.",
            metrics: [
              { value: "اليوم 1", label: "إطلاق تسلسل المهام الكامل" },
              { value: "0", label: "خطوات إعداد فائتة لكل تعيين" },
              { value: "7 أيام", label: "الزمن حتى أول مخرج مستقل" },
            ],
            flow: [
              "تأكيد التعيين",
              "الذكاء الاصطناعي يُطلق تسلسل الإعداد",
              "تجهيز الحسابات",
              "تعيين المهام + التدريب",
              "تتبّع التقدّم مقابل الجدول",
            ],
          },
          {
            label: "تقييمات الأداء",
            sub: "باستخدام أطر موثّقة",
            desc: "يستبدل التقييمات المعتمدة على الذاكرة والمنحازة للأحدث بتقييمات مدفوعة بالبيانات مسحوبة مباشرة من مؤشرات الأداء الموثّقة والعمل المُلاحظ — مانحًا كل عضو تقييمًا عادلًا ومتسقًا.",
            how: "يجمّع الذكاء الاصطناعي بيانات الأداء من الأدوات المتصلة (معدلات إنجاز المهام، أزمنة الرد، أعداد المخرجات، درجات الجودة) ويربطها بإطار مؤشرات الأداء الموثّق لكل دور. يصوغ التقييم، ويعلّم الفجوات، ويُظهر نقاط النقاش — يضيف المدير السياق ويقدّمه.",
            impact: "يتوقف المديرون عن رهبة موسم التقييم. يستغرق التقييم 20 دقيقة بدل ساعتين. يُقيَّم كل عضو مقابل المعيار الموثّق ذاته — لا مقابل من ترك أكبر انطباع في الأسبوعين الأخيرين.",
            example: "لـ«مدير علاقة الجمهور» في Evea، يسحب الذكاء الاصطناعي زمن الرد على الرسائل، ومعدل التحويل من مجاني إلى مدفوع، ومعدل الاحتفاظ بالمعجبين — ثم يصوغ تقييمًا مقابل المؤشرات الموثّقة، مشيرًا إلى تحسّن زمن الرد وهبوط تحويل البيع الإضافي 12% هذا الشهر.",
            metrics: [
              { value: "20 دقيقة", label: "زمن مسودة التقييم (كان ساعتين)" },
              { value: "100%", label: "مؤشرات مسحوبة من بيانات حية" },
              { value: "0", label: "انحياز للأحدث في التقييم" },
            ],
            flow: [
              "فتح دورة التقييم",
              "سحب البيانات من الأدوات المتصلة",
              "الربط بإطار مؤشرات الدور",
              "توليد مسودة التقييم",
              "المدير يضيف السياق ويقدّم",
            ],
          },
          {
            label: "مسارات التعلّم والتطوير",
            sub: "دعم المهارات الموثّقة",
            desc: "يحوّل التعلّم من مكتبة تدريب عامة بمقاس واحد للجميع إلى خريطة فجوة مهارات مخصصة — يحصل كل عضو على مسار مبني حول ما يتطلبه دوره وما ينقصه حاليًا.",
            how: "يقارن الذكاء الاصطناعي ملف المهارات الحالي لكل شخص (من التقييمات والمخرجات والتقييم الذاتي) بمتطلبات المهارة الموثّقة لدوره. يولّد مسار تعلّم مرتّبًا حسب الأولوية: أي المهارات تُطوَّر أولًا، وبأي تسلسل، وعبر أي موارد.",
            impact: "تتوقف ميزانية التدريب عن الهدر على دورات لا يحتاجها أحد. تُوجَّه كل ساعة تطوير نحو الفجوة المحددة بين موضع الشخص وما يتطلبه دوره. يصبح تقدّم المهارة قابلًا للقياس لا مفترضًا.",
            example: "عارض محتوى في Evea يحصل على درجة منخفضة في «كتابة سكربت فيديو الذكاء الاصطناعي» مقابل إطار مهارة صانع المحتوى الموثّق. يولّد الذكاء الاصطناعي مسارًا من 3 أسابيع: درسان في ComfyUI، ووحدة هندسة موجّهات، وجلسة مراجعة أقران مع المصوّر — مع معالم مخرجات أسبوعية.",
            metrics: [
              { value: "100%", label: "تدريب مرتبط بفجوات موثّقة" },
              { value: "3 أسابيع", label: "متوسط مسار سد فجوة" },
              { value: "0", label: "تدريب عام يُعيَّن افتراضيًا" },
            ],
            flow: [
              "تقييم ملف المهارات",
              "الربط مقابل متطلبات الدور",
              "تحديد الفجوة",
              "توليد مسار مخصص",
              "تتبّع المعالم الأسبوعية",
            ],
          },
        ],
      },
    },
  },
};

// ─── Builder ────────────────────────────────────────────────────────────────
// Merge locale-independent metadata with the per-locale prose into the shape
// the ModulePanel consumes. Returns null for an unknown slug so route handlers
// can call notFound().
export function getModulePage(
  locale: Locale,
  slug: ModuleSlug,
): ModulePage {
  const meta = PAGE_META[slug];
  const text = TEXT[locale].pages[slug];
  return {
    slug,
    accent: meta.accent,
    headerIcon: meta.headerIcon,
    num: meta.num,
    eyebrow: text.eyebrow,
    title: text.title,
    intro: text.intro,
    labels: TEXT[locale].labels,
    modules: text.modules.map((m, i) => ({
      tag: meta.modules[i].tag,
      icon: meta.modules[i].icon,
      ...m,
    })),
  };
}

// Localized link list for the three module pages, for nav/footer menus.
export function moduleLinks(
  locale: Locale,
  basePath: "" | "/fa" | "/ar",
): { label: string; href: string }[] {
  return moduleSlugs.map((slug) => ({
    label: TEXT[locale].pages[slug].title,
    href: `${basePath}/modules/${slug}`,
  }));
}
