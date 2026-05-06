import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Will Call, Delivery & Setup | Accel Event Rentals",
  description:
    "Three ways to get your rentals to your event: pick up at our Honolulu warehouse, schedule delivery, or add full setup and breakdown. Hours, fees, and what's included.",
};

export default function WillCallDeliverySetupPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f7f7f7] pt-[140px] pb-20" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <section className="max-w-[900px] mx-auto px-6 sm:px-8 text-center py-10 sm:py-16">
          <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#999]">
            <Link href="/resources" className="hover:text-[#ff6c0e] transition-colors">Resources</Link>
            <span className="mx-2 text-[#ccc]">/</span>
            <span className="text-[#ff6c0e]">Will Call, Delivery &amp; Setup</span>
          </p>
          <h1 className="mt-4 text-[#111] font-bold leading-[1.05]" style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
            How your rentals get there<span style={{ color: "#ff6c0e" }}>.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-[16px] leading-[1.7] text-[#555]">
            Three options, depending on your event size, site, and budget. You can mix them. For example, deliver tents and tables while you pick up smaller items yourself.
          </p>
        </section>

        <section className="max-w-[900px] mx-auto px-4 sm:px-8 space-y-12">
          <article className="rounded-2xl border border-[#e5e5e5] bg-white p-6 sm:p-10">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h2 className="text-[#111] font-bold text-[24px] sm:text-[28px]">Will Call (you pick up)</h2>
              <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#ff6c0e]">No delivery fee</span>
            </div>
            <p className="mt-4 text-[15px] leading-[1.7] text-[#555]">
              You&apos;re welcome to pick your order up at our warehouse and return it the same way. Will Call orders skip both the delivery fee and any portage fee that would apply at your event site.
            </p>
            <ul className="mt-6 space-y-3 text-[15px] leading-[1.7] text-[#333]">
              <li><strong>Where:</strong> Our Honolulu warehouse, 1299 Kaumualii Street.</li>
              <li><strong>Hours:</strong> Monday–Friday, 9am–3pm HST. Showroom by appointment.</li>
              <li><strong>Loading help:</strong> Our team will help load items into your vehicle and unload them on return.</li>
              <li><strong>Pickup &amp; return timing:</strong> Coordinated with our sales team when you book — call <a href={`tel:${SITE.phone.replace(/\D/g, "")}`} className="font-semibold text-[#111] underline-offset-4 hover:underline">{SITE.phone}</a> or email <a href={`mailto:${SITE.email}`} className="font-semibold text-[#111] underline-offset-4 hover:underline">{SITE.email}</a>.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-[#e5e5e5] bg-white p-6 sm:p-10">
            <h2 className="text-[#111] font-bold text-[24px] sm:text-[28px]">Delivery</h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-[#555]">
              We deliver across Oahu. Share as many details about the delivery location as you can up front (parking, building access, where the rentals will live) so our team arrives with the right truck and equipment.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-[15px] leading-[1.7] text-[#555]">
              <div>
                <h3 className="text-[#111] font-semibold text-[16px]">Fees</h3>
                <p className="mt-2">Round-trip delivery fees range from <strong>$60–$300</strong> depending on where the delivery is going on island. The exact amount is confirmed with your quote.</p>
              </div>
              <div>
                <h3 className="text-[#111] font-semibold text-[16px]">Portage</h3>
                <p className="mt-2">Additional portage fees may apply when access is harder than a ground-level drop, e.g. an upper-floor delivery or a long carry of 200 ft or more from where the truck can park.</p>
              </div>
              <div>
                <h3 className="text-[#111] font-semibold text-[16px]">Someone on site</h3>
                <p className="mt-2">A representative needs to be present so our driver and crew can complete the checkout walk-through. If that&apos;s not possible, contact us in advance to reschedule the delivery window.</p>
              </div>
              <div>
                <h3 className="text-[#111] font-semibold text-[16px]">Rental period</h3>
                <p className="mt-2">The standard rental period is 24 hours. Delivery and return times can be flexible based on product availability. Confirm timing with your Event Rental Specialist when you book.</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#e5e5e5] bg-white p-6 sm:p-10">
            <h2 className="text-[#111] font-bold text-[24px] sm:text-[28px]">Setup &amp; breakdown</h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-[#555]">
              Many of our items include setup and breakdown in the rental price. Equipment that doesn&apos;t require special tools or skills to set up has additional cost associated.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[#e5e5e5] p-5">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#ff6c0e]">Setup included</h3>
                <ul className="mt-3 space-y-2 text-[15px] leading-[1.6] text-[#333]">
                  <li>Tents</li>
                  <li>Cabanas</li>
                  <li>Dance floors</li>
                </ul>
                <p className="mt-3 text-[13px] text-[#888]">And similar items that require tools or specialty install.</p>
              </div>
              <div className="rounded-xl border border-[#e5e5e5] p-5">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#999]">Setup by request</h3>
                <ul className="mt-3 space-y-2 text-[15px] leading-[1.6] text-[#333]">
                  <li>Tables</li>
                  <li>Chairs</li>
                </ul>
                <p className="mt-3 text-[13px] text-[#888]">And other items that don&apos;t need tools to set up.</p>
              </div>
            </div>

            <p className="mt-8 text-[14px] text-[#888]">
              For any item not listed here, or to add setup as a service, please inquire with sales. Call <a href={`tel:${SITE.phone.replace(/\D/g, "")}`} className="font-semibold text-[#111] underline-offset-4 hover:underline">{SITE.phone}</a> or email <a href={`mailto:${SITE.email}`} className="font-semibold text-[#111] underline-offset-4 hover:underline">{SITE.email}</a>.
            </p>
          </article>

          <div className="text-center">
            <p className="text-[15px] text-[#555] mb-5">Want a tailored quote with delivery and setup priced in?</p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white bg-[#111] hover:bg-[#ff6c0e] transition-colors"
              style={{ borderRadius: 0 }}
            >
              Request a quote
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
