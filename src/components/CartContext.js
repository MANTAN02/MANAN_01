import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, callBackendFunction } from '../AuthContext';
import { useToast } from '../ToastContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

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

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart from backend or localStorage on mount/user change
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (user) {
          // Load from backend
          const data = await callBackendFunction('getCart', 'GET');
          setCartItems(data);
        } else {
          // Load from localStorage
          const savedCart = localStorage.getItem('swapin_cart');
          if (savedCart) {
            setCartItems(JSON.parse(savedCart));
          } else {
            setCartItems([]);
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setError('Failed to load cart data');
      }
      setIsLoading(false);
    };
    loadCart();
  }, [user]);

  // Save cart to localStorage whenever it changes (for guests)
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem('swapin_cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
        setError('Failed to save cart data');
      }
    }
  }, [cartItems, user]);

  const addToCart = async (item, quantity = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      if (user) {
        await callBackendFunction('addToCart', 'POST', { itemId: item.id, quantity });
        showToast('Added to cart!', 'success');
        // Reload cart from backend
        const data = await callBackendFunction('getCart', 'GET');
        setCartItems(data);
      } else {
        setCartItems(prevItems => {
          const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
          if (existingItem) {
            return prevItems.map(cartItem =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + quantity }
                : cartItem
            );
          } else {
            return [...prevItems, { ...item, quantity }];
          }
        });
        showToast('Added to cart!', 'success');
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setError('Failed to add item to cart');
      showToast('Failed to add to cart', 'error');
    }
    setIsLoading(false);
  };

  const removeFromCart = async (itemId) => {
    setIsLoading(true);
    setError(null);
    try {
      if (user) {
        await callBackendFunction('removeFromCart', 'POST', { itemId });
        showToast('Removed from cart.', 'info');
        // Reload cart from backend
        const data = await callBackendFunction('getCart', 'GET');
        setCartItems(data);
      } else {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        showToast('Removed from cart.', 'info');
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError('Failed to remove item from cart');
      showToast('Failed to remove from cart', 'error');
    }
    setIsLoading(false);
  };

  const updateQuantity = async (itemId, newQuantity) => {
    setIsLoading(true);
    setError(null);
    try {
      if (user) {
        if (newQuantity <= 0) {
          await removeFromCart(itemId);
          return;
        }
        await callBackendFunction('addToCart', 'POST', { itemId, quantity: newQuantity });
        showToast('Cart updated!', 'success');
        const data = await callBackendFunction('getCart', 'GET');
        setCartItems(data);
      } else {
        if (newQuantity <= 0) {
          removeFromCart(itemId);
          return;
        }
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
        showToast('Cart updated!', 'success');
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
      setError('Failed to update item quantity');
      showToast('Failed to update cart', 'error');
    }
    setIsLoading(false);
  };

  const clearCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (user) {
        // Remove all items from backend cart
        const data = await callBackendFunction('getCart', 'GET');
        for (const item of data) {
          await callBackendFunction('removeFromCart', 'POST', { itemId: item.itemId || item.id });
        }
        setCartItems([]);
        showToast('Cart cleared.', 'info');
      } else {
        setCartItems([]);
        showToast('Cart cleared.', 'info');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart');
      showToast('Failed to clear cart', 'error');
    }
    setIsLoading(false);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isLoading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartItemsCount,
    }}>
      {isLoading && (
        <div style={{ position: 'fixed', top: 80, right: 30, zIndex: 9999 }}>
          <Spinner />
        </div>
      )}
      {children}
    </CartContext.Provider>
  );
};
