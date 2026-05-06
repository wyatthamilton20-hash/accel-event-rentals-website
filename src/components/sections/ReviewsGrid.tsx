"use client";

import { useState } from "react";
import type { GoogleReview } from "@/types/reviews";
import {
  StarFilledIcon,
  StarEmptyIcon,
  GoogleIcon,
  QuoteIcon,
} from "@/components/icons";

const VISIBLE_COUNT = 5;

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

function ReviewCard({ review }: { review: GoogleReview }) {
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
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: "24px 20px 20px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily: "'Poppins', sans-serif",
        height: "100%",
      }}
    >
      <QuoteIcon
        style={{ width: 28, height: 28, color: "#e0d6c8", flexShrink: 0 }}
      />

      <p
        style={{
          fontSize: 13,
          lineHeight: 1.6,
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
              fontSize: 12,
              cursor: "pointer",
              padding: "0 0 0 4px",
              fontFamily: "inherit",
            }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </p>

      <StarRating rating={review.rating} />

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <AuthorInitials name={review.authorName} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#111",
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
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

interface ReviewsGridProps {
  reviews: GoogleReview[];
  averageRating: number;
  totalReviews: number;
  placeId: string;
}

export function ReviewsGrid({
  reviews,
  averageRating,
  totalReviews,
  placeId,
}: ReviewsGridProps) {
  const visibleReviews = reviews.slice(0, VISIBLE_COUNT);
  const googleMapsUrl =
    placeId && placeId !== "demo"
      ? `https://search.google.com/local/reviews?placeid=${placeId}`
      : "https://www.google.com/maps/search/?api=1&query=Accel+Event+Rentals+Honolulu+HI";

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {visibleReviews.map((review, i) => (
          <ReviewCard key={`${review.authorName}-${i}`} review={review} />
        ))}
      </div>

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
