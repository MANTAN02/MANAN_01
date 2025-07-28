import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, callBackendFunction } from '../AuthContext';
import { FaHeart, FaTrash, FaExchangeAlt, FaShoppingCart, FaEye, FaShare } from 'react-icons/fa';

const WishlistPage = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user) {
          const data = await callBackendFunction('getWishlist', 'GET');
          setWishlistItems(data);
        }
      } catch (e) {
        setError('Failed to load wishlist');
      }
      setLoading(false);
    };
    fetchWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      // Here you would call the backend to remove from wishlist
      // await callBackendFunction('removeFromWishlist', 'POST', { itemId });
      
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      alert('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove item from wishlist');
    }
  };

  const handleMoveToCart = async (item) => {
    try {
      // Here you would call the backend to add to cart
      // await callBackendFunction('addToCart', 'POST', { itemId: item.itemId });
      
      // Remove from wishlist after adding to cart
      setWishlistItems(prev => prev.filter(wishlistItem => wishlistItem.id !== item.id));
      alert('Item moved to cart successfully!');
    } catch (error) {
      console.error('Error moving to cart:', error);
      alert('Failed to move item to cart');
    }
  };

  const handleShareItem = (item) => {
    const shareUrl = `${window.location.origin}/product/${item.itemId}`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out this item on Swapin: ${item.title}`,
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const filteredItems = wishlistItems.filter(item => {
    if (filter === 'available') return item.isAvailable;
    if (filter === 'unavailable') return !item.isAvailable;
    return true;
  });

  const getPriceDifference = (currentPrice, originalPrice) => {
    const difference = originalPrice - currentPrice;
    const percentage = ((difference / originalPrice) * 100).toFixed(1);
    return { difference, percentage };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <FaHeart className="text-red-500 mr-3" />
            My Wishlist
          </h1>
          <p className="text-lg text-gray-600">
            {wishlistItems.length} items saved for later
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Items ({wishlistItems.length})</option>
                <option value="available">Available ({wishlistItems.filter(item => item.isAvailable).length})</option>
                <option value="unavailable">Unavailable ({wishlistItems.filter(item => !item.isAvailable).length})</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Total Value: ₹{wishlistItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FaHeart className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'Your wishlist is empty' : 'No items match your filter'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Start browsing and save items you love to your wishlist!' 
                : 'Try adjusting your filter to see more items.'
              }
            </p>
            {filter === 'all' && (
              <Link
                to="/browse"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Browse Items
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const priceInfo = getPriceDifference(item.price, item.originalPrice);
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Item Image */}
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    {!item.isAvailable && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                        Unavailable
                      </div>
                    )}
                    {priceInfo.difference > 0 && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                        -{priceInfo.percentage}%
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <button
                        onClick={() => handleShareItem(item)}
                        className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
                        title="Share"
                      >
                        <FaShare className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
                        title="Remove from wishlist"
                      >
                        <FaTrash className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600">{item.rating}</span>
                        <span className="text-sm text-gray-500">({item.reviewCount})</span>
                      </div>
                      <span className="text-sm text-gray-500">{item.location}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xl font-bold text-gray-900">₹{item.price}</span>
                        {priceInfo.difference > 0 && (
                          <span className="text-sm text-gray-500 line-through ml-2">₹{item.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                      Added on {new Date(item.addedAt).toLocaleDateString()}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/product/${item.itemId}`}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                      >
                        <FaEye className="mr-1" />
                        View
                      </Link>
                      
                      {item.isAvailable ? (
                        <>
                          <button
                            onClick={() => handleMoveToCart(item)}
                            className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center"
                          >
                            <FaShoppingCart className="mr-1" />
                            Add to Cart
                          </button>
                          <Link
                            to={`/exchange/${item.itemId}`}
                            className="flex-1 bg-secondary-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-secondary-700 transition-colors flex items-center justify-center"
                          >
                            <FaExchangeAlt className="mr-1" />
                            Exchange
                          </Link>
                        </>
                      ) : (
                        <button
                          disabled
                          className="flex-1 bg-gray-300 text-gray-500 py-2 px-3 rounded-lg text-sm font-medium cursor-not-allowed"
                        >
                          Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bulk Actions */}
        {filteredItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  const availableItems = filteredItems.filter(item => item.isAvailable);
                  if (availableItems.length > 0) {
                    // Add all available items to cart
                    alert(`Added ${availableItems.length} items to cart!`);
                  } else {
                    alert('No available items to add to cart');
                  }
                }}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center"
              >
                <FaShoppingCart className="mr-2" />
                Add All Available to Cart
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your wishlist?')) {
                    setWishlistItems([]);
                  }
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
              >
                <FaTrash className="mr-2" />
                Clear Wishlist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage; 