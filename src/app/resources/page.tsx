import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Resources | Accel Event Rentals",
  description:
    "Planning guides, FAQs, and tips from Accel Event Rentals. Everything you need to plan your event with confidence on Oahu.",
};

interface Resource {
  title: string;
  subtitle: string;
  href: string;
  /** Highlights the tile in brand orange (vs. the default dark slate). */
  accent?: boolean;
}

const RESOURCES: Resource[] = [
  { title: "FAQ's",                            subtitle: "A handy list of commonly asked questions.",                  href: "/resources/faqs", accent: true },
  { title: "Tent Resource Guide",              subtitle: "Choose the right tent for your event.",                      href: "/resources/tent-guide" },
  { title: "Will Call, Delivery & Setup",      subtitle: "Pickup, drop-off, and on-site setup. All your options.",    href: "/resources/will-call-delivery-setup" },
  { title: "Linen Draping Guide",              subtitle: "See how your linens will hang on various table sizes.",      href: "/resources/linen-draping" },
  { title: "Linen Sizing Guide",               subtitle: "Find the right linen size for every table.",                 href: "/resources/linen-sizing" },
  { title: "Table Seating Guide",              subtitle: "Choose the right tables and setup for a comfortable event.", href: "/resources/table-seating" },
];

export default function ResourcesPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f7f7f7] pt-[140px] pb-20" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <section className="max-w-[1200px] mx-auto px-6 sm:px-8 text-center py-10 sm:py-16">
          <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#999]">
            Resources
          </p>
          <h1
            className="mt-4 text-[#111] font-bold leading-[1.05]"
            style={{ fontSize: "clamp(36px, 6vw, 72px)" }}
          >
            Plan with confidence<span style={{ color: "#ff6c0e" }}>.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-[16px] leading-[1.7] text-[#555]">
            Guides, FAQs, and quick references from our team, built up over thousands of
            Oahu events. Tap any tile to dig in.
          </p>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {RESOURCES.map((r) => {
              const bg = r.accent ? "#ff6c0e" : "#111";
              return (
                <Link
                  key={r.title}
                  href={r.href}
                  className="group relative flex flex-col items-center justify-center rounded-2xl px-8 py-12 sm:py-16 text-center transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6c0e] focus-visible:ring-offset-2"
                  style={{ backgroundColor: bg, minHeight: 240 }}
                >
                  <h3 className="text-white font-bold tracking-tight" style={{ fontSize: "clamp(22px, 2.6vw, 30px)" }}>
                    {r.title}
                  </h3>
                  <p className="mt-3 text-white/85 text-[14px] sm:text-[15px] max-w-[420px] leading-[1.55]">
                    {r.subtitle}
                  </p>
                  <span
                    className="mt-6 inline-block px-7 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white border-[1.5px] border-white transition-colors group-hover:bg-white"
                    style={{ borderRadius: 0 }}
                  >
                    <span className="group-hover:text-[color:var(--card-bg)]" style={{ ["--card-bg" as string]: bg } as React.CSSProperties}>
                      Read More
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
