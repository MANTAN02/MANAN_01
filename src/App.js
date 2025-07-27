import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { CartProvider } from './components/CartContext';
import EnhancedHeader from './components/EnhancedHeader';
import EnhancedItemCard from './components/EnhancedItemCard';
import BrowsePage from './pages/BrowsePage';
import CartPage from './pages/CartPage';
import DeliveryPage from './pages/DeliveryPage';
import ExchangePage from './pages/ExchangePage';
import ExchangeOfferPage from './pages/ExchangeOfferPage';
import ListItemPage from './pages/ListItemPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductDetailPage from './pages/ProductDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import UpdatesPage from './pages/UpdatesPage';
import './index.css';

const App = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockItems = [
      {
        id: 1,
        title: "Vintage Camera",
        price: 299,
        category: "Electronics",
        description: "Beautiful vintage camera in excellent condition",
        image: "https://via.placeholder.com/300x200",
        location: "New York",
        rating: 4.5,
        reviewCount: 12,
        isNew: true,
        postedAt: "2 days ago"
      },
      {
        id: 2,
        title: "Designer Watch",
        price: 599,
        category: "Fashion",
        description: "Luxury designer watch with original box",
        image: "https://via.placeholder.com/300x200",
        location: "Los Angeles",
        rating: 4.8,
        reviewCount: 25,
        isFeatured: true,
        postedAt: "1 week ago"
      },
      {
        id: 3,
        title: "Gaming Laptop",
        price: 899,
        category: "Electronics",
        description: "High-performance gaming laptop with warranty",
        image: "https://via.placeholder.com/300x200",
        location: "Chicago",
        rating: 4.2,
        reviewCount: 8,
        postedAt: "3 days ago"
      }
    ];
    setItems(mockItems);
  }, []);

  const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <EnhancedHeader searchValue={search} onSearchChange={setSearch} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<BrowsePage items={items} search={search} />} />
                <Route path="/browse" element={<BrowsePage items={items} search={search} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/list" element={<ProtectedRoute><ListItemPage /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/exchange/:id" element={<ProtectedRoute><ExchangePage /></ProtectedRoute>} />
                <Route path="/delivery/:id" element={<ProtectedRoute><DeliveryPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
                <Route path="/updates" element={<ProtectedRoute><UpdatesPage /></ProtectedRoute>} />
                <Route path="/exchange-offers" element={<ProtectedRoute><ExchangeOfferPage /></ProtectedRoute>} />
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
          <li onClick={() => handleNav('/cart')}><FaShoppingCart className="sidebar-icon" /> My Cart</li>
          <li onClick={() => handleNav('/my-profile')}><FaUser className="sidebar-icon" /> My Profile</li>
          <li onClick={() => handleNav('/updates')}><FaCog className="sidebar-icon" /> Account Settings</li>
          <li onClick={() => handleNav('/notifications')}><FaBell className="sidebar-icon" /> Notifications <span className="sidebar-badge">3</span></li>
          <li onClick={() => handleNav('/shop-pages')}><FaStore className="sidebar-icon" /> Shop Pages</li>
          <li onClick={() => handleNav('/all-pages')}><FaList className="sidebar-icon" /> All Pages</li>
          <li onClick={() => handleNav('/my-wishlist')}><FaHeart className="sidebar-icon" /> My Wishlist</li>
          <li onClick={() => handleNav('/my-listings')}><FaList className="sidebar-icon" /> My Listings</li>
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

function MyListingsPage() {
  // Placeholder: show only user's items
  return <div className="sidebar-landing-page">My Listings (Your posted ads will appear here)</div>;
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
    const navigate = useNavigate();
    
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
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/updates" element={<ProtectedRoute><UpdatesPage /></ProtectedRoute>} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/delivery" element={<ProtectedRoute><DeliveryPage item={selectedItem} onBack={() => navigate('/cart')} onConfirm={handleConfirmDelivery} /></ProtectedRoute>} />
        <Route path="/exchange" element={<ProtectedRoute><ExchangePage item={selectedItem} yourItems={userItems} onBack={() => navigate('/browse')} onConfirm={handleConfirmExchange} /></ProtectedRoute>} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );
  }

export default App;
