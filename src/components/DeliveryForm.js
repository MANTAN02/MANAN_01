import React, { useState } from "react";
import Button from "./Button";

export default function DeliveryForm({ onSubmit, onBack, initialData = {} }) {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    streetAddress: initialData.streetAddress || "",
    apartment: initialData.apartment || "",
    city: initialData.city || "",
    state: initialData.state || "",
    zipCode: initialData.zipCode || "",
    country: initialData.country || "India",
    deliveryInstructions: initialData.deliveryInstructions || "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Street address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP/Postal code is required";
    } else if (!/^\d{6}$/.test(formData.zipCode.replace(/\s/g, ''))) {
      newErrors.zipCode = "Please enter a valid 6-digit PIN code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting delivery form:', error);
      setErrors({ submit: 'Failed to submit delivery information. Please try again.' });
    } finally {
      setIsSubmitting(false);
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

  return (
    <form onSubmit={handleSubmit} className="delivery-form" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#232F3E", marginBottom: "8px" }}>
          Delivery Information
        </h3>
        <p style={{ color: "#666", fontSize: "1rem" }}>
          Please provide your delivery details for a smooth shipping experience
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            style={errors.fullName ? errorInputStyle : inputStyle}
            required
          />
          {errors.fullName && <span style={errorTextStyle}>{errors.fullName}</span>}
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            style={errors.email ? errorInputStyle : inputStyle}
            required
          />
          {errors.email && <span style={errorTextStyle}>{errors.email}</span>}
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
          Phone Number *
        </label>
        <input
          type="tel"
          name="phone"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={handleChange}
          style={errors.phone ? errorInputStyle : inputStyle}
          required
        />
        {errors.phone && <span style={errorTextStyle}>{errors.phone}</span>}
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
          Street Address *
        </label>
        <input
          type="text"
          name="streetAddress"
          placeholder="House number, street name"
          value={formData.streetAddress}
          onChange={handleChange}
          style={errors.streetAddress ? errorInputStyle : inputStyle}
          required
        />
        {errors.streetAddress && <span style={errorTextStyle}>{errors.streetAddress}</span>}
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
          Apartment, Suite, etc. (Optional)
        </label>
        <input
          type="text"
          name="apartment"
          placeholder="Apartment, suite, unit, building, floor, etc."
          value={formData.apartment}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
            City *
          </label>
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            style={errors.city ? errorInputStyle : inputStyle}
            required
          />
          {errors.city && <span style={errorTextStyle}>{errors.city}</span>}
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
            State *
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            style={errors.state ? errorInputStyle : inputStyle}
            required
          >
            <option value="">Select State</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Assam">Assam</option>
            <option value="Bihar">Bihar</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
            <option value="Goa">Goa</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Haryana">Haryana</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Manipur">Manipur</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Odisha">Odisha</option>
            <option value="Punjab">Punjab</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Telangana">Telangana</option>
            <option value="Tripura">Tripura</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Delhi">Delhi</option>
          </select>
          {errors.state && <span style={errorTextStyle}>{errors.state}</span>}
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
            PIN Code *
          </label>
          <input
            type="text"
            name="zipCode"
            placeholder="PIN Code"
            value={formData.zipCode}
            onChange={handleChange}
            style={errors.zipCode ? errorInputStyle : inputStyle}
            maxLength="6"
            required
          />
          {errors.zipCode && <span style={errorTextStyle}>{errors.zipCode}</span>}
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
          Delivery Instructions (Optional)
        </label>
        <textarea
          name="deliveryInstructions"
          placeholder="Any special delivery instructions..."
          value={formData.deliveryInstructions}
          onChange={handleChange}
          rows="3"
          style={{
            ...inputStyle,
            resize: "vertical",
            minHeight: "80px",
          }}
        />
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
            Back to Cart
          </Button>
        )}
        <Button 
          type="submit" 
          variant="premium"
          loading={isSubmitting}
          style={{ minWidth: "160px" }}
        >
          Confirm Delivery
        </Button>
      </div>
    </form>
  );
}
