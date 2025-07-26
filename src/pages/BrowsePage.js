import React, { useState, useEffect } from "react";
import ItemCard from "../components/ItemCard";
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export const initialItems = [
  // ... keep for category suggestions, but do not display
];

export default function BrowsePage({ userItems, onAddToCart, onOfferExchange, onOfferFullPrice, search, searchCategory }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasOwnItem = userItems && userItems.length > 0;

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'items'));
      const firebaseItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(firebaseItems);
      setLoading(false);
    }
    fetchItems();
  }, []);

  // Filter items by search/category
  const filteredItems = items.filter(item => {
    const matchesCategory = searchCategory && item.category
      ? item.category.toLowerCase() === searchCategory.toLowerCase()
      : true;
    const matchesText = (item.name.toLowerCase().includes((search || "").toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes((search || "").toLowerCase())));
    return matchesCategory && matchesText;
  });

  // Featured items (show only a few at the top)
  const featuredItems = filteredItems.filter(item => item.featured);
  const nonFeaturedItems = filteredItems.filter(item => !item.featured);

  return (
    <>
      {/* Welcome Section for Landing Page */}
      <section className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome to SWAPIN</h1>
          <p className="welcome-desc">Barter, swap, or sell your items with trust. Enjoy modern, secure, and smart product matching with delivery tracking.</p>
        </div>
      </section>

      <div className="browse-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading items...</p>
          </div>
        ) : (
          <>
            {featuredItems.length > 0 && (
              <section className="featured-section">
                <div className="featured-title">🔥 Featured Items</div>
                <div className="featured-items">
                  {featuredItems.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      isOwn={item.owner === "me"}
                      onAddToCart={!hasOwnItem && item.owner !== "me" ? onAddToCart : undefined}
                      onOfferExchange={hasOwnItem && item.owner !== "me" ? onOfferExchange : undefined}
                      onOfferFullPrice={hasOwnItem && item.owner !== "me" ? onOfferFullPrice : undefined}
                    />
                  ))}
                </div>
              </section>
            )}
            
            <section className="all-items-section">
              <div className="section-header">
                <h2>Browse All Items</h2>
                <p>Find something you want? Buy or swap instantly.</p>
              </div>
              
              {nonFeaturedItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3>No items found</h3>
                  <p>Try adjusting your search or check back later for new items.</p>
                </div>
              ) : (
                <div className="items-grid">
                  {nonFeaturedItems.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      isOwn={item.owner === "me"}
                      onAddToCart={!hasOwnItem && item.owner !== "me" ? onAddToCart : undefined}
                      onOfferExchange={hasOwnItem && item.owner !== "me" ? onOfferExchange : undefined}
                      onOfferFullPrice={hasOwnItem && item.owner !== "me" ? onOfferFullPrice : undefined}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
