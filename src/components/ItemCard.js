import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ItemCard({ item, isOwn, onAddToCart, onOfferExchange, onOfferFullPrice, onOfferBoth }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const badges = item.badges || [];
  const [reviews, setReviews] = useState(item.reviews || []);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

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

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(item);
      navigate('/delivery');
    }
  };

  const handleOfferExchange = () => {
    if (onOfferExchange) {
      onOfferExchange(item);
      navigate('/exchange');
    }
  };

  const handleOfferFullPrice = () => {
    if (onOfferFullPrice) {
      onOfferFullPrice(item);
      navigate('/delivery');
    }
  };

  const handleOfferBoth = () => {
    if (onOfferBoth) {
      onOfferBoth(item);
      navigate('/exchange');
    }
  };

  return (
    <div className="card item-card">
      <div className="item-badges">
        {badges.map(badge => (
          <span key={badge} className={`item-badge ${badge}`}>{badge}</span>
        ))}
      </div>
      <button
        className={`heart-btn${liked ? " liked" : ""}`}
        onClick={() => setLiked(l => !l)}
        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
      >
        {liked ? "❤️" : "🤍"}
      </button>
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
        <div className="item-description">{item.description}</div>
        <div className="item-price">₹{item.price}</div>
        <div className="actions">
          {!isOwn && (
            <>
              {onAddToCart && <Button onClick={handleAddToCart}>Add to Cart</Button>}
              {onOfferExchange && <Button variant="secondary" onClick={handleOfferExchange}><SwapSymbol />Offer Exchange</Button>}
              {onOfferFullPrice && <Button onClick={handleOfferFullPrice}>Offer Full Price</Button>}
              {onOfferBoth && <Button onClick={handleOfferBoth}>Offer Both</Button>}
            </>
          )}
          {isOwn && <span className="item-own">Your item</span>}
        </div>
      </div>
    </div>
  );
}
