// AITransforms — portfolio / "/work" content (Phase 4 redesign).
//
// Dedicated case-study section. Each project is a self-contained, forward-able
// case an ops/transformation lead can send upward without exposing a client.
// Same content-split as modules.ts: locale-independent metadata (accent, icon,
// category, route slug) lives in PROJECT_META; translated prose lives per-locale
// in TEXT; getWorkProject() merges them.
//
// Confidentiality: no client names, no logos. Metrics are real and defensible
// (P5: every number is one Hiwa will defend verbatim in a call). The Hamkelasi
// automation figure is shown as an explicit Target KPI (Phase 2 active), not a
// realized result.
//
// i18n: fa/ar are V1 translations, flagged for native review (same standard as
// the rest of the site). Numerals are locale-native: Persian Eastern (۰-۹),
// Arabic Arabic-Indic (٠-٩). Proper nouns kept across locales: AITransforms,
// vTiger, Mizito, Claude, PGLite, pgvector, EMPOWER.

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

// A metric is either a single value, or a before→after delta. For a delta both
// `before` and `after` are set and rendered as two LTR-isolated spans with an
// arrow element between them (the arrow mirrors via rtl:-scale-x-100), which
// keeps native numerals bidi-safe. Single metrics set `value`.
export type WorkMetric = {
  value?: string;
  before?: string;
  after?: string;
  label: string;
};

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
  metricNote: string;
  whatChanged: string;
  constraints: string[];
  founderRole: string;
  method: string[]; // Map → Structure → Implement → Adapt
  whyAnonymized: string;
  diagram: { inputs: string; processing: string; outputs: string };
};

