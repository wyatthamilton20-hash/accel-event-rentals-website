"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  SearchIcon,
  ChevronDownIcon,
  UserIcon,
  CartIcon,
  LocationIcon,
  MenuIcon,
  CloseIcon,
} from "@/components/icons";

interface DropdownItem {
  label: string;
  image: string;
}

interface NavItem {
  label: string;
  hasDropdown: boolean;
  dropdown?: DropdownItem[];
}

const categoryLinks: NavItem[] = [
  {
    label: "Tents",
    hasDropdown: true,
    dropdown: [
      { label: "Sailcloth Tents", image: "/images/hero/1.jpg" },
      { label: "Frame Tents", image: "/images/hero/2.jpg" },
      { label: "Pole Tents", image: "/images/hero/3.jpg" },
      { label: "Clear Top Tents", image: "/images/hero/4.jpg" },
      { label: "Canopies", image: "/images/hero/5.jpg" },
    ],
  },
  {
    label: "Furnishings",
    hasDropdown: true,
    dropdown: [
      { label: "Chairs", image: "/images/products/flora-bella.jpg" },
      { label: "Dining Tables", image: "/images/products/aria-stainless.jpg" },
      { label: "Cocktail Tables", image: "/images/products/birch-honey.jpg" },
      { label: "Sofas & Lounges", image: "/images/products/tivoli-chair.jpg" },
      { label: "Bars & Back Bars", image: "/images/products/tribeca-bar.jpg" },
      { label: "Bar Stools", image: "/images/products/vero-chair.jpg" },
      { label: "Outdoor Furniture", image: "/images/products/palermo-highboy.jpg" },
    ],
  },
  {
    label: "Tabletop",
    hasDropdown: true,
    dropdown: [
      { label: "Dinnerware", image: "/images/products/flora-bella.jpg" },
      { label: "Chargers", image: "/images/products/birch-honey.jpg" },
      { label: "Flatware", image: "/images/products/aria-stainless.jpg" },
      { label: "Glassware", image: "/images/products/napoli-glassware.jpg" },
      { label: "Linens", image: "/images/products/product-11.jpg" },
      { label: "Tabletop Accessories", image: "/images/products/product-12.jpg" },
    ],
  },
  {
    label: "Catering",
    hasDropdown: true,
    dropdown: [
      { label: "Cooking Equipment", image: "/images/products/palermo-highboy.jpg" },
      { label: "Serving Pieces", image: "/images/products/milo-bar.jpg" },
      { label: "Buffetware", image: "/images/products/product-10.jpg" },
      { label: "Beverage Service", image: "/images/products/napoli-glassware.jpg" },
    ],
  },
  {
    label: "Decor",
    hasDropdown: true,
    dropdown: [
      { label: "Greenery & Florals", image: "/images/hero/6.jpg" },
      { label: "Pipe & Drape", image: "/images/hero/7.jpg" },
      { label: "Chandeliers & Lighting", image: "/images/hero/8.jpg" },
      { label: "Props", image: "/images/products/product-12.jpg" },
      { label: "Cabanas", image: "/images/hero/5.jpg" },
    ],
  },
  {
    label: "More for Your Event",
    hasDropdown: true,
    dropdown: [
      { label: "Dance Floors", image: "/images/hero/3.jpg" },
      { label: "Staging", image: "/images/hero/1.jpg" },
      { label: "Fans & Cooling", image: "/images/hero/4.jpg" },
      { label: "Electrical & PA", image: "/images/hero/7.jpg" },
      { label: "Miscellaneous", image: "/images/hero/2.jpg" },
    ],
  },
  { label: "What's New", hasDropdown: false },
  { label: "Gallery", hasDropdown: false },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  useEffect(() => {
    if (!openDropdown) return;
    setOpenDropdown(null);
  }, [scrolled]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeDropdown = categoryLinks.find(
    (l) => l.label === openDropdown && l.dropdown
  );

  return (
    <>
      {openDropdown && activeDropdown && (
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
          className="mx-auto bg-white transition-[max-width,border-radius,box-shadow] duration-500 ease-in-out"
          style={{
            borderRadius: scrolled ? 60 : 119,
            boxShadow: scrolled
              ? "0 2px 12px rgba(0,0,0,0.15)"
              : "0 0 5px #9f9f9f",
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
            <a href="/" className="shrink-0 leading-none">
              <span
                className="font-bold tracking-[-0.02em] text-[#111] transition-[font-size] duration-500 ease-in-out"
                style={{ fontSize: scrolled ? 17 : 22 }}
              >
                ACCEL
              </span>
              <span
                className="block font-normal uppercase text-[#6b6b6b] transition-[font-size,margin,opacity] duration-500 ease-in-out"
                style={{
                  fontSize: scrolled ? 7 : 9,
                  letterSpacing: "0.15em",
                  marginTop: scrolled ? 0 : -2,
                }}
              >
                Event Rentals
              </span>
            </a>

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
              <div className="flex overflow-hidden rounded-full border border-[#cccccc]">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full border-none bg-transparent px-4 py-2 text-[16px] sm:text-[13px] text-[#111] outline-none placeholder:text-[#999]"
                  tabIndex={scrolled ? -1 : 0}
                />
                <button
                  type="button"
                  className="flex shrink-0 items-center justify-center bg-[#111] px-3 transition-opacity hover:opacity-80"
                  aria-label="Search"
                  tabIndex={scrolled ? -1 : 0}
                >
                  <SearchIcon className="size-4 text-white" />
                </button>
              </div>
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
                  className="cursor-pointer text-sm font-extrabold text-[#111] transition-opacity hover:opacity-70 whitespace-nowrap"
                >
                  Gallery
                </a>
                <a
                  href="/about"
                  className="flex cursor-pointer items-center gap-1 text-sm font-extrabold text-[#111] transition-opacity hover:opacity-70 whitespace-nowrap"
                >
                  About
                  <ChevronDownIcon className="size-3" />
                </a>
                <a
                  href="/locations"
                  className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-[#111] transition-opacity hover:opacity-70 whitespace-nowrap"
                >
                  <LocationIcon className="size-4" />
                  Oahu
                </a>
              </div>

              {/* Search icon — fades in on scroll */}
              <button
                type="button"
                className="cursor-pointer text-[#111] transition-[opacity] duration-500 ease-in-out hover:opacity-70"
                aria-label="Search"
                style={{
                  opacity: scrolled ? 1 : 0,
                  pointerEvents: scrolled ? "auto" : "none",
                }}
              >
                <SearchIcon className="size-5" />
              </button>

              {/* Always visible icons */}
              <button
                type="button"
                className="cursor-pointer text-[#111] transition-opacity hover:opacity-70"
                aria-label="Account"
              >
                <UserIcon className="size-5" />
              </button>
              <button
                type="button"
                className="cursor-pointer text-[#111] transition-opacity hover:opacity-70"
                aria-label="Cart"
              >
                <CartIcon className="size-5" />
              </button>

              {/* Hamburger — fades in on scroll */}
              <button
                type="button"
                className="cursor-pointer text-[#111] transition-[opacity] duration-500 ease-in-out hover:opacity-70"
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
                <div className="flex overflow-hidden rounded-full border border-[#ccc] animate-in fade-in slide-in-from-right-4 duration-200">
                  <input
                    type="text"
                    placeholder="Search..."
                    autoFocus
                    className="w-[140px] sm:w-[180px] border-none bg-transparent px-3 py-1.5 text-[16px] text-[#111] outline-none placeholder:text-[#999]"
                  />
                  <button
                    type="button"
                    className="flex shrink-0 items-center justify-center bg-[#111] px-2.5"
                    aria-label="Submit search"
                  >
                    <SearchIcon className="size-3.5 text-white" />
                  </button>
                </div>
              )}
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 text-[#111] transition-opacity hover:opacity-70"
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
                className="flex items-center justify-center w-10 h-10 text-[#111] transition-opacity hover:opacity-70"
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
              <div className="flex items-center justify-between border-t border-[#eee] px-8 py-2.5">
                <nav className="flex items-center gap-5 lg:gap-6">
                  {categoryLinks.map((link) => (
                    <button
                      key={link.label}
                      type="button"
                      className={`flex cursor-pointer items-center gap-1 whitespace-nowrap text-sm font-extrabold transition-opacity hover:opacity-70 ${
                        openDropdown === link.label ? "text-[#666]" : "text-[#111]"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (link.hasDropdown) {
                          setOpenDropdown(
                            openDropdown === link.label ? null : link.label
                          );
                        }
                      }}
                      tabIndex={scrolled ? -1 : 0}
                    >
                      {link.label}
                      {link.hasDropdown && <ChevronDownIcon className="size-3" />}
                    </button>
                  ))}
                </nav>
                <a
                  href="tel:18085551234"
                  className="shrink-0 whitespace-nowrap text-sm font-semibold text-[#111] transition-opacity hover:opacity-70"
                  tabIndex={scrolled ? -1 : 0}
                >
                  Call Us: (808) 555-1234
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mega menu panel */}
        {openDropdown && activeDropdown?.dropdown && (
          <div
            className="mx-auto mt-3 overflow-hidden bg-white"
            style={{
              borderRadius: 24,
              boxShadow: "0 0 5px #9f9f9f",
            }}
          >
            {/* Title */}
            <div className="pt-8 pb-4 text-center text-sm font-bold uppercase tracking-[0.15em] text-[#111]">
              {activeDropdown.label}
            </div>

            {/* Items grid — contained, no overflow */}
            <div className="px-8 pb-10">
              <div className="mx-auto grid max-w-[1100px] gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(activeDropdown.dropdown.length, 7)}, 1fr)` }}>
                {activeDropdown.dropdown.map((item) => (
                  <a
                    key={item.label}
                    href="#"
                    className="flex flex-col items-center gap-3 rounded-xl p-3 transition-all hover:bg-[#f5f5f5]"
                  >
                    <div className="relative h-[120px] w-[120px] overflow-hidden rounded-full border-2 border-[#eee]">
                      <Image
                        src={item.image}
                        alt={item.label}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-center text-[13px] font-medium leading-snug text-[#333]">
                      {item.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="mt-2 rounded-3xl bg-white p-6 md:hidden"
            style={{ boxShadow: "0 0 5px #9f9f9f" }}
          >
            <div className="mb-4 flex overflow-hidden rounded-full border border-[#cccccc]">
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full border-none bg-transparent px-4 py-2 text-[16px] sm:text-[13px] text-[#111] outline-none placeholder:text-[#999]"
              />
              <button
                type="button"
                className="flex shrink-0 items-center justify-center bg-[#111] px-3"
                aria-label="Search"
              >
                <SearchIcon className="size-4 text-white" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
              {categoryLinks.map((link) => (
                <div key={link.label}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-2.5 text-sm font-extrabold text-[#111]"
                    onClick={() => {
                      if (link.hasDropdown) {
                        setMobileDropdown(mobileDropdown === link.label ? null : link.label);
                      }
                    }}
                  >
                    {link.label}
                    {link.hasDropdown && (
                      <ChevronDownIcon
                        className="size-4 transition-transform duration-200"
                        style={{ transform: mobileDropdown === link.label ? "rotate(180deg)" : "rotate(0)" }}
                      />
                    )}
                  </button>
                  {link.hasDropdown && link.dropdown && mobileDropdown === link.label && (
                    <div className="ml-3 mb-2 flex flex-col gap-1 border-l-2 border-[#eee] pl-3">
                      {link.dropdown.map((item) => (
                        <a key={item.label} href="#" className="py-1.5 text-[13px] text-[#666] transition-colors hover:text-[#111]">
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
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
                href="/locations"
                className="flex items-center gap-1 text-sm font-semibold text-[#111]"
              >
                <LocationIcon className="size-4" />
                Oahu
              </a>
              <a
                href="tel:18085551234"
                className="text-sm font-semibold text-[#111]"
              >
                Call Us: (808) 555-1234
              </a>
            </div>
            <div className="mt-4 flex items-center gap-4 border-t border-[#eee] pt-4">
              <button type="button" className="text-[#111]" aria-label="Account">
                <UserIcon className="size-5" />
              </button>
              <button type="button" className="text-[#111]" aria-label="Cart">
                <CartIcon className="size-5" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
