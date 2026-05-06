import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Table Seating Guide | Accel Event Rentals",
  description:
    "A quick reference chart for how many guests fit at each table.",
};

export default function TableSeatingPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f7f7f7] pt-[140px] pb-20" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <section className="max-w-[900px] mx-auto px-6 sm:px-8 text-center py-10 sm:py-16">
          <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#999]">
            <Link href="/resources" className="hover:text-[#ff6c0e] transition-colors">Resources</Link>
            <span className="mx-2 text-[#ccc]">/</span>
            <span className="text-[#ff6c0e]">Table Seating</span>
          </p>
          <h1 className="mt-4 text-[#111] font-bold leading-[1.05]" style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
            How many fit at each table<span style={{ color: "#ff6c0e" }}>.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-[16px] leading-[1.7] text-[#555]">
            A quick reference chart for seating capacity by table size.
          </p>
        </section>

        <section className="max-w-[900px] mx-auto px-4 sm:px-8 space-y-12">
          <article className="rounded-2xl border border-[#e5e5e5] bg-white p-6 sm:p-10">
            <div className="overflow-hidden rounded-xl bg-[#f7f7f7]">
              <Image
                src="/images/resources/table-seating.png"
                alt="Table seating sizes chart showing seating capacity for banquet tables and round tables of various sizes"
                width={1214}
                height={880}
                className="w-full h-auto"
                priority
              />
            </div>
          </article>

          <div className="text-center">
            <p className="text-[15px] text-[#555] mb-5">Want us to plan the seating layout for you?</p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white bg-[#111] hover:bg-[#ff6c0e] transition-colors"
              style={{ borderRadius: 0 }}
            >
              Talk to an event specialist
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
