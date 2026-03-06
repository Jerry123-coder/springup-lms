import { HeroSection } from "@/components/marketing/hero-section";
import { PillarsGrid } from "@/components/marketing/pillars-grid";
import { MissionSection } from "@/components/marketing/mission-section";
import { ImpactSection } from "@/components/marketing/impact-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { CTASection } from "@/components/marketing/cta-section";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <PillarsGrid />
      <MissionSection />
      <ImpactSection />
      <HowItWorks />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
