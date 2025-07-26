import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ItemForm from "../components/ItemForm";
import Button from "../components/Button";
import "../styles.css";

export default function ListItemPage(props) {
  const navigate = useNavigate();

  const handleSkip = () => {
    navigate('/browse');
  };

  const handleSubmit = (item) => {
    if (props.onSubmit) {
      props.onSubmit(item);
    }
    navigate('/browse');
  };

  // Home/landing hero section
  return (
    <>
      {/* Header removed, now rendered at top level */}
      <section className="home-hero">
        <div className="abstract-bg">
          <svg width="100%" height="100%" viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="520" cy="60" r="60" fill="#ffb347" fillOpacity="0.7" />
            <circle cx="80" cy="220" r="40" fill="#232f3e" fillOpacity="0.15" />
            <ellipse cx="180" cy="60" rx="60" ry="30" fill="#232f3e" fillOpacity="0.12" />
            <ellipse cx="500" cy="220" rx="50" ry="20" fill="#ffb347" fillOpacity="0.18" />
          </svg>
        </div>
        <div className="home-hero-content">
          <h1 className="home-hero-title">Welcome to SWAPIN</h1>
          <p className="home-hero-desc">Barter, swap, or sell your items with trust. Enjoy modern, secure, and smart product matching with delivery tracking.</p>
          <div className="home-hero-actions">
            <button className="button premium" onClick={handleSkip}>Browse Items</button>
            <button className="button" onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})}>List Your Item</button>
          </div>
        </div>
      </section>
      <div style={{ maxWidth: 500, margin: "40px auto 0 auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px #232F3E11", padding: 32 }}>
        <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8, color: "#232F3E" }}>List Your Item to Sell or Swap</h2>
        <p style={{ color: "#555", marginBottom: 24 }}>Enter details of your item. You can skip and browse items if you want.</p>
        <ItemForm onSubmit={handleSubmit} />
        <Button variant="secondary" fullWidth onClick={handleSkip} style={{ marginTop: 8 }}>Skip for now</Button>
      </div>
    </>
  );
}
