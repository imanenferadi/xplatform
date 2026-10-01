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
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND } from "@/lib/brand";
import { landingFaqs } from "@/lib/landing-faq";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/seo";

// Mentors first: pick a mentor, placement is optional (after sign-up).
export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: BRAND,
              url: SITE_URL,
              logo: `${SITE_URL}/icons/icon-512.png`,
              description: SITE_DESCRIPTION,
            },
            {
              "@type": "WebSite",
              name: BRAND,
              url: SITE_URL,
              inLanguage: "fa",
            },
            {
              "@type": "FAQPage",
              mainEntity: landingFaqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }}
      />
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
