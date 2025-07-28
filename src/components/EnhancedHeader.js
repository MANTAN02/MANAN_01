import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, callBackendFunction } from '../AuthContext';
import { FaBars, FaSearch, FaShoppingCart, FaUser, FaBell, FaTimes, FaHeart, FaStore, FaCog, FaList, FaInfoCircle } from 'react-icons/fa';
import { useCart } from './CartContext';

// 300+ categories (should match ItemForm)
const CATEGORIES = [
  "Mobile Phones", "Laptops", "Tablets", "Headphones", "Speakers", "Smart Watches", "Televisions", "Refrigerators", "Washing Machines", "Microwave Ovens", "Air Conditioners", "Fans", "Heaters", "Water Purifiers", "Vacuum Cleaners", "Mixers & Grinders", "Juicers", "Toasters", "Coffee Makers", "Induction Cooktops", "Gas Stoves", "Chairs", "Sofas", "Beds", "Mattresses", "Dining Tables", "Study Tables", "Wardrobes", "Bookshelves", "Shoe Racks", "TV Units", "Paint", "Suitcase", "Carpet", "Curtains", "Blankets", "Pillows", "Bedsheets", "Towels", "Clocks", "Mirrors", "Wall Art", "Decor Items", "Vases", "Planters", "Artificial Plants", "Candles", "Photo Frames", "Storage Boxes", "Laundry Baskets", "Ironing Boards", "Bicycles", "Scooters", "Motorcycles", "Cars", "Tyres", "Car Accessories", "Bike Accessories", "Helmets", "Sports Shoes", "Casual Shoes", "Sandals", "Slippers", "Formal Shoes", "Boots", "Sneakers", "Backpacks", "Handbags", "Wallets", "Belts", "Caps", "Hats", "Sunglasses", "Watches", "Jewellery", "Rings", "Necklaces", "Earrings", "Bracelets", "Bangles", "Anklets", "Makeup", "Perfumes", "Deodorants", "Shampoos", "Conditioners", "Soaps", "Body Wash", "Face Wash", "Moisturizers", "Sunscreen", "Toothpaste", "Toothbrushes", "Shaving Razors", "Shaving Cream", "Hair Dryers", "Hair Straighteners", "Combs", "Brushes", "Nail Clippers", "Scissors", "First Aid Kits", "Thermometers", "Blood Pressure Monitors", "Glucometers", "Wheelchairs", "Crutches", "Walkers", "Stethoscopes", "Books", "Novels", "Textbooks", "Comics", "Magazines", "Notebooks", "Pens", "Pencils", "Markers", "Highlighters", "Erasers", "Sharpeners", "Rulers", "Calculators", "School Bags", "Lunch Boxes", "Water Bottles", "Tiffin Boxes", "Stationery Sets", "Art Supplies", "Paint Brushes", "Colors", "Sketch Pens", "Crayons", "Drawing Books", "Craft Paper", "Glue", "Scissors (Craft)", "Stickers", "Toys", "Board Games", "Puzzles", "Action Figures", "Dolls", "Soft Toys", "Remote Control Toys", "Building Blocks", "Educational Toys", "Musical Toys", "Baby Strollers", "Baby Carriers", "Baby Cots", "Baby Chairs", "Baby Bottles", "Baby Clothes", "Baby Shoes", "Diapers", "Wipes", "Feeding Bottles", "Sippers", "Pacifiers", "Baby Blankets", "Baby Towels", "Baby Bath Tubs", "Baby Monitors", "Baby Gates", "Baby Safety Locks", "Baby Swings", "Baby Walkers", "Baby Play Gyms", "Baby Rattles", "Baby Teethers", "Baby Spoons", "Baby Plates", "Baby Bowls", "Baby Food Makers", "Baby Thermometers", "Baby Nail Clippers", "Baby Toothbrushes", "Baby Shampoo", "Baby Soap", "Baby Lotion", "Baby Oil", "Baby Powder", "Baby Cream", "Baby Wipes", "Baby Diaper Bags", "Baby Changing Mats", "Baby Potty Seats", "Baby Step Stools", "Baby Bath Seats", "Baby Bath Toys", "Baby Bath Thermometers", "Baby Bath Sponges", "Baby Bath Towels", "Baby Bath Robes", "Baby Bath Mats", "Baby Bath Brushes", "Baby Bath Washcloths", "Baby Bath Mitts", "Baby Bath Aprons", "Baby Bath Caps", "Baby Bath Shoes", "Baby Bath Slippers", "Baby Bath Sandals", "Baby Bath Boots", "Baby Bath Socks", "Baby Bath Gloves", "Baby Bath Hats", "Baby Bath Scarves", "Baby Bath Bibs", "Baby Bath Blankets", "Baby Bath Quilts", "Baby Bath Comforters", "Baby Bath Pillows", "Baby Bath Cushions", "Baby Bath Mattresses", "Baby Bath Sheets", "Baby Bath Covers", "Baby Bath Bags", "Baby Bath Pouches", "Baby Bath Cases", "Baby Bath Boxes", "Baby Bath Baskets", "Baby Bath Buckets", "Baby Bath Basins", "Baby Bath Bowls", "Baby Bath Cups", "Baby Bath Mugs", "Baby Bath Jugs", "Baby Bath Bottles", "Baby Bath Flasks", "Baby Bath Tumblers", "Baby Bath Glasses", "Baby Bath Plates", "Baby Bath Spoons", "Baby Bath Forks", "Baby Bath Knives", "Baby Bath Chopsticks", "Baby Bath Straws", "Baby Bath Brushes (Feeding)", "Baby Bath Cleaners", "Baby Bath Sterilizers", "Baby Bath Warmers", "Baby Bath Coolers", "Baby Bath Heaters", "Baby Bath Fans", "Baby Bath Air Purifiers", "Baby Bath Humidifiers", "Baby Bath Dehumidifiers", "Baby Bath Air Conditioners", "Baby Bath Air Coolers", "Baby Bath Air Heaters", "Baby Bath Air Blowers", "Baby Bath Air Circulators", "Baby Bath Air Fresheners", "Baby Bath Air Cleaners", "Baby Bath Air Filters", "Baby Bath Air Purifiers (Room)", "Baby Bath Air Purifiers (Car)", "Baby Bath Air Purifiers (Desk)", "Baby Bath Air Purifiers (Portable)", "Baby Bath Air Purifiers (Mini)", "Baby Bath Air Purifiers (Large)", "Baby Bath Air Purifiers (Small)", "Baby Bath Air Purifiers (Medium)", "Baby Bath Air Purifiers (Extra Large)", "Other"
];

