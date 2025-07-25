import React, { useState } from "react";
import Button from "./Button";

export default function DeliveryForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !address || !phone) {
      setError("All fields are required.");
      return;
    }
    setError("");
    onSubmit({ name, address, phone });
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #232F3E11", padding: 24, marginBottom: 24 }}>
      <label>Full Name *</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
      <label>Address *</label>
      <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Delivery address" rows={3} required />
      <label>Phone Number *</label>
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210" required />
      {error && <div style={{ color: "#c00", marginBottom: 8 }}>{error}</div>}
      <Button type="submit" fullWidth>Confirm Delivery</Button>
    </form>
  );
}
