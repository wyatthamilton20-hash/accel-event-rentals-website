import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/category-map";
import { SITE } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/quote/review`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const rentalPaths: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE.url}/rentals/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticPaths, ...rentalPaths];
}
