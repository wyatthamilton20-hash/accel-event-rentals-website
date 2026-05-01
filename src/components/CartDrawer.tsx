"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { CloseIcon } from "@/components/icons";
import { useState } from "react";

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQty,
    clearCart,
    totalItems,
    cartOpen,
    setCartOpen,
    eventDates,
    setEventDates,
  } = useCart();

  const [availabilityStatus, setAvailabilityStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");

  const hasDates = eventDates.start !== "" && eventDates.end !== "";

  async function checkAvailability() {
    if (!hasDates || items.length === 0) return;
    setAvailabilityStatus("checking");

    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: eventDates.start,
          endDate: eventDates.end,
          productIds: items.map((i) => i.id),
        }),
      });
      const data = await res.json();
      setAvailabilityStatus(data.allAvailable ? "available" : "unavailable");
    } catch {
      setAvailabilityStatus("idle");
    }
  }

  if (!cartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[440px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eee]">
          <h2 className="text-lg font-bold text-[#111]">
            Your Quote ({totalItems} items)
          </h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="w-10 h-10 flex items-center justify-center text-[#111] hover:opacity-70 cursor-pointer"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        {/* TEST MODE BANNER */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-center">
          <p className="text-[12px] font-bold text-amber-800 uppercase tracking-wider">
            Test Mode — No orders will be placed
          </p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            Quote requests are reviewed by our team — no charges, no contracts at this stage.
          </p>
        </div>

        {/* Date picker — REQUIRED */}
        <div className="px-6 py-4 border-b border-[#eee] bg-[#fafafa]">
          <p className="text-[13px] font-semibold text-[#111] mb-3">
            Event Dates <span className="text-red-500">*</span>
          </p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[11px] text-[#888] uppercase tracking-wider block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={eventDates.start}
                onChange={(e) =>
                  setEventDates({ ...eventDates, start: e.target.value })
                }
                className="w-full border border-[#ddd] rounded-lg px-3 py-2.5 text-[14px] text-[#111] outline-none focus:border-[#111] bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-[#888] uppercase tracking-wider block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={eventDates.end}
                onChange={(e) =>
                  setEventDates({ ...eventDates, end: e.target.value })
                }
                min={eventDates.start || undefined}
                className="w-full border border-[#ddd] rounded-lg px-3 py-2.5 text-[14px] text-[#111] outline-none focus:border-[#111] bg-white"
              />
            </div>
          </div>
          {hasDates && items.length > 0 && (
            <button
              type="button"
              onClick={checkAvailability}
              disabled={availabilityStatus === "checking"}
              className="mt-3 w-full rounded-lg bg-[#111] text-white text-[13px] font-semibold py-2.5 cursor-pointer hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {availabilityStatus === "checking"
                ? "Checking availability..."
                : "Check Availability"}
            </button>
          )}
          {availabilityStatus === "available" && (
            <p className="mt-2 text-[12px] text-green-700 font-medium text-center">
              All items available for your dates.
            </p>
          )}
          {availabilityStatus === "unavailable" && (
            <p className="mt-2 text-[12px] text-red-600 font-medium text-center">
              Some items may not be available. Contact us for details.
            </p>
          )}
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="text-center text-[14px] text-[#999] py-12">
              Your quote is empty. Browse our rentals to add items.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl p-3 border border-[#eee]"
                >
                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[#f5f5f5]">
                    {(item.imageUrl || item.thumbUrl) ? (
                      <Image
                        src={item.imageUrl || item.thumbUrl!}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[8px] text-[#aaa] text-center">
                        {item.name.slice(0, 10)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#111] truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-[#888]">{item.category}</p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-[#ddd] text-[#111] text-sm cursor-pointer hover:bg-[#f5f5f5]"
                    >
                      -
                    </button>
                    <span className="text-[13px] font-semibold text-[#111] w-6 text-center">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-[#ddd] text-[#111] text-sm cursor-pointer hover:bg-[#f5f5f5]"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-[#ccc] hover:text-red-500 cursor-pointer transition-colors"
                  >
                    <CloseIcon className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-[#eee]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] text-[#888]">
                {totalItems} items in quote
              </span>
              <button
                type="button"
                onClick={clearCart}
                className="text-[12px] text-red-500 underline cursor-pointer hover:text-red-700"
              >
                Clear All
              </button>
            </div>

            {/* Continue to review — enabled when cart has items + dates */}
            {hasDates ? (
              <Link
                href="/quote/review"
                onClick={() => setCartOpen(false)}
                className="block w-full rounded-full bg-[#ff6c0e] text-white text-[14px] font-bold py-4 text-center hover:opacity-90 transition-opacity cursor-pointer"
              >
                Continue → Review Quote
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="w-full rounded-full bg-[#ccc] text-white text-[14px] font-bold py-4 cursor-not-allowed"
                title="Pick event dates above to continue"
              >
                Continue → Review Quote
              </button>
            )}
            <p className="text-[10px] text-[#999] text-center mt-2">
              {hasDates
                ? "Review your details on the next step before sending."
                : "Pick your event dates above to continue."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
