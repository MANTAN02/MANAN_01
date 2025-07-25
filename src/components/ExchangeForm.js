import React, { useState } from "react";
import Button from "./Button";

export default function ExchangeForm({ yourItem, theirItem, onSubmit }) {
  const [yourOffer, setYourOffer] = useState(yourItem ? yourItem.price : 0);
  const [error, setError] = useState("");

  const netAmount = theirItem.price - yourOffer;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (yourOffer < 0) {
      setError("Offer price cannot be negative.");
      return;
    }
    setError("");
    onSubmit({
      yourItem,
      theirItem,
      yourOffer,
      netAmount
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #232F3E11", padding: 24, marginBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 16, color: "#232F3E" }}>Your Item:</div>
        <div style={{ color: "#555" }}>{yourItem ? yourItem.name : "-"} (₹{yourItem ? yourItem.price : 0})</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 16, color: "#232F3E" }}>Their Item:</div>
        <div style={{ color: "#555" }}>{theirItem.name} (₹{theirItem.price})</div>
      </div>
      <label>Your Offer Price (₹)</label>
      <input type="number" value={yourOffer} min={0} onChange={e => setYourOffer(Number(e.target.value))} required />
      <div style={{ margin: "16px 0", fontWeight: 600, color: netAmount > 0 ? "#c00" : netAmount < 0 ? "#22a06b" : "#232F3E" }}>
        Net Amount: {netAmount === 0 ? "Even Exchange" : netAmount > 0 ? `You pay ₹${netAmount}` : `You receive ₹${-netAmount}`}
      </div>
      {error && <div style={{ color: "#c00", marginBottom: 8 }}>{error}</div>}
      <Button type="submit" fullWidth>Propose Exchange</Button>
    </form>
  );
}
