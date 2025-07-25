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
      <div className="browse-container">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', margin: 40 }}>Loading items...</div>
        ) : (
          <>
            {featuredItems.length > 0 && (
              <section className="featured-section">
                <div className="featured-title">Featured Items</div>
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
            <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8, color: "#232F3E" }}>Browse Items</h2>
            <p style={{ color: "#555", marginBottom: 24 }}>Find something you want? Buy or swap instantly.</p>
            {nonFeaturedItems.length === 0 && <div style={{ color: "#888", textAlign: "center", margin: 40 }}>No items found.</div>}
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
          </>
        )}
      </div>
    </>
  );
}
