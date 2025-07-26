import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import Button from "./Button";

function SwapSymbol() {
  // Modern swap arrows SVG
  return (
    <span className="swap-symbol" title="Swap Offer" style={{ marginRight: 8, verticalAlign: 'middle' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 18l-3 3 3 3" stroke="#a259f7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 21h13a5 5 0 0 0 5-5V4" stroke="#a259f7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 10l3-3-3-3" stroke="#ff914d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 7H11a5 5 0 0 0-5 5v12" stroke="#ff914d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

export default function ItemCard({ item, isOwn, onAddToCart, onOfferExchange, onOfferFullPrice }) {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [liked, setLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const badges = item.badges || [];
  const [reviews, setReviews] = useState(item.reviews || []);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  // Check if item is already in cart
  const isInCart = cartItems.some(cartItem => cartItem.id === item.id);
  const cartItem = cartItems.find(cartItem => cartItem.id === item.id);

  function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setReviews([
      ...reviews,
      {
        user: "You",
        rating: reviewRating,
        comment: reviewText,
        date: new Date().toLocaleDateString()
      }
    ]);
    setReviewText("");
    setReviewRating(5);
    setShowReviewForm(false);
  }

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      await addToCart(item, 1);
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2000);
      
      // Also call the original handler if provided
      if (onAddToCart) {
        onAddToCart(item);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (onOfferFullPrice) {
      onOfferFullPrice(item);
      navigate('/delivery');
    }
  };

  const handleOfferExchange = () => {
    if (onOfferExchange) {
      onOfferExchange(item);
      navigate('/exchange');
    }
  };

  // Removed unused handleOfferBoth function

  const handleViewCart = () => {
    navigate('/cart');
  };

  const handleToggleWishlist = () => {
    setLiked(!liked);
    // Here you could also save to a wishlist context or API
  };

  return (
    <div 
      className="card item-card" 
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/product/${item.id}`)}
    >
      <div className="item-badges">
        {badges.map(badge => (
          <span key={badge} className={`item-badge ${badge}`}>{badge}</span>
        ))}
      </div>
      
      <button
        className={`heart-btn${liked ? " liked" : ""}`}
        onClick={handleToggleWishlist}
        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          background: "rgba(255,255,255,0.9)",
          border: "none",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          cursor: "pointer",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.2s"
        }}
      >
        {liked ? "❤️" : "🤍"}
      </button>

      {/* Success Message */}
      {showSuccessMessage && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#22a06b",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "8px",
          fontSize: "0.9rem",
          fontWeight: "600",
          zIndex: 10,
          animation: "fadeInUp 0.3s ease"
        }}>
          Added to cart!
        </div>
      )}
      
      <img
        src={item.image || "https://via.placeholder.com/80x80?text=No+Image"}
        alt={item.name}
        className="item-image"
        onError={e => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/80x80?text=No+Image"; }}
      />
      
      <div className="item-details">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="item-title">{item.name}</div>
          {onOfferExchange && <SwapSymbol />}
        </div>
        {item.category && (
          <div style={{ fontSize: '0.95em', color: '#a259f7', fontWeight: 600, marginBottom: 2 }}>
            Category: {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
          </div>
        )}
        <div className="item-description">
          {item.description && item.description.length > 100 
            ? `${item.description.substring(0, 100)}...` 
            : item.description
          }
        </div>
        <div className="item-price">₹{item.price?.toLocaleString()}</div>
        
        <div className="actions" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
          {!isOwn && (
            <>
              {isInCart ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
                  <Button 
                    variant="success" 
                    onClick={handleViewCart}
                    style={{ flex: 1 }}
                  >
                    In Cart ({cartItem?.quantity}) - View Cart
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleAddToCart}
                  loading={isAddingToCart}
                  disabled={isAddingToCart}
                  style={{ flex: 1 }}
                >
                  Add to Cart
                </Button>
              )}
              
              <Button 
                variant="premium" 
                onClick={handleBuyNow}
                style={{ flex: 1 }}
              >
                Buy Now
              </Button>
              
              {onOfferExchange && (
                <Button 
                  variant="secondary" 
                  onClick={handleOfferExchange}
                  style={{ flex: 1 }}
                >
                  <SwapSymbol />Exchange
                </Button>
              )}
            </>
          )}
          {isOwn && (
            <span 
              className="item-own" 
              style={{ 
                color: "#22a06b", 
                fontWeight: 600, 
                fontSize: "0.9rem",
                padding: "8px 12px",
                background: "#f0f9f4",
                borderRadius: "8px",
                border: "1px solid #22a06b"
              }}
            >
              Your item
            </span>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="reviews-section">
          <div className="reviews-header">
            <span>Reviews ({reviews.length})</span>
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              style={{ 
                background: "none", 
                border: "none", 
                color: "#a259f7", 
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: 600
              }}
            >
              {showReviewForm ? "Cancel" : "Add Review"}
            </button>
          </div>
          
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <label>Rating:</label>
                <select 
                  value={reviewRating} 
                  onChange={e => setReviewRating(Number(e.target.value))}
                >
                  {[5,4,3,2,1].map(rating => (
                    <option key={rating} value={rating}>
                      {"★".repeat(rating)} ({rating})
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Write your review..."
                rows="3"
                required
              />
              <Button type="submit" size="small">Submit Review</Button>
            </form>
          )}
          
          <div className="reviews-list">
            {reviews.slice(0, 3).map((review, index) => (
              <div key={index} className="review-item">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="review-user">{review.user}</span>
                  <span className="review-date">{review.date}</span>
                </div>
                <div className="review-rating">{"★".repeat(review.rating)}</div>
                <div className="review-comment">{review.comment}</div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="no-reviews">No reviews yet. Be the first to review!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
