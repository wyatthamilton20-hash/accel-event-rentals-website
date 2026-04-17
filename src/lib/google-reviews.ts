import type { GooglePlaceReviewsResponse, GoogleReview } from "@/types/reviews";

const DEMO_REVIEWS: GoogleReview[] = [
  {
    authorName: "Sarah K.",
    rating: 5,
    relativeTime: "2 weeks ago",
    text: "Accel made our Maui wedding absolutely magical! The lounge furniture and tent setup were beyond what we imagined. Their team was professional, on time, and handled every detail. We got so many compliments from our guests. Highly recommend for any event in Hawaii!",
    publishTime: "2026-04-01T00:00:00Z",
  },
  {
    authorName: "James L.",
    rating: 5,
    relativeTime: "1 month ago",
    text: "Used Accel for our corporate retreat on Oahu and everything was flawless. The tables, chairs, and bar setup looked incredible against the ocean backdrop. Communication was great from start to finish.",
    publishTime: "2026-03-15T00:00:00Z",
  },
  {
    authorName: "Malia T.",
    rating: 5,
    relativeTime: "1 month ago",
    text: "We've worked with several rental companies across the islands and Accel is hands down the best. Their inventory is modern and well-maintained, pricing is fair, and the delivery crew is always friendly. They're our go-to for every event now.",
    publishTime: "2026-03-10T00:00:00Z",
  },
  {
    authorName: "David R.",
    rating: 5,
    relativeTime: "2 months ago",
    text: "Hosted a 200-person gala at the Hilton Hawaiian Village and Accel delivered everything on time and in perfect condition. The cross-back chairs and gold flatware were stunning. Will absolutely use them again!",
    publishTime: "2026-02-20T00:00:00Z",
  },
  {
    authorName: "Tina W.",
    rating: 4,
    relativeTime: "3 months ago",
    text: "Beautiful rental pieces and great customer service. The sailcloth tent was the highlight of our beach birthday party. Only reason for 4 stars is I wish they had more color options for linens, but overall a wonderful experience.",
    publishTime: "2026-01-15T00:00:00Z",
  },
];

function getDemoReviews(): GooglePlaceReviewsResponse {
  return {
    reviews: DEMO_REVIEWS,
    averageRating: 4.9,
    totalReviews: 127,
    placeId: "demo",
  };
}

export async function fetchGoogleReviews(): Promise<GooglePlaceReviewsResponse> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) return getDemoReviews();

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=reviews,rating,userRatingCount`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) return getDemoReviews();

    const data = await res.json();

    const reviews: GoogleReview[] = (data.reviews ?? []).map(
      (r: {
        authorAttribution?: { displayName?: string };
        rating?: number;
        relativePublishTimeDescription?: string;
        text?: { text?: string };
        publishTime?: string;
      }) => ({
        authorName: r.authorAttribution?.displayName ?? "Anonymous",
        rating: r.rating ?? 5,
        relativeTime: r.relativePublishTimeDescription ?? "",
        text: r.text?.text ?? "",
        publishTime: r.publishTime ?? "",
      }),
    );

    return {
      reviews,
      averageRating: data.rating ?? 0,
      totalReviews: data.userRatingCount ?? 0,
      placeId,
    };
  } catch {
    return getDemoReviews();
  }
}
