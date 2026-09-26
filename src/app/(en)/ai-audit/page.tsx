import type { Metadata } from "next";
import Wordmark from "@/components/Wordmark";
import AuditControls from "@/components/ai-audit/AuditControls";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Free AI Readiness Audit | AITransforms",
  description:
    "Choose a customer path, diagnose lifecycle friction and AI readiness gaps, and leave with practical next steps.",
  alternates: { canonical: "/ai-audit" },
  openGraph: {
    title: "Free AI Readiness Audit | AITransforms",
    description: "Find the right AI starting point in your customer lifecycle.",
    url: "/ai-audit",
  },
};

const benefits = [
  ["Find the friction that matters", "Pinpoint where a customer path slows down, loses context, repeats work, or creates an inconsistent customer experience."],
  ["Know what to fix before AI", "Separate responsible AI opportunities from ownership, documentation, data, review, or handoff problems that should be solved first."],
  ["Leave with a practical report", "Get a clear diagnosis with readiness gaps, priority actions, quick wins, and one recommended next step."],
];

const paths = [
  ["Market to Lead", "How attention becomes qualified interest."],
  ["Lead to Sale", "How qualified interest becomes closed business."],
  ["Sale to Delivery", "How customers are handed off and onboarded."],
  ["Delivery to Success", "How results drive retention and expansion."],
  ["Success to Market", "How customer outcomes create proof and demand."],
  ["Success to Lead", "How relationships create qualified opportunities."],
];

const reportItems = [
  ["Lifecycle success definition", "A plain-English view of what the selected customer path should achieve."],
  ["Current workflow snapshot", "A start-to-finish summary of movement, handoffs, delays, and outcomes."],
  ["Bottlenecks and risk signals", "A grounded diagnosis of delays, rework, context loss, and visibility gaps."],
  ["AI opportunity areas", "Specific places AI could improve speed, quality, consistency, or decisions."],
  ["Process fixes before automation", "Ownership, documentation, data, or review work that should happen first."],
  ["Priority order and next step", "A practical sequence of quick wins, readiness gaps, and the next move."],
];

const steps = [
  ["Submit the short form", "Share your company, website, name, and email so we can prepare the audit handoff."],
  ["Choose the lifecycle path", "Select the customer path creating the most friction and answer focused questions."],
  ["Review the recommended next step", "Use the diagnosis to decide what to fix, document, or automate first."],
];

const faqs = [
  ["What do I get at the end?", "A focused audit summary covering workflow friction, AI opportunities, process fixes, readiness gaps, priorities, and a recommended next step."],
  ["Which customer path should I choose?", "Start with the path creating the most friction now: lead generation, sales, onboarding, delivery, retention, referrals, or another path."],
  ["Can I run more than one audit?", "Yes. Each review stays focused on one lifecycle path so the diagnosis remains specific and useful."],
  ["Do I need to know where AI should go?", "No. The audit helps determine whether AI is useful or whether process, ownership, data, or documentation should be fixed first."],
  ["Is this a generic business audit?", "No. It stays anchored to one selected customer lifecycle rather than becoming a broad software or department inventory."],
  ["Is this a sales call?", "No. The first step is a focused written handoff. Any deeper support is optional and based on the practical next step."],
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className={styles.eyebrow}>{children}</p>;
}

function PrimaryCta() {
  return (
    <a className={styles.primaryCta} href="#apply">
      Get my free AI audit <span aria-hidden="true">→</span>
    </a>
  );
}

