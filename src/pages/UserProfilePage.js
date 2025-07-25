import React from "react";
import "../styles.css";

export default function UserProfilePage() {
  // Placeholder user data
  const user = {
    name: "John Doe",
    email: "john.doe@email.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    reviews: [
      { item: "Used Laptop", rating: 5, comment: "Great product!", date: "2024-06-01" },
      { item: "Mountain Bike", rating: 4, comment: "Smooth ride.", date: "2024-05-28" }
    ],
    swaps: [
      { item: "Bluetooth Speaker", status: "Completed", date: "2024-05-20" },
      { item: "Mountain Bike", status: "Pending", date: "2024-06-02" }
    ]
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={user.avatar} alt="Avatar" className="profile-avatar" />
        <div className="profile-info">
          <div className="profile-name">{user.name}</div>
          <div className="profile-email">{user.email}</div>
        </div>
      </div>
      <div className="profile-section">
        <div className="profile-section-title">Recent Reviews</div>
        {user.reviews.length === 0 && <div className="profile-empty">No reviews yet.</div>}
        {user.reviews.map((r, i) => (
          <div key={i} className="profile-review">
            <span className="profile-review-item">{r.item}</span>
            <span className="profile-review-rating">{"★".repeat(r.rating)}</span>
            <span className="profile-review-comment">{r.comment}</span>
            <span className="profile-review-date">{r.date}</span>
          </div>
        ))}
      </div>
      <div className="profile-section">
        <div className="profile-section-title">Recent Swaps</div>
        {user.swaps.length === 0 && <div className="profile-empty">No swaps yet.</div>}
        {user.swaps.map((s, i) => (
          <div key={i} className="profile-swap">
            <span className="profile-swap-item">{s.item}</span>
            <span className={`profile-swap-status ${s.status.toLowerCase()}`}>{s.status}</span>
            <span className="profile-swap-date">{s.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 