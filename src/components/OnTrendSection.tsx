"use client";

import { useState } from "react";
import Image from "next/image";
import { CartIcon } from "@/components/icons";

interface Product {
  name: string;
  image: string;
  qty: number;
  category: string;
}

const EVENT_TABS = ["Weddings", "Birthdays", "Corporate", "Luau"] as const;
type EventType = (typeof EVENT_TABS)[number];

const eventHeadings: Record<EventType, string> = {
  Weddings: "Your Wedding Essentials",
  Birthdays: "Birthday Party Package",
  Corporate: "Corporate Event Setup",
  Luau: "Luau & Beach Party Kit",
};

const eventProducts: Record<EventType, Product[]> = {
  Weddings: [
    { name: "Sailcloth Tent, 40x60", image: "/images/products/milo-bar.jpg", qty: 1, category: "Tents" },
    { name: "Cross-Back Chair, Walnut", image: "/images/products/product-10.jpg", qty: 120, category: "Seating" },
    { name: "Waikiki Dining Table, Oak", image: "/images/products/napoli-glassware.jpg", qty: 15, category: "Tables" },
    { name: 'Lanai Gold Charger, 13"', image: "/images/products/vero-chair.jpg", qty: 120, category: "Tabletop" },
    { name: "Palms Flatware, Gold", image: "/images/products/tribeca-bar.jpg", qty: 120, category: "Tabletop" },
    { name: "Pacific Blue Glassware Set", image: "/images/products/palermo-highboy.jpg", qty: 120, category: "Tabletop" },
    { name: "Island Linen Napkin, Sand", image: "/images/products/product-11.jpg", qty: 120, category: "Linens" },
    { name: "Hana Bar, Natural Wood", image: "/images/products/birch-honey.jpg", qty: 2, category: "Bars" },
    { name: "Aloha Sofa, Cream Linen", image: "/images/products/tivoli-chair.jpg", qty: 4, category: "Lounge" },
  ],
  Birthdays: [
    { name: "Frame Tent, 20x30", image: "/images/products/aria-stainless.jpg", qty: 1, category: "Tents" },
    { name: "Kailua Lounge Chair, White", image: "/images/products/flora-bella.jpg", qty: 30, category: "Seating" },
    { name: "Waikiki Dining Table, Oak", image: "/images/products/napoli-glassware.jpg", qty: 4, category: "Tables" },
    { name: "Makai Highboy, Teak", image: "/images/products/aria-stainless.jpg", qty: 4, category: "Tables" },
    { name: "Pacific Blue Glassware Set", image: "/images/products/palermo-highboy.jpg", qty: 30, category: "Tabletop" },
    { name: "Oceanview Cabana, White", image: "/images/products/product-12.jpg", qty: 1, category: "Decor" },
  ],
  Corporate: [
    { name: "Sailcloth Tent, 40x60", image: "/images/products/milo-bar.jpg", qty: 1, category: "Tents" },
    { name: "Vero Chair, Natural Oak", image: "/images/products/vero-chair.jpg", qty: 80, category: "Seating" },
    { name: "Waikiki Dining Table, Oak", image: "/images/products/napoli-glassware.jpg", qty: 10, category: "Tables" },
    { name: "Makai Highboy, Teak", image: "/images/products/aria-stainless.jpg", qty: 8, category: "Tables" },
    { name: "Tribeca Back Bar, White", image: "/images/products/tribeca-bar.jpg", qty: 1, category: "Bars" },
    { name: "Palms Flatware, Gold", image: "/images/products/tribeca-bar.jpg", qty: 80, category: "Tabletop" },
    { name: "Pacific Blue Glassware Set", image: "/images/products/palermo-highboy.jpg", qty: 80, category: "Tabletop" },
  ],
  Luau: [
    { name: "Oceanview Cabana, White", image: "/images/products/product-12.jpg", qty: 2, category: "Decor" },
    { name: "Kailua Lounge Chair, White", image: "/images/products/flora-bella.jpg", qty: 40, category: "Seating" },
    { name: "Hana Bar, Natural Wood", image: "/images/products/birch-honey.jpg", qty: 2, category: "Bars" },
    { name: 'Lanai Gold Charger, 13"', image: "/images/products/vero-chair.jpg", qty: 40, category: "Tabletop" },
    { name: "Pacific Blue Glassware Set", image: "/images/products/palermo-highboy.jpg", qty: 40, category: "Tabletop" },
    { name: "Island Linen Napkin, Sand", image: "/images/products/product-11.jpg", qty: 40, category: "Linens" },
    { name: "Aloha Sofa, Cream Linen", image: "/images/products/tivoli-chair.jpg", qty: 6, category: "Lounge" },
  ],
};

