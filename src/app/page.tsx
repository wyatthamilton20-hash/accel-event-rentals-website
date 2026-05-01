import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { OnTrendSection } from "@/components/OnTrendSection";
import { WelcomeSection } from "@/components/WelcomeSection";
import { FeaturedEventsSection } from "@/components/FeaturedEventsSection";
import { SocialSection } from "@/components/SocialSection";
import { EmailSignupSection } from "@/components/EmailSignupSection";
import { Footer } from "@/components/Footer";
import { SectionMarker } from "@/components/SectionMarker";

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
