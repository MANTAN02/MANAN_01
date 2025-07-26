import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('swapin_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setError('Failed to load cart data');
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('swapin_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      setError('Failed to save cart data');
    }
  }, [cartItems]);

  const addToCart = (item, quantity = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
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
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setError('Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = (itemId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError('Failed to remove item from cart');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
      }

      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating item quantity:', error);
      setError('Failed to update item quantity');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    try {
      setIsLoading(true);
      setError(null);
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart');
    } finally {
      setIsLoading(false);
    }
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
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
