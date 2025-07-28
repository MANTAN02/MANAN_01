import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, callBackendFunction } from './AuthContext';
import { CartProvider } from './components/CartContext';
import EnhancedHeader from './components/EnhancedHeader';
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
import AboutUsPage from './pages/AboutUsPage';
import LocationPage from './pages/LocationPage';
import WishlistPage from './pages/WishlistPage';
import MyListingsPage from './pages/MyListingsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import { ToastProvider } from './components/ToastContext';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user) {
          const data = await callBackendFunction('getAvailableItems', 'GET');
          setItems(data);
        }
      } catch (e) {
        setError('Failed to load items');
      }
      setLoading(false);
    };
    fetchItems();
  }, [user]);

  return (
    <ToastProvider>
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
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/list" element={<ProtectedRoute><ListItemPage /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/exchange/:id" element={<ProtectedRoute><ExchangePage /></ProtectedRoute>} />
                  <Route path="/delivery/:id" element={<ProtectedRoute><DeliveryPage /></ProtectedRoute>} />
                  <Route path="/location" element={<ProtectedRoute><LocationPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
                  <Route path="/updates" element={<ProtectedRoute><UpdatesPage /></ProtectedRoute>} />
                  <Route path="/exchange-offers" element={<ProtectedRoute><ExchangeOfferPage /></ProtectedRoute>} />
                  <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                  <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                </Routes>
              </main>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
