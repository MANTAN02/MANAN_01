import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../styles.css";
// Dynamically extract unique categories from initialItems (imported from BrowsePage)
import { initialItems as browseInitialItems } from '../pages/BrowsePage';

const CATEGORY_SUGGESTIONS = Array.from(
  new Set(browseInitialItems.map(item => item.category))
).sort();

export default function Header({ searchValue, onSearchChange }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const menuRef = useRef();
  const searchRef = useRef();
  const navigate = useNavigate();
  // Placeholder cart count (replace with real cart logic if available)
  const cartCount = 2;

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    if (menuOpen || showSuggestions) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen, showSuggestions]);

  useEffect(() => {
    if (searchValue && searchValue.length > 0) {
      const filtered = CATEGORY_SUGGESTIONS.filter(cat =>
        cat.toLowerCase().includes(searchValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  }, [searchValue]);

  // Removed unused functions to fix linting warnings

  return (
    <header className="main-header">
      <div className="header-content">
        <span className="logo">SWAPIN</span>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/browse" className="nav-link">Browse</Link>
          <Link to="/list" className="nav-link">List Item</Link>
          <Link to="/offers" className="nav-link">My Offers</Link>
        </nav>
        <div className="header-actions">
          <button className="cart-btn" aria-label="Cart" tabIndex={0} onClick={() => navigate('/cart')}>
            <span role="img" aria-label="cart" style={{ fontSize: 22 }}>🛒</span>
            <span className="cart-label">Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          {user ? (
            <div className="user-profile" ref={menuRef}>
              <div className="user-profile-btn" onClick={() => setMenuOpen(m => !m)}>
                <img
                  src={user.photoURL || user.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"}
                  alt="User Avatar"
                  className="user-avatar"
                />
                <span className="user-name">{user.displayName || user.name || user.email || 'NEW USER'}</span>
                <span style={{ marginLeft: 4, fontSize: 18 }}>▼</span>
              </div>
              {menuOpen && (
                <div className="user-menu">
                  <Link to="/profile" className="user-menu-item">Profile</Link>
                  <button className="user-menu-item" onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="user-auth-links">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}