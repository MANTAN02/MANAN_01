import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import "../styles.css";

export default function ExchangeOfferPage({ offer, onAccept, onDecline }) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState(null); // 'accept' or 'decline'

  const handleAccept = async () => {
    try {
      setIsProcessing(true);
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onAccept) {
        onAccept(offer);
      }
      
      // Navigate to delivery page for accepted offers
      navigate('/delivery');
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('Failed to accept offer. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
    }
  };

  const handleDecline = async () => {
    try {
      setIsProcessing(true);
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onDecline) {
        onDecline(offer);
      }
      
      navigate('/browse');
    } catch (error) {
      console.error('Error declining offer:', error);
      alert('Failed to decline offer. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
    }
  };

  const handleActionClick = (action) => {
    setActionType(action);
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    if (actionType === 'accept') {
      handleAccept();
    } else if (actionType === 'decline') {
      handleDecline();
    }
  };

  const handleCancelAction = () => {
    setShowConfirmDialog(false);
    setActionType(null);
  };

  if (!offer) {
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
            No Exchange Offer
          </h2>
          <p style={{ color: "#666", marginBottom: 24, fontSize: "1.1rem" }}>
            No exchange offer to review at this time. Check back later for new offers!
          </p>
          <Button variant="premium" onClick={() => navigate('/browse')}>
            Browse Items
          </Button>
        </div>
      </div>
    );
  }

  const { yourItem, theirItem, additionalCash = 0, message, netAmount, timestamp } = offer;

  return (
    <>
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: 32,
            maxWidth: 400,
            margin: "0 20px",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#232F3E", marginBottom: 16 }}>
              {actionType === 'accept' ? 'Accept Exchange Offer?' : 'Decline Exchange Offer?'}
            </h3>
            <p style={{ color: "#666", marginBottom: 24 }}>
              {actionType === 'accept' 
                ? 'Are you sure you want to accept this exchange offer? This action cannot be undone.'
                : 'Are you sure you want to decline this exchange offer?'
              }
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <Button 
                variant="secondary" 
                onClick={handleCancelAction}
                disabled={isProcessing}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button 
                variant={actionType === 'accept' ? 'premium' : 'danger'}
                onClick={handleConfirmAction}
                loading={isProcessing}
                style={{ flex: 1 }}
              >
                {actionType === 'accept' ? 'Accept' : 'Decline'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 20px" }}>
        <div style={{ 
          background: "#fff", 
          borderRadius: 16, 
          boxShadow: "0 4px 24px rgba(0,0,0,0.05)", 
          padding: 32 
        }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8, color: "#232F3E" }}>
              Exchange Offer Received
            </h2>
            <p style={{ color: "#666", fontSize: "1rem" }}>
              Review the details and decide whether to accept or decline
            </p>
            {timestamp && (
              <p style={{ color: "#a259f7", fontSize: "0.9rem", fontWeight: 600 }}>
                Received: {new Date(timestamp).toLocaleDateString()} at {new Date(timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Exchange Details */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              {/* Their Item */}
              <div style={{ 
                padding: 20, 
                background: "#f7faff", 
                borderRadius: 16,
                border: "2px solid #e0e7ff"
              }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#232F3E", fontSize: "1.1rem", fontWeight: 700 }}>
                  They Want (Your Item):
                </h4>
                {yourItem ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img 
                      src={yourItem.image || "https://via.placeholder.com/60x60?text=Item"} 
                      alt={yourItem.name} 
                      style={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: 8, 
                        objectFit: "cover",
                        border: "1px solid #e0e7ff"
                      }}
                      onError={e => { 
                        e.target.onerror = null; 
                        e.target.src = "https://via.placeholder.com/60x60?text=Item"; 
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: "#232F3E", marginBottom: 4 }}>
                        {yourItem.name}
                      </div>
                      <div style={{ color: "#FFD814", fontWeight: 600 }}>
                        ₹{yourItem.price}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "#666", fontStyle: "italic" }}>Cash only offer</p>
                )}
              </div>

              {/* Your Item */}
              <div style={{ 
                padding: 20, 
                background: "#fff5f0", 
                borderRadius: 16,
                border: "2px solid #ffb347"
              }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#232F3E", fontSize: "1.1rem", fontWeight: 700 }}>
                  They Offer:
                </h4>
                {theirItem ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img 
                      src={theirItem.image || "https://via.placeholder.com/60x60?text=Item"} 
                      alt={theirItem.name} 
                      style={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: 8, 
                        objectFit: "cover",
                        border: "1px solid #ffb347"
                      }}
                      onError={e => { 
                        e.target.onerror = null; 
                        e.target.src = "https://via.placeholder.com/60x60?text=Item"; 
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: "#232F3E", marginBottom: 4 }}>
                        {theirItem.name}
                      </div>
                      <div style={{ color: "#FFD814", fontWeight: 600 }}>
                        ₹{theirItem.price}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "#666", fontStyle: "italic" }}>No item offered</p>
                )}
              </div>
            </div>

            {/* Additional Cash */}
            {additionalCash > 0 && (
              <div style={{ 
                padding: 16, 
                background: "#f0f9f4", 
                borderRadius: 12,
                border: "1px solid #22a06b",
                marginBottom: 16,
                textAlign: "center"
              }}>
                <h4 style={{ margin: "0 0 4px 0", color: "#22a06b", fontSize: "1rem", fontWeight: 700 }}>
                  Additional Cash Offered:
                </h4>
                <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#22a06b" }}>
                  ₹{additionalCash}
                </p>
              </div>
            )}

            {/* Net Amount */}
            <div style={{ 
              padding: 20, 
              background: netAmount > 0 ? "#fff5f5" : netAmount < 0 ? "#f0f9f4" : "#f7faff", 
              borderRadius: 16,
              border: `2px solid ${netAmount > 0 ? "#ff4d6d" : netAmount < 0 ? "#22a06b" : "#e0e7ff"}`,
              textAlign: "center",
              marginBottom: 20
            }}>
              <h4 style={{ margin: "0 0 8px 0", color: "#232F3E", fontSize: "1.2rem", fontWeight: 700 }}>
                Exchange Summary:
              </h4>
              <p style={{ 
                margin: 0, 
                fontWeight: 800, 
                fontSize: "1.3rem",
                color: netAmount > 0 ? "#ff4d6d" : netAmount < 0 ? "#22a06b" : "#232F3E"
              }}>
                {netAmount === 0 ? "Even Exchange" : 
                 netAmount > 0 ? `You pay ₹${netAmount}` : 
                 `You receive ₹${Math.abs(netAmount)}`}
              </p>
            </div>

            {/* Message */}
            {message && (
              <div style={{ 
                padding: 16, 
                background: "#f7faff", 
                borderRadius: 12,
                border: "1px solid #e0e7ff",
                marginBottom: 20
              }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#232F3E", fontSize: "1rem", fontWeight: 700 }}>
                  Message from Buyer:
                </h4>
                <p style={{ margin: 0, color: "#666", fontStyle: "italic", lineHeight: 1.5 }}>
                  "{message}"
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Button 
              variant="danger" 
              onClick={() => handleActionClick('decline')}
              disabled={isProcessing}
              style={{ minWidth: "140px" }}
            >
              Decline Offer
            </Button>
            <Button 
              variant="premium" 
              onClick={() => handleActionClick('accept')}
              disabled={isProcessing}
              style={{ minWidth: "140px" }}
            >
              Accept Offer
            </Button>
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/browse')}
              disabled={isProcessing}
            >
              Back to Browse
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
