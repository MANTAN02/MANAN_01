import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import EnhancedItemCard from '../components/EnhancedItemCard';
import '../styles.css';

const BrowsePage = ({ items = [], search = "" }) => {
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'All Items', icon: '🛍️' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'fashion', name: 'Fashion', icon: '👕' },
    { id: 'home', name: 'Home & Garden', icon: '🏠' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'books', name: 'Books', icon: '📚' },
    { id: 'toys', name: 'Toys & Games', icon: '🎮' },
    { id: 'other', name: 'Other', icon: '🎁' }
  ];

  useEffect(() => {
    filterAndSortItems();
  }, [items, search, selectedCategory, sortBy]);

  const filterAndSortItems = () => {
    let filtered = items.filter(item => {
      const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase()) ||
                           item.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort items
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }

    setFilteredItems(filtered);
  };

  const handleListItem = () => {
    if (!user) {
      showToast('Please login to list an item', 'warning');
      navigate('/login');
      return;
    }
    navigate('/list');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-violet-600 font-semibold">Loading amazing items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Vibrant Gradient */}
      <div className="hero-section relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-float">
            Discover Amazing Items to Swap
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Join the vibrant community of swappers in Mumbai. Find unique items and make exciting exchanges!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleListItem}
              className="button primary text-lg px-8 py-4 animate-pulse-glow"
            >
              🎯 List Your Item
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="button secondary text-lg px-8 py-4"
            >
              🌟 Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-violet-50 to-orange-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-violet-600 mb-2">1,234+</div>
              <div className="text-gray-600">Active Swappers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5,678+</div>
              <div className="text-gray-600">Items Listed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">2,345+</div>
              <div className="text-gray-600">Successful Swaps</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-violet-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white/80 text-gray-700 hover:bg-violet-50 border border-violet-200'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-violet-200 bg-white/80 backdrop-blur-sm rounded-lg text-sm font-medium focus:border-violet-500 focus:ring-4 focus:ring-violet-200 transition-all duration-300"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No items found</h3>
            <p className="text-gray-500 mb-6">
              {search ? `No items match "${search}"` : 'Be the first to list an item!'}
            </p>
            <button 
              onClick={handleListItem}
              className="button primary"
            >
              List Your First Item
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {search ? `Search Results for "${search}"` : 'Available Items'}
              </h2>
              <p className="text-gray-600">
                Found {filteredItems.length} amazing item{filteredItems.length !== 1 ? 's' : ''} to swap
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="animate-fade-in">
                  <EnhancedItemCard item={item} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Swapping?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of happy swappers in Mumbai and discover amazing items!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleListItem}
              className="button accent text-lg px-8 py-4"
            >
              🚀 List Your Item Now
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="button secondary text-lg px-8 py-4"
            >
              📖 How It Works
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;
