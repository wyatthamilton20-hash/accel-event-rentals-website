"use client";

import { useState, useCallback, useEffect } from "react";
import type { GoogleReview } from "@/types/reviews";
import {
  StarFilledIcon,
  StarEmptyIcon,
  GoogleIcon,
  QuoteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";

const CARD_WIDTH = 300;
const CARD_GAP = 16;

function getVisibleCount(): number {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth >= 1100) return 3;
  if (window.innerWidth >= 700) return 2;
  return 1;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= rating ? (
          <StarFilledIcon
            key={i}
            style={{ width: 16, height: 16, color: "#D4A853" }}
          />
        ) : (
          <StarEmptyIcon
            key={i}
            style={{ width: 16, height: 16, color: "#D4A853" }}
          />
        ),
      )}
    </span>
  );
}

function AuthorInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: "#111",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 600,
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
    >
      {initials}
    </div>
  );
}

function ReviewCard({ review, width }: { review: GoogleReview; width: number }) {
  const [expanded, setExpanded] = useState(false);
  const truncateAt = 180;
  const needsTruncation = review.text.length > truncateAt;
  const displayText =
    !expanded && needsTruncation
      ? review.text.slice(0, truncateAt).trimEnd() + "..."
      : review.text;

  return (
    <div
      style={{
        width: width,
        flexShrink: 0,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: "24px 20px 20px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Quote icon */}
      <QuoteIcon
        style={{ width: 28, height: 28, color: "#e0d6c8", flexShrink: 0 }}
      />

      {/* Review text */}
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "#444",
          margin: 0,
          flex: 1,
        }}
      >
        {displayText}
        {needsTruncation && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none",
              border: "none",
              color: "#111",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              padding: "0 0 0 4px",
              fontFamily: "inherit",
            }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </p>

      {/* Stars */}
      <StarRating rating={review.rating} />

      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <AuthorInitials name={review.authorName} />
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#111",
              lineHeight: 1.3,
            }}
          >
            {review.authorName}
          </div>
          {review.relativeTime && (
            <div
              style={{
                fontSize: 12,
                color: "#888",
                marginTop: 2,
              }}
            >
              {review.relativeTime}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReviewsCarouselProps {
  reviews: GoogleReview[];
  averageRating: number;
  totalReviews: number;
  placeId: string;
}

export function ReviewsCarousel({
  reviews,
  averageRating,
  totalReviews,
  placeId,
}: ReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH);

  useEffect(() => {
    function handleResize() {
      const count = getVisibleCount();
      setVisibleCount(count);
      setCardWidth(window.innerWidth < 400 ? window.innerWidth - 48 : CARD_WIDTH);
      setCurrentIndex((prev) => {
        const max = reviews.length - count;
        return prev > max ? Math.max(0, max) : prev;
      });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [reviews.length]);

  const maxIndex = Math.max(0, reviews.length - visibleCount);
  const showArrows = reviews.length > visibleCount;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const slideOffset = currentIndex * (cardWidth + CARD_GAP);

  const googleMapsUrl = `https://search.google.com/local/reviews?placeid=${placeId}`;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Header: Google icon + rating + count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
        className="max-sm:flex-col max-sm:items-start max-sm:gap-3"
      >
        <GoogleIcon style={{ width: 24, height: 24, flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StarRating rating={Math.round(averageRating)} />
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#111",
            }}
          >
            {averageRating.toFixed(1)}
          </span>
          <span style={{ fontSize: 14, color: "#666" }}>
            based on {totalReviews.toLocaleString()} reviews
          </span>
        </div>
      </div>

      {/* Carousel */}
      <div style={{ position: "relative" }}>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              gap: CARD_GAP,
              transform: `translateX(-${slideOffset}px)`,
              transition: "transform 0.5s ease",
            }}
          >
            {reviews.map((review, i) => (
              <ReviewCard key={`${review.authorName}-${i}`} review={review} width={cardWidth} />
            ))}
          </div>
        </div>

        {/* Arrows */}
        {showArrows && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous review"
              className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer"
              style={{
                left: 4,
                width: 44,
                height: 44,
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <ChevronLeftIcon
                className="h-4 w-4"
                style={{ color: "#333" }}
              />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next review"
              className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer"
              style={{
                right: 4,
                width: 44,
                height: 44,
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <ChevronRightIcon
                className="h-4 w-4"
                style={{ color: "#333" }}
              />
            </button>
          </>
        )}
      </div>

      {/* Google attribution link */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            color: "#666",
            textDecoration: "none",
            fontWeight: 500,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#111";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#666";
          }}
        >
          View all reviews on Google &rarr;
        </a>
      </div>
    </div>
  );
}
