import Footer from '@/components/Footer'
import AnimateIn from '@/components/AnimateIn'
import PortfolioClient from './PortfolioClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Project Portfolio | Hayden Miyamoto — EMPOWER Labs',
  description: 'Real AI systems built across 30+ businesses. Lead qualification agents, proposal generators, acquisition due diligence AI, and more — all in production.',
}

export const PROJECTS = [
  {
    id: 'lead-qualifier',
    cat: 'revenue',
    catLabel: 'Revenue Tools',
    icon: 'ti-target',
    iconBg: '#EFF6FF', iconBorder: '#BFDBFE', iconColor: '#2563eb',
    title: 'AI Lead Qualifier',
    desc: 'Analyzes Zoom call transcripts in real time and returns a binary qualified/unqualified verdict against a documented ICP scorecard. Eliminates 68% of unqualified calls before they reach a salesperson.',
    stack: ['OpenAI GPT-4o', 'n8n', 'Zapier', 'Vtiger CRM', 'Whisper API'],
    outcomeVal: '68% fewer unqualified calls',
    outcomeDesc: 'Sales team time recovered per week: 12 hours',
    status: 'Live in 3 businesses',
    difficulty: 'Intermediate',
  },
  {
    id: 'proposal-gen',
    cat: 'revenue',
    catLabel: 'Revenue Tools',
    icon: 'ti-file-text',
    iconBg: '#F5F3FF', iconBorder: '#DDD6FE', iconColor: '#7C3AED',
    title: 'AI Proposal Generator',
    desc: 'Discovery call transcript goes in, hyper-personalized proposal comes out in under 20 minutes. Pulls from documented service offerings and client pain points. Replaces an 8–10 hour manual process.',
    stack: ['Claude 3.5 Sonnet', 'n8n', 'Google Docs API', 'Whisper'],
    outcomeVal: '8 hrs → 20 minutes',
    outcomeDesc: 'Close rate improved 31% from faster turnaround',
    status: 'Live in 7 businesses',
    difficulty: 'Intermediate',
  },
  {
    id: 'sop-engine',
    cat: 'knowledge',
    catLabel: 'Knowledge Systems',
    icon: 'ti-clipboard-text',
    iconBg: '#E1F5EE', iconBorder: '#9FE1CB', iconColor: '#0F6E56',
    title: 'Transcript → SOP Engine',
    desc: 'Any Zoom meeting, screen recording, or voice memo gets automatically transcribed and converted into a structured Level 3 SOP. Uses the EMPOWER four-level documentation framework to assign the right depth automatically.',
    stack: ['Whisper API', 'Claude API', 'Notion API', 'n8n', 'Zapier'],
    outcomeVal: '90% faster documentation',
    outcomeDesc: 'Average: 45-min meeting → SOP in 8 minutes',
    status: 'Live — 500+ SOPs generated',
    difficulty: 'Intermediate',
  },
  {
    id: 'due-diligence',
    cat: 'analytics',
    catLabel: 'Analytics',
    icon: 'ti-building-store',
    iconBg: '#FAEEDA', iconBorder: '#FAC775', iconColor: '#633806',
    title: 'Acquisition Due Diligence AI',
    desc: 'Compresses business acquisition due diligence from 3 weeks to 3 days. Analyzes financial statements, operational docs, staff structure, and market position against a 47-point scoring rubric. Returns a buy/pass recommendation with risk flags.',
    stack: ['Claude 3.5', 'Python', 'Airtable', 'PDF parsing', 'Custom scoring'],
    outcomeVal: '3 weeks → 3 days',
    outcomeDesc: 'Used on 12 acquisitions — 4 deals closed faster',
    status: 'Active — 12 acquisitions analyzed',
    difficulty: 'Expert',
  },
  {
    id: 'portfolio-monitor',
    cat: 'analytics',
    catLabel: 'Analytics',
    icon: 'ti-chart-line',
    iconBg: '#EAF3DE', iconBorder: '#C0DD97', iconColor: '#27500A',
    title: 'Portfolio Intelligence Monitor',
    desc: 'Monitors KPIs across 30+ businesses simultaneously. Each morning, AI pulls data from each company\'s systems, flags anomalies against documented thresholds, and delivers a Slack digest ranked by urgency.',
    stack: ['n8n', 'OpenAI', 'Slack API', 'Airtable', 'Stripe API', 'QuickBooks'],
    outcomeVal: '30+ businesses, 1 analyst',
    outcomeDesc: '$180K/yr analyst headcount eliminated',
    status: 'Live — 7 months running',
    difficulty: 'Advanced',
  },
  {
    id: 'content-engine',
    cat: 'automation',
    catLabel: 'Business Automation',
    icon: 'ti-repeat',
    iconBg: '#FBEAF0', iconBorder: '#F4C0D1', iconColor: '#72243E',
    title: 'Content Repurposing Engine',
    desc: 'One raw idea — a voice memo, a framework diagram, a meeting insight — gets transformed into LinkedIn post, email newsletter, Twitter thread, short-form video script, and blog outline. All in brand voice. All in 4 minutes.',
    stack: ['Claude API', 'n8n', 'Beehiiv API', 'Buffer', 'Notion'],
    outcomeVal: '10x content output',
    outcomeDesc: 'Same time investment, 10 formats per idea',
    status: 'Live — personal + 3 client accounts',
    difficulty: 'Intermediate',
  },
  {
    id: 'onboarding-system',
    cat: 'automation',
    catLabel: 'Business Automation',
    icon: 'ti-arrow-bar-right',
    iconBg: '#EFF6FF', iconBorder: '#BFDBFE', iconColor: '#1e40af',
    title: 'AI Client Onboarding System',
    desc: 'New client signed → entire onboarding sequence triggered automatically. Welcome sequence, account setup tasks, training module scheduling, 7-day check-ins, and 30-day milestone reviews — all without a human touching it.',
    stack: ['n8n', 'Airtable', 'Slack', 'Loom API', 'OpenAI', 'Zapier'],
    outcomeVal: '2 weeks → 3 days',
    outcomeDesc: 'Client satisfaction score up 44% post-deploy',
    status: 'Live in 5 businesses',
    difficulty: 'Advanced',
  },
  {
    id: 'scope-guard',
    cat: 'agents',
    catLabel: 'AI Agents',
    icon: 'ti-shield-check',
    iconBg: '#EEEDFE', iconBorder: '#AFA9EC', iconColor: '#3C3489',
    title: 'Contract Scope Guard Agent',
    desc: 'An AI agent that monitors incoming client requests and automatically compares them against documented service offerings. Flags scope creep in real time, categorizes as standard/exception/new service, and drafts the response message.',
    stack: ['Claude API', 'n8n', 'Gmail API', 'Slack', 'Airtable'],
    outcomeVal: 'Zero scope creep incidents',
    outcomeDesc: '$240K in out-of-scope work identified in year 1',
    status: 'Live — monitoring 3 agencies',
    difficulty: 'Advanced',
  },
  {
    id: 'quality-audit',
    cat: 'agents',
    catLabel: 'AI Agents',
    icon: 'ti-eye',
    iconBg: '#FAEEDA', iconBorder: '#EF9F27', iconColor: '#412402',
    title: '24/7 Quality Audit Agent',
    desc: 'An always-on AI auditor that analyzes every support interaction, sales call, and client touchpoint against documented quality standards. Scores each interaction 1–10. Only alerts the manager below threshold — enabling leadership by exception at scale.',
    stack: ['OpenAI Whisper', 'Claude API', 'n8n', 'Slack API', 'Custom rubric'],
    outcomeVal: '700+ interactions/day audited',
    outcomeDesc: 'Founder review time: 0 hrs/week (was 12)',
    status: 'Live — Hamkelasi (700+ schools)',
    difficulty: 'Advanced',
  },
  {
    id: 'crm-agent',
    cat: 'agents',
    catLabel: 'AI Agents',
    icon: 'ti-database',
    iconBg: '#E6F1FB', iconBorder: '#B5D4F4', iconColor: '#0C447C',
    title: 'CRM Enrichment Agent',
    desc: 'After every sales call, an AI agent automatically transcribes the conversation, extracts contact details, pain points, next steps, and deal signals — then pushes everything to the CRM with zero manual input from the salesperson.',
    stack: ['Whisper', 'GPT-4o', 'n8n', 'HubSpot API', 'Vtiger'],
    outcomeVal: '20% of sales day recovered',
    outcomeDesc: 'Data quality up 89% — zero manual CRM entries',
    status: 'Live — 4 sales teams',
    difficulty: 'Intermediate',
  },
  {
    id: 'master-prompt',
    cat: 'knowledge',
    catLabel: 'Knowledge Systems',
    icon: 'ti-brain',
    iconBg: '#E1F5EE', iconBorder: '#5DCAA5', iconColor: '#085041',
    title: 'Master Prompt Engine',
    desc: 'Extracts a company\'s complete Business DNA — ICP, brand voice, pricing logic, competitive positioning, decision frameworks, and cultural values — into a structured, versioned context document that makes every AI interaction 3x more accurate.',
    stack: ['Claude API', 'Next.js', 'Supabase', 'Custom framework'],
    outcomeVal: '3x AI output quality',
    outcomeDesc: 'Measured across 178 business deployments',
    status: 'Core of EMPOWER OS — 178 deployed',
    difficulty: 'Expert',
  },
  {
    id: 'assessment-tool',
    cat: 'analytics',
    catLabel: 'Analytics',
    icon: 'ti-adjustments-horizontal',
    iconBg: '#F5F3FF', iconBorder: '#DDD6FE', iconColor: '#26215C',
    title: 'EMPOWER OS Assessment Tool',
    desc: 'The 7-pillar scoring system that tells any business which processes to document first for maximum AI impact. Evaluates all seven EMPOWER value drivers and outputs a prioritized action roadmap specific to that business.',
    stack: ['Next.js', 'React', 'Supabase', 'Claude API'],
    outcomeVal: '178 roadmaps generated',
    outcomeDesc: 'Avg. documentation priority clarity: 94% reported',
    status: 'Core EMPOWER tool — 178 used',
    difficulty: 'Advanced',
  },
] as const

