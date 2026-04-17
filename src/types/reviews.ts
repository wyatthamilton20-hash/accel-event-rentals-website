export interface GoogleReview {
  authorName: string;
  rating: number;
  relativeTime: string;
  text: string;
  publishTime: string;
}

export interface GooglePlaceReviewsResponse {
  reviews: GoogleReview[];
  averageRating: number;
  totalReviews: number;
  placeId: string;
}
