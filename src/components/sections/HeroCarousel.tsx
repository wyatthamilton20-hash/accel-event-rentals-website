"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

const SLIDE_COUNT = 5;
const AUTO_ADVANCE_MS = 5000;
const TRANSITION_DURATION = "1s";
const SHRINK_DISTANCE = 400; // px of scroll over which the shrink happens

const slides = Array.from({ length: SLIDE_COUNT }, (_, i) => ({
  src: `/images/hero/${i + 1}.jpg`,
  alt: `Event photo ${i + 1}`,
}));

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1440);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDE_COUNT);
    }, AUTO_ADVANCE_MS);
  }, []);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SLIDE_COUNT);
    startTimer();
  }, [startTimer]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SLIDE_COUNT) % SLIDE_COUNT);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  useEffect(() => {
    function handleScroll() {
      const progress = Math.min(1, window.scrollY / SHRINK_DISTANCE);
      setScrollProgress(progress);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleResize() { setWindowWidth(window.innerWidth); }
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Interpolate values based on scroll progress
  const scale = 1 - scrollProgress * 0.15;
  const borderRadius = scrollProgress * 24;
  const maxPad = windowWidth <= 640 ? 12 : 40;
  const horizontalPad = scrollProgress * maxPad;
  const shadow = scrollProgress;

  return (
    <div
      className="relative w-full h-dvh min-h-[400px] max-h-[715px]"
      style={{ padding: `0 ${horizontalPad}px` }}
    >
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          transform: `scale(${scale})`,
          borderRadius: `${borderRadius}px`,
          transformOrigin: "top center",
          transition: "border-radius 0.1s ease-out",
          boxShadow:
            shadow > 0.05
              ? `0 ${8 * shadow}px ${30 * shadow}px rgba(0,0,0,${0.2 * shadow})`
              : "none",
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className="absolute inset-0"
            style={{
              opacity: index === activeIndex ? 1 : 0,
              transition: `opacity ${TRANSITION_DURATION} ease-in-out`,
            }}
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="100vw"
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Brand overlay */}
        <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        <div className="pointer-events-none absolute inset-0 z-[5] flex flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
            Accel Event Rentals
          </h1>
          <p className="mt-3 text-base sm:text-lg md:text-xl font-medium tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
            Laulima. Ho’okipa. Pono.
          </p>
        </div>

        {/* Left arrow */}
        <button
          type="button"
          onClick={goToPrev}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-shadow cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
        </button>

        {/* Right arrow */}
        <button
          type="button"
          onClick={goToNext}
          aria-label="Next slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-shadow cursor-pointer"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
