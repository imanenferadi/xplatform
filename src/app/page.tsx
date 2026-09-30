import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { MentorShowcase } from "@/components/landing/MentorShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MentorVetting } from "@/components/landing/MentorVetting";
import { WhySection } from "@/components/landing/WhySection";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { SiteFooter } from "@/components/landing/SiteFooter";

// Mentors first: pick a mentor, placement is optional (after sign-up).
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <MentorShowcase />
        <HowItWorks />
        <MentorVetting />
        <WhySection />
        <PricingPreview />
        <FAQSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
