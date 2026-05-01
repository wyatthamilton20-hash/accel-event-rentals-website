import type { Metadata } from "next";
import Link from "next/link";
import { QuoteForm } from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Review your quote",
  description: "Review your event rental request before sending it to our team.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function QuoteReviewPage() {
  return (
    <section className="max-w-[900px] mx-auto px-6 sm:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="text-[13px] font-semibold text-[#666] hover:text-[#111] transition-colors"
        >
          ← Back to browsing
        </Link>
      </div>
      <header className="mb-8">
        <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#999]">
          Step 2 of 2
        </p>
        <h1 className="mt-2 text-[#111] font-bold leading-[1.05]"
            style={{ fontSize: "clamp(32px, 5vw, 48px)" }}>
          Review your quote<span style={{ color: "#ff6c0e" }}>.</span>
        </h1>
        <p className="mt-3 text-[15px] text-[#555] max-w-[640px]">
          Tell us a little about your event and we&apos;ll follow up within one
          business day with availability and pricing.
        </p>
      </header>

      <QuoteForm />
    </section>
  );
}
