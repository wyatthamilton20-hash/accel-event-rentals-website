import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "FAQs | Accel Event Rentals",
  description:
    "Answers to the questions our Oahu clients ask most often: delivery, deposits, setup, rental periods, cancellations, and more.",
};

interface Faq {
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    question: "Is there a delivery fee?",
    answer:
      "Yes. Our delivery fee is based on where the delivery is made on island and ranges from $60–$300. Additional portage fees may apply dependent on the exact location of the delivery and set up (e.g. on the 7th floor of a building, or 200 ft from the nearest drop off location). Please divulge as many details about the delivery location as possible so our team can prepare for your delivery with the correct equipment.",
  },
  {
    question: "I am ready to place my order. What is the best way to do that?",
    answer:
      "Great! The best way to request a quote is to send an email to sales@accelrentals.com with your name and event date in the subject line. Please include the delivery location address as well as your requested date and time of delivery and pick up. Any other details about your order are also appreciated. If you have any particular questions before placing your quote request, feel free to call one of our Event Rental Specialists at 808.484.2258.",
  },
  {
    question: "What happens if I have to cancel my reservation?",
    answer:
      "Please inquire with an Event Rental Specialist if a cancellation is necessary. Per the rental contract, a 50% non-refundable deposit is lost. If you are able to reschedule your event for a different date (based on product availability), we would be happy to assist you moving your order to the newly requested date.",
  },
  {
    question: "How far in advance do I need to reserve equipment for my event?",
    answer:
      "Equipment is reserved on a first come, first served basis. Once you submit a 50% confirmation deposit on your order, those items are reserved for your event date. For high demand items (tenting, linen, specialty/custom items, etc.) the sooner you reserve them, the better chance you have of being able to secure them for your event date.",
  },
  {
    question: "Do I have to be home when the rentals arrive?",
    answer:
      "If you are unable to be home when the rentals arrive, it is important that a representative be present in order for the Accel driver and crew to set up properly and complete the checkout process. If a representative will not be available, please inquire in advance with an Event Rental Specialist to reschedule the delivery window to a more suitable time.",
  },
  {
    question: "Can I extend my rental if I need it longer?",
    answer:
      "If the product is available for an extended rental period, please inquire with an Event Rental Specialist for details on the requested extension. Please note that high demand items may not be available for an extension.",
  },
  {
    question: "Is set up included with the items I rent?",
    answer:
      "Many of our items include set up and breakdown in the rental price (e.g. tents, cabanas, dancefloor). Equipment not requiring special tools or skills to set up has additional cost associated (e.g. tables and chairs). Please inquire with sales to request additional service options.",
  },
  {
    question: "How long is the rental period?",
    answer:
      "The rental period is typically 24 hours before additional charges are incurred. Please inquire with an Event Rental Specialist as delivery and return times may be flexible contingent on availability of the rented product. Discounted rates are available for weekly and monthly rental rates on available product.",
  },
  {
    question: "Can I make changes without being penalized?",
    answer:
      "Changes may be requested, and our Accel team will do our absolute best to fulfill those requests. Product is based on availability so the sooner you reserve it with a confirmation deposit, the more likely we will be able to fulfill your request. If certain custom items are procured particularly for your event, payment is still required to cover those costs.",
  },
  {
    question: "How much is the required deposit in order to reserve the product I want?",
    answer:
      "A 50% non-refundable deposit is required in order to reserve requested rental items. Your order will lock one week prior to your delivery date, at which time items may be added to your order if available, but not removed. Total payment is also due at least one week prior to your delivery date. We highly encourage you to confirm your order further in advance to ensure your desired product is available for your event date.",
  },
  {
    question: "What do I do if something doesn't work?",
    answer:
      "If a rental item is not working properly for its intended use, please call our sales office at 808.484.2258. If you are calling outside of our normal business hours, listen to our voicemail which will provide emergency cell phone numbers for employees that can assist you off hours.",
  },
  {
    question: "Can I pick up and drop off the product to avoid the delivery fee?",
    answer:
      "Yes! We are happy to assist you with loading and unloading items into your vehicle from our warehouse. Will Call orders will save you money on delivery and portage fees.",
  },
  {
    question: "Do I get my money back if I don't use some of the equipment I ordered?",
    answer:
      "Once our rental items are reserved with a confirmation deposit, we remove them from inventory so they are unable to be rented for other potential events. Due to the need for advanced reservation of product, rentals are charged based on reservation of product and not use of product on the event date.",
  },
  {
    question: "What happens if I damage a piece of rental equipment?",
    answer:
      "If a piece of equipment is not working, please call our sales office at 808.484.2258 so we can assist you and provide you with safe next steps. If warranted, we will do our best to replace the damaged item(s) before your event. If significant damage occurred while the item was in your possession, repair and/or replacement fees may apply. Please do not try to fix damaged equipment.",
  },
];

export default function FaqsPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f7f7f7] pt-[140px] pb-20" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <section className="max-w-[900px] mx-auto px-6 sm:px-8 text-center py-10 sm:py-16">
          <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#999]">
            <Link href="/resources" className="hover:text-[#ff6c0e] transition-colors">
              Resources
            </Link>
            <span className="mx-2 text-[#ccc]">/</span>
            <span className="text-[#ff6c0e]">FAQs</span>
          </p>
          <h1
            className="mt-4 text-[#111] font-bold leading-[1.05]"
            style={{ fontSize: "clamp(36px, 6vw, 72px)" }}
          >
            Frequently asked questions<span style={{ color: "#ff6c0e" }}>.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-[16px] leading-[1.7] text-[#555]">
            The questions our Oahu clients ask most. Tap any question to expand. Don&apos;t see
            yours? Call <a href={`tel:${SITE.phone.replace(/\D/g, "")}`} className="font-semibold text-[#111] underline-offset-4 hover:underline">{SITE.phone}</a>{" "}
            or email{" "}
            <a href={`mailto:${SITE.email}`} className="font-semibold text-[#111] underline-offset-4 hover:underline">
              {SITE.email}
            </a>
            .
          </p>
        </section>

        <section className="max-w-[900px] mx-auto px-4 sm:px-8">
          <div className="divide-y divide-[#e5e5e5] rounded-2xl border border-[#e5e5e5] bg-white">
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="group px-6 py-5 sm:px-8 sm:py-6 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 outline-none focus-visible:ring-2 focus-visible:ring-[#ff6c0e] focus-visible:ring-offset-2 rounded">
                  <h2 className="text-[#111] font-semibold text-[17px] sm:text-[19px] leading-[1.4]">
                    {f.question}
                  </h2>
                  <span
                    aria-hidden
                    className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ddd] text-[#111] transition-transform duration-200 group-open:rotate-45 group-open:border-[#ff6c0e] group-open:text-[#ff6c0e]"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-[15px] leading-[1.7] text-[#555]">{f.answer}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white bg-[#111] hover:bg-[#ff6c0e] transition-colors"
              style={{ borderRadius: 0 }}
            >
              Still have questions? Contact us
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
