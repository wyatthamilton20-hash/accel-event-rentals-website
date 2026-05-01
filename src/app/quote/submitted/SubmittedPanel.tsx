"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SITE } from "@/lib/site-config";

export function SubmittedPanel() {
  const params = useSearchParams();
  const quoteId = params.get("id") ?? "";

  return (
    <section className="max-w-[720px] mx-auto px-6 sm:px-8">
      <div className="rounded-2xl bg-white border border-[#e5e5e5] p-8 sm:p-12 text-center">
        <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#ff6c0e]">
          Mahalo
        </p>
        <h1
          className="mt-3 text-[#111] font-bold leading-[1.1]"
          style={{ fontSize: "clamp(28px, 4.5vw, 40px)" }}
        >
          We got your request<span style={{ color: "#ff6c0e" }}>.</span>
        </h1>

        {quoteId && (
          <p className="mt-4 inline-block rounded-full bg-[#f7f7f7] px-4 py-2 text-[13px] font-semibold text-[#111]">
            Reference: <span className="text-[#ff6c0e]">{quoteId}</span>
          </p>
        )}

        <p className="mt-6 text-[15px] text-[#555] leading-relaxed">
          A team member will be in touch within one business day with
          availability, pricing, and next steps. Keep this reference number
          handy if you need to call or email us in the meantime — it helps us
          find your request fast.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="rounded-full bg-[#111] px-6 py-3 text-[14px] font-bold text-white hover:opacity-90 transition-opacity"
          >
            Back to home
          </Link>
          <Link
            href="/rentals/tents"
            className="rounded-full border border-[#111] px-6 py-3 text-[14px] font-bold text-[#111] hover:bg-[#111] hover:text-white transition-colors"
          >
            Keep browsing
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#eee] text-[13px] text-[#666]">
          <p>Need to reach us directly?</p>
          <p className="mt-2">
            <a
              href={`mailto:${SITE.email}`}
              className="font-semibold text-[#111] hover:text-[#ff6c0e] transition-colors"
            >
              {SITE.email}
            </a>
            <span className="mx-2 text-[#ccc]">·</span>
            <a
              href={`tel:${SITE.phone.replace(/\D/g, "")}`}
              className="font-semibold text-[#111] hover:text-[#ff6c0e] transition-colors"
            >
              {SITE.phone}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
