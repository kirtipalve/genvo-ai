import { Header } from "@/app/components/Header";
import { Hero } from "@/app/components/Hero";
import { Features } from "@/app/components/Features";
import { HowItWorks } from "@/app/components/HowItWorks";
import { CliSection } from "@/app/components/CliSection";
import { CTA } from "@/app/components/CTA";
import { Footer } from "@/app/components/Footer";

export function Landing() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <CliSection />
      <CTA />
      <Footer />
    </div>
  );
}
