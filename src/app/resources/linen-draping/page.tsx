import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Linen Draping Guide | Accel Event Rentals",
  description:
    "A quick visual reference for how common linen sizes drape over round tables and highboys.",
};

export default function LinenDrapingPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f7f7f7] pt-[140px] pb-20" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <section className="max-w-[900px] mx-auto px-6 sm:px-8 text-center py-10 sm:py-16">
          <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#999]">
            <Link href="/resources" className="hover:text-[#ff6c0e] transition-colors">Resources</Link>
            <span className="mx-2 text-[#ccc]">/</span>
            <span className="text-[#ff6c0e]">Linen Draping</span>
          </p>
          <h1 className="mt-4 text-[#111] font-bold leading-[1.05]" style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
            How your linen will hang<span style={{ color: "#ff6c0e" }}>.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-[16px] leading-[1.7] text-[#555]">
            A quick visual reference for how our most-used linen sizes drape over round tables and highboys.
          </p>
        </section>

        <section className="max-w-[900px] mx-auto px-4 sm:px-8 space-y-12">
          <article className="rounded-2xl border border-[#e5e5e5] bg-white p-6 sm:p-10">
            <div className="overflow-hidden rounded-xl bg-[#f7f7f7]">
              <Image
                src="/images/resources/linen-draping.png"
                alt="Linen draping reference showing 6-ft, 5-ft, and 4-ft round tables with 90, 108, 120, and 132 inch linens, plus two 2.5-ft highboy variants"
                width={1376}
                height={768}
                className="w-full h-auto"
                priority
              />
            </div>
          </article>

          <div className="text-center">
            <p className="text-[15px] text-[#555] mb-5">Need help picking a linen for your tables?</p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white bg-[#111] hover:bg-[#ff6c0e] transition-colors"
              style={{ borderRadius: 0 }}
            >
              Talk to our linens team
            </Link>
            <p className="mt-4 text-[13px] text-[#888]">
              Or call <a href={`tel:${SITE.phone.replace(/\D/g, "")}`} className="font-semibold text-[#111] underline-offset-4 hover:underline">{SITE.phone}</a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
