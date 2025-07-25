
import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import ListItemPage from "./pages/ListItemPage";
import BrowsePage from "./pages/BrowsePage";
import DeliveryPage from "./pages/DeliveryPage";
import ExchangePage from "./pages/ExchangePage";
import ExchangeOfferPage from "./pages/ExchangeOfferPage";
import UserProfilePage from "./pages/UserProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Header from "./components/Header";
import { AuthProvider, useAuth } from "./AuthContext";
import "./styles.css";
import { initialItems } from './pages/BrowsePage';
import { FaBars, FaUser, FaBell, FaStore, FaList, FaHeart, FaCog, FaSignOutAlt } from 'react-icons/fa';

const CATEGORY_SUGGESTIONS = Array.from(
  new Set(initialItems.map(item => item.category))
).sort();

function CenteredSearchBar({ searchValue, onSearchChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef();
  const navigate = useNavigate();

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

  function handleInputChange(e) {
    onSearchChange(e.target.value);
  }

  function handleSuggestionClick(suggestion) {
    onSearchChange(suggestion);
    setShowSuggestions(false);
    navigate('/browse', { state: { searchCategory: suggestion } });
  }

  function handleInputKeyDown(e) {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      onSearchChange(suggestions[highlightedIndex]);
      setShowSuggestions(false);
      navigate('/browse', { state: { searchCategory: suggestions[highlightedIndex] } });
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  function highlightMatch(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<span className="highlight-match-bold">{text.slice(idx, idx + query.length)}</span>{text.slice(idx + query.length)}</>;
  }

  function handleSearchIconClick() {
    const category = CATEGORY_SUGGESTIONS.find(cat =>
      cat.toLowerCase() === searchValue.toLowerCase()
    );
    navigate('/browse', { state: { searchCategory: category || searchValue } });
  }

  return (
    <div className="centered-search-bar-container">
      <div className="centered-search-bar" ref={searchRef}>
        <input
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onKeyDown={handleInputKeyDown}
          placeholder="Search by category..."
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
        />
        <span className="search-icon" role="img" aria-label="search" onClick={handleSearchIconClick} style={{ cursor: 'pointer' }}>🔍</span>
        {showSuggestions && (
          <ul className="search-suggestions" id="search-suggestions" role="listbox">
            {suggestions.map((s, i) => (
              <li
                key={s}
                id={`suggestion-${i}`}
                className={highlightedIndex === i ? "highlighted" : ""}
                onMouseDown={() => handleSuggestionClick(s)}
                role="option"
                aria-selected={highlightedIndex === i}
              >
                <span className="suggestion-label">{highlightMatch(s, searchValue)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function HomePage() {
  return <div className="sidebar-landing-page">Welcome to Swapin! Start browsing or list your first item.</div>;
}
function OffersPage() {
  return <div className="sidebar-landing-page">Your Offers and Transactions</div>;
}
function MyProfilePage() {
  return <div className="sidebar-landing-page">My Profile Page (View/Edit your info)</div>;
}
function NotificationsPage() {
  return <div className="sidebar-landing-page">Notifications Page (All your alerts)</div>;
}
function ShopPagesPage() {
  return <div className="sidebar-landing-page">Shop Pages (Browse by shop or category)</div>;
}
function AllPagesPage() {
  return <div className="sidebar-landing-page">All Pages (Site map or feature list)</div>;
}
function MyWishlistPage() {
  return <div className="sidebar-landing-page">My Wishlist (Your saved items)</div>;
}
function SettingsPage() {
  return <div className="sidebar-landing-page">Settings (Account preferences)</div>;
}
function CartPage() {
  return <div className="sidebar-landing-page">Your Cart (Checkout and manage items)</div>;
}

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  function handleNav(path) {
    onClose();
    navigate(path);
  }
  function handleSignOut() {
    logout();
    onClose();
    navigate('/login');
  }
  return (
    <div className={`sidebar-overlay ${open ? 'sidebar-open' : ''}`}> 
      <div className="sidebar-panel">
        <button className="sidebar-close" onClick={onClose}>&times;</button>
        <div className="sidebar-profile">
          <img src={user && user.avatar ? user.avatar : 'https://randomuser.me/api/portraits/lego/1.jpg'} alt="Profile" className="sidebar-profile-img" />
          <div className="sidebar-profile-name">{user && user.name ? user.name : 'NEW USER'}</div>
          <div className="sidebar-profile-balance">Current Balance $99</div>
        </div>
        <ul className="sidebar-menu">
          <li onClick={() => handleNav('/my-profile')}><FaUser className="sidebar-icon" /> My Profile</li>
          <li onClick={() => handleNav('/notifications')}><FaBell className="sidebar-icon" /> Notifications <span className="sidebar-badge">3</span></li>
          <li onClick={() => handleNav('/shop-pages')}><FaStore className="sidebar-icon" /> Shop Pages</li>
          <li onClick={() => handleNav('/all-pages')}><FaList className="sidebar-icon" /> All Pages</li>
          <li onClick={() => handleNav('/my-wishlist')}><FaHeart className="sidebar-icon" /> My Wishlist</li>
          <li onClick={() => handleNav('/my-listings')}><FaList className="sidebar-icon" /> My Listings</li>
          <li onClick={() => handleNav('/settings')}><FaCog className="sidebar-icon" /> Settings</li>
          <li onClick={handleSignOut}><FaSignOutAlt className="sidebar-icon" /> Sign Out</li>
        </ul>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function ListItemPageWithSkip(props) {
  const navigate = useNavigate();
  return <ListItemPage {...props} onSkip={() => navigate('/browse')} />;
}

function MyListingsPage() {
  const { user } = useAuth();
  // Placeholder: show only user's items
  return <div className="sidebar-landing-page">My Listings (Your posted ads will appear here)</div>;
}
function ItemDetailsPage({ itemId }) {
  // Placeholder: show details for a single item
  return <div className="sidebar-landing-page">Item Details for ID: {itemId}</div>;
}

function App() {
  const [userItems, setUserItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [exchangeOffer, setExchangeOffer] = useState(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // These handlers can be passed as props if needed
  const handleListItem = (item) => {
    const newItem = { ...item, owner: 'me' };
    setUserItems([...userItems, newItem]);
  };

  const handlePurchase = (item) => {
    setSelectedItem(item);
  };

  const handleOfferExchange = (item) => {
    setSelectedItem(item);
  };

  const handleConfirmExchange = (offer) => {
    setExchangeOffer(offer);
  };

  const handleAcceptOffer = () => {
    alert("Exchange accepted! Proceeding to delivery.");
    setSelectedItem(exchangeOffer.theirItem);
  };

  const handleConfirmDelivery = () => {
    alert("Delivery confirmed! Thank you for using SWAPIN.");
    setSelectedItem(null);
    setExchangeOffer(null);
  };

  return (
    <AuthProvider>
      <Router>
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
          <span className="hamburger-circle">
            <FaBars size={28} />
          </span>
        </button>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Header searchValue={search} onSearchChange={setSearch} />
        <CenteredSearchBar searchValue={search} onSearchChange={setSearch} />
        <div className="App">
          <AppRoutes
            userItems={userItems}
            handleListItem={handleListItem}
            handlePurchase={handlePurchase}
            handleOfferExchange={handleOfferExchange}
            handleConfirmExchange={handleConfirmExchange}
            handleAcceptOffer={handleAcceptOffer}
            handleConfirmDelivery={handleConfirmDelivery}
            selectedItem={selectedItem}
            exchangeOffer={exchangeOffer}
            search={search}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

function AppRoutes({ userItems, handleListItem, handlePurchase, handleOfferExchange, handleConfirmExchange, handleAcceptOffer, handleConfirmDelivery, selectedItem, exchangeOffer, search }) {
  const location = useLocation();
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/browse" element={<BrowsePage userItems={userItems} onAddToCart={handlePurchase} onOfferExchange={handleOfferExchange} onOfferFullPrice={handlePurchase} search={search} searchCategory={location.state?.searchCategory} />} />
      <Route path="/list" element={<ListItemPage onSubmit={handleListItem} />} />
      <Route path="/offers" element={<OffersPage />} />
      <Route path="/my-profile" element={<MyProfilePage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/shop-pages" element={<ShopPagesPage />} />
      <Route path="/all-pages" element={<AllPagesPage />} />
      <Route path="/my-wishlist" element={<MyWishlistPage />} />
      <Route path="/my-listings" element={<MyListingsPage />} />
      <Route path="/item/:itemId" element={<ItemDetailsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/delivery" element={<ProtectedRoute><DeliveryPage item={selectedItem} onBack={() => {}} onConfirm={handleConfirmDelivery} /></ProtectedRoute>} />
      <Route path="/exchange" element={<ProtectedRoute><ExchangePage item={selectedItem} yourItems={userItems} onBack={() => {}} onConfirm={handleConfirmExchange} /></ProtectedRoute>} />
      <Route path="/offers" element={<ProtectedRoute><ExchangeOfferPage offer={exchangeOffer} onAccept={handleAcceptOffer} onDecline={() => {}} /></ProtectedRoute>} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;