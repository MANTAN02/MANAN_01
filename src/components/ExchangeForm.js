import React, { useState } from "react";
import Button from "./Button";
import { callBackendFunction } from '../AuthContext';
import { useToast } from '../ToastContext';

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

export default function ExchangeForm({ onSubmit, onBack, selectedItem, userItems = [] }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    selectedUserItem: "",
    additionalCash: 0,
    message: "",
    exchangeType: "item-only" // "item-only", "item-plus-cash", "cash-only"
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [backendNetAmount, setBackendNetAmount] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    if (formData.exchangeType === "item-only" || formData.exchangeType === "item-plus-cash") {
      if (!formData.selectedUserItem) {
        newErrors.selectedUserItem = "Please select an item to exchange";
      }
    }

    if (formData.exchangeType === "item-plus-cash" || formData.exchangeType === "cash-only") {
      if (!formData.additionalCash || formData.additionalCash <= 0) {
        newErrors.additionalCash = "Please enter a valid cash amount";
      }
    }

    if (formData.message.length > 500) {
      newErrors.message = "Message must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      // Call backend proposeSwap
      const itemOfferedId = formData.selectedUserItem;
      const itemRequestedId = selectedItem?.id;
      if (!itemOfferedId || !itemRequestedId) {
        setErrors({ submit: 'Missing item information.' });
        setIsSubmitting(false);
        return;
      }
      const swap = await callBackendFunction('proposeSwap', 'POST', { itemOfferedId, itemRequestedId });
      setBackendNetAmount(swap.netAmount);
      setSuccess(true);
      showToast('Exchange offer sent!', 'success');
      if (onSubmit) {
        onSubmit(swap);
      }
    } catch (error) {
      setErrors({ submit: 'Failed to submit exchange offer. Please try again.' });
      showToast('Failed to send exchange offer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateNetAmount = () => {
    if (backendNetAmount !== null) return backendNetAmount;
    const selectedUserItemData = userItems.find(item => item.id === formData.selectedUserItem);
    const yourItemValue = selectedUserItemData ? selectedUserItemData.price : 0;
    const theirItemValue = selectedItem ? selectedItem.price : 0;
    switch (formData.exchangeType) {
      case "item-only":
        return theirItemValue - yourItemValue;
      case "item-plus-cash":
        return theirItemValue - yourItemValue - formData.additionalCash;
      case "cash-only":
        return theirItemValue - formData.additionalCash;
      default:
        return 0;
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e0e7ff",
    borderRadius: "12px",
    fontSize: "1rem",
    background: "#f7faff",
    marginBottom: "4px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box"
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: "#ff4d6d",
    background: "#fff5f5",
  };

  const errorTextStyle = {
    color: "#ff4d6d",
    fontSize: "0.875rem",
    marginBottom: "12px",
    display: "block",
  };

  const netAmount = calculateNetAmount();

  return (
    <form onSubmit={handleSubmit} className="exchange-form" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#232F3E", marginBottom: "8px" }}>
          Make an Exchange Offer
        </h3>
        <p style={{ color: "#666", fontSize: "1rem" }}>
          Propose an exchange for this item with your own items or cash
        </p>
      </div>

      {errors.submit && (
        <div style={{ 
          background: "#fff5f5", 
          border: "1px solid #ff4d6d", 
          borderRadius: "8px", 
          padding: "12px", 
          marginBottom: "20px",
          color: "#ff4d6d",
          textAlign: "center"
        }}>
          {errors.submit}
        </div>
      )}

      {success && (
        <div style={{ 
          background: "#f0f9f4", 
          border: "1px solid #22a06b", 
          borderRadius: "8px", 
          padding: "12px", 
          marginBottom: "20px",
          color: "#22a06b",
          textAlign: "center"
        }}>
          Exchange offer sent successfully!
        </div>
      )}

      {/* Their Item Display */}
      {selectedItem && (
        <div style={{ 
          marginBottom: "24px", 
          padding: "20px", 
          background: "#f7faff", 
          borderRadius: "16px",
          border: "1px solid #e0e7ff"
        }}>
          <h4 style={{ margin: "0 0 12px 0", color: "#232F3E", fontSize: "1.1rem", fontWeight: 700 }}>
            Item You Want:
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img 
              src={selectedItem.image || "https://via.placeholder.com/80x80?text=Item"} 
              alt={selectedItem.name} 
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: 12, 
                objectFit: "cover",
                border: "2px solid #a259f7"
              }}
              onError={e => { 
                e.target.onerror = null; 
                e.target.src = "https://via.placeholder.com/80x80?text=Item"; 
              }}
            />
            <div>
              <div style={{ fontWeight: 700, color: "#232F3E", fontSize: "1.1rem", marginBottom: 4 }}>
                {selectedItem.name}
              </div>
              {selectedItem.category && (
                <div style={{ color: "#a259f7", fontSize: "0.9rem", marginBottom: 4 }}>
                  {selectedItem.category}
                </div>
              )}
              <div style={{ color: "#FFD814", fontWeight: 700, fontSize: "1.1rem" }}>
                ₹{selectedItem.price}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exchange Type Selection */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "8px" }}>
          Exchange Type *
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="radio"
              name="exchangeType"
              value="item-only"
              checked={formData.exchangeType === "item-only"}
              onChange={handleChange}
              style={{ marginRight: "8px" }}
            />
            <span>Item for Item Exchange</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="radio"
              name="exchangeType"
              value="item-plus-cash"
              checked={formData.exchangeType === "item-plus-cash"}
              onChange={handleChange}
              style={{ marginRight: "8px" }}
            />
            <span>Item + Cash</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="radio"
              name="exchangeType"
              value="cash-only"
              checked={formData.exchangeType === "cash-only"}
              onChange={handleChange}
              style={{ marginRight: "8px" }}
            />
            <span>Cash Only</span>
          </label>
        </div>
      </div>

      {/* Item Selection */}
      {(formData.exchangeType === "item-only" || formData.exchangeType === "item-plus-cash") && (
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
            Select Your Item to Exchange *
          </label>
          <select
            name="selectedUserItem"
            value={formData.selectedUserItem}
            onChange={handleChange}
            style={errors.selectedUserItem ? errorInputStyle : inputStyle}
            required
          >
            <option value="">Choose an item from your collection</option>
            {userItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} - ₹{item.price}
              </option>
            ))}
          </select>
          {errors.selectedUserItem && <span style={errorTextStyle}>{errors.selectedUserItem}</span>}
          
          {userItems.length === 0 && (
            <p style={{ color: "#ff4d6d", fontSize: "0.9rem", marginTop: "8px" }}>
              You don't have any items to exchange. Please list some items first.
            </p>
          )}
        </div>
      )}

      {/* Cash Amount */}
      {(formData.exchangeType === "item-plus-cash" || formData.exchangeType === "cash-only") && (
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
            Additional Cash Amount (₹) *
          </label>
          <input
            type="number"
            name="additionalCash"
            placeholder="Enter cash amount"
            value={formData.additionalCash || ""}
            onChange={handleChange}
            style={errors.additionalCash ? errorInputStyle : inputStyle}
            min="1"
            required
          />
          {errors.additionalCash && <span style={errorTextStyle}>{errors.additionalCash}</span>}
        </div>
      )}

      {/* Net Amount Display */}
      <div style={{ 
        marginBottom: "20px", 
        padding: "16px", 
        background: netAmount > 0 ? "#fff5f5" : netAmount < 0 ? "#f0f9f4" : "#f7faff", 
        borderRadius: "12px",
        border: `1px solid ${netAmount > 0 ? "#ff4d6d" : netAmount < 0 ? "#22a06b" : "#e0e7ff"}`
      }}>
        <h4 style={{ margin: "0 0 8px 0", color: "#232F3E", fontSize: "1rem", fontWeight: 700 }}>
          Exchange Summary:
        </h4>
        <p style={{ 
          margin: 0, 
          fontWeight: 700, 
          fontSize: "1.1rem",
          color: netAmount === 0 ? "#232F3E" : netAmount > 0 ? "#ff4d6d" : "#22a06b"
        }}>
          {netAmount === 0 ? "Even Exchange" : 
           netAmount > 0 ? `You need to pay ₹${netAmount}` : 
           `You will receive ₹${Math.abs(netAmount)}`}
        </p>
      </div>

      {/* Message */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
          Message to Seller (Optional)
        </label>
        <textarea
          name="message"
          placeholder="Add a personal message to your exchange offer..."
          value={formData.message}
          onChange={handleChange}
          rows="4"
          maxLength="500"
          style={{
            ...inputStyle,
            resize: "vertical",
            minHeight: "100px",
          }}
        />
        <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#666", marginTop: "4px" }}>
          {formData.message.length}/500 characters
        </div>
        {errors.message && <span style={errorTextStyle}>{errors.message}</span>}
      </div>

      <div className="form-actions" style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
        {onBack && (
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onBack}
            disabled={isSubmitting}
            style={{ minWidth: "120px" }}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          variant="premium"
          loading={isSubmitting}
          disabled={userItems.length === 0 && (formData.exchangeType === "item-only" || formData.exchangeType === "item-plus-cash")}
          style={{ minWidth: "160px" }}
        >
          {isSubmitting ? <><Spinner /> Submitting...</> : 'Send Exchange Offer'}
        </Button>
      </div>
    </form>
  );
}
