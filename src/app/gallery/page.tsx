import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE, shopCategoryUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Inspiration | Accel Event Rentals",
  description:
    "Real events, real inspiration. See how our tents, lounge furniture, and tabletop collections come together for weddings, corporate events, and celebrations across Oahu.",
};

// Inspiration photos mirrored from accelrentals.com/galleries/ via
// scripts/download-inspiration-photos.mjs. Re-run that script to refresh.
const galleryImages: { src: string; alt: string }[] = [
  { src: "/images/inspiration/four-seasons.png",      alt: "Four Seasons wedding tent and reception by Accel Event Rentals" },
  { src: "/images/inspiration/kualoa-ranch.jpeg",     alt: "Kualoa Ranch outdoor event by Accel Event Rentals" },
  { src: "/images/inspiration/ashley-goodwin.png",    alt: "Wedding styled by Ashley Goodwin Photos with Accel rentals" },
  { src: "/images/inspiration/desiree-leilani.png",   alt: "Event styled by Desiree Leilani Photos with Accel rentals" },
  { src: "/images/inspiration/india-pearl.png",       alt: "Event styled by India Pearl Photos with Accel rentals" },
  { src: "/images/inspiration/jessica-sullivan.png",  alt: "Event styled by Jessica Sullivan Photography with Accel rentals" },
  { src: "/images/inspiration/molly-caskey.png",      alt: "Event styled by Molly Caskey with Accel rentals" },
  { src: "/images/inspiration/outdoor.png",           alt: "Outdoor event by Accel Event Rentals" },
  { src: "/images/inspiration/tented-wedding.jpg",    alt: "Tented wedding reception by Accel Event Rentals" },
  { src: "/images/inspiration/wedding-tent-1.png",    alt: "Wedding tent setup by Accel Event Rentals" },
  { src: "/images/inspiration/wedding-tent-2.png",    alt: "Wedding tent setup by Accel Event Rentals" },
  { src: "/images/inspiration/lighting.png",          alt: "Event lighting by Accel Event Rentals" },
  { src: "/images/inspiration/lighting-fixtures.png", alt: "Lighting fixtures by Accel Event Rentals" },
  { src: "/images/inspiration/lights.png",            alt: "String lights by Accel Event Rentals" },
  { src: "/images/inspiration/photo-7.jpeg",          alt: "Featured Accel Event Rentals setup" },
];

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

        <section className="max-w-[1600px] mx-auto px-4 sm:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {galleryImages.map((img) => (
              <a
                key={img.src}
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${img.alt} — see more on Instagram`}
                className="group relative overflow-hidden rounded-2xl bg-[#eee] aspect-[3/2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6c0e] focus-visible:ring-offset-2"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  quality={90}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/35 group-hover:opacity-100"
                  aria-hidden="true"
                >
                  <span className="text-white text-[12px] font-bold uppercase tracking-[0.25em]">
                    View on Instagram ↗
                  </span>
                </span>
              </a>
            ))}
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
            <a
              href={shopCategoryUrl("tents")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 rounded-full bg-[#111] text-white text-[14px] font-bold tracking-wider"
            >
              SHOP RENTALS ↗
            </a>
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
