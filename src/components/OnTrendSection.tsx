"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CartIcon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";

// --- Types ---
interface ItemConfig {
  perGuest?: number;
  per8?: number;
  per10?: number;
  fixed?: number;
}

interface EventProduct {
  id: number;
  name: string;
  category: string;
  imageUrl: string | null;
  groupLabel: string;
  config: ItemConfig;
}

interface EventData {
  heading: string;
  description: string;
  baseGuests: number;
  products: EventProduct[];
}

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

type Mode = "category" | "event";

const COLLAPSED_ITEMS = 6; // 2 rows on 3-col desktop

function CollapsibleGrid({
  children,
  totalCount,
  expanded,
  onToggle,
}: {
  children: React.ReactNode;
  totalCount: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const needsCollapse = totalCount > COLLAPSED_ITEMS;

  return (
    <>
      <div className="relative">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-300"
          style={
            !expanded && needsCollapse
              ? { maxHeight: 220, overflow: "hidden" }
              : undefined
          }
        >
          {children}
        </div>
        {/* Fade gradient when collapsed */}
        {!expanded && needsCollapse && (
          <div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{
              background: "linear-gradient(to top, #f7f7f7 0%, transparent 100%)",
            }}
          />
        )}
      </div>
      {needsCollapse && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={onToggle}
            className="text-[13px] font-semibold text-[#111] cursor-pointer transition-opacity hover:opacity-70"
            style={{
              padding: "10px 28px",
              borderRadius: 50,
              border: "1.5px solid #111",
              backgroundColor: "transparent",
            }}
          >
            {expanded ? "Show Less" : `See All (${totalCount} items)`}
          </button>
        </div>
      )}
    </>
  );
}

function calcQty(config: ItemConfig, guests: number): number {
  if (config.fixed !== undefined) return config.fixed;
  if (config.perGuest !== undefined) return Math.ceil(guests * config.perGuest);
  if (config.per8 !== undefined) return Math.ceil(guests / 8) * config.per8;
  if (config.per10 !== undefined) return Math.ceil(guests / 10) * config.per10;
  return 1;
}

