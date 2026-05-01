"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/category-map";

interface CatalogProduct {
  id: number;
  name: string;
  category: string;
  imageUrl: string | null;
  thumbUrl: string | null;
  price: string;
}

interface CatalogCategory {
  label: string;
  products: CatalogProduct[];
}

export function OnTrendSection() {
  const [imagesByLabel, setImagesByLabel] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.categories) return;
        const map: Record<string, string> = {};
        (data.categories as CatalogCategory[]).forEach((cat) => {
          const firstWithImage = cat.products.find((p) => p.imageUrl);
          if (firstWithImage?.imageUrl) map[cat.label] = firstWithImage.imageUrl;
        });
        setImagesByLabel(map);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-12 sm:py-20 overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 700, color: "#111", lineHeight: 1.15, margin: 0 }}>
            Browse Our Rentals<span style={{ color: "#ff6c0e" }}>.</span>
          </h2>
          <p className="mt-3 text-[15px] text-[#555] max-w-[500px] mx-auto">
            Tap a category to start building your quote.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const imageUrl = imagesByLabel[cat.label];
            return (
              <Link
                key={cat.slug}
                href={`/rentals/${cat.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-[#1a1a1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6c0e] focus-visible:ring-offset-2"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={cat.label}
                    fill
                    sizes="(max-width: 1024px) 50vw, 20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#3a3a3a]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="tile-shimmer pointer-events-none absolute inset-0" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <h3 className="text-white text-lg sm:text-2xl font-bold tracking-tight leading-tight">
                    {cat.label}
                  </h3>
                  <p className="mt-1 text-white/85 text-xs sm:text-sm">
                    Shop {cat.label.toLowerCase()} →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
