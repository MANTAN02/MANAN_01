import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { useToast } from '../ToastContext';
import { callBackendFunction } from '../AuthContext';

const EnhancedItemCard = ({ item, onUpdate }) => {
  const { user } = useAuth();
  const { addToCart, removeFromCart, cartItems } = useCart();
  const { showToast } = useToast();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ownerRating, setOwnerRating] = useState(null);
  const [isViewed, setIsViewed] = useState(false);

  // Check if item is in cart
  const cartItem = cartItems.find(cartItem => cartItem.itemId === item.id);
  const isInCart = !!cartItem;

  useEffect(() => {
    // Track item view
    if (user && item.id && !isViewed) {
      trackItemView();
      setIsViewed(true);
    }
    
    // Check wishlist status
    checkWishlistStatus();
    
    // Get owner rating
    getOwnerRating();
  }, [item.id, user]);

  const trackItemView = async () => {
    try {
      await callBackendFunction('trackItemView', 'POST', { itemId: item.id });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user) return;
    try {
      const wishlist = await callBackendFunction('getWishlist', 'GET');
      setIsInWishlist(wishlist.some(wishlistItem => wishlistItem.itemId === item.id));
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const getOwnerRating = async () => {
    try {
      const ratings = await callBackendFunction('getUserRatings', 'GET', {}, `?userId=${item.ownerId}`);
      if (ratings.length > 0) {
        const avgRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
        setOwnerRating(Math.round(avgRating * 10) / 10);
      }
    } catch (error) {
      console.error('Error getting owner rating:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      showToast('Please login to add items to wishlist', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlist) {
        await callBackendFunction('removeFromWishlist', 'POST', { itemId: item.id });
        setIsInWishlist(false);
        showToast('Removed from wishlist', 'success');
      } else {
        await callBackendFunction('addToWishlist', 'POST', { itemId: item.id });
        setIsInWishlist(true);
        showToast('Added to wishlist', 'success');
      }
    } catch (error) {
      showToast('Error updating wishlist', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCartToggle = async () => {
    if (!user) {
      showToast('Please login to add items to cart', 'error');
      return;
    }

    try {
      if (isInCart) {
        await removeFromCart(item.id);
        showToast('Removed from cart', 'success');
      } else {
        await addToCart(item.id);
        showToast('Added to cart', 'success');
      }
    } catch (error) {
      showToast('Error updating cart', 'error');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getConditionColor = (condition) => {
    const colors = {
      'new': 'bg-green-100 text-green-800',
      'like-new': 'bg-blue-100 text-blue-800',
      'good': 'bg-yellow-100 text-yellow-800',
      'fair': 'bg-orange-100 text-orange-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const created = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:transform hover:-translate-y-1">
      {/* Item Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-secondary-100">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="h-24 w-24 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 7h-8v6h8V7zm-2 4h-4V9h4v2z"/>
              <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-bold rounded ${getConditionColor(item.condition)}`}>
            {item.condition.toUpperCase()}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 left-2 flex space-x-1">
          <button
            onClick={handleWishlistToggle}
            disabled={isLoading}
            className={`p-1 rounded-full transition-colors ${
              isInWishlist 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-red-50'
            }`}
          >
            <svg className="h-4 w-4" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Item Details */}
      <div className="p-4">
        {/* Title and Category */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
            {item.title}
          </h3>
          <p className="text-sm text-gray-500">{item.category}</p>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price and Analytics */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-primary-600">
            {formatPrice(item.price)}
          </span>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              {item.views || 0}
            </span>
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
              </svg>
              {item.likes || 0}
            </span>
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              {item.offers || 0}
            </span>
          </div>
        </div>

        {/* Owner Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
              <span className="text-sm font-semibold text-primary-600">
                {item.ownerName ? item.ownerName.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {item.ownerName || 'Anonymous'}
              </p>
              {ownerRating && (
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`h-3 w-3 ${i < Math.floor(ownerRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00.95-.69h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">({ownerRating})</span>
                </div>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {getTimeAgo(item.createdAt)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link
            to={`/exchange/${item.id}`}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
          >
            Make Offer
          </Link>
          <button
            onClick={handleCartToggle}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isInCart
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {isInCart ? 'Remove' : 'Add to Cart'}
          </button>
        </div>

        {/* Location */}
        {item.location && (
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
            {item.location.city}, {item.location.state}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedItemCard;
