import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth, callBackendFunction } from '../AuthContext';
import ExchangeForm from "../components/ExchangeForm";
import Button from "../components/Button";
import "../styles.css";

export default function ExchangePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  // Get itemId from URL or location state
  const { id: itemId } = useParams();
  const [theirItem, setTheirItem] = useState(null);
  const [yourItems, setYourItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get the item being requested
        let item = location.state?.item;
        if (!item && itemId) {
          // Fetch from backend if not passed in state
          const items = await callBackendFunction('getItems', 'GET');
          item = items.find(i => i.id === itemId);
        }
        setTheirItem(item);
        // Get all user's items
        if (user) {
          const myItems = await callBackendFunction('getItems', 'GET', { ownerId: user.uid });
          setYourItems(myItems);
        } else {
          setYourItems([]);
        }
      } catch (e) {
        setError('Failed to load exchange data');
      }
      setLoading(false);
    };
    fetchData();
  }, [user, itemId, location.state]);

  const handleBack = () => {
    navigate('/browse');
  };

  const handleConfirm = (offer) => {
    navigate('/exchange-offers', { state: { offer } });
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#c00' }}>{error}</div>;
  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Sign In Required</h2>
        <p>You must be logged in to propose an exchange.</p>
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    );
  }
  if (!theirItem) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Item Not Found</h2>
        <p>The item you want to exchange for could not be found.</p>
        <Button onClick={handleBack}>Back</Button>
      </div>
    );
  }
  if (!yourItems || yourItems.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>No Items to Offer</h2>
        <p>You need to list at least one item before you can propose an exchange.</p>
        <Button onClick={() => navigate('/list')}>List an Item</Button>
        <Button variant="secondary" onClick={handleBack} style={{ marginLeft: 12 }}>Back</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto 0 auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.05)", padding: 32 }}>
      <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 16 }}>Propose Exchange</h2>
      {/* Show all details of the item being requested */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
        <img src={theirItem.image || 'https://via.placeholder.com/100x100?text=Item'} alt={theirItem.title || theirItem.name} style={{ width: 100, height: 100, borderRadius: 12, objectFit: 'cover', border: '2px solid #a259f7' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{theirItem.title || theirItem.name}</div>
          {theirItem.category && <div style={{ color: '#a259f7', fontWeight: 600, fontSize: 16 }}>Category: {theirItem.category}</div>}
          <div style={{ color: '#FFD814', fontWeight: 700, fontSize: 18 }}>₹{theirItem.price?.toLocaleString()}</div>
          {theirItem.description && <div style={{ color: '#555', marginTop: 8 }}>{theirItem.description}</div>}
        </div>
      </div>
      <ExchangeForm
        userItems={yourItems}
        selectedItem={theirItem}
        onBack={handleBack}
        onSubmit={handleConfirm}
      />
    </div>
  );
}