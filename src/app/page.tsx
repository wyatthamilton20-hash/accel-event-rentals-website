import { Header } from "@/components/layout/Header";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { OnTrendSection } from "@/components/sections/OnTrendSection";
import { WelcomeSection } from "@/components/sections/WelcomeSection";
import { FeaturedEventsSection } from "@/components/sections/FeaturedEventsSection";
import { SocialSection } from "@/components/sections/SocialSection";
import { EmailSignupSection } from "@/components/sections/EmailSignupSection";
import { Footer } from "@/components/layout/Footer";
import { SectionMarker } from "@/components/dev/SectionMarker";

export default function Home() {
  return (
    <>
      <Header />
      <div className="relative">
        <SectionMarker num={1} label="Hero" />
        <HeroCarousel />
      </div>
      <main className="relative z-10 bg-[#f7f7f7]">
        <div className="relative">
          <SectionMarker num={2} label="Browse Rentals" />
          <OnTrendSection />
        </div>
        <div className="relative">
          <SectionMarker num={3} label="Welcome" />
          <WelcomeSection />
        </div>
        <div className="relative">
          <SectionMarker num={4} label="Featured Events" />
          <FeaturedEventsSection />
        </div>
        <div className="relative">
          <SectionMarker num={5} label="Social" />
          <SocialSection />
        </div>
        <div className="relative">
          <SectionMarker num={6} label="Newsletter" />
          <EmailSignupSection />
        </div>
      </main>
      <div className="relative">
        <SectionMarker num={7} label="Footer" />
        <Footer />
      </div>
    </>
  );
}
