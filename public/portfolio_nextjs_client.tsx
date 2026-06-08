'use client'

import { useState } from 'react'
import AnimateIn from '@/components/AnimateIn'
import type { PROJECTS } from './page'

type Project = (typeof PROJECTS)[number]

const CATS = [
  { id: 'all',        label: 'All Projects' },
  { id: 'automation', label: 'Business Automation' },
  { id: 'revenue',    label: 'Revenue Tools' },
  { id: 'knowledge',  label: 'Knowledge Systems' },
  { id: 'analytics',  label: 'Analytics' },
  { id: 'agents',     label: 'AI Agents' },
] as const

const DIFFICULTY_STYLES: Record<string, string> = {
  'Intermediate': 'bg-[#E6F1FB] text-[#185FA5] border-[#85B7EB]',
  'Advanced':     'bg-[#EEEDFE] text-[#534AB7] border-[#AFA9EC]',
  'Expert':       'bg-[#FCEBEB] text-[#A32D2D] border-[#F09595]',
}

export default function PortfolioClient({ projects }: { projects: typeof PROJECTS }) {
  const [cat, setCat] = useState<string>('all')

  const visible = cat === 'all' ? projects : projects.filter(p => p.cat === cat)
  const featured = projects[0] // EMPOWER OS always featured when 'all', else first of category
  const rest = visible.filter(p => p.id !== featured.id || cat !== 'all')

  return (
    <>
      {/* FILTER BAR */}
      <div className="py-9 px-6 flex justify-center gap-2 flex-wrap">
        {CATS.map(c => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`text-[0.82rem] font-medium px-4 py-2 rounded-full border transition-all duration-150
              ${cat === c.id
                ? 'bg-zinc-950 text-white border-zinc-950'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900'
              }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* FEATURED */}
      {cat === 'all' && (
        <div className="max-w-[1160px] mx-auto px-6 pb-12">
          <p className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-zinc-500 mb-3">
            Flagship project
          </p>
          <div className="bg-zinc-950 text-white rounded-2xl p-10 grid md:grid-cols-2 gap-10 items-center relative overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(37,99,235,.2), transparent 70%)' }} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-500/18 border border-blue-500/30
                text-blue-400 text-[0.7rem] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
                ★ Flagship · Knowledge Systems
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-4">
                EMPOWER OS — Business Documentation System
              </h2>
              <p className="text-zinc-400 leading-[1.72] mb-6">
                The full documentation infrastructure that transforms any business from
                founder-dependent to AI-augmented. Eight core processes mapped four levels
                deep, connected to a Master Prompt engine that makes every AI interaction
                specific, accurate, and on-brand.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-7">
                {['Next.js 14','Supabase','Claude API','OpenAI GPT-4','n8n','Notion API','Zapier'].map(t => (
                  <span key={t} className="bg-white/8 border border-white/12 text-zinc-300 text-[0.72rem] font-medium px-2.5 py-1 rounded-md">
                    {t}
                  </span>
                ))}
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-green-400 mb-1">Measured outcome</p>
                <p className="text-[1.5rem] font-black tracking-tight text-white">178 businesses systematized</p>
                <p className="text-[0.8rem] text-zinc-400 mt-0.5">Average time from chaos to documented foundation: 5 weeks</p>
              </div>
            </div>

            {/* System monitor visual */}
            <div className="relative z-10 bg-white/4 border border-white/8 rounded-2xl p-7 font-mono hidden md:block">
              <p className="text-[0.68rem] text-zinc-600 tracking-widest uppercase mb-4 font-sans">System health monitor</p>
              {[
                { label: 'Customer Flow', pct: 94 },
                { label: 'Money Flow',    pct: 88 },
                { label: 'People Flow',   pct: 76 },
                { label: 'AI Readiness',  pct: 91 },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 mb-3">
                  <span className="text-blue-400 text-[0.78rem] min-w-[110px]">{row.label}</span>
                  <div className="flex-1 h-[3px] bg-white/6 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${row.pct}%`, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' }} />
                  </div>
                  <span className="text-green-400 text-[0.78rem] min-w-[32px]">{row.pct}%</span>
                </div>
              ))}
              <div className="border-t border-white/6 pt-4 mt-4">
                <p className="text-[0.68rem] text-zinc-600 tracking-widest uppercase mb-3 font-sans">Recent activity</p>
                {[
                  { status: 'done', text: 'SOP auto-generated from Zoom transcript' },
                  { status: 'done', text: 'Master Prompt updated with Q4 positioning' },
                  { status: 'done', text: '3 new Level 3 Guides published' },
                  { status: 'warn', text: 'People Flow — 2 gaps flagged for review' },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-[0.74rem] text-zinc-500 mb-1.5">
                    <span className={a.status === 'done' ? 'text-green-400' : 'text-amber-400'}>
                      {a.status === 'done' ? '✓' : '◎'}
                    </span>
                    {a.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT GRID */}
      <div className="max-w-[1160px] mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((p, i) => (
            <AnimateIn key={p.id} delay={(i % 3 * 100) as 0 | 100 | 200}>
              <ProjectCard project={p} />
            </AnimateIn>
          ))}
        </div>
        {visible.length === 0 && (
          <p className="text-center text-zinc-500 py-20">No projects in this category yet.</p>
        )}
      </div>
    </>
  )
}

function ProjectCard({ project: p }: { project: Project }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col
      hover:shadow-[0_12px_40px_rgba(0,0,0,0.09)] hover:-translate-y-1 hover:border-zinc-300
      transition-all duration-200 cursor-default">

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border"
          style={{ background: p.iconBg, borderColor: p.iconBorder, color: p.iconColor }}>
          <i className={`ti ${p.icon}`} aria-hidden="true" />
        </div>
        <span className={`text-[0.68rem] font-bold tracking-[0.06em] uppercase px-2 py-1 rounded-md border
          ${DIFFICULTY_STYLES[p.difficulty]}`}>
          {p.difficulty}
        </span>
      </div>

      <p className="text-[0.68rem] font-bold tracking-[0.08em] uppercase text-zinc-500 mb-1.5">{p.catLabel}</p>
      <h3 className="font-bold text-[1.05rem] tracking-tight mb-2 leading-snug">{p.title}</h3>
      <p className="text-[0.83rem] text-zinc-600 leading-[1.65] flex-1 mb-4">{p.desc}</p>

      <div className="flex flex-wrap gap-1 mb-4">
        {p.stack.map(t => (
          <span key={t} className="text-[0.68rem] font-medium px-2 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600">
            {t}
          </span>
        ))}
      </div>

      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 mb-3.5">
        <p className="text-[0.65rem] font-bold tracking-[0.1em] uppercase text-zinc-500 mb-0.5">Outcome</p>
        <p className="font-black text-[1.1rem] tracking-tight">{p.outcomeVal}</p>
        <p className="text-[0.72rem] text-zinc-500 mt-0.5">{p.outcomeDesc}</p>
      </div>

      <div className="flex items-center gap-1.5 text-[0.72rem] font-medium text-green-600">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
        {p.status}
      </div>
    </div>
  )
}
