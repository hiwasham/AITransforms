// /apply page content, locale-keyed. Mirrors the shape of src/content/site.ts:
// three top-level locale keys (en / fa / ar), each holding the same nested
// shape. Components consume a per-locale slice via the t prop. `as const`
// preserves literal narrowing so the union type ApplyContent works across
// locales.
//
// For the form's language radio, options are ordered with the page's own
// language first so the form's lazy initializer can default to options[0].

export const applyContent = {
  en: {
    meta: {
      title: "Apply for an AI Transformation Review — AITransforms",
      description:
        "Apply for a structured review of how your business can turn knowledge, documents, workflows, and decisions into practical AI systems.",
    },

    hero: {
      eyebrow: "AI Transformation Review",
      title: "Apply for an AI Transformation Review",
      subtitle:
        "A structured review that maps how your business can turn knowledge, documents, workflows, and decisions into practical AI systems — and where the highest-leverage build actually lives.",
      primaryCta: { label: "Start application", href: "#form" },
      secondaryCta: { label: "See how it works", href: "#process" },
      note: "Reviewed manually by Hiwa. No automated funnel.",
    },

    problem: {
      title: "AI tools fail without business context.",
      body: "Generic AI products are designed for the open web — not for your strategy, your documents, your team's decision patterns. The gap between what a business knows and what its tools can act on is where most AI initiatives stall.",
      points: [
        {
          title: "Knowledge is scattered.",
          body: "Documents live across drives, chats, inboxes, and people's heads. AI tools can't reason over context they can't reach.",
        },
        {
          title: "Workflows are undocumented.",
          body: "The way decisions actually get made is rarely written down. Without that structure, automation produces shallow output.",
        },
        {
          title: "Generic AI doesn't know your business.",
          body: "ChatGPT can write. It can't recall your pricing logic, your sales playbook, your client history, or how your team makes calls.",
        },
      ],
    },

    diagnostic: {
      eyebrow: "Business Brain Readiness Check",
      title: "Five signals we look for.",
      intro:
        "The review covers five dimensions of AI readiness. Each one tells us whether to map, structure, build, or wait.",
      itemLabel: "Diagnostic",
      items: [
        {
          title: "Context clarity",
          body: "How well-defined are the decisions, frameworks, and knowledge that drive day-to-day work? The more implicit the business, the more mapping comes first.",
        },
        {
          title: "Document readiness",
          body: "Do the documents that matter — SOPs, playbooks, frameworks, customer history — exist in a form AI can ingest? Source quality directly shapes retrieval quality.",
        },
        {
          title: "Workflow structure",
          body: "Are repeated decisions visible as steps, or do they live inside one person's head? Structured workflows convert into AI assistants; tribal workflows don't.",
        },
        {
          title: "AI opportunity fit",
          body: "Where does AI actually move the needle — and where would it be a distraction? Not every business problem is an AI problem.",
        },
        {
          title: "Deployment constraints",
          body: "Privacy, infrastructure, mobile access, and team adoption all shape what's buildable. The review surfaces these before architecture is committed.",
        },
      ],
    },

    whatWeReview: {
      title: "What the review covers.",
      intro:
        "Seven surfaces of your business that the review examines for AI opportunities and bottlenecks.",
      items: [
        "Documents and PDFs",
        "Workflows and SOPs",
        "Decision patterns",
        "Customer and support knowledge",
        "Internal expertise",
        "AI CEO Assistant potential",
        "RAG and knowledge architecture opportunities",
      ],
    },

    whoThisIsFor: {
      title: "Who this is for.",
      intro:
        "The review is built for businesses with valuable knowledge but no clear AI architecture.",
      items: [
        {
          title: "Founders",
          body: "Operating with deep context that hasn't been captured anywhere outside their head.",
        },
        {
          title: "Small teams",
          body: "Where one or two people carry most of the institutional knowledge.",
        },
        {
          title: "Expert-led businesses",
          body: "Whose value comes from a methodology, a framework, or a way of thinking.",
        },
        {
          title: "Consultants and coaches",
          body: "With frameworks they want to productize into adaptive AI tools.",
        },
        {
          title: "Knowledge-rich operators",
          body: "Whose business already runs on accumulated decisions and documents but who haven't yet decided how AI should fit in.",
        },
      ],
    },

    afterApply: {
      title: "After you apply.",
      intro: "A short, practical process. No sales funnel.",
      steps: [
        {
          number: "01",
          title: "You describe the business context",
          body: "The application below captures what your business does, what knowledge already exists, and where the biggest bottleneck is.",
        },
        {
          number: "02",
          title: "Hiwa reviews the AI opportunities and bottlenecks",
          body: "Applications are reviewed manually — no automation, no AI screening. The goal is to identify whether and where AI moves the needle.",
        },
        {
          number: "03",
          title: "You receive a practical next-step recommendation",
          body: "A short, written recommendation: what's worth turning into AI, what isn't ready yet, and where the highest-leverage build lives.",
        },
      ],
    },

    form: {
      eyebrow: "Application",
      title: "Tell us about the business.",
      intro: "All fields are read by Hiwa. No automated processing.",
      submitLabel: "Send application",
      fallbackNote: "Or email us directly at iranfluent.com@gmail.com.",
      successNote:
        "Your email app should open with the application details pre-filled. If it does not open, please email us directly at iranfluent.com@gmail.com.",
      fields: {
        name: { label: "Name" },
        email: { label: "Email" },
        company: { label: "Company or project" },
        website: { label: "Website", help: "Optional" },
        helpWith: {
          label: "What do you want AI to help with?",
          placeholder:
            "Decisions, workflows, knowledge, products — whatever's on your mind.",
        },
        existing: {
          label: "What knowledge, docs, or workflows already exist?",
          placeholder:
            "Documents, frameworks, methodologies, SOPs, customer data, anything captured today.",
        },
        bottleneck: {
          label: "What is the biggest bottleneck?",
          placeholder:
            "Where does the business slow down, repeat itself, or depend on a single person?",
        },
        interests: {
          label: "Interested in",
          help: "Choose any that fit.",
          options: [
            "Business Brain Mapping",
            "RAG / Knowledge Architecture",
            "AI CEO Assistant",
            "AI Coaching / Productization",
          ],
        },
        language: {
          label: "Preferred language",
          options: ["English", "Persian", "Arabic"],
        },
        consent: {
          label: "I consent to be contacted about this application.",
        },
      },
    },

    reassurance: {
      title: "What we don't do.",
      points: [
        "No automated spam.",
        "No fake sales funnel.",
        "Applications are reviewed manually.",
        "The first goal is to identify a practical next step — not to sell an engagement.",
      ],
    },
  },

  fa: {
    meta: {
      title: "درخواست بازبینی تحول هوش مصنوعی — AITransforms",
      description:
        "درخواست برای بازبینی ساختاریافته‌ای که نشان می‌دهد چگونه کسب‌وکار شما می‌تواند دانش، اسناد، گردش‌های کاری و تصمیم‌ها را به سیستم‌های عملی هوش مصنوعی تبدیل کند.",
    },

    hero: {
      eyebrow: "بازبینی تحول هوش مصنوعی",
      title: "درخواست بازبینی تحول هوش مصنوعی",
      subtitle:
        "بازبینی ساختاریافته‌ای که نگاشت می‌کند چگونه کسب‌وکار شما می‌تواند دانش، اسناد، گردش‌های کاری و تصمیم‌ها را به سیستم‌های عملی هوش مصنوعی تبدیل کند — و کجا بالاترین اهرم ساخت واقعاً قرار دارد.",
      primaryCta: { label: "شروع درخواست", href: "#form" },
      secondaryCta: { label: "ببینید چگونه کار می‌کند", href: "#process" },
      note: "به‌صورت دستی توسط هیوا بررسی می‌شود. بدون قیف فروش خودکار.",
    },

    problem: {
      title: "ابزارهای هوش مصنوعی بدون زمینه کسب‌وکار شکست می‌خورند.",
      body: "محصولات عمومی هوش مصنوعی برای وب باز طراحی شده‌اند — نه برای استراتژی شما، اسناد شما، الگوهای تصمیم‌گیری تیم شما. فاصله‌ای که بین آنچه یک کسب‌وکار می‌داند و آنچه ابزارهایش می‌توانند انجام دهند وجود دارد، جایی است که بیشتر طرح‌های هوش مصنوعی متوقف می‌شوند.",
      points: [
        {
          title: "دانش پراکنده است.",
          body: "اسناد در درایوها، چت‌ها، صندوق‌های ایمیل و ذهن افراد زندگی می‌کنند. ابزارهای هوش مصنوعی نمی‌توانند بر زمینه‌ای که نمی‌توانند به آن دسترسی پیدا کنند استدلال کنند.",
        },
        {
          title: "گردش‌های کاری مستند نیستند.",
          body: "روش واقعی تصمیم‌گیری به‌ندرت نوشته می‌شود. بدون آن ساختار، اتوماسیون خروجی سطحی تولید می‌کند.",
        },
        {
          title: "هوش مصنوعی عمومی، کسب‌وکار شما را نمی‌شناسد.",
          body: "ChatGPT می‌تواند بنویسد. اما نمی‌تواند منطق قیمت‌گذاری شما، راهنمای فروش، تاریخچه مشتری یا روش واقعی تصمیم‌گیری تیم را به یاد بیاورد.",
        },
      ],
    },

    diagnostic: {
      eyebrow: "بررسی آمادگی مغز کسب‌وکار",
      title: "پنج نشانه‌ای که بررسی می‌کنیم.",
      intro:
        "بازبینی پنج بُعد آمادگی هوش مصنوعی را پوشش می‌دهد. هر یک به ما می‌گوید آیا باید نقشه‌برداری کنیم، ساختاردهی کنیم، بسازیم یا صبر کنیم.",
      itemLabel: "تشخیص",
      items: [
        {
          title: "شفافیت زمینه",
          body: "تصمیم‌ها، چارچوب‌ها و دانشی که کار روزانه را پیش می‌برند چقدر شفاف تعریف شده‌اند؟ هرچه کسب‌وکار ضمنی‌تر باشد، نقشه‌برداری ابتدا اهمیت بیشتری دارد.",
        },
        {
          title: "آمادگی اسناد",
          body: "آیا اسناد مهم — SOPها، راهنماها، چارچوب‌ها، تاریخچه مشتری — به شکلی وجود دارند که هوش مصنوعی بتواند آن‌ها را وارد کند؟ کیفیت منبع مستقیماً بر کیفیت بازیابی تأثیر می‌گذارد.",
        },
        {
          title: "ساختار گردش کاری",
          body: "آیا تصمیم‌های تکراری به‌عنوان مراحل قابل مشاهده‌اند، یا در ذهن یک نفر زندگی می‌کنند؟ گردش‌های کاری ساختاریافته به دستیارهای هوش مصنوعی تبدیل می‌شوند؛ گردش‌های قبیله‌ای نه.",
        },
        {
          title: "تناسب فرصت هوش مصنوعی",
          body: "هوش مصنوعی واقعاً کجا تفاوت ایجاد می‌کند — و کجا حواس‌پرتی است؟ هر مسئله کسب‌وکار، مسئله هوش مصنوعی نیست.",
        },
        {
          title: "محدودیت‌های استقرار",
          body: "حریم خصوصی، زیرساخت، دسترسی از موبایل و پذیرش تیم همگی شکل می‌دهند چه چیزی قابل ساخت است. بازبینی این‌ها را قبل از تعهد به معماری آشکار می‌کند.",
        },
      ],
    },

    whatWeReview: {
      title: "بازبینی چه چیزی را پوشش می‌دهد.",
      intro:
        "هفت سطح از کسب‌وکار شما که بازبینی برای فرصت‌ها و گلوگاه‌های هوش مصنوعی بررسی می‌کند.",
      items: [
        "اسناد و PDFها",
        "گردش‌های کاری و SOPها",
        "الگوهای تصمیم‌گیری",
        "دانش مشتری و پشتیبانی",
        "تخصص داخلی",
        "پتانسیل دستیار AI CEO",
        "فرصت‌های RAG و معماری دانش",
      ],
    },

    whoThisIsFor: {
      title: "برای چه کسی است.",
      intro:
        "بازبینی برای کسب‌وکارهایی ساخته شده که دانش ارزشمند دارند اما معماری هوش مصنوعی روشنی ندارند.",
      items: [
        {
          title: "بنیان‌گذاران",
          body: "که با زمینه عمیقی کار می‌کنند که در جایی خارج از ذهنشان ثبت نشده.",
        },
        {
          title: "تیم‌های کوچک",
          body: "که در آن یک یا دو نفر بیشتر دانش سازمانی را حمل می‌کنند.",
        },
        {
          title: "کسب‌وکارهای متخصص‌محور",
          body: "که ارزش‌شان از یک متدولوژی، یک چارچوب یا یک روش تفکر می‌آید.",
        },
        {
          title: "مشاوران و مربیان",
          body: "با چارچوب‌هایی که می‌خواهند به ابزارهای تطبیقی هوش مصنوعی تبدیل کنند.",
        },
        {
          title: "اپراتورهای دانش‌محور",
          body: "که کسب‌وکارشان روی تصمیم‌ها و اسناد انباشته‌شده اجرا می‌شود اما هنوز تصمیم نگرفته‌اند هوش مصنوعی چگونه باید جا بگیرد.",
        },
      ],
    },

    afterApply: {
      title: "بعد از درخواست.",
      intro: "یک فرآیند کوتاه و عملی. بدون قیف فروش.",
      steps: [
        {
          number: "۰۱",
          title: "شما زمینه کسب‌وکار را توصیف می‌کنید",
          body: "فرم پایین می‌گیرد که کسب‌وکار شما چه می‌کند، چه دانشی از قبل وجود دارد و بزرگ‌ترین گلوگاه کجاست.",
        },
        {
          number: "۰۲",
          title: "هیوا فرصت‌ها و گلوگاه‌های هوش مصنوعی را بررسی می‌کند",
          body: "درخواست‌ها به‌صورت دستی بررسی می‌شوند — بدون اتوماسیون، بدون غربالگری توسط هوش مصنوعی. هدف این است که مشخص شود آیا و کجا هوش مصنوعی تفاوت ایجاد می‌کند.",
        },
        {
          number: "۰۳",
          title: "شما یک توصیه عملی برای گام بعدی دریافت می‌کنید",
          body: "یک توصیه نوشتاری کوتاه: چه چیزی ارزش تبدیل شدن به هوش مصنوعی را دارد، چه چیزی هنوز آماده نیست، و بالاترین اهرم ساخت کجاست.",
        },
      ],
    },

    form: {
      eyebrow: "درخواست",
      title: "درباره کسب‌وکار به ما بگویید.",
      intro: "همه فیلدها توسط هیوا خوانده می‌شوند. بدون پردازش خودکار.",
      submitLabel: "ارسال درخواست",
      fallbackNote: "یا مستقیماً به iranfluent.com@gmail.com ایمیل بزنید.",
      successNote:
        "برنامه ایمیل شما باید با اطلاعات درخواست از پیش پر شده باز شود. اگر باز نشد، لطفاً مستقیماً به iranfluent.com@gmail.com ایمیل بزنید.",
      fields: {
        name: { label: "نام" },
        email: { label: "ایمیل" },
        company: { label: "شرکت یا پروژه" },
        website: { label: "وب‌سایت", help: "اختیاری" },
        helpWith: {
          label: "می‌خواهید هوش مصنوعی در چه چیزی کمک کند؟",
          placeholder:
            "تصمیم‌ها، گردش‌های کاری، دانش، محصولات — هر چه در ذهن دارید.",
        },
        existing: {
          label: "چه دانش، اسناد یا گردش‌های کاری از قبل وجود دارد؟",
          placeholder:
            "اسناد، چارچوب‌ها، متدولوژی‌ها، SOPها، داده مشتری، هر چه امروز ثبت شده.",
        },
        bottleneck: {
          label: "بزرگ‌ترین گلوگاه چیست؟",
          placeholder:
            "کجا کسب‌وکار کند می‌شود، خودش را تکرار می‌کند، یا به یک نفر وابسته است؟",
        },
        interests: {
          label: "علاقه‌مند به",
          help: "هر کدام را که مناسب است انتخاب کنید.",
          options: [
            "نقشه‌برداری مغز کسب‌وکار",
            "RAG / معماری دانش",
            "دستیار AI CEO",
            "کوچینگ / محصول‌سازی هوش مصنوعی",
          ],
        },
        language: {
          label: "زبان ترجیحی",
          options: ["فارسی", "انگلیسی", "عربی"],
        },
        consent: {
          label: "موافقت می‌کنم که در مورد این درخواست با من تماس گرفته شود.",
        },
      },
    },

    reassurance: {
      title: "آنچه ما انجام نمی‌دهیم.",
      points: [
        "بدون اسپم خودکار.",
        "بدون قیف فروش جعلی.",
        "درخواست‌ها به‌صورت دستی بررسی می‌شوند.",
        "اولین هدف شناسایی یک گام عملی بعدی است — نه فروش یک همکاری.",
      ],
    },
  },

  ar: {
    meta: {
      title: "تقدّم لمراجعة تحول الذكاء الاصطناعي — AITransforms",
      description:
        "تقدّم لمراجعة منظمة لكيفية تحويل عملك للمعرفة والوثائق وسير العمل والقرارات إلى أنظمة ذكاء اصطناعي عملية.",
    },

    hero: {
      eyebrow: "مراجعة تحول الذكاء الاصطناعي",
      title: "تقدّم لمراجعة تحول الذكاء الاصطناعي",
      subtitle:
        "مراجعة منظمة ترسم كيف يمكن لعملك تحويل المعرفة والوثائق وسير العمل والقرارات إلى أنظمة ذكاء اصطناعي عملية — وأين تكمن أعلى رافعة بناء فعلاً.",
      primaryCta: { label: "ابدأ التقديم", href: "#form" },
      secondaryCta: { label: "شاهد كيف يعمل", href: "#process" },
      note: "تتم المراجعة يدويًا من قبل هيوا. بدون قمع مبيعات آلي.",
    },

    problem: {
      title: "تفشل أدوات الذكاء الاصطناعي بدون سياق العمل.",
      body: "صُممت منتجات الذكاء الاصطناعي العامة للويب المفتوح — وليس لاستراتيجيتك، أو وثائقك، أو أنماط قرارات فريقك. الفجوة بين ما يعرفه العمل وما يمكن لأدواته التصرف بناءً عليه هي حيث تتعثر معظم مبادرات الذكاء الاصطناعي.",
      points: [
        {
          title: "المعرفة متناثرة.",
          body: "تعيش الوثائق عبر الأقراص والمحادثات وصناديق البريد ورؤوس الأشخاص. لا تستطيع أدوات الذكاء الاصطناعي الاستدلال على سياق لا تستطيع الوصول إليه.",
        },
        {
          title: "سير العمل غير موثق.",
          body: "نادرًا ما تُكتب الطريقة الفعلية لاتخاذ القرارات. بدون هذا الهيكل، تنتج الأتمتة مخرجات سطحية.",
        },
        {
          title: "الذكاء الاصطناعي العام لا يعرف عملك.",
          body: "ChatGPT يستطيع الكتابة. لكنه لا يستطيع تذكّر منطق التسعير لديك، أو دليل المبيعات، أو تاريخ العملاء، أو كيفية اتخاذ فريقك للقرارات.",
        },
      ],
    },

    diagnostic: {
      eyebrow: "فحص جاهزية عقل الأعمال",
      title: "خمس إشارات نبحث عنها.",
      intro:
        "تغطي المراجعة خمسة أبعاد لجاهزية الذكاء الاصطناعي. كل واحد يخبرنا ما إذا كنا نرسم، نهيكل، نبني، أم ننتظر.",
      itemLabel: "تشخيص",
      items: [
        {
          title: "وضوح السياق",
          body: "ما مدى وضوح القرارات والأطر والمعرفة التي تقود العمل اليومي؟ كلما كان العمل أكثر ضمنية، كان الرسم أولاً أكثر أهمية.",
        },
        {
          title: "جاهزية الوثائق",
          body: "هل توجد الوثائق المهمة — إجراءات التشغيل، الأدلة، الأطر، تاريخ العملاء — بصيغة يمكن للذكاء الاصطناعي استيعابها؟ جودة المصدر تشكّل جودة الاسترجاع مباشرة.",
        },
        {
          title: "هيكل سير العمل",
          body: "هل القرارات المتكررة مرئية كخطوات، أم تعيش داخل رأس شخص واحد؟ سير العمل المنظم يتحول إلى مساعدين ذكيين؛ سير العمل القبلي لا.",
        },
        {
          title: "ملاءمة فرصة الذكاء الاصطناعي",
          body: "أين يحدث الذكاء الاصطناعي فعلاً فرقًا — وأين سيكون مجرد تشتيت؟ ليست كل مشكلة عمل هي مشكلة ذكاء اصطناعي.",
        },
        {
          title: "قيود النشر",
          body: "الخصوصية، البنية التحتية، الوصول من الهاتف، وتبني الفريق كلها تشكل ما يمكن بناؤه. المراجعة تكشف هذه قبل الالتزام بالبنية.",
        },
      ],
    },

    whatWeReview: {
      title: "ما تغطيه المراجعة.",
      intro:
        "سبعة أسطح من عملك تفحصها المراجعة لاكتشاف فرص الذكاء الاصطناعي والاختناقات.",
      items: [
        "الوثائق وملفات PDF",
        "سير العمل وإجراءات التشغيل",
        "أنماط القرارات",
        "معرفة العملاء والدعم",
        "الخبرة الداخلية",
        "إمكانات مساعد AI CEO",
        "فرص RAG وهيكلة المعرفة",
      ],
    },

    whoThisIsFor: {
      title: "لمن هذا.",
      intro:
        "المراجعة مبنية للأعمال التي لديها معرفة قيمة لكن دون بنية ذكاء اصطناعي واضحة.",
      items: [
        {
          title: "المؤسسون",
          body: "الذين يعملون بسياق عميق لم يُسجَّل في أي مكان خارج رؤوسهم.",
        },
        {
          title: "الفرق الصغيرة",
          body: "حيث يحمل شخص أو شخصان معظم المعرفة المؤسسية.",
        },
        {
          title: "الأعمال بقيادة الخبراء",
          body: "التي تأتي قيمتها من منهجية، أو إطار، أو طريقة تفكير.",
        },
        {
          title: "المستشارون والمدربون",
          body: "بأطر يريدون تحويلها إلى أدوات ذكاء اصطناعي تكيفية.",
        },
        {
          title: "المشغلون الأغنياء بالمعرفة",
          body: "الذين تعمل أعمالهم بالفعل على قرارات ووثائق متراكمة لكنهم لم يقرروا بعد كيف يجب أن يندمج الذكاء الاصطناعي.",
        },
      ],
    },

    afterApply: {
      title: "بعد التقديم.",
      intro: "عملية قصيرة وعملية. بدون قمع مبيعات.",
      steps: [
        {
          number: "٠١",
          title: "تصف سياق العمل",
          body: "النموذج أدناه يلتقط ما يفعله عملك، وما المعرفة الموجودة بالفعل، وأين أكبر اختناق.",
        },
        {
          number: "٠٢",
          title: "هيوا يراجع فرص الذكاء الاصطناعي والاختناقات",
          body: "تتم مراجعة الطلبات يدويًا — لا أتمتة، لا فرز بالذكاء الاصطناعي. الهدف تحديد ما إذا كان الذكاء الاصطناعي يحدث فرقًا وأين.",
        },
        {
          number: "٠٣",
          title: "تتلقى توصية عملية للخطوة التالية",
          body: "توصية مكتوبة قصيرة: ما يستحق التحويل إلى ذكاء اصطناعي، وما هو غير جاهز بعد، وأين تكمن أعلى رافعة بناء.",
        },
      ],
    },

    form: {
      eyebrow: "التقديم",
      title: "أخبرنا عن العمل.",
      intro: "جميع الحقول يقرأها هيوا. بدون معالجة آلية.",
      submitLabel: "إرسال التقديم",
      fallbackNote: "أو راسلنا مباشرة على iranfluent.com@gmail.com.",
      successNote:
        "يجب أن يفتح تطبيق البريد الإلكتروني لديك مع تفاصيل التقديم معبأة مسبقًا. إذا لم يفتح، يرجى مراسلتنا مباشرة على iranfluent.com@gmail.com.",
      fields: {
        name: { label: "الاسم" },
        email: { label: "البريد الإلكتروني" },
        company: { label: "الشركة أو المشروع" },
        website: { label: "الموقع الإلكتروني", help: "اختياري" },
        helpWith: {
          label: "في ماذا تريد أن يساعد الذكاء الاصطناعي؟",
          placeholder:
            "القرارات، سير العمل، المعرفة، المنتجات — أي شيء يدور في ذهنك.",
        },
        existing: {
          label: "ما المعرفة أو الوثائق أو سير العمل الموجود بالفعل؟",
          placeholder:
            "الوثائق، الأطر، المنهجيات، إجراءات التشغيل، بيانات العملاء، أي شيء مسجل اليوم.",
        },
        bottleneck: {
          label: "ما أكبر اختناق؟",
          placeholder:
            "أين يبطئ العمل، أو يكرر نفسه، أو يعتمد على شخص واحد؟",
        },
        interests: {
          label: "مهتم بـ",
          help: "اختر أي خيار يناسب.",
          options: [
            "تخطيط عقل الأعمال",
            "RAG / هيكلة المعرفة",
            "مساعد AI CEO",
            "تدريب / تحويل الذكاء الاصطناعي إلى منتج",
          ],
        },
        language: {
          label: "اللغة المفضلة",
          options: ["العربية", "الإنجليزية", "الفارسية"],
        },
        consent: {
          label: "أوافق على التواصل معي بشأن هذا التقديم.",
        },
      },
    },

    reassurance: {
      title: "ما لا نفعله.",
      points: [
        "بدون رسائل مزعجة آلية.",
        "بدون قمع مبيعات وهمي.",
        "تتم مراجعة الطلبات يدويًا.",
        "الهدف الأول هو تحديد خطوة عملية تالية — وليس بيع ارتباط.",
      ],
    },
  },
} as const;

export type ApplyLocale = keyof typeof applyContent;
export type ApplyContent = (typeof applyContent)[ApplyLocale];
