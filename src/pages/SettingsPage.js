import React, { useState, useEffect } from 'react';
import { useAuth, callBackendFunction } from '../AuthContext';
import { FaCog, FaUser, FaShieldAlt, FaBell, FaPalette, FaGlobe, FaTrash, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useToast } from '../components/ToastContext';

function Spinner() {
  return (
    <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="4" fill="none" opacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    location: 'Mumbai',
    avatar: user?.photoURL || ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      exchangeOffers: true,
      likes: true,
      views: true,
      delivery: true,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true,
      showOnlineStatus: true
    },
    preferences: {
      language: 'en',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      theme: 'light'
    }
  });
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        displayName: user.displayName || '',
        email: user.email || '',
        avatar: user.photoURL || ''
      }));
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      // Only update displayName, photoURL, email (if allowed)
      await callBackendFunction('createUserProfile', 'POST', {
        displayName: profileData.displayName,
        email: profileData.email,
        photoURL: profileData.avatar
      });
      setSuccess('Profile updated successfully!');
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      setError('Failed to update profile.');
      showToast('Failed to update profile.', 'error');
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      // Here you would call the backend to change password
      // await callBackendFunction('changePassword', 'POST', passwordData);
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // Here you would call the backend to save settings
      // await callBackendFunction('updateSettings', 'POST', settings);
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
      if (window.confirm('This is your final warning. Are you absolutely sure?')) {
        // Here you would call the backend to delete account
        // await callBackendFunction('deleteAccount', 'POST');
        logout();
      }
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FaUser },
    { id: 'security', name: 'Security', icon: FaShieldAlt },
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'privacy', name: 'Privacy', icon: FaGlobe },
    { id: 'preferences', name: 'Preferences', icon: FaPalette }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <FaCog className="text-primary-600 mr-3" />
            Account Settings
          </h1>
          <p className="text-lg text-gray-600">
            Manage your account preferences and settings
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter your display name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <select
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Kolkata">Kolkata</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {loading ? <><Spinner /> Saving...</> : (
                        <>
                          <FaSave className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                            placeholder="Enter current password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter new password"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Confirm new password"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
                    <p className="text-red-700 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
                    >
                      <FaTrash className="mr-2" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      {Object.entries(settings.notifications).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-3 text-sm text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showEmail}
                        onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Show email to other users</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showPhone}
                        onChange={(e) => handleSettingChange('privacy', 'showPhone', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Show phone number to other users</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.privacy.allowMessages}
                        onChange={(e) => handleSettingChange('privacy', 'allowMessages', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Allow messages from other users</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showOnlineStatus}
                        onChange={(e) => handleSettingChange('privacy', 'showOnlineStatus', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">Show online status</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="mr">Marathi</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={settings.preferences.currency}
                        onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.preferences.timezone}
                        onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="Asia/Kolkata">India (IST)</option>
                        <option value="Asia/Dubai">Dubai (GST)</option>
                        <option value="America/New_York">New York (EST)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select
                        value={settings.preferences.theme}
                        onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button for Settings */}
            {activeTab !== 'profile' && activeTab !== 'security' && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? 'Saving...' : (
                    <>
                      <FaSave className="mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 