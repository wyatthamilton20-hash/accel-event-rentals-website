import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { OnTrendSection } from "@/components/OnTrendSection";
import { WelcomeSection } from "@/components/WelcomeSection";
import { FeaturedEventsSection } from "@/components/FeaturedEventsSection";
import { SocialSection } from "@/components/SocialSection";
import { EmailSignupSection } from "@/components/EmailSignupSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <HeroCarousel />
      <main className="relative z-10 bg-[#f7f7f7]">
        <OnTrendSection />
        <WelcomeSection />
        <FeaturedEventsSection />
        <SocialSection />
        <EmailSignupSection />
      </main>
      <Footer />
    </>
  );
}
