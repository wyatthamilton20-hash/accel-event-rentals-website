"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface CartItem {
  id: number;
  name: string;
  category: string;
  imageUrl: string | null;
  thumbUrl: string | null;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  isInCart: (id: number) => boolean;
  toggleItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  totalItems: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  eventDates: { start: string; end: string };
  setEventDates: (dates: { start: string; end: string }) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [eventDates, setEventDates] = useState({ start: "", end: "" });

  const addItem = useCallback(
    (item: Omit<CartItem, "qty"> & { qty?: number }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + (item.qty || 1) } : i
          );
        }
        return [...prev, { ...item, qty: item.qty || 1 }];
      });
    },
    []
  );

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: number, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, qty } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback(
    (id: number) => items.some((i) => i.id === id),
    [items]
  );

  const toggleItem = useCallback(
    (item: Omit<CartItem, "qty"> & { qty?: number }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) return prev.filter((i) => i.id !== item.id);
        return [...prev, { ...item, qty: item.qty || 1 }];
      });
    },
    []
  );

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        isInCart,
        toggleItem,
        totalItems,
        cartOpen,
        setCartOpen,
        eventDates,
        setEventDates,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
