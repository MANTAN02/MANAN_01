import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Button from "../components/Button";
import "../styles.css";

export default function ExchangeOfferPage(props) {
  const navigate = useNavigate();

  const handleAccept = () => {
    if (props.onAccept) {
      props.onAccept();
    }
    navigate('/delivery');
  };

  const handleDecline = () => {
    if (props.onDecline) {
      props.onDecline();
    }
    navigate('/browse');
  };

  if (!props.offer) {
    return (
      <>
        <Header searchValue="" onSearchChange={() => {}} />
        <div style={{ maxWidth: 500, margin: "40px auto 0 auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px #232F3E11", padding: 32, textAlign: "center" }}>
          <h2 style={{ fontWeight: 800, fontSize: 28, color: "#232F3E" }}>No Exchange Offer</h2>
          <p style={{ color: "#888" }}>No exchange offer to review at this time.</p>
          <Button onClick={() => navigate('/browse')}>Back to Browse</Button>
        </div>
      </>
    );
  }
  const { yourItem, theirItem, yourOffer, netAmount } = props.offer;
  return (
    <>
      {/* Header removed, now rendered at top level */}
      <div style={{ maxWidth: 500, margin: "40px auto 0 auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px #232F3E11", padding: 32 }}>
        <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8, color: "#232F3E" }}>Exchange Offer</h2>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: "#232F3E" }}>Your Item:</div>
          <div style={{ color: "#555" }}>{yourItem ? yourItem.name : "-"} (₹{yourItem ? yourItem.price : 0})</div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: "#232F3E" }}>Their Item:</div>
          <div style={{ color: "#555" }}>{theirItem ? theirItem.name : "-"} (₹{theirItem ? theirItem.price : 0})</div>
        </div>
        <div style={{ marginBottom: 20, fontWeight: 600, color: netAmount > 0 ? "#c00" : netAmount < 0 ? "#22a06b" : "#232F3E" }}>
          Net Amount: {netAmount === 0 ? "Even Exchange" : netAmount > 0 ? `You pay ₹${netAmount}` : `You receive ₹${-netAmount}`}
        </div>
        <div className="actions" style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Button fullWidth onClick={handleAccept}>Accept</Button>
          <Button variant="secondary" fullWidth onClick={handleDecline}>Decline</Button>
        </div>
      </div>
    </>
  );
}
