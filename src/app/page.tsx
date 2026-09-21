import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { WhySection } from "@/components/landing/WhySection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MatchingPreview } from "@/components/landing/MatchingPreview";
import { HumanAiDistinction } from "@/components/landing/HumanAiDistinction";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <WhySection />
        <HowItWorks />
        <MatchingPreview />
        <HumanAiDistinction />
        <PricingPreview />
        <FAQSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
