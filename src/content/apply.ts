// /apply page content. English-only at this phase — the form's
// "Preferred language" field captures Persian/Arabic visitors. If localized
// /apply/fa and /apply/ar are added later, the schema below can be wrapped
// in a per-locale dictionary mirroring site.ts.

export const applyContent = {
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
} as const;

export type ApplyContent = typeof applyContent;
