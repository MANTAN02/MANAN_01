import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth, callBackendFunction } from '../AuthContext';
import { useToast } from '../components/ToastContext';
import "../styles.css";

function Spinner() {
  return (
    <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="4" fill="none" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ExchangeOfferPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await callBackendFunction('getUserSwaps', 'GET');
        setOffers(data);
      } catch (e) {
        setError('Failed to load swap offers');
      }
      setLoading(false);
    };
    fetchOffers();
  }, [user]);

  const handleAccept = async (swapId) => {
    setActionLoading(true);
    setActionError(null);
    setSuccessMessage("");
    try {
      await callBackendFunction('acceptSwap', 'POST', { swapId });
      setSuccessMessage('Offer accepted!');
      setOffers(prev => prev.map(o => o.id === swapId ? { ...o, status: 'accepted' } : o));
      showToast('Offer accepted!', 'success');
    } catch (e) {
      setActionError('Failed to accept offer');
      showToast('Failed to accept offer', 'error');
    }
    setActionLoading(false);
  };

  const handleDecline = async (swapId) => {
    setActionLoading(true);
    setActionError(null);
    setSuccessMessage("");
    try {
      await callBackendFunction('declineSwap', 'POST', { swapId });
      setSuccessMessage('Offer declined.');
      setOffers(prev => prev.map(o => o.id === swapId ? { ...o, status: 'declined' } : o));
      showToast('Offer declined.', 'info');
    } catch (e) {
      setActionError('Failed to decline offer');
      showToast('Failed to decline offer', 'error');
    }
    setActionLoading(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spinner /> Loading...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: '#c00' }}>{error}</div>;
  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Sign In Required</h2>
        <p>You must be logged in to view your swap offers.</p>
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    );
  }
  if (!offers || offers.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 20px" }}>
        <div style={{ 
          background: "#fff", 
          borderRadius: 16, 
          boxShadow: "0 4px 24px rgba(0,0,0,0.05)", 
          padding: 40, 
          textAlign: "center" 
        }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
          <h2 style={{ fontWeight: 800, fontSize: 28, color: "#232F3E", marginBottom: 16 }}>
            No Exchange Offers
          </h2>
          <p style={{ color: "#666", marginBottom: 24, fontSize: "1.1rem" }}>
            You have no exchange offers at this time. Check back later or propose a swap!
          </p>
          <Button variant="premium" onClick={() => navigate('/browse')}>
            Browse Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ 
        background: "#fff", 
        borderRadius: 16, 
        boxShadow: "0 4px 24px rgba(0,0,0,0.05)", 
        padding: 32 
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8, color: "#232F3E" }}>
            My Swap Offers
          </h2>
          <p style={{ color: "#666", fontSize: "1rem" }}>
            View and manage all your swap offers
          </p>
          {successMessage && <div style={{ color: '#22a06b', fontWeight: 600, marginTop: 8 }}>{successMessage}</div>}
          {actionError && <div style={{ color: '#c00', fontWeight: 600, marginTop: 8 }}>{actionError}</div>}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr style={{ background: '#f7faff' }}>
                <th style={{ padding: 12, borderBottom: '2px solid #e0e7ff' }}>Offer ID</th>
                <th style={{ padding: 12, borderBottom: '2px solid #e0e7ff' }}>Your Item</th>
                <th style={{ padding: 12, borderBottom: '2px solid #e0e7ff' }}>Requested Item</th>
                <th style={{ padding: 12, borderBottom: '2px solid #e0e7ff' }}>Net Amount</th>
                <th style={{ padding: 12, borderBottom: '2px solid #e0e7ff' }}>Status</th>
                <th style={{ padding: 12, borderBottom: '2px solid #e0e7ff' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(offer => (
                <tr key={offer.id} style={{ borderBottom: '1px solid #e0e7ff' }}>
                  <td style={{ padding: 10 }}>{offer.id}</td>
                  <td style={{ padding: 10 }}>
                    {offer.itemOfferedId || '-'}
                  </td>
                  <td style={{ padding: 10 }}>
                    {offer.itemRequestedId || '-'}
                  </td>
                  <td style={{ padding: 10, fontWeight: 600, color: offer.netAmount > 0 ? '#ff4d6d' : offer.netAmount < 0 ? '#22a06b' : '#232F3E' }}>
                    {offer.netAmount === 0 ? 'Even' : offer.netAmount > 0 ? `Pay ₹${offer.netAmount}` : `Receive ₹${Math.abs(offer.netAmount)}`}
                  </td>
                  <td style={{ padding: 10, fontWeight: 600, color: offer.status === 'accepted' ? '#22a06b' : offer.status === 'declined' ? '#c00' : '#a259f7' }}>
                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </td>
                  <td style={{ padding: 10 }}>
                    {offer.status === 'pending' && (
                      <>
                        <Button 
                          variant="premium" 
                          onClick={() => handleAccept(offer.id)}
                          loading={actionLoading}
                          style={{ marginRight: 8 }}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="danger" 
                          onClick={() => handleDecline(offer.id)}
                          loading={actionLoading}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {offer.status !== 'pending' && <span style={{ color: '#888' }}>No actions</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: "center" }}>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/browse')}
            disabled={actionLoading}
          >
            Back to Browse
          </Button>
        </div>
      </div>
    </div>
  );
}
