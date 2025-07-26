import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeliveryForm from "../components/DeliveryForm";
import Button from "../components/Button";

export default function DeliveryPage(props) {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [deliveryData, setDeliveryData] = useState(null);

  const handleSubmit = (data) => {
    setDeliveryData(data);
    setConfirmed(true);
    setTimeout(() => {
      if (props.onConfirm) {
        props.onConfirm();
      }
      navigate('/browse');
    }, 1800);
  };

  const handleBack = () => {
    navigate('/browse');
  };

  return (
    <>
      {/* Header removed, now rendered at top level */}
      <div style={{ maxWidth: 500, margin: "40px auto 0 auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px #232F3E11", padding: 32 }}>
        <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8, color: "#232F3E" }}>Delivery Details</h2>
        {props.item && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <img src={props.item.image || "https://via.placeholder.com/80x80?text=No+Image"} alt={props.item.name} style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", border: "1px solid #eee" }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{props.item.name}</div>
              <div style={{ color: "#FFD814", fontWeight: 600 }}>₹{props.item.price}</div>
            </div>
          </div>
        )}
        {!confirmed && <DeliveryForm onSubmit={handleSubmit} />}
        {confirmed && (
          <div style={{ textAlign: "center", color: "#22a06b", fontWeight: 700, fontSize: 20, margin: "32px 0" }}>
            Delivery Confirmed! 🚚<br />
            Thank you for shopping with SWAPIN.
          </div>
        )}
        <Button variant="secondary" fullWidth onClick={handleBack} style={{ marginTop: 8 }}>Back</Button>
      </div>
    </>
  );
}
