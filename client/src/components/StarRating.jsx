// Here contains the logic for the star rating component, which displays a star-based rating system for products, allowing for fractional star ratings.

import './style/StarRating.css';

const StarRating = ({ rating = 0, numReviews = 0, idPrefix = 'prod' }) => {
  return (
    <div className="star-rating-row">
      <span className="rating-score">{Number(rating).toFixed(1)}/5</span>
      <span className="rating-stars">
        (
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const rawFill = Math.max(0, Math.min(1, rating - (starIndex - 1)));
          const roundedFill = Math.round(rawFill * 4) / 4;
          const fillPercent = `${roundedFill * 100}%`;
          const gradientId = `${idPrefix}-grad-${starIndex}-${roundedFill * 100}`;

          return (
            <svg key={starIndex} className="star-icon" viewBox="0 0 24 24">
              <defs>
                <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                  <stop offset={fillPercent} stopColor="#fbc531" />
                  <stop offset={fillPercent} stopColor="#dcdde1" />
                </linearGradient>
              </defs>
              <path
                fill={`url(#${gradientId})`}
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
          );
        })}
        )
      </span>

      {/* Review Count */}
      <span className="review-count">({numReviews})</span>
    </div>
  );
};

export default StarRating;