import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About | Accel Event Rentals",
  description:
    "Hawaii's premier event rental company, serving Oahu and Maui with premium tents, furnishings, and tabletop collections for weddings, corporate events, and celebrations.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f7f7f7] pt-[140px] pb-20">
        <section className="relative h-[320px] sm:h-[420px] overflow-hidden">
          <Image
            src="/images/hero/3.jpg"
            alt="Accel Event Rentals"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
          <div className="relative z-10 flex h-full items-center justify-center text-center px-6">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-white/80">
                Our Story
              </p>
              <h1 className="mt-3 text-white font-bold leading-[1.05]"
                  style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
                Hawaii&apos;s go-to for<br />beautiful events<span style={{ color: "#ff6c0e" }}>.</span>
              </h1>
              <p className="mt-5 text-[14px] sm:text-[16px] font-semibold tracking-[0.3em] text-white/90 uppercase">
                {SITE.tagline}
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-[900px] mx-auto px-6 sm:px-8 py-16 sm:py-20">
          <p className="text-[18px] sm:text-[20px] leading-[1.7] text-[#222]">
            As Hawaii&apos;s premier go-to for all event rental needs, Accel
            Event Rentals is dedicated to successful events. Through impeccable
            customer service, Hawaii vendors know Accel Events &amp; Tents is
            there for them — from intimate beachfront weddings on Oahu to
            large-scale corporate galas on Maui.
          </p>
          <p className="mt-6 text-[16px] sm:text-[18px] leading-[1.7] text-[#444]">
            Our inventory of tents, furnishings, tabletop, and decor is
            hand-curated for island style, and our team obsesses over the
            details so you don&apos;t have to. As the largest event rental
            company on Oahu, we show up with the rentals, the expertise, and
            the aloha to make every occasion unforgettable.
          </p>

          <div className="mt-14 grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-[16px] font-bold uppercase tracking-[0.2em] text-[#111]">Laulima</p>
              <p className="text-[14px] text-[#666] mt-2">Working together</p>
            </div>
            <div>
              <p className="text-[16px] font-bold uppercase tracking-[0.2em] text-[#111]">Ho&apos;okipa</p>
              <p className="text-[14px] text-[#666] mt-2">Hospitality</p>
            </div>
            <div>
              <p className="text-[16px] font-bold uppercase tracking-[0.2em] text-[#111]">Pono</p>
              <p className="text-[14px] text-[#666] mt-2">Doing what&apos;s right</p>
            </div>
          </div>
        </section>

        <section className="max-w-[1100px] mx-auto px-6 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/hero/5.jpg"
                alt="Event rental setup"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-[#111] font-bold leading-[1.1]"
                  style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>
                What we do<span style={{ color: "#ff6c0e" }}>.</span>
              </h2>
              <p className="mt-5 text-[16px] leading-[1.75] text-[#444]">
                Weddings, corporate events, birthdays, anniversaries — whatever
                the occasion, we show up with the rentals, the expertise, and
                the aloha to make it unforgettable. Browse our catalog, build
                a quote, and our team will follow up personally to confirm
                availability and details.
              </p>
              <Link
                href="/rentals/tents"
                className="inline-block mt-8 px-8 py-4 rounded-full bg-[#ff6c0e] text-white text-[14px] font-bold tracking-wider transition-colors hover:bg-[#e55d00]"
              >
                SHOP RENTALS
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-[1100px] mx-auto px-6 sm:px-8 mt-20">
          <h2 className="text-center text-[#111] font-bold leading-[1.1]"
              style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>
            Visit a showroom<span style={{ color: "#ff6c0e" }}>.</span>
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 gap-6">
            {SITE.locations.map((loc) => (
              <div key={loc.name} className="rounded-2xl border border-[#e5e5e5] bg-white p-8">
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">
                  {loc.island}
                </p>
                <h3 className="mt-1 text-[22px] font-bold text-[#111]">{loc.name}</h3>
                <p className="mt-3 text-[14px] leading-[1.7] text-[#555] whitespace-pre-line">
                  {loc.address}
                </p>
                <p className="mt-3 text-[14px] text-[#555]">
                  <a href={`tel:${loc.phone.replace(/\D/g, "")}`} className="hover:text-[#111]">
                    {loc.phone}
                  </a>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-4 rounded-full border-2 border-[#ff6c0e] text-[#ff6c0e] text-[14px] font-bold tracking-wider transition-colors hover:bg-[#ff6c0e] hover:text-white"
            >
              CONTACT US
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
