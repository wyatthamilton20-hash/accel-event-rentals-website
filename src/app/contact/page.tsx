import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact | Accel Event Rentals",
  description:
    "Get in touch with Accel Event Rentals on Oahu or Maui. Call, email, or visit our showrooms to plan your next event.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f7f7f7] pt-[140px] pb-20">
        <section className="relative h-[280px] sm:h-[360px] overflow-hidden">
          <Image
            src="/images/hero/4.jpg"
            alt="Contact Accel Event Rentals"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex h-full items-center justify-center text-center px-6">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-white/80">
                Let&apos;s talk
              </p>
              <h1 className="mt-3 text-white font-bold leading-[1.05]"
                  style={{ fontSize: "clamp(36px, 6vw, 64px)" }}>
                Contact us<span style={{ color: "#ff6c0e" }}>.</span>
              </h1>
            </div>
          </div>
        </section>

        <section className="max-w-[1100px] mx-auto px-6 sm:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-white border border-[#e5e5e5] p-8 text-center">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">Call</p>
              <a
                href={`tel:${SITE.phone.replace(/\D/g, "")}`}
                className="block mt-3 text-[20px] font-bold text-[#111] hover:opacity-70"
              >
                {SITE.phone}
              </a>
              <p className="mt-2 text-[13px] text-[#666]">Mon–Fri · 8am–5pm HST</p>
            </div>

            <div className="rounded-2xl bg-white border border-[#e5e5e5] p-8 text-center">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">Email</p>
              <a
                href={`mailto:${SITE.email}`}
                className="block mt-3 text-[20px] font-bold text-[#111] hover:opacity-70 break-all"
              >
                {SITE.email}
              </a>
              <p className="mt-2 text-[13px] text-[#666]">We reply within one business day</p>
            </div>

            <div className="rounded-2xl bg-white border border-[#e5e5e5] p-8 text-center">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">Browse</p>
              <Link
                href="/rentals/tents"
                className="block mt-3 text-[20px] font-bold text-[#111] hover:opacity-70"
              >
                Catalog
              </Link>
              <p className="mt-2 text-[13px] text-[#666]">Build a quote online, we&apos;ll follow up</p>
            </div>
          </div>
        </section>

        <section className="max-w-[1100px] mx-auto px-6 sm:px-8 pb-16">
          <h2 className="text-center text-[#111] font-bold leading-[1.1]"
              style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>
            Visit a showroom<span style={{ color: "#ff6c0e" }}>.</span>
          </h2>
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {SITE.locations.map((loc) => (
              <div key={loc.name} className="rounded-2xl border border-[#e5e5e5] bg-white p-8">
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">
                  {loc.island}
                </p>
                <h3 className="mt-1 text-[24px] font-bold text-[#111]">{loc.name}</h3>
                <p className="mt-4 text-[14px] leading-[1.7] text-[#555] whitespace-pre-line">
                  {loc.address}
                </p>
                <p className="mt-3 text-[14px] text-[#555]">
                  <a href={`tel:${loc.phone.replace(/\D/g, "")}`} className="hover:text-[#111]">
                    {loc.phone}
                  </a>
                </p>
                <p className="mt-2 text-[13px] text-[#888]">{loc.hours}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[700px] mx-auto px-6 sm:px-8 text-center">
          <div className="rounded-2xl bg-[#111] text-white p-10 sm:p-14">
            <h2 className="font-bold leading-[1.1]"
                style={{ fontSize: "clamp(24px, 3.5vw, 36px)" }}>
              Ready to start planning<span style={{ color: "#ff6c0e" }}>?</span>
            </h2>
            <p className="mt-4 text-[15px] text-white/80 leading-[1.7]">
              Browse our catalog, add items to a quote, pick your event dates,
              and we&apos;ll check availability. A team member will follow up
              personally to confirm and handle the details.
            </p>
            <Link
              href="/rentals/tents"
              className="inline-block mt-8 px-8 py-4 rounded-full bg-[#ff6c0e] text-white text-[14px] font-bold tracking-wider transition-colors hover:bg-[#e55d00]"
            >
              BROWSE THE CATALOG
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
