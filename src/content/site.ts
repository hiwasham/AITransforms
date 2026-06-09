// AITransforms — static content dictionary.
//
// One entry per supported locale. `as const` so each field narrows to its
// literal type; the Locale union is derived from the keys. English is the
// polished default; Persian and Arabic are good-enough V1 translations.
//
// Universal constants (brand, copyright, CTA href, founder placeholder) are
// hoisted so they stay aligned across locales and trivial to update later.

const PRIMARY_CTA_HREF = "mailto:iranfluent.com@gmail.com" as const;
const SECONDARY_CTA_HREF = "#work" as const;
const APPLY_HREF = "/apply" as const;
const APPLY_HREF_FA = "/fa/apply" as const;
const APPLY_HREF_AR = "/ar/apply" as const;
const BRAND = "AITransforms" as const;
const COPYRIGHT = "© 2026 AITransforms" as const;

// Founder identity. Hoisted so the public display name and role are trivial
// to change later without touching the per-locale blocks. The display name
// stays Latin ("Hiwa") across all locales by design; the role is translated.
const FOUNDER = {
  displayName: "Hiwa",
  role: {
    en: "AI Transformation Architect & Founder, AITransforms",
    fa: "معمار تحول هوش مصنوعی و بنیان‌گذار AITransforms",
    ar: "مهندس التحول إلى الذكاء الاصطناعي ومؤسس AITransforms",
  },
} as const;

