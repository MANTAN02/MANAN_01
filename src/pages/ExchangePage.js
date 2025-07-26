import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ExchangeForm from "../components/ExchangeForm";
import Button from "../components/Button";
import "../styles.css";

export default function ExchangePage(props) {
  const navigate = useNavigate();
  const { yourItems, item, onBack, onConfirm } = props;
  const yourItem = yourItems && yourItems.length > 0 ? yourItems[0] : null;
  const theirItem = item;

  const handleBack = () => {
    navigate('/browse');
  };

  const handleConfirm = (offer) => {
    if (onConfirm) {
      onConfirm(offer);
    }
    navigate('/offers');
  };

  if (!yourItem || !theirItem) {
    return (
      <>
        <Header searchValue="" onSearchChange={() => {}} />
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Error</h2>
          <p>Missing item information for exchange.</p>
          <Button onClick={handleBack}>Back</Button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header removed, now rendered at top level */}
      <div style={{ maxWidth: 500, margin: "40px auto 0 auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.05)", padding: 32 }}>
        <h2 style={{ fontWeight: 800, fontSize: 28 }}>Propose Exchange</h2>
        <ExchangeForm yourItem={yourItem} theirItem={theirItem} onBack={handleBack} onConfirm={handleConfirm} />
      </div>
    </>
  );
}