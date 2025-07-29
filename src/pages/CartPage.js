import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../components/CartContext';
import { useToast } from '../ToastContext';
import { callBackendFunction } from '../AuthContext';
import '../styles.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const { removeFromCart, updateQuantity } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const items = await callBackendFunction('getCartItems', 'GET');
      setCartItems(items || []);
    } catch (error) {
      showToast('Failed to load cart items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      await updateQuantity(itemId, newQuantity);
      await fetchCartItems(); // Refresh cart
      showToast('Cart updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update quantity', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setUpdating(true);
    try {
      await removeFromCart(itemId);
      await fetchCartItems(); // Refresh cart
      showToast('Item removed from cart', 'success');
    } catch (error) {
      showToast('Failed to remove item', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty!', 'warning');
      return;
    }
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-orange-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-violet-600 font-semibold">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-orange-600 bg-clip-text text-transparent mb-4">
            🛒 Your Shopping Cart
          </h1>
          <p className="text-gray-600 text-lg">
            {cartItems.length === 0 
              ? "Your cart is empty, but amazing items await!" 
              : `You have ${calculateItemsCount()} item${calculateItemsCount() !== 1 ? 's' : ''} in your cart`
            }
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="card text-center py-16">
            <div className="text-8xl mb-6 animate-bounce">🛍️</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start exploring amazing items to swap and add them to your cart!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleContinueShopping}
                className="button primary text-lg px-8 py-4"
              >
                🚀 Start Shopping
              </button>
              <button 
                onClick={() => navigate('/list')}
                className="button secondary text-lg px-8 py-4"
              >
                📝 List Your Item
              </button>
            </div>
          </div>
        ) : (
          /* Cart Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-2">📦</span>
                  Cart Items ({calculateItemsCount()})
                </h2>
                
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-white/50 rounded-lg border border-violet-200 hover:shadow-lg transition-all duration-300">
                      {/* Item Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.imageUrl || 'https://via.placeholder.com/100x100?text=Item'}
                          alt={item.title}
                          className="w-24 h-24 object-cover rounded-lg border-2 border-violet-200"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-orange-600">
                            ₹{item.price?.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Qty:</span>
                            <div className="flex items-center border border-violet-200 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={updating || item.quantity <= 1}
                                className="px-3 py-1 text-violet-600 hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-gray-700 font-semibold min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={updating}
                                className="px-3 py-1 text-violet-600 hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updating}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-2">📋</span>
                  Order Summary
                </h2>

                {/* Summary Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({calculateItemsCount()}):</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery:</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Platform Fee:</span>
                    <span>₹{(calculateTotal() * 0.05).toFixed(0)}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total:</span>
                    <span className="text-orange-600">
                      ₹{(calculateTotal() * 1.05).toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleCheckout}
                    disabled={updating}
                    className="w-full button primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      '🚀 Proceed to Checkout'
                    )}
                  </button>
                  
                  <button
                    onClick={handleContinueShopping}
                    className="w-full button secondary text-lg py-4"
                  >
                    🛍️ Continue Shopping
                  </button>
                </div>

                {/* Additional Info */}
                <div className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg border border-violet-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <span className="mr-2">💡</span>
                    Pro Tip
                  </h3>
                  <p className="text-sm text-gray-600">
                    Add more items to your cart to unlock exclusive discounts and faster delivery options!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Why Choose Swapin?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Easy Swapping</h3>
              <p className="text-gray-600">Swap items directly or pay the difference. No complicated negotiations!</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Professional delivery partners ensure your items reach safely and quickly.</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure Payments</h3>
              <p className="text-gray-600">Multiple payment options with secure processing and buyer protection.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
