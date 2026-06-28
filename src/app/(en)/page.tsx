import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Framework from "@/components/Framework";
import Services from "@/components/Services";
import AgentSpotlight from "@/components/AgentSpotlight";
import CaseStudies from "@/components/CaseStudies";
import Founder from "@/components/Founder";
import ResourcesTeaser from "@/components/ResourcesTeaser";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { siteContent } from "@/content/site";
import { moduleLinks } from "@/content/modules";

const t = siteContent.en;

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  openGraph: {
    title: t.meta.title,
    description: t.meta.description,
    url: "/",
    siteName: "AITransforms",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: t.meta.title,
    description: t.meta.description,
  },
};

export default function HomePage() {
  return (
    <>
      <Header
        nav={t.nav}
        currentLocale="en"
        cta={{ label: t.hero.primaryCta.label, href: t.hero.primaryCta.href }}
      />
      <main className="flex-1">
        <Hero t={t.hero} />
        <Problem t={t.problem} />
        <Framework t={t.framework} />
        <Services t={t.services} />
        <AgentSpotlight t={t.agentSpotlight} />
        <CaseStudies
          t={t.caseStudies}
          more={{ label: "View detailed work", href: "/work" }}
        />
        <Founder t={t.founder} />
        <ResourcesTeaser t={t.resources} />
        <CTA t={t.cta} />
      </main>
      <Footer
        t={t.footer}
        columns={[
          {
            heading: t.nav.services,
            links: [
              { label: t.nav.services, href: "#services" },
              { label: t.nav.work, href: "#work" },
              { label: t.nav.process, href: "#process" },
            ],
          },
          {
            heading: t.nav.process,
            links: moduleLinks("en", ""),
          },
          {
            heading: t.nav.contact,
            links: [
              { label: t.footer.contactLabel, href: t.footer.contactHref },
            ],
          },
        ]}
      />
    </>
  );
}
