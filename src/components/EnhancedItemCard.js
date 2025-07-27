import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaExchangeAlt, FaStar, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const EnhancedItemCard = ({ item, onAddToCart, onAddToWishlist, onOfferExchange }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(item);
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onAddToWishlist(item);
  };

  const handleOfferExchange = () => {
    onOfferExchange(item);
  };

  return (
    <div 
      className="card group cursor-pointer transform transition-all duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <img 
          src={item.image || 'https://via.placeholder.com/300x200'} 
          alt={item.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className={`absolute top-2 right-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={handleAddToWishlist}
            className={`p-2 rounded-full ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'} hover:bg-red-500 hover:text-white transition-colors`}
          >
            <FaHeart size={16} />
          </button>
        </div>
        <div className="absolute top-2 left-2">
          {item.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">New</span>
          )}
          {item.isFeatured && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full ml-1">Featured</span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
          <span className="text-sm text-gray-500">{item.category}</span>
        </div>

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`text-sm ${i < Math.floor(item.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="ml-1 text-sm text-gray-600">({item.reviewCount || 0})</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-primary-600">${item.price}</span>
          <div className="flex items-center text-sm text-gray-500">
            <FaMapMarkerAlt className="mr-1" />
            <span>{item.location || 'Online'}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <FaClock className="mr-1" />
            <span>{item.postedAt || 'Recently'}</span>
          </div>
          <div className="flex items-center">
            <FaMapMarkerAlt className="mr-1" />
            <span>{item.location || 'Online'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link 
            to={`/product/${item.id}`}
            className="flex-1 bg-primary-600 text-white text-center py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors mr-2"
          >
            View Details
          </Link>
          <div className="flex space-x-2">
            <button 
              onClick={handleAddToCart}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Add to Cart"
            >
              <FaShoppingCart size={16} />
            </button>
            <button 
              onClick={handleOfferExchange}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Offer Exchange"
            >
              <FaExchangeAlt size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedItemCard;