export type WorkLabels = {
  eyebrow: string;
  pageTitle: string;
  intro: string;
  categoryLabels: Record<WorkCategory, string>;
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

// ─── English (polished default) ─────────────────────────────────────────────
const WHY_ANON_EN =
  "Client identity is withheld under engagement confidentiality. The metrics are real and verifiable in a private reference call.";

const EN: LocaleText = {
  labels: {
    eyebrow: "Selected work",
    pageTitle: "Work",
    intro:
      "Anonymized engagements with real, defensible outcomes. Names and identifying details are omitted to respect client confidentiality; the numbers are ones we stand behind.",
    categoryLabels: { revenue: "Revenue", knowledge: "Knowledge", operations: "Operations" },
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
      metric: { before: "18%", after: "31%", label: "close rate, within one quarter" },
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

// ─── Persian (fa) — V1, FLAGGED FOR NATIVE REVIEW ───────────────────────────
// Numerals are Persian Eastern (۰-۹). Proper nouns kept Latin.
const WHY_ANON_FA =
  "هویت مشتری بنا بر محرمانگی پروژه فاش نمی‌شود. اعداد واقعی هستند و در یک تماس مرجع خصوصی قابل‌راستی‌آزمایی‌اند.";

const FA: LocaleText = {
  labels: {
    eyebrow: "نمونه‌کارهای منتخب",
    pageTitle: "نمونه‌کارها",
    intro:
      "همکاری‌های ناشناس‌سازی‌شده با نتایج واقعی و قابل‌دفاع. نام‌ها و جزئیات شناسایی‌کننده برای حفظ محرمانگی مشتری حذف شده‌اند؛ اعداد، اعدادی هستند که پشت آن‌ها می‌ایستیم.",
    categoryLabels: { revenue: "درآمد", knowledge: "دانش", operations: "عملیات" },
    problemLabel: "مسئله",
    beforeLabel: "روال پیشین",
    systemLabel: "آنچه ساختیم",
    resultLabel: "نتیجه",
    changedLabel: "چه چیزی تغییر کرد",
    constraintsLabel: "محدودیت‌ها",
    roleLabel: "نقش ما",
    methodLabel: "روش",
    whyAnonymizedLabel: "چرا ناشناس است",
    diagramLabel: "ساختار سیستم",
    diagramInputs: "ورودی‌ها",
    diagramProcessing: "پردازش",
    diagramOutputs: "خروجی‌ها",
    viewCase: "مشاهده نمونه",
    backToWork: "همه نمونه‌کارها",
    ctaTitle: "سند عملیاتی‌ای دارید که می‌خواهید تحلیل شود؟",
    ctaBody:
      "ما تماس فروش متعارف برگزار نمی‌کنیم. پیچیده‌ترین سند عملیاتی‌تان را بفرستید تا یک مهندس مدلی روشن از ارزش خودکارسازی آن ارائه دهد.",
    ctaLabel: "درخواست تشخیص عملیاتی",
  },
  projects: {
    "support-transformation": {
      sector: "فناوری آموزشی / پشتیبانی نرم‌افزار",
      title: "یک میز پشتیبانیِ وابسته به بنیان‌گذار، بازسازی‌شده به‌صورت سیستم تیکتینگ هوش مصنوعی",
      problem:
        "عملیات پشتیبانی غرق در ۳۸٬۰۰۰ تیکت تاریخی و ۸۵٬۰۰۰ پیام، در حالی‌که مدیرعامل نقش لایه ترجمه دستی میان سیستم‌های پراکنده سایه را ایفا می‌کرد.",
      workflowBefore:
        "کارشناسان پشتیبانی از کانال‌های غیراستاندارد امتیاز می‌دادند. یک vTiger CRM به‌شدت سفارشی‌سازی‌شده به ده‌ها سیستم سایه تبدیل شده بود و دانش آن‌بوردینگ در Mizito پراکنده بود. پاسخ‌های روتین به بنیان‌گذار وابسته بود.",
      systemDelivered:
        "یک سیستم تیکتینگ مبتنی بر معماری عامل‌های توزیع‌شده با لایه حافظه معنایی (PGLite / pgvector). «تیکتینگ هوشمند» هنگام ثبت، تیکت‌های حل‌شده مشابه را نشان می‌دهد و برای پاسخ‌گویی خودکار به پرسش‌های روتین پیش از رسیدن به انسان ساخته شده است.",
      metric: { value: "۳۸٬۰۰۰", label: "تیکت منتقل‌شده به یک پایگاه دانش ساختاریافته" },
      metricNote:
        "دامنه مهاجرت مستند است: ۳۸٬۰۰۰ تیکت / ۸۵٬۰۰۰ پیام / ۱۲۳٬۰۰۰ نقطه‌داده. خودکارسازی یک KPI هدف است — ۸۰٪ از پرسش‌های روتین — نه نتیجه محقق‌شده: پروژه فعال است (فاز ۲) و روی انبوه ۳۸٬۰۰۰ تیکتی در حال استقرار است، پس نرخ نهایی پاسخ‌گویی خودکار هنوز منتشر نشده.",
      whatChanged:
        "میز پشتیبانی از حالت وابسته به بنیان‌گذار و بداهه به سمت مدلی تقویت‌شده با هوش مصنوعی حرکت کرد و انبوه تیکت‌های تاریخی به‌جای حافظه قبیله‌ای به یک پایگاه دانش قابل‌جست‌وجو تبدیل شد.",
      constraints: [
        "زبان فارسی / راست‌به‌چپ در سراسر سیستم",
        "۱۲۳٬۰۰۰ نقطه‌داده مجزا که به‌صورت ایمن منتقل شد",
        "انطباق با امنیت داده محلی (گواهینامه افتا)",
      ],
      founderRole: "راهبر تحول و مشاور راهبردی مدیرعامل",
      method: [
        "نقشه‌برداری: ممیزی عملیات پشتیبانی با هوش مصنوعی برای آشکارسازی گلوگاه مدیرعامل و سیستم‌های سایه",
        "ساختاردهی: یک چارچوب مستندسازی ۴-سطحی؛ ۳۸٬۰۰۰ تیکت به یک پایگاه دانش ساختاریافته منتقل شد",
        "پیاده‌سازی: معماری عامل‌های توزیع‌شده روی یک لایه حافظه معنایی PGLite / pgvector",
        "تطبیق: یک پروتکل قواعد رسیدگی به استثناها تا سیستم به‌جای ارجاع، روی موارد مرزی بازآموزی شود",
      ],
      whyAnonymized: WHY_ANON_FA,
      diagram: {
        inputs: "۳۸٬۰۰۰ تیکت تاریخی / ۸۵٬۰۰۰ پیام",
        processing: "حافظه معنایی + طبقه‌بندی روی یک پایگاه برداری",
        outputs: "پاسخ‌گویی خودکار پیش از ثبت + پیشنهاد پاسخ‌های پایگاه دانش",
      },
    },
    "competitive-intelligence": {
      sector: "غیرانتفاعی / آموزش",
      title: "هوش رقابتی در سطح سازمانی، برای تیمی که وقتش را نداشت",
      problem:
        "مدیر عملیات نمی‌توانست بیش از یک رقیب را نام ببرد، چون پژوهش راهبردی همیشه زیر فشار کارهای روزمره گم می‌شد.",
      workflowBefore:
        "پژوهش راهبردی و رقابتی عملاً انجام نمی‌شد. با منابع محدود، کار جایگاه‌یابی به‌طور نامحدود به نفع اطفای حریق عملیاتی کنار گذاشته می‌شد.",
      systemDelivered:
        "یک جریان‌کاری مستندِ مبتنی بر پرامپت و تحلیل که جایگاه‌یابی رقابتی را بنا به درخواست اجرا می‌کند — منابع را گرد می‌آورد و در یک سند هوش رقابتی ساختاریافته یکپارچه می‌کند.",
      metric: { value: "۲۵ دقیقه", label: "تا تحلیلی رقابتی که قبلاً هفته‌ها زمان می‌برد" },
      metricNote:
        "به‌گزارش مشتری: ۱۷۱ منبع در حدود ۲۵ دقیقه در یک سند رقابتی یکپارچه شد. گزارش از سوی مشتری؛ به‌صورت زمان تا تولید سند چارچوب‌بندی شده، نه یک معیار نتیجه کسب‌وکار.",
      whatChanged:
        "یک تیم با منابع محدود به هوش راهبردی — نقاط قوت، ضعف و شکاف‌های جایگاه‌یابی رقبا — دست یافت که پیش‌تر هفته‌ها کار یا مشاور بیرونی می‌طلبید.",
      constraints: ["منابع و نیروی انسانی در سطح یک سازمان غیرانتفاعی"],
      founderRole:
        "به‌عنوان اپراتور اصلی عمل کرد، مستقیماً دانش ضمنی را استخراج و معماری هوش مصنوعی را پیکربندی کرد.",
      method: [
        "نقشه‌برداری: تشخیص اینکه قابلیت مفقوده، پژوهش راهبردی است نه یک ابزار",
        "ساختاردهی: کدگذاری پرسش‌های جایگاه‌یابی در یک جریان‌کاری پرامپت مستند و تکرارپذیر",
        "پیاده‌سازی: اجرای ترکیب چندمنبعی در یک سند رقابتی واحد",
        "تطبیق: اجرای دوباره بنا به درخواست با تغییر بازار و مجموعه رقبا",
      ],
      whyAnonymized: WHY_ANON_FA,
      diagram: {
        inputs: "ورودی‌های پایه جایگاه‌یابی + مجموعه رقبای مشخص",
        processing: "جریان‌کاری پرامپت مستند + ترکیب چندمنبعی",
        outputs: "یک سند هوش رقابتی ساختاریافته (۱۷۱ منبع)",
      },
    },
    "proposal-turnaround": {
      sector: "شرکت مشاوره (۱۴ نفر)",
      title: "نرخ تبدیل گیرکرده، با مستندسازی پروپوزال حل شد، نه با تغییر پیشنهاد",
      problem:
        "نرخ تبدیل با وجود پیشنهاد قوی و سرنخ‌های گرم روی ۱۸٪ گیر کرده بود — ناشی از فرایند پروپوزالی که هر بار از صفر بداهه ساخته می‌شد.",
      workflowBefore:
        "هر پروپوزال بداهه ساخته می‌شد و ۲ تا ۴ ساعت زمان می‌برد، بدون قالب و بدون منطق تصمیم‌گیری یکدست برای دامنه یا قیمت‌گذاری.",
      systemDelivered:
        "یک قالب پروپوزال مستند با یک چک‌لیست ذهنی ۵-تصمیمی و یک چک‌لیست کوتاه سفارشی‌سازی — تا هر پروپوزال یکدست و سریع باشد بدون از‌دست‌دادن تناسب.",
      metric: { before: "۱۸٪", after: "۳۱٪", label: "نرخ تبدیل، ظرف یک فصل" },
      metricNote:
        "ردیابی فروش داخلی شرکت طی یک فصل. زمان آماده‌سازی پروپوزال نیز از ۲ تا ۴ ساعت به کمتر از یک ساعت کاهش یافت. خودِ پیشنهاد تغییری نکرد.",
      whatChanged:
        "زمان آماده‌سازی پروپوزال از ۲ تا ۴ ساعت به کمتر از یک ساعت رسید و نرخ تبدیل از ۱۸٪ به ۳۱٪ افزایش یافت — بدون دست‌زدن به پیشنهاد یا قیمت‌گذاری زیربنایی.",
      constraints: [],
      founderRole:
        "به‌عنوان اپراتور اصلی عمل کرد، مستقیماً دانش ضمنی را استخراج و معماری هوش مصنوعی را پیکربندی کرد.",
      method: [
        "نقشه‌برداری: یافتن گلوگاه در گام پروپوزال، نه در سرنخ یا پیشنهاد",
        "ساختاردهی: ثبت تصمیم‌های ضمنی پروپوزال به‌صورت یک چک‌لیست ۵-موردی + قالب",
        "پیاده‌سازی: افزودن قالب به جریان‌کاری پروپوزال تیم",
        "تطبیق: پالایش چک‌لیست بر اساس نتایج بُرد/باخت در طول فصل",
      ],
      whyAnonymized: WHY_ANON_FA,
      diagram: {
        inputs: "سرنخ واجد شرایط + زمینه اکتشاف",
        processing: "قالب مستند + چک‌لیست ۵-تصمیمی",
        outputs: "یک پروپوزال یکدست و سفارشی در کمتر از یک ساعت",
      },
    },
  },
};

// ─── Arabic (ar) — V1, FLAGGED FOR NATIVE REVIEW ────────────────────────────
// Numerals are Arabic-Indic (٠-٩). Proper nouns kept Latin.
const WHY_ANON_AR =
  "هوية العميل محجوبة بموجب سرية التعاقد. الأرقام حقيقية وقابلة للتحقق في مكالمة مرجعية خاصة.";

const AR: LocaleText = {
  labels: {
    eyebrow: "أعمال مختارة",
    pageTitle: "الأعمال",
    intro:
      "ارتباطات مجهّلة بنتائج حقيقية وقابلة للدفاع. حُذفت الأسماء والتفاصيل المعرّفة احترامًا لسرية العميل؛ والأرقام أرقام نقف خلفها.",
    categoryLabels: { revenue: "الإيرادات", knowledge: "المعرفة", operations: "العمليات" },
    problemLabel: "المشكلة",
    beforeLabel: "كيف كان العمل سابقًا",
    systemLabel: "ما الذي بنيناه",
    resultLabel: "النتيجة",
    changedLabel: "ما الذي تغيّر",
    constraintsLabel: "القيود",
    roleLabel: "دورنا",
    methodLabel: "المنهج",
    whyAnonymizedLabel: "لماذا هذا مجهّل",
    diagramLabel: "بنية النظام",
    diagramInputs: "المدخلات",
    diagramProcessing: "المعالجة",
    diagramOutputs: "المخرجات",
    viewCase: "عرض الحالة",
    backToWork: "كل الأعمال",
    ctaTitle: "هل لديك مستند تشغيلي تريد تحليله؟",
    ctaBody:
      "نحن لا نُجري مكالمات مبيعات تقليدية. أرسل أعقد مستند تشغيلي لديك وسيعيد مهندس نموذجًا واضحًا لقيمة أتمتته.",
    ctaLabel: "اطلب تشخيصًا تشغيليًا",
  },
  projects: {
    "support-transformation": {
      sector: "تقنية تعليمية / دعم برمجي",
      title: "مكتب دعم يعتمد على المؤسس، أُعيد بناؤه كنظام تذاكر بالذكاء الاصطناعي",
      problem:
        "عملية دعم غارقة في ٣٨٬٠٠٠ تذكرة تاريخية و٨٥٬٠٠٠ رسالة، بينما يعمل الرئيس التنفيذي كطبقة ترجمة يدوية بين أنظمة ظل متناثرة.",
      workflowBefore:
        "كان موظفو الدعم يمنحون تنازلات عبر قنوات غير موحّدة. وقد تحوّل نظام vTiger CRM المخصّص بكثافة إلى عشرات أنظمة الظل، وتناثرت معرفة الإعداد عبر Mizito. الإجابات الروتينية كانت تعتمد على المؤسس.",
      systemDelivered:
        "نظام تذاكر بمعمارية وكلاء موزّعة مع طبقة ذاكرة دلالية (PGLite / pgvector). تُظهر «التذاكر الذكية» التذاكر المحلولة المشابهة لحظة الإرسال، وهي مبنية لصرف الاستفسارات الروتينية قبل وصولها إلى إنسان.",
      metric: { value: "٣٨٬٠٠٠", label: "تذكرة نُقلت إلى قاعدة معرفة منظّمة" },
      metricNote:
        "نطاق النقل موثّق: ٣٨٬٠٠٠ تذكرة / ٨٥٬٠٠٠ رسالة / ١٢٣٬٠٠٠ نقطة بيانات. الأتمتة مؤشر أداء مستهدف — ٨٠٪ من الاستفسارات الروتينية — لا نتيجة محقّقة: الارتباط نشط (المرحلة ٢) ويجري نشره على تراكم ٣٨٬٠٠٠ تذكرة، لذا لم يُنشر معدّل الصرف النهائي بعد.",
      whatChanged:
        "انتقل مكتب الدعم من الاعتماد على المؤسس والارتجال نحو نموذج معزّز بالذكاء الاصطناعي، وتحوّل أرشيف التذاكر التاريخي إلى قاعدة معرفة قابلة للبحث بدل الذاكرة القبلية.",
      constraints: [
        "اللغة الفارسية / من اليمين إلى اليسار في كامل النظام",
        "١٢٣٬٠٠٠ نقطة بيانات مميّزة نُقلت بأمان",
        "الامتثال لأمن البيانات المحلي (شهادة AFTA)",
      ],
      founderRole: "قاد التحول وعمل مستشارًا استراتيجيًا للرئيس التنفيذي",
      method: [
        "التخطيط: تدقيق عملية الدعم بالذكاء الاصطناعي لكشف عنق زجاجة الرئيس التنفيذي وأنظمة الظل",
        "الهيكلة: إطار توثيق من ٤ مستويات؛ نُقلت ٣٨٬٠٠٠ تذكرة إلى قاعدة معرفة منظّمة",
        "التنفيذ: معمارية وكلاء موزّعة فوق طبقة ذاكرة دلالية PGLite / pgvector",
        "التكيّف: بروتوكول قواعد لمعالجة الاستثناءات كي يعيد النظام التدرّب على الحالات الحدّية بدل تصعيدها",
      ],
      whyAnonymized: WHY_ANON_AR,
      diagram: {
        inputs: "٣٨٬٠٠٠ تذكرة تاريخية / ٨٥٬٠٠٠ رسالة",
        processing: "ذاكرة دلالية + تصنيف فوق مخزن متجهات",
        outputs: "صرف التذاكر قبل الإرسال + اقتراح إجابات من قاعدة المعرفة",
      },
    },
    "competitive-intelligence": {
      sector: "غير ربحي / تعليم",
      title: "ذكاء تنافسي بمستوى المؤسسات، لفريق لا وقت لديه له",
      problem:
        "لم يستطع مدير العمليات تسمية أكثر من منافس واحد، لأن البحث الاستراتيجي كان يُزاح دائمًا تحت ضغط العمل اليومي.",
      workflowBefore:
        "البحث الاستراتيجي والتنافسي ببساطة لم يكن يُنجز. ومع موارد شحيحة، كان عمل تحديد المكانة يُؤجَّل بلا حدّ لصالح إطفاء الحرائق التشغيلية.",
      systemDelivered:
        "سير عمل موثّق قائم على المطالبات والتحليل يُجري تحديد المكانة التنافسية عند الطلب — يجمع المصادر ويوحّدها في وثيقة ذكاء تنافسي منظّمة واحدة.",
      metric: { value: "٢٥ دقيقة", label: "للوصول إلى تحليل تنافسي كان يستغرق أسابيع" },
      metricNote:
        "بحسب تقرير العميل: جرى توحيد ١٧١ مصدرًا في وثيقة تنافسية واحدة خلال نحو ٢٥ دقيقة. تقرير من العميل؛ مُؤطَّر بوصفه زمن الوصول إلى الوثيقة، لا كمقياس نتيجة عمل.",
      whatChanged:
        "حصل فريق محدود الموارد على ذكاء استراتيجي — نقاط قوة المنافسين وضعفهم وفجوات المكانة — كان يتطلب سابقًا أسابيع من العمل أو مستشارين خارجيين.",
      constraints: ["موارد وكوادر بمستوى منظمة غير ربحية"],
      founderRole:
        "عمل كمشغّل رئيسي، واستخرج المعرفة الضمنية مباشرة وهيّأ معمارية الذكاء الاصطناعي.",
      method: [
        "التخطيط: إدراك أن القدرة المفقودة هي البحث الاستراتيجي، لا أداة مفقودة",
        "الهيكلة: ترميز أسئلة تحديد المكانة في سير عمل مطالبات موثّق وقابل للتكرار",
        "التنفيذ: تشغيل توليف متعدد المصادر في وثيقة تنافسية واحدة",
        "التكيّف: إعادة التشغيل عند الطلب مع تغيّر السوق ومجموعة المنافسين",
      ],
      whyAnonymized: WHY_ANON_AR,
      diagram: {
        inputs: "مدخلات مكانة أساسية + مجموعة منافسين محددة",
        processing: "سير عمل مطالبات موثّق + توليف متعدد المصادر",
        outputs: "وثيقة ذكاء تنافسي منظّمة واحدة (١٧١ مصدرًا)",
      },
    },
    "proposal-turnaround": {
      sector: "شركة استشارات (١٤ شخصًا)",
      title: "معدّل إغلاق عالق، عولج بتوثيق العرض لا بتغيير العرض",
      problem:
        "معدّل إغلاق عالق عند ١٨٪ رغم عرض قوي وعملاء محتملين دافئين — بسبب عملية عروض تُرتجل من الصفر في كل مرة.",
      workflowBefore:
        "كل عرض كان يُرتجل ويستغرق من ٢ إلى ٤ ساعات، بلا قالب وبلا منطق قرار موحّد للنطاق أو التسعير.",
      systemDelivered:
        "قالب عرض موثّق مع قائمة تحقّق ذهنية من ٥ قرارات وقائمة تخصيص قصيرة — كي يكون كل عرض متّسقًا وسريعًا دون فقدان الملاءمة.",
      metric: { before: "١٨٪", after: "٣١٪", label: "معدّل الإغلاق، خلال ربع واحد" },
      metricNote:
        "تتبّع مبيعات داخلي للشركة على مدى ربع. كما انخفض زمن إعداد العرض من ٢–٤ ساعات إلى أقل من ساعة. العرض نفسه لم يتغيّر.",
      whatChanged:
        "انخفض زمن إعداد العرض من ٢–٤ ساعات إلى أقل من ساعة، وارتفع معدّل الإغلاق من ١٨٪ إلى ٣١٪ — دون المساس بالعرض أو التسعير الأساسي.",
      constraints: [],
      founderRole:
        "عمل كمشغّل رئيسي، واستخرج المعرفة الضمنية مباشرة وهيّأ معمارية الذكاء الاصطناعي.",
      method: [
        "التخطيط: تحديد عنق الزجاجة عند خطوة العرض، لا عند العميل المحتمل أو العرض",
        "الهيكلة: التقاط قرارات العرض الضمنية كقائمة من ٥ نقاط + قالب",
        "التنفيذ: دمج القالب في سير عمل العروض لدى الفريق",
        "التكيّف: صقل القائمة بحسب نتائج الفوز/الخسارة خلال الربع",
      ],
      whyAnonymized: WHY_ANON_AR,
      diagram: {
        inputs: "عميل محتمل مؤهّل + سياق الاكتشاف",
        processing: "قالب موثّق + قائمة تحقّق من ٥ قرارات",
        outputs: "عرض متّسق ومخصّص في أقل من ساعة",
      },
    },
  },
};

const TEXT: Record<Locale, LocaleText> = { en: EN, fa: FA, ar: AR };

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