export function OnTrendSection() {
  const [activeTab, setActiveTab] = useState<EventType>("Weddings");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const products = eventProducts[activeTab];
  const heading = eventHeadings[activeTab];

  function handleTabChange(tab: EventType) {
    setActiveTab(tab);
    setCheckedItems(new Set());
  }

  function toggleItem(name: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function selectAll() {
    if (checkedItems.size === products.length) {
      setCheckedItems(new Set());
    } else {
      setCheckedItems(new Set(products.map((p) => p.name)));
    }
  }

  const selectedCount = checkedItems.size;

  return (
    <section
      className="py-12 sm:py-20 overflow-hidden"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="max-w-[1100px] mx-auto px-4 sm:px-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 52px)",
              fontWeight: 700,
              color: "#111",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Shop by Event.
          </h2>
          <p className="mt-3 text-[15px] text-[#555] max-w-[500px] mx-auto">
            Select your event type and build your rental package. Everything you
            need, curated for your celebration.
          </p>
        </div>

        {/* Event type tabs */}
        <div className="flex gap-2 justify-center flex-wrap mb-10">
          {EVENT_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className="transition-all whitespace-nowrap"
              style={{
                padding: "10px 24px",
                borderRadius: 50,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                border: "1.5px solid #111",
                backgroundColor: activeTab === tab ? "#111" : "transparent",
                color: activeTab === tab ? "#fff" : "#111",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Package heading */}
        <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:gap-3">
          <div>
            <h3
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#111",
                margin: 0,
              }}
            >
              {heading}
            </h3>
            <p className="text-[13px] text-[#888] mt-1">
              {products.length} items &middot; Select what you need
            </p>
          </div>
          <button
            type="button"
            onClick={selectAll}
            className="text-[13px] font-semibold text-[#111] underline underline-offset-2 cursor-pointer hover:text-[#555] transition-colors"
          >
            {checkedItems.size === products.length
              ? "Deselect All"
              : "Select All"}
          </button>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const isChecked = checkedItems.has(product.name);
            return (
              <button
                key={product.name}
                type="button"
                onClick={() => toggleItem(product.name)}
                className="flex items-center gap-4 rounded-2xl p-3 text-left transition-all cursor-pointer"
                style={{
                  backgroundColor: isChecked ? "#f0f7f0" : "#fff",
                  border: isChecked
                    ? "2px solid #111"
                    : "2px solid #eee",
                  boxShadow: isChecked
                    ? "0 2px 12px rgba(0,0,0,0.08)"
                    : "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {/* Checkbox */}
                <div
                  className="shrink-0 flex items-center justify-center rounded-md transition-colors"
                  style={{
                    width: 24,
                    height: 24,
                    border: isChecked
                      ? "2px solid #111"
                      : "2px solid #ccc",
                    backgroundColor: isChecked ? "#111" : "transparent",
                  }}
                >
                  {isChecked && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                {/* Product image */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#111] leading-tight truncate">
                    {product.name}
                  </p>
                  <p className="text-[12px] text-[#888] mt-0.5">
                    {product.category} &middot; Qty: {product.qty}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 flex items-center justify-center gap-4 max-sm:flex-col">
          <button
            type="button"
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-85 cursor-pointer"
            style={{
              backgroundColor: "#111",
              color: "#fff",
              padding: "16px 36px",
              borderRadius: 50,
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              letterSpacing: "-0.01em",
            }}
          >
            <CartIcon className="w-5 h-5" />
            {selectedCount > 0
              ? `Request Quote (${selectedCount} items)`
              : "Request a Quote"}
          </button>
          {selectedCount > 0 && (
            <p className="text-[13px] text-[#888]">
              {selectedCount} of {products.length} items selected
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
