import Image from "next/image";
import { fetchGoogleReviews } from "@/lib/google-reviews";
import { ReviewsGrid } from "@/components/sections/ReviewsGrid";

export async function WelcomeSection() {
  const reviewsData = await fetchGoogleReviews();

  return (
    <section style={{ backgroundColor: "#e8e5e0" }}>
      <div
        className="max-w-[1300px] mx-auto flex items-center flex-col sm:flex-row gap-5 sm:gap-8 px-4 sm:px-10 py-8 sm:py-12"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* Logo mark */}
        <div className="shrink-0">
          <Image
            src="/images/logos/accel-logo.png"
            alt="Accel Event Rentals"
            width={130}
            height={40}
            style={{ filter: "invert(1)", height: 40, width: "auto" }}
          />
        </div>

        {/* Text */}
        <p
          style={{
            fontSize: 15,
            color: "#444444",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Welcome to Accel Event Rentals, your trusted source for inspired event
          rentals across Oahu and Maui. From relaxed beachfront celebrations to
          grand island galas, our curated inventory offers everything from modern
          essentials to timeless tropical favorites. With a focus on service,
          creativity, and seamless execution, we&rsquo;re here to help bring
          your event vision to life&mdash;beautifully and effortlessly.{" "}
          <strong style={{ color: "#111" }}>
            The Best Events Start Here.
          </strong>
        </p>
      </div>

      {/* Google Reviews */}
      {reviewsData.reviews.length > 0 && (
        <div className="max-w-[1300px] mx-auto px-4 sm:px-10 pb-8 sm:pb-12">
          <div
            style={{
              height: 1,
              backgroundColor: "#d0c8be",
              marginBottom: 32,
            }}
          />
          <ReviewsGrid
            reviews={reviewsData.reviews}
            averageRating={reviewsData.averageRating}
            totalReviews={reviewsData.totalReviews}
            placeId={reviewsData.placeId}
          />
        </div>
      )}
    </section>
  );
}
