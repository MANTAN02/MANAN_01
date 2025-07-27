import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { FaBars, FaSearch, FaShoppingCart, FaUser, FaBell, FaTimes, FaHeart, FaStore } from 'react-icons/fa';

const EnhancedHeader = ({ searchValue, onSearchChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchValue)}`);
      setIsSearchOpen(false);
    }
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
            <div className="flex-1 max-w-md mx-8">
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

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link to="/browse" className="text-gray-700 hover:text-primary-600 transition-colors">
                Browse
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
                  <Link to="/profile" className="flex items-center space-x-2">
                    <img
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium">{user.displayName || 'Profile'}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-primary-600">
                    Logout
                  </button>
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
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold text-primary-600">
            SWAPIN
          </Link>
          
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSearchOpen(true)} className="text-gray-600">
              <FaSearch size={20} />
            </button>
            <Link to="/cart" className="relative text-gray-600">
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={toggleMobileMenu} className="text-gray-600">
              <FaBars size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <FaTimes />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
        <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-bold">Menu</span>
              <button onClick={toggleMobileMenu} className="text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>

            {user && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{user.displayName || 'User'}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="space-y-2">
              <Link to="/browse" onClick={toggleMobileMenu} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <FaStore />
                <span>Browse Items</span>
              </Link>
              <Link to="/list" onClick={toggleMobileMenu} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <FaStore />
                <span>Sell Item</span>
              </Link>
              <Link to="/cart" onClick={toggleMobileMenu} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <FaShoppingCart />
                <span>My Cart</span>
              </Link>
              <Link to="/profile" onClick={toggleMobileMenu} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <FaUser />
                <span>Profile</span>
              </Link>
              <Link to="/wishlist" onClick={toggleMobileMenu} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <FaHeart />
                <span>Wishlist</span>
              </Link>
              {user ? (
                <button onClick={handleLogout} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg w-full text-left">
                  <FaUser />
                  <span>Logout</span>
                </button>
              ) : (
                <Link to="/login" onClick={toggleMobileMenu} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <FaUser />
                  <span>Login</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedHeader;
