import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Gallery | Accel Event Rentals",
  description:
    "Real events, real inspiration. See how our tents, lounge furniture, and tabletop collections come together for weddings, corporate events, and celebrations across Oahu and Maui.",
};

const galleryImages = Array.from({ length: 8 }, (_, i) => ({
  src: `/images/hero/${i + 1}.jpg`,
  alt: `Accel Event Rentals featured event ${i + 1}`,
}));

export default function GalleryPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f7f7f7] pt-[140px] pb-20">
        <section className="max-w-[1200px] mx-auto px-6 sm:px-8 text-center py-10 sm:py-16">
          <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#999]">
            Featured events
          </p>
          <h1 className="mt-4 text-[#111] font-bold leading-[1.05]"
              style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
            Real events.<br />Real inspiration.
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-[16px] leading-[1.7] text-[#555]">
            Discover how planners and hosts bring their ideas to life with our
            island style. Every event below featured Accel Event Rentals.
          </p>
        </section>

        <section className="max-w-[1200px] mx-auto px-3 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {galleryImages.map((img, i) => {
              const isTall = i % 5 === 0 || i % 5 === 3;
              return (
                <div
                  key={img.src}
                  className={`relative overflow-hidden rounded-xl bg-[#eee] ${
                    isTall ? "aspect-[3/4]" : "aspect-square"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className="max-w-[800px] mx-auto px-6 sm:px-8 mt-20 text-center">
          <h2 className="text-[#111] font-bold leading-[1.1]"
              style={{ fontSize: "clamp(28px, 4vw, 44px)" }}>
            Your event, next.
          </h2>
          <p className="mt-4 text-[16px] leading-[1.7] text-[#555]">
            Browse our full rental catalog and build a quote. Our team will
            follow up to lock in the details.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/rentals/tents"
              className="inline-block px-8 py-4 rounded-full bg-[#111] text-white text-[14px] font-bold tracking-wider"
            >
              SHOP RENTALS
            </Link>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 rounded-full border-2 border-[#111] text-[#111] text-[14px] font-bold tracking-wider"
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
