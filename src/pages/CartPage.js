import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import Button from '../components/Button';
import '../styles.css';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart, isLoading, error } = useCart();
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        await removeFromCart(itemId);
      } else {
        await updateQuantity(itemId, newQuantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleContinueShopping = () => {
    navigate('/browse');
  };

  const handleProceedToCheckout = async () => {
    try {
      setProcessingCheckout(true);
      // Simulate checkout processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/delivery');
    } catch (error) {
      console.error('Error proceeding to checkout:', error);
    } finally {
      setProcessingCheckout(false);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const total = getCartTotal();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (error) {
    return (
      <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.05)", padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 16, color: "#ff4d6d" }}>⚠️</div>
          <h2 style={{ color: "#ff4d6d", marginBottom: 16 }}>Error Loading Cart</h2>
          <p style={{ color: "#666", marginBottom: 24 }}>{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.05)", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 28, color: "#232F3E", margin: 0 }}>
            Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h2>
          {cartItems.length > 0 && (
            <Button 
              variant="danger" 
              size="small" 
              onClick={handleClearCart}
              disabled={isLoading}
            >
              Clear Cart
            </Button>
          )}
        </div>
        
        {cartItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>🛒</div>
            <h3 style={{ color: "#232F3E", marginBottom: 8, fontSize: "1.5rem" }}>Your cart is empty</h3>
            <p style={{ color: "#666", marginBottom: 32, fontSize: "1.1rem" }}>Add some amazing items to get started!</p>
            <Button 
              variant="premium"
              size="large"
              onClick={handleContinueShopping}
            >
              Browse Items
            </Button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  padding: "20px 0", 
                  borderBottom: "1px solid #eee",
                  gap: 20
                }}>
                  <img 
                    src={item.image || "https://via.placeholder.com/100x100?text=No+Image"} 
                    alt={item.name}
                    style={{ 
                      width: 100, 
                      height: 100, 
                      borderRadius: 12, 
                      objectFit: "cover",
                      border: "2px solid #e0e7ff"
                    }}
                    onError={e => { 
                      e.target.onerror = null; 
                      e.target.src = "https://via.placeholder.com/100x100?text=No+Image"; 
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#232F3E", fontSize: "1.2rem", fontWeight: 700 }}>
                      {item.name}
                    </h4>
                    {item.category && (
                      <p style={{ margin: "0 0 8px 0", color: "#a259f7", fontSize: "0.9rem", fontWeight: 600 }}>
                        {item.category}
                      </p>
                    )}
                    {item.description && (
                      <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: "0.95rem" }}>
                        {item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
                      </p>
                    )}
                    <p style={{ margin: 0, color: "#FFD814", fontWeight: 700, fontSize: "1.1rem" }}>
                      ₹{item.price} each
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={isLoading || item.quantity <= 1}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: "2px solid #ddd",
                        background: item.quantity <= 1 ? "#f5f5f5" : "#fff",
                        cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: item.quantity <= 1 ? "#ccc" : "#232F3E",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s"
                      }}
                    >
                      −
                    </button>
                    <span style={{ 
                      minWidth: 40, 
                      textAlign: "center", 
                      fontWeight: 700, 
                      fontSize: "1.1rem",
                      color: "#232F3E"
                    }}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={isLoading}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: "2px solid #ddd",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "#232F3E",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s"
                      }}
                    >
                      +
                    </button>
                  </div>
                  
                  <div style={{ textAlign: "right", minWidth: 100 }}>
                    <p style={{ margin: "0 0 8px 0", fontWeight: 700, color: "#232F3E", fontSize: "1.2rem" }}>
                      ₹{item.price * item.quantity}
                    </p>
                    <Button 
                      variant="danger" 
                      size="small"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isLoading}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              borderTop: "2px solid #eee", 
              paddingTop: 24, 
              marginTop: 24 
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: 32
              }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", color: "#232F3E", fontSize: "1.3rem" }}>
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):
                  </h3>
                  <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>
                    Shipping and taxes calculated at checkout
                  </p>
                </div>
                <h3 style={{ margin: 0, color: "#FFD814", fontWeight: 900, fontSize: "1.8rem" }}>
                  ₹{total.toLocaleString()}
                </h3>
              </div>
              
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Button 
                  variant="secondary"
                  style={{ flex: 1, minWidth: "200px" }}
                  onClick={handleContinueShopping}
                  disabled={isLoading}
                >
                  Continue Shopping
                </Button>
                <Button 
                  variant="premium"
                  style={{ flex: 1, minWidth: "200px" }}
                  onClick={handleProceedToCheckout}
                  loading={processingCheckout}
                  disabled={isLoading}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
