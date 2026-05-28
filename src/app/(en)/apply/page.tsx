import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApplyHero from "@/components/apply/ApplyHero";
import ApplyProblem from "@/components/apply/ApplyProblem";
import Diagnostic from "@/components/apply/Diagnostic";
import WhatWeReview from "@/components/apply/WhatWeReview";
import WhoThisIsFor from "@/components/apply/WhoThisIsFor";
import AfterApply from "@/components/apply/AfterApply";
import ApplyForm from "@/components/apply/ApplyForm";
import Reassurance from "@/components/apply/Reassurance";
import { siteContent } from "@/content/site";
import { applyContent } from "@/content/apply";

const t = applyContent.en;

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
};

export default function ApplyPage() {
  return (
    <>
      <Header nav={siteContent.en.nav} currentLocale="en" />
      <main className="flex-1">
        <ApplyHero t={t.hero} />
        <ApplyProblem t={t.problem} />
        <Diagnostic t={t.diagnostic} />
        <WhatWeReview t={t.whatWeReview} />
        <WhoThisIsFor t={t.whoThisIsFor} />
        <AfterApply t={t.afterApply} />
        <ApplyForm t={t.form} />
        <Reassurance t={t.reassurance} />
      </main>
      <Footer t={siteContent.en.footer} />
    </>
  );
}
