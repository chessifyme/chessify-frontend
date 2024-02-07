import React, { useState } from 'react';
import ReactStars from 'react-rating-stars-component';
import { sendChessAIReview } from '../../utils/api';

const ReviewChessAI = ({
  reviewFen,
  reviewPgnStr,
  gptResponse,
  userInfo,
  isSent,
  setIsSent,
}) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleReviewChange = (event) => {
    setReviewText(event.target.value);
  };

  const submitReview = () => {
    sendChessAIReview(
      reviewFen,
      reviewPgnStr,
      gptResponse,
      rating,
      reviewText,
      userInfo.token
    ).then(() => {
      setIsSent(true);
    });
    setRating(0);
    setReviewText('');
  };

  return (
    <div className="rating-and-review">
      {!isSent ? (
        <>
          <h6>Leave a Review</h6>
          <div className="rating-section">
            <ReactStars
              count={5}
              value={rating}
              onChange={handleRatingChange}
              size={35}
              isHalf={true}
              color="#788078"
              activeColor="#358c65"
            />
          </div>
          <div className="review-section">
            <textarea
              placeholder="Write your review..."
              value={reviewText}
              onChange={handleReviewChange}
              rows={2}
            />
          </div>
          <div className="submit-section mt-3">
            <button className="green-btn mt-0" onClick={submitReview}>
              Submit Review
            </button>
          </div>
        </>
      ) : (
        <>
          Thank you for taking the time to leave your valuable feedback! Your
          insights help us improve and serve you better.
        </>
      )}
    </div>
  );
};

export default ReviewChessAI;
