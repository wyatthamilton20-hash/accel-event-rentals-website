"use client";

import Image from "next/image";
import { CATEGORIES } from "@/lib/category-map";
import { shopCategoryUrl } from "@/lib/site-config";

export function OnTrendSection() {
  return (
    <section className="py-12 sm:py-20 overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 700, color: "#111", lineHeight: 1.15, margin: 0 }}>
            Browse Our Rentals<span style={{ color: "#ff6c0e" }}>.</span>
          </h2>
          <p className="mt-3 text-[15px] text-[#555] max-w-[500px] mx-auto">
            Tap a category to shop on accelrentals.com.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.slug}
              href={shopCategoryUrl(cat.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-[#1a1a1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6c0e] focus-visible:ring-offset-2"
            >
              <Image
                src={cat.imageUrl}
                alt={cat.label}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="tile-shimmer pointer-events-none absolute inset-0" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="text-white text-lg sm:text-2xl font-bold tracking-tight leading-tight">
                  {cat.label}
                </h3>
                <p className="mt-1 text-white/85 text-xs sm:text-sm">
                  Shop {cat.label.toLowerCase()} ↗
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
