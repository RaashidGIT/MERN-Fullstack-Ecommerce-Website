// Here contains the logic for the Product Reviews component, which displays the aggregate rating, allows logged-in users to submit reviews, and lists all existing reviews for a specific product. It handles form submission, error handling, and updates the parent component when a new review is added.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../pages/style/ProductReviews.css';

const ProductReviews = ({ product, onReviewAdded }) => {
  const { userInfo } = useUser();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setReviewSubmitting(true);
    setReviewError('');

    try {
      const res = await fetch(`http://localhost:5000/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (res.ok) {
        setComment('');
        if (onReviewAdded) {
          onReviewAdded();
        }
      } else {
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewError('Error submitting review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="reviews-section">
      <h2 className="reviews-main-title">
        Customer Reviews ({product?.numReviews || 0})
      </h2>

      {/* Top Row: Aggregate Score on Left, Write Form on Right */}
      <div className="reviews-top-row">
        {/* Vertical Aggregate Score Box */}
        <div className="vertical-rating-card">
          <span className="aggregate-big-number">
            {(product?.rating || 0).toFixed(1)}
          </span>
          <div className="aggregate-stars">
            {'★'.repeat(Math.round(product?.rating || 0))}
            {'☆'.repeat(5 - Math.round(product?.rating || 0))}
          </div>
          <span className="aggregate-subtext">
            Based on {product?.numReviews || 0}{' '}
            {product?.numReviews === 1 ? 'review' : 'reviews'}
          </span>

          {/* Star Breakdown Bars */}
          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = product?.reviews?.filter((r) => r.rating === star).length || 0;
              const pct = product?.numReviews ? (count / product.numReviews) * 100 : 0;
              return (
                <div key={star} className="breakdown-row">
                  <span className="breakdown-label">{star}★</span>
                  <div className="breakdown-track">
                    <div className="breakdown-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="breakdown-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write a Review Box */}
        <div className="review-form-container">
          <h3>Write a Review</h3>
          {reviewError && <div className="review-error-banner">{reviewError}</div>}

          {userInfo ? (
            <form onSubmit={submitReviewHandler} className="review-form">
              <label htmlFor="rating-select">RATING</label>
              <select
                id="rating-select"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value="5">5 - Excellent ★★★★★</option>
                <option value="4">4 - Very Good ★★★★☆</option>
                <option value="3">3 - Average ★★★☆☆</option>
                <option value="2">2 - Fair ★★☆☆☆</option>
                <option value="1">1 - Poor ★☆☆☆☆</option>
              </select>

              <label htmlFor="comment-text">COMMENT</label>
              <textarea
                id="comment-text"
                rows="4"
                value={comment}
                placeholder="Share details of your experience with this item..."
                onChange={(e) => setComment(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="submit-review-btn"
              >
                {reviewSubmitting ? 'Posting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <p className="login-prompt">
              Please <Link to="/login">Sign In</Link> to write a review.
            </p>
          )}
        </div>
      </div>

      {/* Bottom: Customer Feedback List */}
      <div className="reviews-list-container">
        <h3>User Feedback</h3>
        {product?.reviews?.length === 0 ? (
          <p className="no-reviews-text">No reviews yet for this product.</p>
        ) : (
          <div className="reviews-feed">
            {product?.reviews?.map((rev) => (
              <div key={rev._id} className="review-item-card">
                <div className="review-item-header">
                  <div className="review-user-info">
                    <span className="review-user-avatar">
                      {rev.name?.charAt(0).toUpperCase()}
                    </span>
                    <strong className="review-user-name">{rev.name}</strong>
                    <span className="review-date">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span className="review-stars-display">
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </span>
                </div>

                <p className="review-comment-text">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;