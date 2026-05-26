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

const t = siteContent.ar;

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
};

export default function HomePageAr() {
  return (
    <>
      <Header nav={t.nav} currentLocale="ar" />
      <main className="flex-1">
        <Hero t={t.hero} />
        <Problem t={t.problem} />
        <Framework t={t.framework} />
        <Services t={t.services} />
        <AgentSpotlight t={t.agentSpotlight} />
        <CaseStudies t={t.caseStudies} />
        <Founder t={t.founder} />
        <ResourcesTeaser t={t.resources} />
        <CTA t={t.cta} />
      </main>
      <Footer t={t.footer} />
    </>
  );
}
