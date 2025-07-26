import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Button from "../components/Button";
import "../styles.css";

export default function UpdatesPage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    avatar: ''
  });

  const [addressData, setAddressData] = useState({
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.photoURL || user.avatar || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (profileData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(profileData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (updateProfile) {
        await updateProfile(profileData);
      }
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setErrors({});
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Address updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating address:', error);
      setErrors({ submit: 'Failed to update address. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccessMessage('Password updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating password:', error);
      setErrors({ submit: 'Failed to update password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setErrors({});
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccessMessage('Notification settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating notifications:', error);
      setErrors({ submit: 'Failed to update notification settings. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e0e7ff",
    borderRadius: "12px",
    fontSize: "1rem",
    background: "#f7faff",
    marginBottom: "4px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box"
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: "#ff4d6d",
    background: "#fff5f5",
  };

  const errorTextStyle = {
    color: "#ff4d6d",
    fontSize: "0.875rem",
    marginBottom: "12px",
    display: "block",
  };

  const tabStyle = {
    padding: "12px 24px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    borderRadius: "8px",
    transition: "all 0.2s"
  };

  const activeTabStyle = {
    ...tabStyle,
    background: "#a259f7",
    color: "#fff"
  };

  const inactiveTabStyle = {
    ...tabStyle,
    color: "#666",
    background: "#f7faff"
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ 
        background: "#fff", 
        borderRadius: 16, 
        boxShadow: "0 4px 24px rgba(0,0,0,0.05)", 
        padding: 32 
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontWeight: 800, fontSize: 28, marginBottom: 8, color: "#232F3E" }}>
            Account Settings
          </h2>
          <p style={{ color: "#666", fontSize: "1rem" }}>
            Manage your profile, addresses, and preferences
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{ 
            background: "#f0f9f4", 
            border: "1px solid #22a06b", 
            borderRadius: "8px", 
            padding: "12px", 
            marginBottom: "20px",
            color: "#22a06b",
            textAlign: "center",
            fontWeight: "600"
          }}>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div style={{ 
            background: "#fff5f5", 
            border: "1px solid #ff4d6d", 
            borderRadius: "8px", 
            padding: "12px", 
            marginBottom: "20px",
            color: "#ff4d6d",
            textAlign: "center"
          }}>
            {errors.submit}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ 
          display: "flex", 
          gap: "8px", 
          marginBottom: "32px", 
          borderBottom: "1px solid #e0e7ff",
          paddingBottom: "16px"
        }}>
          <button
            style={activeTab === 'profile' ? activeTabStyle : inactiveTabStyle}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            style={activeTab === 'address' ? activeTabStyle : inactiveTabStyle}
            onClick={() => setActiveTab('address')}
          >
            Address
          </button>
          <button
            style={activeTab === 'password' ? activeTabStyle : inactiveTabStyle}
            onClick={() => setActiveTab('password')}
          >
            Password
          </button>
          <button
            style={activeTab === 'notifications' ? activeTabStyle : inactiveTabStyle}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
                  Display Name *
                </label>
                <input
                  type="text"
                  name="displayName"
                  placeholder="Enter your display name"
                  value={profileData.displayName}
                  onChange={handleProfileChange}
                  style={errors.displayName ? errorInputStyle : inputStyle}
                  required
                />
                {errors.displayName && <span style={errorTextStyle}>{errors.displayName}</span>}
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  style={errors.email ? errorInputStyle : inputStyle}
                  required
                />
                {errors.email && <span style={errorTextStyle}>{errors.email}</span>}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={profileData.phone}
                onChange={handleProfileChange}
                style={errors.phone ? errorInputStyle : inputStyle}
              />
              {errors.phone && <span style={errorTextStyle}>{errors.phone}</span>}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
                Profile Picture URL
              </label>
              <input
                type="url"
                name="avatar"
                placeholder="Enter profile picture URL"
                value={profileData.avatar}
                onChange={handleProfileChange}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
                Bio
              </label>
              <textarea
                name="bio"
                placeholder="Tell us about yourself..."
                value={profileData.bio}
                onChange={handleProfileChange}
                rows="4"
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "100px",
                }}
              />
            </div>

            <Button 
              type="submit" 
              variant="premium"
              loading={isLoading}
              style={{ width: "100%" }}
            >
              Update Profile
            </Button>
          </form>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && (
          <form onSubmit={handleAddressSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
                Street Address
              </label>
              <input
                type="text"
                name="streetAddress"
                placeholder="House number, street name"
                value={addressData.streetAddress}
                onChange={handleAddressChange}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
                Apartment, Suite, etc.
              </label>
              <input
                type="text"
                name="apartment"
                placeholder="Apartment, suite, unit, building, floor, etc."
                value={addressData.apartment}
                onChange={handleAddressChange}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={addressData.city}
                  onChange={handleAddressChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
                  State
                </label>
                <select
                  name="state"
                  value={addressData.state}
                  onChange={handleAddressChange}
                  style={inputStyle}
                >
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Delhi">Delhi</option>
                  {/* Add more states as needed */}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
                  PIN Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  placeholder="PIN Code"
                  value={addressData.zipCode}
                  onChange={handleAddressChange}
                  style={inputStyle}
                  maxLength="6"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="premium"
              loading={isLoading}
              style={{ width: "100%" }}
            >
              Update Address
            </Button>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
                Current Password *
              </label>
              <input
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                style={errors.currentPassword ? errorInputStyle : inputStyle}
                required
              />
              {errors.currentPassword && <span style={errorTextStyle}>{errors.currentPassword}</span>}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
                New Password *
              </label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                style={errors.newPassword ? errorInputStyle : inputStyle}
                required
              />
              {errors.newPassword && <span style={errorTextStyle}>{errors.newPassword}</span>}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontWeight: "600", color: "#232F3E", marginBottom: "6px" }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                style={errors.confirmPassword ? errorInputStyle : inputStyle}
                required
              />
              {errors.confirmPassword && <span style={errorTextStyle}>{errors.confirmPassword}</span>}
            </div>

            <Button 
              type="submit" 
              variant="premium"
              loading={isLoading}
              style={{ width: "100%" }}
            >
              Update Password
            </Button>
          </form>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleNotificationSubmit}>
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ color: "#232F3E", marginBottom: "16px", fontSize: "1.1rem", fontWeight: "700" }}>
                Notification Preferences
              </h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span style={{ fontSize: "1rem", color: "#232F3E" }}>Email Notifications</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={notificationSettings.smsNotifications}
                    onChange={handleNotificationChange}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span style={{ fontSize: "1rem", color: "#232F3E" }}>SMS Notifications</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onChange={handleNotificationChange}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span style={{ fontSize: "1rem", color: "#232F3E" }}>Push Notifications</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="marketingEmails"
                    checked={notificationSettings.marketingEmails}
                    onChange={handleNotificationChange}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span style={{ fontSize: "1rem", color: "#232F3E" }}>Marketing Emails</span>
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="premium"
              loading={isLoading}
              style={{ width: "100%" }}
            >
              Update Notifications
            </Button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/browse')}
          >
            Back to Browse
          </Button>
        </div>
      </div>
    </div>
  );
}