export const siteContent = {
  en: {
    locale: "en",
    dir: "ltr",
    languageLabel: "English",

    meta: {
      title: "AITransforms — Turn Your Business Brain Into AI Systems",
      description:
        "An AI transformation studio that turns business knowledge, workflows, and documents into practical AI assistants, RAG systems, adaptive coaching tools, and private agents.",
    },

    nav: {
      services: "Services",
      work: "Work",
      process: "Process",
      contact: "Contact",
    },

    hero: {
      eyebrow: "AI transformation studio",
      title: "Turn Your Business Brain Into Practical AI Systems.",
      subtitle:
        "AITransforms helps businesses document, structure, and implement their knowledge, workflows, frameworks, and documents as AI assistants, RAG systems, adaptive coaching tools, and private mobile-accessible AI agents.",
      primaryCta: { label: "Apply for a review", href: APPLY_HREF },
      secondaryCta: { label: "See what we build", href: SECONDARY_CTA_HREF },
      metaphor: "Business Brain → AI Systems",
      stats: [
        { value: 20, suffix: "+", label: "Years of engineering experience" },
        { value: 4, suffix: "", label: "Focused AI service lines" },
        { value: 3, suffix: "", label: "Languages, fully localized" },
        { value: 100, suffix: "%", label: "Private by default" },
      ],
    },

    problem: {
      title: "Your business already has the brain. It just isn't accessible as software.",
      body: "Years of decisions, documents, frameworks, and tribal knowledge live inside a handful of people, scattered drives, and inboxes. None of it is queryable. None of it scales. None of it adapts. That gap — between what your business knows and what your tools can act on — is where AI transformation actually happens.",
      terminal: {
        title: "System Diagnostics",
        statusLabel: "Status Report",
        badge: "Critical Disconnect",
        rows: [
          "No centralized knowledge base",
          "Processes live in people's heads",
          "Data silos between departments",
          "Generic AI outputs, no business context",
        ],
        errorText: "ERROR_CODE_404_CONTEXT",
        actionLabel: "ACTION REQUIRED",
      },
      points: [
        {
          title: "Knowledge is locked inside people.",
          body: "When key people are unavailable, projects stall and decisions repeat. Onboarding is slow because the playbook lives in someone's head.",
        },
        {
          title: "Documents are static.",
          body: "PDFs, SOPs, and slide decks describe how the work is done but can't answer questions, surface context, or guide decisions in the moment.",
        },
        {
          title: "Generic AI tools don't know your business.",
          body: "ChatGPT can write. It can't recall your pricing logic, your sales playbook, your client history, or the way your team actually makes calls.",
        },
      ],
    },

    framework: {
      title: "Business Brain → AI Systems",
      intro:
        "A short, repeatable path from what your business knows to what your tools can do.",
      steps: [
        {
          number: "01",
          title: "Map",
          body: "Identify the knowledge, workflows, frameworks, and documents that actually drive your business. Surface the implicit so it can be made explicit.",
        },
        {
          number: "02",
          title: "Structure",
          body: "Organize that material into formats AI can reason over — typed knowledge bases, retrievable documents, decision rules, and prompt frameworks.",
        },
        {
          number: "03",
          title: "Implement",
          body: "Build the AI systems that consume it: assistants, RAG pipelines, coaching tools, and private agents that operate on your actual business context.",
        },
        {
          number: "04",
          title: "Adapt",
          body: "Iterate based on real use. Tighten the prompts, expand the knowledge, refine the workflows, and put the right system in the right hands.",
        },
      ],
    },

    services: {
      title: "Services",
      intro: "Four focused service lines, all designed around your business brain.",
      items: [
        {
          title: "AI Business Brain Mapping",
          body: "Workshops and discovery to identify the knowledge, frameworks, and decision processes worth turning into AI systems — and the ones that aren't ready.",
          bullets: [
            "Knowledge audit across documents, workflows, and people",
            "Prioritized roadmap of AI-ready use cases",
            "Decision-level mapping for your most repeated processes",
          ],
        },
        {
          title: "RAG & Knowledge Architecture",
          body: "Retrieval-augmented generation systems built on your actual documents, structured for relevance, freshness, and trust.",
          bullets: [
            "Document ingestion and chunking strategy",
            "Embedding model selection and vector store setup",
            "Retrieval evaluation against real questions",
          ],
        },
        {
          title: "AI Productization & Coaching Systems",
          body: "Turning expertise into adaptive coaching tools and AI products — including assistants that train, evaluate, and personalize for each user.",
          bullets: [
            "Adaptive coaching loops based on your methodology",
            "User-state tracking and personalized progression",
            "Product packaging from internal tool to revenue stream",
          ],
        },
        {
          title: "Local AI Agents & AI CEO Assistant",
          body: "Private, mobile-accessible AI agents that run on your infrastructure and act on your business context — including a dedicated assistant for the founder or CEO.",
          bullets: [
            "Private deployments on your own hardware or cloud",
            "Mobile access without exposing data to public APIs",
            "Integrations with your tools, files, and calendars",
          ],
        },
      ],
    },

    agentSpotlight: {
      eyebrow: "Differentiator",
      title: "Your AI CEO Assistant. On your phone. Trained on your business.",
      body: "Most AI products are generic by design. The AI CEO Assistant is the opposite: a private agent that knows your strategy, your documents, your team, and your decision patterns — and runs on infrastructure you control.",
      bullets: [
        "Trained on your business brain, not the open web",
        "Reachable from your phone, day or night",
        "Private by default — your data stays where you put it",
        "Connected to the tools and files your work actually lives in",
      ],
      note: "Built and rolled out as part of an engagement; not a self-serve SaaS product.",
    },

    caseStudies: {
      title: "Selected work",
      intro:
        "Anonymized engagements. Names, numbers, and identifying details omitted to respect client confidentiality.",
      items: [
        {
          title: "A coaching practice operationalized as an AI system",
          summary:
            "Years of methodology — assessments, frameworks, and progression logic — turned into an adaptive AI coach that personalizes for each user without losing the practitioner's voice.",
          highlights: [
            "Methodology captured as structured prompts and decision rules",
            "User-state tracking across sessions",
            "Practitioner remains the source of truth; the system extends reach",
          ],
        },
        {
          title: "A founder's reference library, made queryable",
          summary:
            "A founder's decade of notes, decisions, and frameworks — previously scattered across files and apps — unified behind a private RAG system reachable from anywhere.",
          highlights: [
            "Mixed-source ingestion across notes, documents, and exports",
            "Retrieval tuned for decision-context, not generic Q&A",
            "Private deployment with mobile access",
          ],
        },
        {
          title: "An internal workflow rebuilt around a local agent",
          summary:
            "A repeated decision process, previously dependent on a single expert, transformed into a local agent that drafts, evaluates, and routes work — with the expert reviewing instead of authoring from scratch.",
          highlights: [
            "Expertise encoded as evaluation criteria, not static templates",
            "Local-first agent, no third-party data exposure",
            "Expert moves from author to reviewer",
          ],
        },
      ],
    },

    founder: {
      title: "Founder-led",
      name: FOUNDER.displayName,
      role: FOUNDER.role.en,
      credentialsLabel: "Background",
      body: "AITransforms is a founder-led studio. Every engagement is shaped by hands-on engineering experience and direct exposure to the technical and human sides of AI transformation.",
      credentials: [
        "MSc in Computer Engineering",
        "20 years of programming experience",
        "AI business projects across coaching, knowledge, and private agent systems",
        "Direct AI coaching experience — translating methodology into adaptive tools",
      ],
    },

    resources: {
      title: "Resources",
      intro:
        "Articles, frameworks, and notes from the studio. A small library, building up over time.",
      items: [
        {
          title: "Articles",
          summary:
            "Short writeups on AI transformation patterns and what actually ships.",
        },
        {
          title: "Frameworks",
          summary:
            "Reusable structures for mapping business knowledge to AI systems.",
        },
        {
          title: "Roadmaps",
          summary: "Public notes on what we're prioritizing and why.",
        },
        {
          title: "Technical Notes",
          summary:
            "Implementation details from real engagements, anonymized.",
        },
      ],
      note: "First writeups coming soon.",
    },

    cta: {
      title: "Ready to see what your business brain can do?",
      body: "Start with an AI transformation review. We'll map what's worth turning into AI, what isn't ready yet, and where the highest-leverage build lives.",
      primaryCta: { label: "Apply for a review", href: APPLY_HREF },
    },

    footer: {
      brand: BRAND,
      tagline: "Turning business brains into practical AI systems.",
      contactLabel: "Contact AITransforms",
      contactHref: PRIMARY_CTA_HREF,
      copyright: COPYRIGHT,
    },
  },

  fa: {
    locale: "fa",
    dir: "rtl",
    languageLabel: "فارسی",

    meta: {
      title: "AITransforms — مغز کسب‌وکار شما را به سیستم‌های هوش مصنوعی تبدیل می‌کنیم",
      description:
        "استودیویی برای تحول هوش مصنوعی که دانش، گردش‌های کاری و اسناد کسب‌وکار شما را به دستیارهای هوشمند، سیستم‌های RAG، ابزارهای آموزش تطبیقی و عامل‌های خصوصی تبدیل می‌کند.",
    },

    nav: {
      services: "خدمات",
      work: "نمونه‌کارها",
      process: "فرآیند",
      contact: "تماس",
    },

    hero: {
      eyebrow: "استودیوی تحول هوش مصنوعی",
      title: "مغز کسب‌وکار خود را به سیستم‌های عملی هوش مصنوعی تبدیل کنید.",
      subtitle:
        "AITransforms به کسب‌وکارها کمک می‌کند تا دانش، گردش‌های کاری، چارچوب‌ها و اسناد خود را به‌صورت دستیارهای هوش مصنوعی، سیستم‌های RAG، ابزارهای آموزش تطبیقی و عامل‌های خصوصی قابل‌دسترس از موبایل پیاده‌سازی کنند.",
      primaryCta: { label: "درخواست بازبینی", href: APPLY_HREF_FA },
      secondaryCta: { label: "ببینید چه می‌سازیم", href: SECONDARY_CTA_HREF },
      metaphor: "مغز کسب‌وکار ← سیستم‌های هوش مصنوعی",
      stats: [
        { value: 20, suffix: "+", label: "سال تجربه مهندسی" },
        { value: 4, suffix: "", label: "خط خدمات متمرکز هوش مصنوعی" },
        { value: 3, suffix: "", label: "زبان، کاملاً بومی‌سازی‌شده" },
        { value: 100, suffix: "٪", label: "خصوصی به‌طور پیش‌فرض" },
      ],
    },

    problem: {
      title: "کسب‌وکار شما همین حالا یک مغز دارد. فقط هنوز به‌صورت نرم‌افزار در دسترس نیست.",
      body: "سال‌ها تصمیم، سند، چارچوب و دانش ضمنی، در ذهن چند نفر، روی هاردهای پراکنده و در ایمیل‌ها زندگی می‌کنند. چیزی از این‌ها قابل‌جست‌وجو نیست. هیچ‌کدام مقیاس نمی‌گیرند. هیچ‌کدام تطبیق پیدا نمی‌کنند. تحول هوش مصنوعی واقعی، در همین فاصله اتفاق می‌افتد — بین آنچه کسب‌وکار شما می‌داند و آنچه ابزارهایتان می‌توانند انجام دهند.",
      terminal: {
        title: "تشخیص سیستم",
        statusLabel: "گزارش وضعیت",
        badge: "گسست بحرانی",
        rows: [
          "پایگاه دانش متمرکزی وجود ندارد",
          "فرآیندها در ذهن آدم‌ها زندگی می‌کنند",
          "جزایر داده میان دپارتمان‌ها",
          "خروجی عمومی هوش مصنوعی، بدون زمینه کسب‌وکار",
        ],
        errorText: "ERROR_CODE_404_CONTEXT",
        actionLabel: "نیازمند اقدام",
      },
      points: [
        {
          title: "دانش در ذهن آدم‌ها قفل است.",
          body: "وقتی افراد کلیدی در دسترس نیستند، پروژه‌ها متوقف می‌شوند و تصمیم‌ها دوباره گرفته می‌شوند. ورود نیروی جدید کند است، چون راهنما در ذهن یک نفر است.",
        },
        {
          title: "اسناد ایستا هستند.",
          body: "PDF و SOP و اسلایدها روش انجام کار را توصیف می‌کنند، اما نمی‌توانند به سؤال پاسخ دهند، زمینه را نمایان کنند یا در لحظه تصمیم را هدایت کنند.",
        },
        {
          title: "ابزارهای عمومی هوش مصنوعی، کسب‌وکار شما را نمی‌شناسند.",
          body: "ChatGPT می‌تواند بنویسد. اما منطق قیمت‌گذاری شما، راهنمای فروش، تاریخچه مشتری و شیوه واقعی تصمیم‌گیری تیم شما را نمی‌داند.",
        },
      ],
    },

    framework: {
      title: "مغز کسب‌وکار ← سیستم‌های هوش مصنوعی",
      intro:
        "یک مسیر کوتاه و تکرارپذیر از آنچه کسب‌وکار شما می‌داند تا آنچه ابزارهای شما می‌توانند انجام دهند.",
      steps: [
        {
          number: "۰۱",
          title: "نقشه‌برداری",
          body: "دانش، گردش‌های کاری، چارچوب‌ها و اسنادی را که واقعاً کسب‌وکار شما را پیش می‌برند شناسایی کنید. آنچه ضمنی است را آشکار کنید.",
        },
        {
          number: "۰۲",
          title: "ساختاردهی",
          body: "این مواد را در قالب‌هایی سازماندهی کنید که هوش مصنوعی بتواند بر آن‌ها استدلال کند — پایگاه‌های دانش، اسناد بازیابی‌شدنی، قواعد تصمیم و چارچوب‌های پرامپت.",
        },
        {
          number: "۰۳",
          title: "پیاده‌سازی",
          body: "سیستم‌های هوش مصنوعی را بسازید: دستیارها، خط‌لوله‌های RAG، ابزارهای آموزش تطبیقی و عامل‌های خصوصی که روی زمینه واقعی کسب‌وکار شما کار می‌کنند.",
        },
        {
          number: "۰۴",
          title: "تطبیق",
          body: "بر اساس استفاده واقعی، چرخه تکرار کنید. پرامپت‌ها را دقیق‌تر کنید، دانش را گسترش دهید، گردش‌های کاری را پالایش کنید و سیستم درست را در دست افراد درست قرار دهید.",
        },
      ],
    },

    services: {
      title: "خدمات",
      intro: "چهار خط خدمات متمرکز، همگی حول مغز کسب‌وکار شما.",
      items: [
        {
          title: "نقشه‌برداری از مغز کسب‌وکار",
          body: "کارگاه و کشف برای شناسایی دانش، چارچوب‌ها و فرآیندهای تصمیمی که ارزش تبدیل شدن به سیستم‌های هوش مصنوعی را دارند — و آن‌هایی که هنوز آماده نیستند.",
          bullets: [
            "ممیزی دانش در میان اسناد، گردش‌های کاری و افراد",
            "نقشه راه اولویت‌بندی‌شده از موارد استفاده آماده برای هوش مصنوعی",
            "نقشه‌برداری در سطح تصمیم برای پرتکرارترین فرآیندها",
          ],
        },
        {
          title: "RAG و معماری دانش",
          body: "سیستم‌های تولید مبتنی بر بازیابی، ساخته‌شده روی اسناد واقعی شما، با تأکید بر مرتبط بودن، به‌روز بودن و قابل‌اعتماد بودن.",
          bullets: [
            "راهبرد ورود اسناد و قطعه‌بندی",
            "انتخاب مدل امبدینگ و راه‌اندازی پایگاه‌داده برداری",
            "ارزیابی بازیابی در برابر پرسش‌های واقعی",
          ],
        },
        {
          title: "محصول‌سازی هوش مصنوعی و سیستم‌های آموزشی",
          body: "تبدیل تخصص به ابزارهای آموزش تطبیقی و محصولات هوش مصنوعی — شامل دستیارهایی که برای هر کاربر آموزش می‌دهند، ارزیابی می‌کنند و شخصی‌سازی می‌کنند.",
          bullets: [
            "چرخه‌های آموزش تطبیقی بر اساس متدولوژی شما",
            "ردیابی وضعیت کاربر و پیشرفت شخصی‌سازی‌شده",
            "بسته‌بندی محصول از ابزار درون‌سازمانی تا منبع درآمد",
          ],
        },
        {
          title: "عامل‌های هوش مصنوعی محلی و دستیار AI CEO",
          body: "عامل‌های خصوصی هوش مصنوعی، قابل‌دسترس از موبایل، که روی زیرساخت خود شما اجرا می‌شوند و بر اساس زمینه کسب‌وکار شما عمل می‌کنند — شامل یک دستیار اختصاصی برای بنیان‌گذار یا مدیرعامل.",
          bullets: [
            "استقرار خصوصی روی سخت‌افزار یا ابر شما",
            "دسترسی از موبایل بدون انتشار داده در APIهای عمومی",
            "اتصال به ابزارها، فایل‌ها و تقویم‌های شما",
          ],
        },
      ],
    },

    agentSpotlight: {
      eyebrow: "تمایز اصلی",
      title: "دستیار AI CEO شما. روی گوشی شما. آموزش‌دیده با کسب‌وکار شما.",
      body: "اکثر محصولات هوش مصنوعی به‌طور پیش‌فرض عمومی‌اند. دستیار AI CEO عکس این است: یک عامل خصوصی که استراتژی، اسناد، تیم و الگوهای تصمیم‌گیری شما را می‌شناسد — و روی زیرساختی که خودتان کنترل می‌کنید اجرا می‌شود.",
      bullets: [
        "آموزش‌دیده با مغز کسب‌وکار شما، نه با وب باز",
        "از گوشی شما، در هر زمان از شبانه‌روز در دسترس",
        "خصوصی به‌طور پیش‌فرض — داده شما همان‌جا می‌ماند که قرار داده‌اید",
        "متصل به ابزارها و فایل‌هایی که کار شما واقعاً در آن‌ها زندگی می‌کند",
      ],
      note: "به‌عنوان بخشی از همکاری ساخته و راه‌اندازی می‌شود؛ یک محصول SaaS سلف‌سرویس نیست.",
    },

    caseStudies: {
      title: "نمونه‌کارهای منتخب",
      intro:
        "همکاری‌های ناشناس‌سازی‌شده. نام‌ها، اعداد و جزئیات شناسایی‌کننده برای حفظ محرمانگی مشتریان حذف شده‌اند.",
      items: [
        {
          title: "یک مرکز کوچینگ، عملیاتی‌شده به‌صورت سیستم هوش مصنوعی",
          summary:
            "سال‌ها متدولوژی — ارزیابی‌ها، چارچوب‌ها و منطق پیشرفت — به یک کوچ هوش مصنوعی تطبیقی تبدیل شد که برای هر کاربر شخصی‌سازی می‌کند، بدون از دست دادن صدای متخصص.",
          highlights: [
            "متدولوژی به‌صورت پرامپت‌های ساختاریافته و قواعد تصمیم ثبت شد",
            "ردیابی وضعیت کاربر در طول جلسات",
            "متخصص همچنان منبع حقیقت است؛ سیستم فقط دسترسی را گسترش می‌دهد",
          ],
        },
        {
          title: "کتابخانه مرجع یک بنیان‌گذار، قابل‌جست‌وجو شد",
          summary:
            "یک دهه یادداشت، تصمیم و چارچوب یک بنیان‌گذار — که قبلاً در فایل‌ها و اپلیکیشن‌ها پراکنده بود — پشت یک سیستم RAG خصوصی قابل‌دسترس از هرکجا یکپارچه شد.",
          highlights: [
            "ورود داده از منابع ترکیبی شامل یادداشت، اسناد و خروجی‌ها",
            "تنظیم بازیابی برای زمینه تصمیم، نه پرسش‌وپاسخ عمومی",
            "استقرار خصوصی با دسترسی موبایل",
          ],
        },
        {
          title: "یک گردش کاری داخلی، بازسازی‌شده حول یک عامل محلی",
          summary:
            "یک فرآیند تصمیم تکراری، که قبلاً به یک متخصص واحد وابسته بود، به یک عامل محلی تبدیل شد که پیش‌نویس، ارزیابی و مسیریابی می‌کند — و متخصص به‌جای نوشتن از صفر، فقط بازبینی می‌کند.",
          highlights: [
            "تخصص به‌صورت معیارهای ارزیابی کدگذاری شد، نه قالب‌های ایستا",
            "عامل محلی، بدون نمایش داده به سرویس‌های شخص ثالث",
            "متخصص از نویسنده به بازبین تبدیل می‌شود",
          ],
        },
      ],
    },

    founder: {
      title: "بنیان‌گذار‌محور",
      name: FOUNDER.displayName,
      role: FOUNDER.role.fa,
      credentialsLabel: "پیشینه",
      body: "AITransforms یک استودیوی بنیان‌گذار‌محور است. هر همکاری با تجربه عملی مهندسی و مواجهه مستقیم با جنبه‌های فنی و انسانی تحول هوش مصنوعی شکل می‌گیرد.",
      credentials: [
        "کارشناسی ارشد مهندسی کامپیوتر",
        "۲۰ سال تجربه برنامه‌نویسی",
        "پروژه‌های هوش مصنوعی کسب‌وکار در حوزه کوچینگ، دانش و عامل‌های خصوصی",
        "تجربه مستقیم کوچینگ هوش مصنوعی — تبدیل متدولوژی به ابزارهای تطبیقی",
      ],
    },

    resources: {
      title: "منابع",
      intro:
        "مقاله‌ها، چارچوب‌ها و یادداشت‌ها از استودیو. کتابخانه‌ای کوچک که در حال شکل‌گیری است.",
      items: [
        {
          title: "مقاله‌ها",
          summary:
            "نوشته‌های کوتاه درباره الگوهای تحول هوش مصنوعی و آنچه واقعاً پیاده‌سازی می‌شود.",
        },
        {
          title: "چارچوب‌ها",
          summary:
            "ساختارهای قابل‌استفاده برای نگاشت دانش کسب‌وکار به سیستم‌های هوش مصنوعی.",
        },
        {
          title: "نقشه‌های راه",
          summary: "یادداشت‌های عمومی درباره اولویت‌های ما و چرایی آن‌ها.",
        },
        {
          title: "یادداشت‌های فنی",
          summary: "جزئیات پیاده‌سازی از همکاری‌های واقعی، ناشناس‌سازی‌شده.",
        },
      ],
      note: "اولین نوشته‌ها به‌زودی منتشر می‌شوند.",
    },

    cta: {
      title: "آماده‌اید ببینید مغز کسب‌وکارتان چه می‌تواند بکند؟",
      body: "با یک بازبینی تحول هوش مصنوعی شروع کنید. نقشه می‌کشیم چه چیزی ارزش تبدیل شدن به هوش مصنوعی را دارد، چه چیزی هنوز آماده نیست، و بالاترین اهرم ساخت کجاست.",
      primaryCta: { label: "درخواست بازبینی", href: APPLY_HREF_FA },
    },

    footer: {
      brand: BRAND,
      tagline: "مغز کسب‌وکار را به سیستم‌های عملی هوش مصنوعی تبدیل می‌کنیم.",
      contactLabel: "تماس با AITransforms",
      contactHref: PRIMARY_CTA_HREF,
      copyright: COPYRIGHT,
    },
  },

  ar: {
    locale: "ar",
    dir: "rtl",
    languageLabel: "العربية",

    meta: {
      title: "AITransforms — حوّل عقل أعمالك إلى أنظمة ذكاء اصطناعي عملية",
      description:
        "استوديو متخصص في التحول إلى الذكاء الاصطناعي، يحوّل معرفة عملك وسير العمل والمستندات إلى مساعدين ذكيين، وأنظمة RAG، وأدوات تدريب تكيفية، ووكلاء خاصين.",
    },

    nav: {
      services: "الخدمات",
      work: "أعمالنا",
      process: "العملية",
      contact: "تواصل",
    },

    hero: {
      eyebrow: "استوديو التحول إلى الذكاء الاصطناعي",
      title: "حوّل عقل أعمالك إلى أنظمة ذكاء اصطناعي عملية.",
      subtitle:
        "تساعد AITransforms الشركات على توثيق معرفتها وسير عملها وأطرها ومستنداتها وتنفيذها كمساعدين ذكيين، وأنظمة RAG، وأدوات تدريب تكيفية، ووكلاء ذكاء اصطناعي خاصين يمكن الوصول إليهم من الهاتف.",
      primaryCta: { label: "تقدّم للمراجعة", href: APPLY_HREF_AR },
      secondaryCta: { label: "شاهد ما نبنيه", href: SECONDARY_CTA_HREF },
      metaphor: "عقل الأعمال ← أنظمة الذكاء الاصطناعي",
      stats: [
        { value: 20, suffix: "+", label: "عامًا من الخبرة الهندسية" },
        { value: 4, suffix: "", label: "خطوط خدمات ذكاء اصطناعي مركزة" },
        { value: 3, suffix: "", label: "لغات، مترجمة بالكامل" },
        { value: 100, suffix: "٪", label: "خاص بشكل افتراضي" },
      ],
    },

    problem: {
      title: "عملك يمتلك العقل بالفعل. فقط لم يصبح بعد متاحًا كبرنامج.",
      body: "سنوات من القرارات والمستندات والأطر والمعرفة الضمنية تعيش داخل عدد قليل من الأشخاص، وعلى أقراص متناثرة، وفي صناديق البريد. لا شيء من ذلك قابل للاستعلام. لا شيء منه يتسع. لا شيء منه يتكيف. هذه الفجوة — بين ما يعرفه عملك وما يمكن لأدواتك التصرف بناءً عليه — هي المكان الذي يحدث فيه التحول الفعلي إلى الذكاء الاصطناعي.",
      terminal: {
        title: "تشخيص النظام",
        statusLabel: "تقرير الحالة",
        badge: "انفصال حرج",
        rows: [
          "لا توجد قاعدة معرفة مركزية",
          "العمليات تعيش في رؤوس الأشخاص",
          "صوامع بيانات بين الأقسام",
          "مخرجات ذكاء اصطناعي عامة، بلا سياق للعمل",
        ],
        errorText: "ERROR_CODE_404_CONTEXT",
        actionLabel: "إجراء مطلوب",
      },
      points: [
        {
          title: "المعرفة محبوسة داخل الأشخاص.",
          body: "عندما لا يتوفر الأشخاص الرئيسيون، تتوقف المشاريع وتتكرر القرارات. تأهيل الموظفين الجدد بطيء لأن دليل العمل في رأس شخص واحد.",
        },
        {
          title: "المستندات ساكنة.",
          body: "ملفات PDF وإجراءات التشغيل والعروض التقديمية تصف كيفية القيام بالعمل، لكنها لا تستطيع الإجابة على الأسئلة، أو إبراز السياق، أو توجيه القرار في اللحظة.",
        },
        {
          title: "أدوات الذكاء الاصطناعي العامة لا تعرف عملك.",
          body: "ChatGPT يستطيع الكتابة. لكنه لا يستطيع تذكّر منطق التسعير لديك، أو دليل المبيعات، أو تاريخ العملاء، أو الطريقة الفعلية التي يتخذ بها فريقك القرارات.",
        },
      ],
    },

    framework: {
      title: "عقل الأعمال ← أنظمة الذكاء الاصطناعي",
      intro:
        "مسار قصير وقابل للتكرار من ما يعرفه عملك إلى ما يمكن لأدواتك القيام به.",
      steps: [
        {
          number: "٠١",
          title: "الخريطة",
          body: "حدّد المعرفة وسير العمل والأطر والمستندات التي تقود عملك فعليًا. أَظهِر ما هو ضمني ليصبح صريحًا.",
        },
        {
          number: "٠٢",
          title: "الهيكلة",
          body: "نظّم تلك المواد بصيغ يمكن للذكاء الاصطناعي الاستدلال عليها — قواعد معرفة منظمة، ومستندات قابلة للاسترجاع، وقواعد قرار، وأطر للموجّهات.",
        },
        {
          number: "٠٣",
          title: "التنفيذ",
          body: "ابنِ أنظمة الذكاء الاصطناعي التي تستهلكها: مساعدون، خطوط RAG، أدوات تدريب، ووكلاء خاصون يعملون على سياق عملك الفعلي.",
        },
        {
          number: "٠٤",
          title: "التكيّف",
          body: "كرّر التطوير بناءً على الاستخدام الفعلي. شدّد الموجّهات، وسّع المعرفة، حسّن سير العمل، وضع النظام المناسب في الأيدي المناسبة.",
        },
      ],
    },

    services: {
      title: "الخدمات",
      intro: "أربعة خطوط خدمات مركزة، كلها مصممة حول عقل أعمالك.",
      items: [
        {
          title: "تخطيط عقل الأعمال للذكاء الاصطناعي",
          body: "ورش عمل واكتشاف لتحديد المعرفة والأطر وعمليات اتخاذ القرار التي تستحق التحويل إلى أنظمة ذكاء اصطناعي — وتلك التي ليست جاهزة بعد.",
          bullets: [
            "تدقيق المعرفة عبر المستندات وسير العمل والأشخاص",
            "خارطة طريق ذات أولوية لحالات الاستخدام الجاهزة للذكاء الاصطناعي",
            "تخطيط على مستوى القرار لأكثر العمليات تكرارًا",
          ],
        },
        {
          title: "RAG وهيكلة المعرفة",
          body: "أنظمة توليد معتمدة على الاسترجاع، مبنية على مستنداتك الفعلية، ومهيكلة من أجل الصلة والحداثة والثقة.",
          bullets: [
            "استراتيجية إدخال المستندات وتقطيعها",
            "اختيار نموذج التضمين وإعداد قاعدة البيانات المتجهة",
            "تقييم الاسترجاع مقابل أسئلة حقيقية",
          ],
        },
        {
          title: "تحويل الذكاء الاصطناعي إلى منتج وأنظمة التدريب",
          body: "تحويل الخبرة إلى أدوات تدريب تكيفية ومنتجات ذكاء اصطناعي — تشمل مساعدين يدرّبون ويقيّمون ويُخصّصون لكل مستخدم.",
          bullets: [
            "دوائر تدريب تكيفية بناءً على منهجيتك",
            "تتبع حالة المستخدم وتقدم مخصص",
            "تغليف المنتج من أداة داخلية إلى مصدر دخل",
          ],
        },
        {
          title: "وكلاء ذكاء اصطناعي محلية ومساعد AI CEO",
          body: "وكلاء ذكاء اصطناعي خاصون يمكن الوصول إليهم من الهاتف، يعملون على بنيتك التحتية ويتصرفون بناءً على سياق عملك — يشمل مساعدًا مخصصًا للمؤسس أو المدير التنفيذي.",
          bullets: [
            "نشر خاص على أجهزتك أو سحابتك",
            "وصول من الهاتف دون كشف البيانات لواجهات برمجة عامة",
            "تكامل مع أدواتك وملفاتك وتقويماتك",
          ],
        },
      ],
    },

    agentSpotlight: {
      eyebrow: "ميزة مميزة",
      title: "مساعد AI CEO الخاص بك. على هاتفك. مُدرَّب على أعمالك.",
      body: "معظم منتجات الذكاء الاصطناعي عامة بطبيعتها. مساعد AI CEO هو العكس: وكيل خاص يعرف استراتيجيتك ومستنداتك وفريقك وأنماط قراراتك — ويعمل على بنية تحتية تتحكم بها أنت.",
      bullets: [
        "مُدرَّب على عقل أعمالك، وليس على الويب المفتوح",
        "متاح من هاتفك، ليلًا ونهارًا",
        "خاص بشكل افتراضي — بياناتك تبقى حيث وضعتها",
        "متصل بالأدوات والملفات التي يعيش فيها عملك فعليًا",
      ],
      note: "يُبنى ويُطلق كجزء من ارتباط عمل؛ ليس منتج SaaS ذاتي الخدمة.",
    },

    caseStudies: {
      title: "أعمال مختارة",
      intro:
        "ارتباطات مجهولة الهوية. تم حذف الأسماء والأرقام والتفاصيل المعرّفة احترامًا لسرية العملاء.",
      items: [
        {
          title: "ممارسة تدريب أصبحت نظام ذكاء اصطناعي تشغيلي",
          summary:
            "سنوات من المنهجية — التقييمات، الأطر، ومنطق التقدم — تحولت إلى مدرب ذكاء اصطناعي تكيفي يُخصّص لكل مستخدم دون فقدان صوت الممارس.",
          highlights: [
            "تم تسجيل المنهجية كموجّهات منظمة وقواعد قرار",
            "تتبع حالة المستخدم عبر الجلسات",
            "الممارس يبقى مصدر الحقيقة؛ النظام يوسّع الوصول",
          ],
        },
        {
          title: "مكتبة مرجعية لمؤسس، أصبحت قابلة للاستعلام",
          summary:
            "عقد من ملاحظات المؤسس وقراراته وأطره — كانت متناثرة عبر الملفات والتطبيقات — توحدت خلف نظام RAG خاص يمكن الوصول إليه من أي مكان.",
          highlights: [
            "إدخال من مصادر متنوعة عبر الملاحظات والمستندات والصادرات",
            "ضبط الاسترجاع لسياق القرار، لا للأسئلة العامة",
            "نشر خاص مع وصول من الهاتف",
          ],
        },
        {
          title: "سير عمل داخلي أُعيد بناؤه حول وكيل محلي",
          summary:
            "عملية قرار متكررة، كانت تعتمد سابقًا على خبير واحد، تحولت إلى وكيل محلي يصوغ ويقيّم ويوجّه العمل — مع مراجعة الخبير بدلًا من الكتابة من الصفر.",
          highlights: [
            "الخبرة مُرمّزة كمعايير تقييم، لا كقوالب ساكنة",
            "وكيل محلي أولًا، دون عرض بيانات لأطراف ثالثة",
            "ينتقل الخبير من كاتب إلى مراجع",
          ],
        },
      ],
    },

    founder: {
      title: "بقيادة المؤسس",
      name: FOUNDER.displayName,
      role: FOUNDER.role.ar,
      credentialsLabel: "الخلفية",
      body: "AITransforms استوديو بقيادة المؤسس. كل ارتباط عمل يتشكل بالخبرة الهندسية العملية والتعرض المباشر للجوانب التقنية والإنسانية للتحول إلى الذكاء الاصطناعي.",
      credentials: [
        "ماجستير في هندسة الحاسوب",
        "٢٠ سنة خبرة في البرمجة",
        "مشاريع ذكاء اصطناعي للأعمال عبر التدريب والمعرفة وأنظمة الوكلاء الخاصة",
        "خبرة مباشرة في تدريب الذكاء الاصطناعي — تحويل المنهجية إلى أدوات تكيفية",
      ],
    },

    resources: {
      title: "موارد",
      intro:
        "مقالات وأطر وملاحظات من الاستوديو. مكتبة صغيرة قيد التكوين.",
      items: [
        {
          title: "المقالات",
          summary:
            "كتابات قصيرة حول أنماط التحول إلى الذكاء الاصطناعي وما يُطلق فعلاً.",
        },
        {
          title: "الأطر",
          summary:
            "هياكل قابلة لإعادة الاستخدام لربط معرفة الأعمال بأنظمة الذكاء الاصطناعي.",
        },
        {
          title: "خرائط الطريق",
          summary: "ملاحظات عامة حول أولوياتنا وسببها.",
        },
        {
          title: "ملاحظات تقنية",
          summary: "تفاصيل التنفيذ من ارتباطات حقيقية، مجهولة الهوية.",
        },
      ],
      note: "أولى الكتابات قريبًا.",
    },

    cta: {
      title: "مستعد لترى ما يستطيع عقل أعمالك فعله؟",
      body: "ابدأ بمراجعة تحول الذكاء الاصطناعي. سنرسم ما يستحق التحويل إلى ذكاء اصطناعي، وما هو غير جاهز بعد، وأين تكمن أعلى رافعة بناء.",
      primaryCta: { label: "تقدّم للمراجعة", href: APPLY_HREF_AR },
    },

    footer: {
      brand: BRAND,
      tagline: "نحوّل عقل الأعمال إلى أنظمة ذكاء اصطناعي عملية.",
      contactLabel: "تواصل مع AITransforms",
      contactHref: PRIMARY_CTA_HREF,
      copyright: COPYRIGHT,
    },
  },
} as const;

export type Locale = keyof typeof siteContent;
export type SiteContent = (typeof siteContent)[Locale];

export const locales: readonly Locale[] = ["en", "fa", "ar"] as const;
export const defaultLocale: Locale = "en";

export function localePath(locale: Locale): "/" | "/fa" | "/ar" {
  return locale === "en" ? "/" : `/${locale}`;
}
