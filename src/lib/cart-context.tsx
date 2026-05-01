"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  id: number;
  name: string;
  category: string;
  imageUrl: string | null;
  thumbUrl: string | null;
  qty: number;
  notes?: string;
}

interface EventDates {
  start: string;
  end: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  updateItemNotes: (id: number, notes: string) => void;
  clearCart: () => void;
  isInCart: (id: number) => boolean;
  toggleItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  totalItems: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  eventDates: EventDates;
  setEventDates: (dates: EventDates) => void;
  hydrated: boolean;
  idempotencyKey: string;
}

interface PersistedCart {
  version: 1;
  items: CartItem[];
  eventDates: EventDates;
  idempotencyKey: string;
}

const STORAGE_KEY = "accel-cart-v1";
const DEBOUNCE_MS = 250;

const CartContext = createContext<CartContextValue | null>(null);

function generateIdempotencyKey(): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  // Extremely defensive fallback — modern browsers always have crypto.randomUUID.
  return `fallback-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "number" &&
    typeof v.name === "string" &&
    typeof v.category === "string" &&
    (typeof v.imageUrl === "string" || v.imageUrl === null) &&
    (typeof v.thumbUrl === "string" || v.thumbUrl === null) &&
    typeof v.qty === "number" &&
    (v.notes === undefined || typeof v.notes === "string")
  );
}

function isPersistedCart(value: unknown): value is PersistedCart {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v.version !== 1) return false;
  if (!Array.isArray(v.items)) return false;
  if (!v.items.every(isCartItem)) return false;
  if (typeof v.eventDates !== "object" || v.eventDates === null) return false;
  const dates = v.eventDates as Record<string, unknown>;
  if (typeof dates.start !== "string" || typeof dates.end !== "string") return false;
  if (typeof v.idempotencyKey !== "string") return false;
  return true;
}

function readPersisted(): PersistedCart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedCart(parsed)) {
      console.warn(
        `[cart-context] Discarding persisted cart at "${STORAGE_KEY}" — invalid shape or unsupported version.`
      );
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn("[cart-context] Failed to read persisted cart:", err);
    return null;
  }
}

function writePersisted(payload: PersistedCart): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Safari private mode, quota exceeded, etc. — silently ignore.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [eventDates, setEventDates] = useState<EventDates>({ start: "", end: "" });
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage on first client mount. This is an external-system
  // sync (browser localStorage -> React state), which is exactly what effects
  // are for; the setState-in-effect lint rule's heuristic doesn't model that.
  useEffect(() => {
    const persisted = readPersisted();
    if (persisted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(persisted.items);
      setEventDates(persisted.eventDates);
      setIdempotencyKey(
        persisted.idempotencyKey || generateIdempotencyKey()
      );
    } else {
      setIdempotencyKey(generateIdempotencyKey());
    }
    setHydrated(true);
  }, []);

  // Debounced persistence after hydration completes.
  useEffect(() => {
    if (!hydrated) return;

    if (writeTimerRef.current !== null) {
      clearTimeout(writeTimerRef.current);
    }

    writeTimerRef.current = setTimeout(() => {
      writePersisted({
        version: 1,
        items,
        eventDates,
        idempotencyKey,
      });
      writeTimerRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (writeTimerRef.current !== null) {
        clearTimeout(writeTimerRef.current);
        writeTimerRef.current = null;
      }
    };
  }, [hydrated, items, eventDates, idempotencyKey]);

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

  const updateItemNotes = useCallback((id: number, notes: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        if (notes === "") {
          // Strip the notes field entirely when cleared.
          const { notes: _omit, ...rest } = i;
          void _omit;
          return rest;
        }
        return { ...i, notes };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setIdempotencyKey(generateIdempotencyKey());
  }, []);

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

  // While unhydrated, expose an empty cart so SSR + first paint match.
  const exposedItems = hydrated ? items : [];
  const totalItems = exposedItems.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items: exposedItems,
        addItem,
        removeItem,
        updateQty,
        updateItemNotes,
        clearCart,
        isInCart,
        toggleItem,
        totalItems,
        cartOpen,
        setCartOpen,
        eventDates,
        setEventDates,
        hydrated,
        idempotencyKey,
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