export default function AiAuditPage() {
  return (
    <main className={styles.page}>
      <a className={styles.skip} href="#main-content">Skip to main content</a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Wordmark href="/" size="lg" />
          <nav aria-label="Primary" className={styles.desktopNav}>
            <a href="#why">Why run it</a>
            <a href="#paths">Audit paths</a>
            <a href="#report">Report preview</a>
            <a className={styles.navCta} href="#apply">Get my free AI audit</a>
          </nav>
          <AuditControls />
        </div>
      </header>

      <section id="main-content" className={styles.hero}>
        <div className={styles.heroGrid} />
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <Eyebrow>Free AI audit</Eyebrow>
          <h1>
            Find the right AI starting point in your{" "}
            <span>customer lifecycle</span>
          </h1>
          <p className={styles.heroCopy}>
            Choose a customer path, diagnose what is working, what is breaking,
            and where AI can responsibly help. Then leave with practical next steps.
          </p>
          <PrimaryCta />
          <div className={styles.proofRow}>
            <span>✓ Choose the path to audit</span>
            <span>✓ Diagnose bottlenecks and readiness gaps</span>
            <span>✓ Get priority next steps</span>
          </div>
          <p className={styles.heroNote}>
            The guided review keeps the scope focused on one customer path. You
            can repeat it later for another lifecycle.
          </p>
        </div>
      </section>

      <section id="why" className={styles.section}>
        <div className={`${styles.container} ${styles.split}`}>
          <div className={styles.sectionLead}>
            <Eyebrow>Why run it</Eyebrow>
            <h2>AI works better when the customer path is clear first.</h2>
            <p>
              Most teams feel pressure to automate, but their customer paths
              already contain messy handoffs, unclear ownership, repeated work,
              lost context, or reporting gaps. Fix the right friction first so
              AI improves the lifecycle instead of accelerating a broken process.
            </p>
          </div>
          <div className={styles.benefitStack}>
            {benefits.map(([title, copy]) => (
              <article className={styles.benefitCard} key={title}>
                <span className={styles.miniIcon}>↗</span>
                <div><h3>{title}</h3><p>{copy}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="paths" className={styles.darkSection}>
        <div className={styles.container}>
          <div className={styles.centerLead}>
            <Eyebrow>Choose the path to audit next</Eyebrow>
            <h2>Start where the customer journey is creating the most friction.</h2>
            <p>
              Use a customer lifecycle path as the unit of analysis. Choose the
              path that matters now, or name another path in your message.
            </p>
          </div>
          <div className={styles.pathGrid}>
            {paths.map(([title, copy], index) => (
              <article className={styles.pathCard} key={title}>
                <span>{index + 1}</span><h3>{title}</h3><p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="report" className={`${styles.section} ${styles.softSection}`}>
        <div className={styles.container}>
          <div className={styles.centerLead}>
            <Eyebrow>Report preview</Eyebrow>
            <h2>Know what your free AI audit will show.</h2>
            <p>
              Get a practical diagnosis of the path you choose, plus the
              improvement opportunities and next steps that matter most.
            </p>
          </div>
          <div className={styles.reportGrid}>
            {reportItems.map(([title, copy], index) => (
              <article className={styles.reportCard} key={title}>
                <span className={styles.reportIcon}>{["◎", "↔", "△", "✦", "□", "▥"][index]}</span>
                <h3>{title}</h3><p>{copy}</p>
              </article>
            ))}
          </div>
          <div className={styles.centerAction}><PrimaryCta /></div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.centerLead}>
            <Eyebrow>How it works</Eyebrow>
            <h2>Start with the path that needs attention now.</h2>
            <p>
              You do not need to overhaul the whole company. Begin with one
              path, answer focused questions, and choose a practical next step.
            </p>
          </div>
          <div className={styles.stepGrid}>
            {steps.map(([title, copy], index) => (
              <article className={styles.stepCard} key={title}>
                <span>{index + 1}</span><h3>{title}</h3><p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className={styles.applySection}>
        <div className={styles.container}>
          <div className={styles.applyLead}>
            <Eyebrow>Get your free report</Eyebrow>
            <h2>Get a practical AI audit for the customer path you choose.</h2>
            <p>
              Send the short form through your email client. We will use it to
              prepare the focused audit handoff. This page does not claim a
              server submission it cannot verify.
            </p>
          </div>
          <div className={styles.applyGrid}>
            <form className={styles.form} action="mailto:hello@aitransforms.ir" method="post" encType="text/plain">
              <div className={styles.formRow}>
                <label>Company<input name="company" autoComplete="organization" required /></label>
                <label>Website<input name="website" type="url" placeholder="https://" autoComplete="url" required /></label>
              </div>
              <div className={styles.formRow}>
                <label>Name<input name="name" autoComplete="name" required /></label>
                <label>Email<input name="email" type="email" autoComplete="email" required /></label>
              </div>
              <label>
                Customer path to audit
                <select name="customer-path" defaultValue="" required>
                  <option value="" disabled>Choose a path</option>
                  {paths.map(([title]) => <option value={title} key={title}>{title}</option>)}
                  <option value="Other">Another customer path</option>
                </select>
              </label>
              <label>
                What is creating friction?
                <textarea name="friction" rows={4} placeholder="Briefly describe the handoff, delay, repeated work, or visibility gap." required />
              </label>
              <label className={styles.consent}>
                <input name="consent" type="checkbox" required />
                <span>I agree to send these details to AITransforms for the purpose of preparing this audit handoff.</span>
              </label>
              <button type="submit">Open email to request my audit →</button>
              <p className={styles.formNote}>Your email app will open with these details. You choose whether to send the message.</p>
            </form>

            <div className={styles.applyAside}>
              <article>
                <Eyebrow>Why this works</Eyebrow>
                <h3>Specific beats a generic AI wish list.</h3>
                <p>
                  The audit stays narrow enough to be useful. It separates
                  responsible AI opportunities from the process, ownership,
                  data, and documentation work that should happen first.
                </p>
                <ul>
                  <li>Start with the path creating the most friction.</li>
                  <li>Map where work slows down or loses context.</li>
                  <li>Prioritize the next improvement before automating.</li>
                </ul>
              </article>
              <article className={styles.nextCard}>
                <h3>What happens next</h3>
                <ol>
                  <li>Send the prepared email from your own email client.</li>
                  <li>We confirm the path and any missing context.</li>
                  <li>You receive a focused review and practical next step.</li>
                </ol>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.centerLead}>
            <Eyebrow>Questions before you start</Eyebrow>
            <h2>Clear expectations before you begin.</h2>
            <p>The audit is practical and focused, even if you are still unsure where AI belongs in the business.</p>
          </div>
          <div className={styles.faqGrid}>
            {faqs.map(([question, answer]) => (
              <details className={styles.faqCard} key={question}>
                <summary>{question}</summary><p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.newsletter}>
        <div className={`${styles.container} ${styles.newsletterInner}`}>
          <div>
            <Eyebrow>AITransforms field notes</Eyebrow>
            <h2>Build your business brain.</h2>
            <p>Practical notes on AI readiness, operating systems, and turning business knowledge into useful AI systems.</p>
          </div>
          <form action="mailto:hello@aitransforms.ir?subject=AITransforms%20Field%20Notes" method="post" encType="text/plain" className={styles.newsletterForm}>
            <div>
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <input id="newsletter-email" name="email" type="email" placeholder="Email address" required />
              <button type="submit">Subscribe</button>
            </div>
            <label className={styles.newsConsent}>
              <input type="checkbox" required />
              <span>I consent to send this subscription request by email.</span>
            </label>
          </form>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div>
              <Wordmark href="/" size="sm" />
              <p>Turning business knowledge, workflows, and documents into practical AI systems.</p>
            </div>
            <div><h3>Explore</h3><a href="/work">Work</a><a href="/apply">AI transformation review</a></div>
            <div><h3>Contact</h3><a href="mailto:hello@aitransforms.ir">hello@aitransforms.ir</a></div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 AITransforms. All rights reserved.</span>
            <span>Authorized migration capability proof.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
