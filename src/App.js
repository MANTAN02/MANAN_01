
import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
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
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Sample Item 1",
      price: 1500,
      image: "https://via.placeholder.com/80x80?text=Item1",
      quantity: 1
    },
    {
      id: 2,
      name: "Sample Item 2", 
      price: 2300,
      image: "https://via.placeholder.com/80x80?text=Item2",
      quantity: 2
    }
  ]);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } else {
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.05)", padding: 32 }}>
        <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 24, color: "#232F3E" }}>Your Cart</h2>
        
        {cartItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>🛒</div>
            <h3 style={{ color: "#232F3E", marginBottom: 8 }}>Your cart is empty</h3>
            <p style={{ color: "#666", marginBottom: 24 }}>Add some items to get started!</p>
            <button 
              className="button premium"
              onClick={() => window.location.href = '/browse'}
            >
              Browse Items
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  padding: "16px 0", 
                  borderBottom: "1px solid #eee",
                  gap: 16
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: 8, 
                      objectFit: "cover" 
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 4px 0", color: "#232F3E" }}>{item.name}</h4>
                    <p style={{ margin: 0, color: "#FFD814", fontWeight: 600 }}>₹{item.price}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "1px solid #ddd",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: "18px"
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: 30, textAlign: "center", fontWeight: 600 }}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "1px solid #ddd",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: "18px"
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 80 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: "#232F3E" }}>
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              borderTop: "2px solid #eee", 
              paddingTop: 24, 
              marginTop: 24 
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: 24
              }}>
                <h3 style={{ margin: 0, color: "#232F3E" }}>Total:</h3>
                <h3 style={{ margin: 0, color: "#FFD814", fontWeight: 800 }}>₹{total}</h3>
              </div>
              
              <div style={{ display: "flex", gap: 12 }}>
                <button 
                  className="button"
                  style={{ flex: 1 }}
                  onClick={() => window.location.href = '/browse'}
                >
                  Continue Shopping
                </button>
                <button 
                  className="button premium"
                  style={{ flex: 1 }}
                  onClick={() => window.location.href = '/delivery'}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
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
  // Get user info from Firebase user object
  const displayName = user?.displayName || user?.name || (user ? user.email : 'NEW USER');
  const email = user?.email || '';
  const avatar = user?.photoURL || user?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg';
  return (
    <div className={`sidebar-overlay ${open ? 'sidebar-open' : ''}`}> 
      <div className="sidebar-panel">
        <button className="sidebar-close" onClick={onClose}>&times;</button>
        <div className="sidebar-profile">
          <img src={avatar} alt="Profile" className="sidebar-profile-img" />
          <div className="sidebar-profile-name">{displayName}</div>
          {email && <div className="sidebar-profile-email">{email}</div>}
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



function MyListingsPage() {
  // Placeholder: show only user's items
  return <div className="sidebar-landing-page">My Listings (Your posted ads will appear here)</div>;
}
function ItemDetailsPage() {
  const { itemId } = useParams();
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
      <Route path="/" element={<BrowsePage userItems={userItems} onAddToCart={handlePurchase} onOfferExchange={handleOfferExchange} onOfferFullPrice={handlePurchase} search={search} searchCategory={location.state?.searchCategory} />} />
      <Route path="/browse" element={<BrowsePage userItems={userItems} onAddToCart={handlePurchase} onOfferExchange={handleOfferExchange} onOfferFullPrice={handlePurchase} search={search} searchCategory={location.state?.searchCategory} />} />
      <Route path="/list" element={<ListItemPage onSubmit={handleListItem} />} />
      <Route path="/offers" element={<ProtectedRoute><ExchangeOfferPage offer={exchangeOffer} onAccept={handleAcceptOffer} onDecline={() => {}} /></ProtectedRoute>} />
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
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;