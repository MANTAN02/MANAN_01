import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import DeliveryForm from "../components/DeliveryForm";
import Button from "../components/Button";
import "../styles.css";

export default function DeliveryPage({ item, onBack, onConfirm }) {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Use cart items if available, otherwise use single item
  const orderItems = cartItems.length > 0 ? cartItems : (item ? [{ ...item, quantity: 1 }] : []);
  const orderTotal = cartItems.length > 0 ? getCartTotal() : (item ? item.price : 0);

  const handleSubmit = async (deliveryData) => {
    try {
      setOrderProcessing(true);
      
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderData = {
        items: orderItems,
        deliveryInfo: deliveryData,
        total: orderTotal,
        orderDate: new Date().toISOString(),
        orderId: `ORD-${Date.now()}`,
        status: 'confirmed'
      };

      console.log("Order data:", orderData);
      
      if (onConfirm) {
        onConfirm(orderData);
      }

      // Clear cart after successful order
      if (cartItems.length > 0) {
        await clearCart();
      }

      setOrderComplete(true);
      
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setOrderProcessing(false);
    }
  };

  const handleBackToCart = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/cart');
    }
  };

  const handleContinueShopping = () => {
    navigate('/browse');
  };

  if (orderComplete) {
    return (
      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 20px" }}>
        <div style={{ 
          background: "#fff", 
          borderRadius: 16, 
          boxShadow: "0 4px 24px rgba(0,0,0,0.05)", 
          padding: 40,
          textAlign: "center"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: 20 }}>✅</div>
          <h2 style={{ color: "#22a06b", marginBottom: 16, fontSize: "1.8rem" }}>
            Order Confirmed!
          </h2>
          <p style={{ color: "#666", marginBottom: 24, fontSize: "1.1rem" }}>
            Thank you for your order. You will receive a confirmation email shortly with tracking details.
          </p>
          <div style={{ 
            background: "#f0f9f4", 
            border: "1px solid #22a06b", 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 24 
          }}>
            <p style={{ margin: 0, color: "#22a06b", fontWeight: 600 }}>
              Order Total: ₹{orderTotal.toLocaleString()}
            </p>
          </div>
          <Button 
            variant="premium" 
            onClick={handleContinueShopping}
            size="large"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 20px" }}>
        <div style={{ 
          background: "#fff", 
          borderRadius: 16, 
          boxShadow: "0 4px 24px rgba(0,0,0,0.05)", 
          padding: 40,
          textAlign: "center"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📦</div>
          <h2 style={{ color: "#232F3E", marginBottom: 16 }}>No Items to Deliver</h2>
          <p style={{ color: "#666", marginBottom: 24 }}>
            Your cart is empty. Add some items to proceed with delivery.
          </p>
          <Button variant="premium" onClick={() => navigate('/browse')}>
            Browse Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ 
        background: "#fff", 
        borderRadius: 16, 
        boxShadow: "0 4px 24px rgba(0,0,0,0.05)", 
        padding: 32 
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8, color: "#232F3E" }}>
            Delivery Details
          </h2>
          <p style={{ color: "#666", fontSize: "1rem" }}>
            Review your order and provide delivery information
          </p>
        </div>

        {/* Order Summary */}
        <div style={{ 
          marginBottom: 32, 
          padding: 24, 
          background: "#f7faff", 
          borderRadius: 16,
          border: "1px solid #e0e7ff"
        }}>
          <h4 style={{ margin: "0 0 16px 0", color: "#232F3E", fontSize: "1.2rem", fontWeight: 700 }}>
            Order Summary ({orderItems.reduce((sum, item) => sum + item.quantity, 0)} items)
          </h4>
          
          <div style={{ marginBottom: 16 }}>
            {orderItems.map((orderItem, index) => (
              <div key={orderItem.id || index} style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 16, 
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom: index < orderItems.length - 1 ? "1px solid #e0e7ff" : "none"
              }}>
                <img 
                  src={orderItem.image || "https://via.placeholder.com/60x60?text=Item"} 
                  alt={orderItem.name} 
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
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#232F3E", marginBottom: 4 }}>
                    {orderItem.name}
                  </div>
                  {orderItem.category && (
                    <div style={{ color: "#a259f7", fontSize: "0.9rem", marginBottom: 4 }}>
                      {orderItem.category}
                    </div>
                  )}
                  <div style={{ color: "#666", fontSize: "0.9rem" }}>
                    Quantity: {orderItem.quantity}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#FFD814", fontWeight: 700, fontSize: "1.1rem" }}>
                    ₹{(orderItem.price * orderItem.quantity).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ 
            borderTop: "2px solid #e0e7ff", 
            paddingTop: 16, 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#232F3E" }}>
              Total:
            </span>
            <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#FFD814" }}>
              ₹{orderTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Delivery Form */}
        {orderProcessing ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div className="loading-spinner" style={{ margin: "0 auto 16px" }}></div>
            <h3 style={{ color: "#232F3E", marginBottom: 8 }}>Processing Your Order...</h3>
            <p style={{ color: "#666" }}>Please wait while we confirm your order details.</p>
          </div>
        ) : (
          <DeliveryForm 
            onSubmit={handleSubmit} 
            onBack={handleBackToCart}
          />
        )}
      </div>
    </div>
  );
}
