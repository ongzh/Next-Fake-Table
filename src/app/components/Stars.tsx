import React from "react";
import fullStar from "../../../public/icons/full-star.png";
import halfStar from "../../../public/icons/half-star.png";
import emptyStar from "../../../public/icons/empty-star.png";
import Image from "next/image";
import { Review } from "@prisma/client";
import { calculateReviewRatingAverage } from "../../../utils/calculateReviewRatingAverage";

export default function Stars({
  reviews,
  rating,
}: {
  reviews?: Review[];
  rating?: number;
}) {
  const reviewRating = rating
    ? rating
    : reviews
    ? calculateReviewRatingAverage(reviews)
    : 0;

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      const diff = parseFloat((reviewRating - i).toFixed(1));
      if (diff >= 1) {
        stars.push(fullStar);
      } else if (diff < 1 && diff > 0) {
        stars.push(halfStar);
      } else {
        stars.push(emptyStar);
      }
    }

    return stars.map((star) => {
      return <Image src={star} alt="review-star" className="w-4 h-4 mr-1" />;
    });
  };

  return <div className="flex items-center">{renderStars()}</div>;
}