const EnhancedHeader = ({ searchValue, onSearchChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();
  // --- Notification State ---
  const [notificationCount, setNotificationCount] = useState(0);
  useEffect(() => {
    let interval;
    const fetchNotifications = async () => {
      if (user) {
        try {
          const data = await callBackendFunction('getNotifications', 'GET');
          const unread = data.filter(n => !n.isRead).length;
          setNotificationCount(unread);
        } catch (e) {
          setNotificationCount(0);
        }
      } else {
        setNotificationCount(0);
      }
    };
    fetchNotifications();
    interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  // --- Search Suggestion State ---
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef();

  // --- Product Titles for Suggestion (optional: fetch from backend for more dynamic results) ---
  const [allTitles, setAllTitles] = useState([]);
  useEffect(() => {
    // Optionally fetch all product titles for suggestions
    // For now, skip or fetch a limited set for demo
    // fetch('/api/getAllTitles')
    //   .then(res => res.json())
    //   .then(data => setAllTitles(data));
  }, []);

  // --- Suggestion Logic ---
  useEffect(() => {
    if (!searchValue) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }
    // Category suggestions
    const catMatches = CATEGORIES.filter(cat => cat.toLowerCase().includes(searchValue.toLowerCase()));
    // Title suggestions (if available)
    const titleMatches = allTitles.filter(title => title.toLowerCase().includes(searchValue.toLowerCase()));
    const combined = [...catMatches, ...titleMatches].slice(0, 10);
    setSuggestions(combined);
    setShowSuggestions(combined.length > 0);
    setHighlightedIndex(-1);
  }, [searchValue, allTitles]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchValue)}`);
      setIsSearchOpen(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onSearchChange(suggestion);
    navigate(`/browse?search=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
  };

  const handleInputKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[highlightedIndex]);
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">SWAPIN</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8 relative">
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={e => onSearchChange(e.target.value)}
                  onFocus={() => setShowSuggestions(suggestions.length > 0)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search by keyword or category..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-controls="search-suggestions"
                  aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </form>
              {showSuggestions && (
                <ul className="absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto" id="search-suggestions" role="listbox">
                  {suggestions.map((s, i) => (
                    <li
                      key={s}
                      id={`suggestion-${i}`}
                      className={`px-4 py-2 cursor-pointer ${highlightedIndex === i ? "bg-primary-100" : ""}`}
                      onMouseDown={() => handleSuggestionClick(s)}
                      role="option"
                      aria-selected={highlightedIndex === i}
                    >
                      <span className="suggestion-label">{s}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link to="/browse" className="text-gray-700 hover:text-primary-600 transition-colors">
                Browse
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
                About
              </Link>
              <Link to="/list" className="text-gray-700 hover:text-primary-600 transition-colors">
                Sell
              </Link>
              <Link to="/cart" className="relative text-gray-700 hover:text-primary-600 transition-colors">
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/wishlist" className="relative text-gray-700 hover:text-primary-600 transition-colors">
                    <FaHeart size={20} />
                  </Link>
                  <Link to="/notifications" className="relative text-gray-700 hover:text-primary-600 transition-colors">
                    <FaBell size={20} />
                    {notificationCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                      <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium">{user.displayName || 'Profile'}</span>
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <FaUser className="mr-3" />
                          My Profile
                        </Link>
                        <Link to="/my-listings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <FaList className="mr-3" />
                          My Listings
                        </Link>
                        <Link to="/wishlist" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <FaHeart className="mr-3" />
                          Wishlist
                        </Link>
                        <Link to="/notifications" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <FaBell className="mr-3" />
                          Notifications
                        </Link>
                        <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <FaCog className="mr-3" />
                          Settings
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold text-primary-600">
              SWAPIN
            </Link>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gray-700 hover:text-primary-600"
              >
                <FaSearch size={20} />
              </button>
              <Link to="/cart" className="relative text-gray-700 hover:text-primary-600">
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-primary-600"
              >
                <FaBars size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {isSearchOpen && (
            <div className="mt-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg">
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-semibold">Menu</span>
                  <button
                    onClick={toggleMobileMenu}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName || 'User'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    <nav className="space-y-2">
                      <Link
                        to="/browse"
                        onClick={toggleMobileMenu}
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <FaStore className="mr-3" />
                        Browse
                      </Link>
                      <Link
                        to="/about"
                        onClick={toggleMobileMenu}
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <FaInfoCircle className="mr-3" />
                        About
                      </Link>
                      <Link
                        to="/list"
                        onClick={toggleMobileMenu}
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <FaStore className="mr-3" />
                        Sell Item
                      </Link>
                      <Link
                        to="/profile"
                        onClick={toggleMobileMenu}
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <FaUser className="mr-3" />
                        My Profile
                      </Link>
                      <Link
                        to="/my-listings"
                        onClick={toggleMobileMenu}
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <FaList className="mr-3" />
                        My Listings
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={toggleMobileMenu}
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <FaHeart className="mr-3" />
                        Wishlist
                      </Link>
                      <Link
                        to="/notifications"
                        onClick={toggleMobileMenu}
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <FaBell className="mr-3" />
                        Notifications
                        {notificationCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {notificationCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/settings"
                        onClick={toggleMobileMenu}
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <FaCog className="mr-3" />
                        Settings
                      </Link>
                      <hr className="my-4" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Logout
                      </button>
                    </nav>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link
                      to="/login"
                      onClick={toggleMobileMenu}
                      className="block w-full bg-primary-600 text-white text-center py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={toggleMobileMenu}
                      className="block w-full border border-primary-600 text-primary-600 text-center py-2 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default EnhancedHeader;