export default function PortfolioPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-zinc-950 text-white relative overflow-hidden py-24 pb-0 text-center">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 85% 60% at 50% -5%, rgba(37,99,235,.4) 0%, transparent 65%)', animation: 'glowpulse 7s ease-in-out infinite' }} />
        <div className="relative z-10 px-6 pb-16">
          <AnimateIn>
            <div className="inline-flex items-center gap-2 bg-white/7 border border-white/13 rounded-full px-4 py-1.5 text-[0.74rem] font-semibold tracking-[0.06em] uppercase text-zinc-400 mb-7 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_7px_#22c55e] animate-pulse flex-shrink-0" />
              Real AI Systems — Not Demos
            </div>
          </AnimateIn>
          <AnimateIn delay={100}>
            <h1 className="text-4xl md:text-[3.8rem] font-black tracking-[-0.04em] leading-[1.08] max-w-[760px] mx-auto mb-5">
              AI Projects Built{' '}
              <span className="bg-gradient-to-br from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                Across 30+ Businesses
              </span>
            </h1>
          </AnimateIn>
          <AnimateIn delay={200}>
            <p className="text-base text-zinc-400 max-w-[540px] mx-auto leading-[1.75]">
              Every system here runs in production. Each one started with a documented
              process — and became an AI-powered machine. This is what the EMPOWER
              methodology looks like when deployed.
            </p>
          </AnimateIn>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 border-t border-zinc-800 border-b border-zinc-800 flex justify-center flex-wrap">
          {[
            { val: '12+', label: 'AI systems in production' },
            { val: '30+', label: 'Businesses running these systems' },
            { val: '$2M+', label: 'Revenue impact documented' },
            { val: '178',  label: 'Operators trained to replicate' },
          ].map(s => (
            <div key={s.val} className="text-center px-10 py-6 border-r border-zinc-800 last:border-r-0">
              <div className="text-[2rem] font-black leading-none tracking-[-0.04em] text-white">{s.val}</div>
              <div className="text-xs text-zinc-600 mt-1.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive filter + grid — client component */}
      <PortfolioClient projects={PROJECTS} />

      {/* CTA */}
      <div className="bg-zinc-950 text-white py-20 px-6 text-center">
        <AnimateIn>
          <h2 className="text-3xl md:text-[3rem] font-black tracking-[-0.03em] mb-3">
            Want These Systems<br />In Your Business?
          </h2>
          <p className="text-zinc-400 max-w-[500px] mx-auto mb-9 leading-relaxed">
            Every project here started with documented processes. Join the cohort and
            build the foundation that makes AI like this possible in your business.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="/cohort"
              className="bg-white text-zinc-950 font-bold text-base px-7 py-3.5 rounded-xl hover:opacity-88 transition-opacity">
              Join the Live Cohort
            </a>
            <a href="/teams"
              className="bg-transparent text-white border border-white/22 font-semibold text-base px-7 py-3.5 rounded-xl hover:border-white/5 hover:bg-white/7 transition-all">
              Enroll Your Team
            </a>
          </div>
        </AnimateIn>
      </div>

      <Footer />
    </>
  )
}