export function OnTrendSection() {
  const [mode, setMode] = useState<Mode>("category");
  const { isInCart, toggleItem, addItem, removeItem, updateQty, items, totalItems, setCartOpen } = useCart();

  const [expanded, setExpanded] = useState(false);

  // Category state
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [catLoading, setCatLoading] = useState(true);

  // Event state
  const [activeTab, setActiveTab] = useState("Weddings");
  const [guestCount, setGuestCount] = useState(100);
  const [events, setEvents] = useState<Record<string, EventData>>({});
  const [eventTabs, setEventTabs] = useState<string[]>([]);
  const [eventLoading, setEventLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) setActiveCategory(data.categories[0].label);
        }
      })
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, []);

  // Fetch events
  useEffect(() => {
    fetch("/api/catalog/events")
      .then((r) => r.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
          const tabs = Object.keys(data.events);
          setEventTabs(tabs);
          if (tabs.length > 0) {
            setActiveTab(tabs[0]);
            setGuestCount(data.events[tabs[0]].baseGuests || 100);
          }
        }
      })
      .catch(() => {})
      .finally(() => setEventLoading(false));
  }, []);

  function handleEventTabChange(tab: string) {
    setActiveTab(tab);
    setExpanded(false);
    const ev = events[tab];
    if (ev) setGuestCount(ev.baseGuests);
  }

  function toggleCatalogProduct(product: CatalogProduct) {
    toggleItem({
      id: product.id,
      name: product.name,
      category: product.category,
      imageUrl: product.imageUrl,
      thumbUrl: product.thumbUrl,
    });
  }

  function toggleEventProduct(product: EventProduct) {
    const qty = calcQty(product.config, guestCount);
    toggleItem({
      id: product.id,
      name: product.name,
      category: product.groupLabel,
      imageUrl: product.imageUrl,
      thumbUrl: product.imageUrl,
      qty,
    });
  }

  function addAllEventItems() {
    const prods = events[activeTab]?.products || [];
    prods.forEach((p) => { if (!isInCart(p.id)) toggleEventProduct(p); });
  }

  function getCartQty(id: number) {
    return items.find((i) => i.id === id)?.qty || 0;
  }

  const currentCat = categories.find((c) => c.label === activeCategory);
  const currentEvent = events[activeTab];
  const allEventInCart = currentEvent?.products.length > 0 && currentEvent.products.every((p) => isInCart(p.id));
  const isLoading = mode === "category" ? catLoading : eventLoading;

  return (
    <section className="py-12 sm:py-20 overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 700, color: "#111", lineHeight: 1.15, margin: 0 }}>
            Browse Our Rentals<span style={{ color: "#ff6c0e" }}>.</span>
          </h2>
          <p className="mt-3 text-[15px] text-[#555] max-w-[500px] mx-auto">
            Explore by category or build a complete package for your event.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full border border-[#ddd] overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("category")}
              className="px-6 py-2.5 text-[13px] font-semibold transition-colors cursor-pointer"
              style={{
                backgroundColor: mode === "category" ? "#111" : "transparent",
                color: mode === "category" ? "#fff" : "#111",
              }}
            >
              Shop by Category
            </button>
            <button
              type="button"
              onClick={() => setMode("event")}
              className="px-6 py-2.5 text-[13px] font-semibold transition-colors cursor-pointer"
              style={{
                backgroundColor: mode === "event" ? "#111" : "transparent",
                color: mode === "event" ? "#fff" : "#111",
              }}
            >
              Shop by Event
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-16 text-[#999] text-sm">Loading...</div>
        )}

        {/* ========== CATEGORY MODE ========== */}
        {!isLoading && mode === "category" && (
          <>
            {/* Category pills */}
            <div className="flex gap-2 justify-center flex-wrap mb-8 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => { setActiveCategory(cat.label); setExpanded(false); }}
                  className="transition-all whitespace-nowrap cursor-pointer"
                  style={{
                    padding: "8px 20px",
                    borderRadius: 50,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "1.5px solid #111",
                    backgroundColor: activeCategory === cat.label ? "#111" : "transparent",
                    color: activeCategory === cat.label ? "#fff" : "#111",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {currentCat && (
              <>
                <div className="mb-6">
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>
                    {currentCat.label}
                  </h3>
                  <p className="text-[13px] text-[#888] mt-1">
                    {currentCat.products.length} items available
                  </p>
                </div>

                <CollapsibleGrid totalCount={currentCat.products.length} expanded={expanded} onToggle={() => setExpanded(!expanded)}>
                  {currentCat.products.map((product) => {
                    const inCart = isInCart(product.id);
                    const qty = getCartQty(product.id);
                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 rounded-2xl p-3 transition-all cursor-pointer"
                        style={{
                          backgroundColor: inCart ? "#f0f7f0" : "#fff",
                          border: inCart ? "2px solid #111" : "2px solid #eee",
                          boxShadow: inCart ? "0 2px 12px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
                        }}
                        onClick={() => {
                          if (!inCart) {
                            addItem({ id: product.id, name: product.name, category: product.category, imageUrl: product.imageUrl, thumbUrl: product.thumbUrl });
                          }
                        }}
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#f5f5f5]">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} fill sizes="64px" className="object-cover" unoptimized />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[9px] text-[#aaa] text-center px-1">{product.name.slice(0, 15)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-[#111] leading-tight truncate">{product.name}</p>
                          <p className="text-[12px] text-[#888] mt-0.5">{product.category} · {product.price}</p>
                        </div>

                        {/* Add button OR qty stepper */}
                        {!inCart ? (
                          <div
                            className="shrink-0 text-center transition-all"
                            style={{
                              padding: "6px 14px",
                              fontSize: 11,
                              fontWeight: 700,
                              border: "1.5px solid #111",
                              backgroundColor: "#111",
                              color: "#fff",
                              borderRadius: 0,
                              textTransform: "uppercase" as const,
                              letterSpacing: "0.04em",
                            }}
                          >
                            Add
                          </div>
                        ) : (
                          <div
                            className="shrink-0 flex items-center gap-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                            style={{ border: "1.5px solid #111", borderRadius: 0 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => { if (qty <= 1) removeItem(product.id); else updateQty(product.id, qty - 1); }}
                              className="w-8 h-8 flex items-center justify-center text-[#111] text-sm font-bold cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                              style={{ borderRight: "1px solid #ddd" }}
                            >
                              {qty <= 1 ? "×" : "−"}
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center text-[12px] font-bold text-[#111] tabular-nums">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(product.id, qty + 1)}
                              className="w-8 h-8 flex items-center justify-center text-[#111] text-sm font-bold cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                              style={{ borderLeft: "1px solid #ddd" }}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CollapsibleGrid>
              </>
            )}
          </>
        )}

        {/* ========== EVENT MODE ========== */}
        {!isLoading && mode === "event" && (
          <>
            {/* Event tabs */}
            <div className="flex gap-2 justify-center flex-wrap mb-8 overflow-x-auto scrollbar-hide">
              {eventTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleEventTabChange(tab)}
                  className="transition-all whitespace-nowrap cursor-pointer"
                  style={{
                    padding: "8px 20px",
                    borderRadius: 50,
                    fontSize: 13,
                    fontWeight: 600,
                    border: "1.5px solid #111",
                    backgroundColor: activeTab === tab ? "#111" : "transparent",
                    color: activeTab === tab ? "#fff" : "#111",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {currentEvent && (
              <>
                {/* Bundle header + slider card */}
                <div className="rounded-2xl border border-[#eee] bg-white p-6 mb-6">
                  <div className="flex items-start justify-between gap-6 max-sm:flex-col">
                    <div>
                      <h3 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>
                        {currentEvent.heading}
                      </h3>
                      <p className="text-[13px] text-[#888] mt-1">{currentEvent.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={addAllEventItems}
                      disabled={allEventInCart}
                      className="whitespace-nowrap cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-default shrink-0"
                      style={{
                        backgroundColor: allEventInCart ? "transparent" : "#111",
                        color: allEventInCart ? "#111" : "#fff",
                        padding: "10px 24px",
                        borderRadius: 50,
                        fontSize: 13,
                        fontWeight: 700,
                        border: "1.5px solid #111",
                      }}
                    >
                      {allEventInCart ? "All Added ✓" : "Add Entire Package"}
                    </button>
                  </div>

                  {/* Guest slider */}
                  <div className="mt-6 pt-5 border-t border-[#f0f0f0]">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[13px] font-semibold text-[#111]">Number of Guests</label>
                      <span className="text-[20px] font-bold text-[#111] tabular-nums">{guestCount}</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={300}
                      step={5}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #111 ${((guestCount - 10) / 290) * 100}%, #e0e0e0 ${((guestCount - 10) / 290) * 100}%)`,
                      }}
                    />
                    <div className="flex justify-between text-[11px] text-[#bbb] mt-1">
                      <span>10</span>
                      <span>150</span>
                      <span>300</span>
                    </div>
                  </div>
                </div>

                {/* Event product grid */}
                <CollapsibleGrid totalCount={currentEvent.products.length} expanded={expanded} onToggle={() => setExpanded(!expanded)}>
                  {currentEvent.products.map((product) => {
                    const suggestedQty = calcQty(product.config, guestCount);
                    const inCart = isInCart(product.id);
                    const cartQty = getCartQty(product.id);
                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 rounded-2xl p-3 transition-all cursor-pointer"
                        style={{
                          backgroundColor: inCart ? "#f0f7f0" : "#fff",
                          border: inCart ? "2px solid #111" : "2px solid #eee",
                          boxShadow: inCart ? "0 2px 12px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
                        }}
                        onClick={() => {
                          if (!inCart) toggleEventProduct(product);
                        }}
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#f5f5f5]">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} fill sizes="64px" className="object-cover" unoptimized />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[9px] text-[#aaa] text-center px-1">{product.name.slice(0, 15)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-[#111] leading-tight truncate">{product.name}</p>
                          <p className="text-[12px] text-[#888] mt-0.5">
                            {product.groupLabel} · Suggested: {suggestedQty}
                          </p>
                        </div>

                        {!inCart ? (
                          <div
                            className="shrink-0 text-center"
                            style={{ padding: "6px 14px", fontSize: 11, fontWeight: 700, border: "1.5px solid #111", backgroundColor: "#111", color: "#fff", borderRadius: 0, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}
                          >
                            Add
                          </div>
                        ) : (
                          <div
                            className="shrink-0 flex items-center gap-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                            style={{ border: "1.5px solid #111", borderRadius: 0 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => { if (cartQty <= 1) removeItem(product.id); else updateQty(product.id, cartQty - 1); }}
                              className="w-8 h-8 flex items-center justify-center text-[#111] text-sm font-bold cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                              style={{ borderRight: "1px solid #ddd" }}
                            >
                              {cartQty <= 1 ? "×" : "−"}
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center text-[12px] font-bold text-[#111] tabular-nums">
                              {cartQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(product.id, cartQty + 1)}
                              className="w-8 h-8 flex items-center justify-center text-[#111] text-sm font-bold cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                              style={{ borderLeft: "1px solid #ddd" }}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CollapsibleGrid>
              </>
            )}
          </>
        )}

        {/* Cart CTA */}
        {totalItems > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-85 cursor-pointer"
              style={{
                backgroundColor: "#ff6c0e",
                color: "#fff",
                padding: "16px 36px",
                borderRadius: 50,
                fontSize: 15,
                fontWeight: 700,
                border: "none",
              }}
            >
              <CartIcon className="w-5 h-5" />
              Add to Cart ({totalItems} items)
            </button>
          </div>
        )}
      </div>

      {/* Slider thumb styling */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px; height: 22px; border-radius: 50%;
          background: #111; border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3); cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px; height: 22px; border-radius: 50%;
          background: #111; border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3); cursor: pointer;
        }
      `}</style>
    </section>
  );
}
