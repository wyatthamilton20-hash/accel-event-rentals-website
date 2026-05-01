"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCategoryByLabel } from "@/lib/category-map";
import {
  SearchIcon,
  ChevronDownIcon,
  UserIcon,
  CartIcon,
  LocationIcon,
  MenuIcon,
  CloseIcon,
} from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { SITE } from "@/lib/site-config";

interface CatalogProduct {
  id: number;
  name: string;
  imageUrl: string | null;
  thumbUrl: string | null;
}

interface NavCategory {
  label: string;
  products: CatalogProduct[];
}

const STATIC_LINKS: { label: string; href: string }[] = [
  { label: "Gallery", href: "/gallery" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const router = useRouter();
  const { totalItems, setCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);

  function submitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const q = String(data.get("q") ?? "").trim();
    if (!q) return;
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  useEffect(() => {
    const onScroll = () => {
      setScrolled((was) => {
        const now = window.scrollY > 60;
        if (was !== now) setOpenDropdown(null);
        return now;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch live catalog from Current RMS
  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) {
          setCategories(
            data.categories.map((c: { label: string; products: CatalogProduct[] }) => ({
              label: c.label,
              products: c.products,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!openDropdown) return;
    function handleClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openDropdown]);

  return (
    <>
      {openDropdown === "Rentals" && categories.length > 0 && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      <header
        ref={headerRef}
        className="fixed top-0 left-0 z-50 w-full px-3 sm:px-5 transition-[padding] duration-500 ease-in-out"
        style={{ paddingTop: scrolled ? 4 : 12, paddingBottom: scrolled ? 4 : 12 }}
      >
        {/* Pill container */}
        <div
          className="mx-auto bg-[#ff6c0e] transition-[max-width,border-radius,box-shadow] duration-500 ease-in-out"
          style={{
            borderRadius: scrolled ? 60 : 119,
            boxShadow: scrolled
              ? "0 2px 12px rgba(0,0,0,0.15)"
              : "0 2px 8px rgba(0,0,0,0.10)",
            maxWidth: scrolled ? 620 : 1400,
          }}
        >
          {/* Top Row */}
          <div
            className="flex items-center justify-between px-4 sm:px-6 transition-[padding] duration-500 ease-in-out md:px-8"
            style={{
              paddingTop: scrolled ? 6 : 14,
              paddingBottom: scrolled ? 6 : 10,
            }}
          >
            {/* Logo */}
            <Link href="/" className="shrink-0 leading-none transition-[height] duration-500 ease-in-out" style={{ height: scrolled ? 28 : 40 }}>
              <Image
                src="/images/logos/accel-logo.png"
                alt="Accel Event Rentals"
                width={scrolled ? 90 : 130}
                height={scrolled ? 28 : 40}
                className="transition-all duration-500 ease-in-out"
                style={{ height: scrolled ? 28 : 40, width: "auto" }}
                priority
              />
            </Link>

            {/* Search Bar — fades out with opacity + scale, no layout shift */}
            <div
              className="relative mx-6 hidden max-w-md flex-1 transition-[opacity,transform] duration-500 ease-in-out md:block"
              style={{
                opacity: scrolled ? 0 : 1,
                transform: scrolled ? "scaleX(0)" : "scaleX(1)",
                transformOrigin: "center",
                pointerEvents: scrolled ? "none" : "auto",
                position: scrolled ? "absolute" : "relative",
                visibility: scrolled ? "hidden" : "visible",
              }}
            >
              <form
                onSubmit={submitSearch}
                role="search"
                className="flex overflow-hidden rounded-full border border-white/40"
              >
                <input
                  type="text"
                  name="q"
                  placeholder="What are you looking for?"
                  className="w-full border-none bg-transparent px-4 py-2 text-[16px] sm:text-[13px] text-white outline-none placeholder:text-white/70"
                  tabIndex={scrolled ? -1 : 0}
                />
                <button
                  type="submit"
                  className="flex shrink-0 items-center justify-center bg-[#111] px-3 transition-opacity hover:opacity-80"
                  aria-label="Search"
                  tabIndex={scrolled ? -1 : 0}
                >
                  <SearchIcon className="size-4 text-white" />
                </button>
              </form>
            </div>

            {/* Utility Links */}
            <div className="hidden items-center gap-4 md:flex">
              {/* Text links — fade out on scroll */}
              <div
                className="flex items-center gap-4 transition-[opacity,transform] duration-500 ease-in-out"
                style={{
                  opacity: scrolled ? 0 : 1,
                  transform: scrolled ? "scaleX(0)" : "scaleX(1)",
                  transformOrigin: "right",
                  pointerEvents: scrolled ? "none" : "auto",
                  position: scrolled ? "absolute" : "relative",
                  visibility: scrolled ? "hidden" : "visible",
                }}
              >
                <a
                  href="/gallery"
                  className="cursor-pointer text-sm font-extrabold text-white transition-opacity hover:opacity-70 whitespace-nowrap"
                >
                  Gallery
                </a>
                <a
                  href="/about"
                  className="flex cursor-pointer items-center gap-1 text-sm font-extrabold text-white transition-opacity hover:opacity-70 whitespace-nowrap"
                >
                  About
                  <ChevronDownIcon className="size-3" />
                </a>
                <a
                  href="/contact"
                  className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-white transition-opacity hover:opacity-70 whitespace-nowrap"
                >
                  <LocationIcon className="size-4" />
                  Oahu
                </a>
              </div>

              {/* Search icon — fades in on scroll */}
              <Link
                href="/search"
                className="cursor-pointer text-white transition-[opacity] duration-500 ease-in-out hover:opacity-70"
                aria-label="Search"
                style={{
                  opacity: scrolled ? 1 : 0,
                  pointerEvents: scrolled ? "auto" : "none",
                }}
              >
                <SearchIcon className="size-5" />
              </Link>

              {/* Always visible icons */}
              <button
                type="button"
                className="cursor-pointer text-white transition-opacity hover:opacity-70"
                aria-label="Account"
              >
                <UserIcon className="size-5" />
              </button>
              <button
                type="button"
                className="relative cursor-pointer text-white transition-opacity hover:opacity-70"
                aria-label="Cart"
                onClick={() => setCartOpen(true)}
              >
                <CartIcon className="size-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-white text-[#ff6c0e] text-[9px] font-bold">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>

              {/* Hamburger — fades in on scroll */}
              <button
                type="button"
                className="cursor-pointer text-white transition-[opacity] duration-500 ease-in-out hover:opacity-70"
                aria-label="Open menu"
                style={{
                  opacity: scrolled ? 1 : 0,
                  pointerEvents: scrolled ? "auto" : "none",
                }}
              >
                <MenuIcon className="size-5" />
              </button>
            </div>

            {/* Mobile icons */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Expandable search bar */}
              {mobileSearchOpen && (
                <form
                  onSubmit={submitSearch}
                  role="search"
                  className="flex overflow-hidden rounded-full border border-white/40 animate-in fade-in slide-in-from-right-4 duration-200"
                >
                  <input
                    type="text"
                    name="q"
                    placeholder="Search..."
                    autoFocus
                    className="w-[140px] sm:w-[180px] border-none bg-transparent px-3 py-1.5 text-[16px] text-white outline-none placeholder:text-white/70"
                  />
                  <button
                    type="submit"
                    className="flex shrink-0 items-center justify-center bg-[#111] px-2.5"
                    aria-label="Submit search"
                  >
                    <SearchIcon className="size-3.5 text-white" />
                  </button>
                </form>
              )}
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 text-white transition-opacity hover:opacity-70"
                aria-label={mobileSearchOpen ? "Close search" : "Search"}
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              >
                {mobileSearchOpen ? (
                  <CloseIcon className="size-4" />
                ) : (
                  <SearchIcon className="size-5" />
                )}
              </button>
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 text-white transition-opacity hover:opacity-70"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setMobileSearchOpen(false); }}
              >
                {mobileMenuOpen ? (
                  <CloseIcon className="size-5" />
                ) : (
                  <MenuIcon className="size-5" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Row — uses grid-rows trick for smooth height collapse */}
          <div
            className="hidden md:grid transition-[grid-template-rows,opacity] duration-500 ease-in-out"
            style={{
              gridTemplateRows: scrolled ? "0fr" : "1fr",
              opacity: scrolled ? 0 : 1,
            }}
          >
            <div className="overflow-hidden">
              <div className="flex items-center justify-between px-8 py-2.5">
                <nav className="flex items-center gap-5 lg:gap-6">
                  <button
                    type="button"
                    className={`flex cursor-pointer items-center gap-1 whitespace-nowrap text-sm font-extrabold transition-opacity hover:opacity-70 ${
                      openDropdown === "Rentals" ? "text-white/70" : "text-white"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === "Rentals" ? null : "Rentals");
                    }}
                    tabIndex={scrolled ? -1 : 0}
                  >
                    Rentals
                    <ChevronDownIcon className="size-3" />
                  </button>
                  {STATIC_LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="whitespace-nowrap text-sm font-extrabold text-white transition-opacity hover:opacity-70"
                      tabIndex={scrolled ? -1 : 0}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
                <a
                  href={`tel:${SITE.phone.replace(/\D/g, "")}`}
                  className="shrink-0 whitespace-nowrap text-sm font-semibold text-white transition-opacity hover:opacity-70"
                  tabIndex={scrolled ? -1 : 0}
                >
                  Call Us: {SITE.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mega menu panel — shows all rental categories */}
        {openDropdown === "Rentals" && categories.length > 0 && (
          <div
            className="mx-auto mt-3 overflow-hidden bg-white"
            style={{
              borderRadius: 24,
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            }}
          >
            <div className="pt-8 pb-4 text-center text-sm font-bold uppercase tracking-[0.15em] text-[#111]">
              Rentals
            </div>
            <div className="px-8 pb-10">
              <div className="mx-auto grid max-w-[1100px] gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 5)}, 1fr)` }}>
                {categories.map((cat) => {
                  const firstWithImage = cat.products.find((p) => p.imageUrl);
                  const catDef = getCategoryByLabel(cat.label);
                  const href = catDef ? `/rentals/${catDef.slug}` : "#";
                  return (
                    <Link
                      key={cat.label}
                      href={href}
                      className="flex flex-col items-center gap-3 rounded-xl p-3 transition-all hover:bg-[#f5f5f5] no-underline"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <div className="relative h-[100px] w-[100px] overflow-hidden rounded-full border-2 border-[#eee] bg-[#f5f5f5]">
                        {firstWithImage?.imageUrl ? (
                          <Image
                            src={firstWithImage.imageUrl}
                            alt={cat.label}
                            fill
                            sizes="100px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[11px] text-[#aaa] font-medium">
                            {cat.label}
                          </span>
                        )}
                      </div>
                      <span className="text-center text-[13px] font-semibold leading-snug text-[#333]">
                        {cat.label}
                      </span>
                      <span className="text-[11px] text-[#999]">
                        {cat.products.length} items
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="mt-2 rounded-3xl bg-white p-6 md:hidden"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
          >
            <form
              onSubmit={submitSearch}
              role="search"
              className="mb-4 flex overflow-hidden rounded-full border border-[#cccccc]"
            >
              <input
                type="text"
                name="q"
                placeholder="What are you looking for?"
                className="w-full border-none bg-transparent px-4 py-2 text-[16px] sm:text-[13px] text-[#111] outline-none placeholder:text-[#999]"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center justify-center bg-[#111] px-3"
                aria-label="Search"
              >
                <SearchIcon className="size-4 text-white" />
              </button>
            </form>
            <nav className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
              {/* Rentals with expandable categories */}
              <div>
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-2.5 text-sm font-extrabold text-[#111]"
                  onClick={() => setMobileDropdown(mobileDropdown === "Rentals" ? null : "Rentals")}
                >
                  Rentals
                  <ChevronDownIcon
                    className="size-4 transition-transform duration-200"
                    style={{ transform: mobileDropdown === "Rentals" ? "rotate(180deg)" : "rotate(0)" }}
                  />
                </button>
                {mobileDropdown === "Rentals" && (
                  <div className="ml-3 mb-2 flex flex-col gap-1 border-l-2 border-[#eee] pl-3">
                    {categories.map((cat) => {
                      const catDef = getCategoryByLabel(cat.label);
                      const href = catDef ? `/rentals/${catDef.slug}` : "#";
                      return (
                        <a
                          key={cat.label}
                          href={href}
                          className="py-1.5 text-[13px] text-[#666] transition-colors hover:text-[#111]"
                        >
                          {cat.label}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
              {STATIC_LINKS.map((link) => (
                <a key={link.label} href={link.href} className="py-2.5 text-sm font-extrabold text-[#111]">
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-3 border-t border-[#eee] pt-4">
              <a href="/gallery" className="text-sm font-extrabold text-[#111]">
                Gallery
              </a>
              <a
                href="/about"
                className="flex items-center gap-1 text-sm font-extrabold text-[#111]"
              >
                About
                <ChevronDownIcon className="size-3" />
              </a>
              <a
                href="/contact"
                className="flex items-center gap-1 text-sm font-semibold text-[#111]"
              >
                <LocationIcon className="size-4" />
                Oahu
              </a>
              <a
                href={`tel:${SITE.phone.replace(/\D/g, "")}`}
                className="text-sm font-semibold text-[#111]"
              >
                Call Us: {SITE.phone}
              </a>
            </div>
            <div className="mt-4 flex items-center gap-4 border-t border-[#eee] pt-4">
              <button
                type="button"
                className="relative text-[#111]"
                aria-label="Cart"
                onClick={() => {
                  setCartOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                <CartIcon className="size-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-[#111] text-white text-[9px] font-bold">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
