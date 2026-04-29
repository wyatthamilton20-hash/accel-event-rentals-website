"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/current-rms";

export function CategoryProductGrid({ products }: { products: Product[] }) {
  const { isInCart, toggleItem, setCartOpen, totalItems } = useCart();

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => {
          const inCart = isInCart(product.id);
          return (
            <div
              key={product.id}
              className="rounded-2xl overflow-hidden bg-white transition-shadow hover:shadow-md"
              style={{
                border: inCart ? "2px solid #111" : "2px solid transparent",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              }}
            >
              {/* Image */}
              <div className="relative w-full aspect-square bg-[#f5f5f5]">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[11px] text-[#bbb] text-center px-3">
                    {product.name}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4">
                <p className="text-[13px] sm:text-[14px] font-semibold text-[#111] leading-tight line-clamp-2 min-h-[36px]">
                  {product.name}
                </p>
                <p className="text-[12px] text-[#888] mt-1">
                  {product.category} · {product.price}
                </p>

                {/* Add / Remove button */}
                <button
                  type="button"
                  onClick={() =>
                    toggleItem({
                      id: product.id,
                      name: product.name,
                      category: product.category,
                      imageUrl: product.imageUrl,
                      thumbUrl: product.thumbUrl,
                    })
                  }
                  className="mt-3 w-full py-2.5 text-[12px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
                  style={{
                    backgroundColor: inCart ? "transparent" : "#111",
                    color: inCart ? "#111" : "#fff",
                    border: inCart ? "1.5px solid #111" : "1.5px solid #111",
                    borderRadius: 0,
                  }}
                >
                  {inCart ? "In Quote ✓" : "Add to Quote"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="inline-flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: "#ff6c0e",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: 50,
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              boxShadow: "0 4px 20px rgba(255,108,14,0.35)",
            }}
          >
            View Quote ({totalItems} items)
          </button>
        </div>
      )}
    </>
  );
}
