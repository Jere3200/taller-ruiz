import { Hero } from "@/components/landing/Hero";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { BrandMarquee, Contact, HowItWorks, Services, Testimonials, WhyUs } from "@/components/landing/Sections";

// Static page: no data from the API, so it is prerendered at build time.
export default function Home() {
  return (
    <>
      <LandingHeader />
      <main>
        <Hero />
        <BrandMarquee />
        <Services />
        <HowItWorks />
        <WhyUs />
        <Testimonials />
        <Contact />
      </main>
      <LandingFooter />
    </>
  );
}
