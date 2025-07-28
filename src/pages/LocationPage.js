import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, callBackendFunction } from '../AuthContext';
import { FaMapMarkerAlt, FaTruck, FaHome, FaBuilding, FaClock, FaPhone, FaEdit, FaSave } from 'react-icons/fa';

const LocationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savedLocations, setSavedLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'home',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    instructions: '',
    preferredTime: 'anytime'
  });

  // Mock saved locations
  useEffect(() => {
    const mockLocations = [
      {
        id: 1,
        name: 'Home',
        type: 'home',
        address: '123 Main Street, Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '+91 98765 43210',
        instructions: 'Call before delivery',
        preferredTime: 'evening'
      },
      {
        id: 2,
        name: 'Office',
        type: 'office',
        address: '456 Business Park, Floor 3',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002',
        phone: '+91 98765 43211',
        instructions: 'Reception desk',
        preferredTime: 'afternoon'
      }
    ];
    setSavedLocations(mockLocations);
    setSelectedLocation(mockLocations[0]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Here you would call the backend to save the location
      // await callBackendFunction('saveLocation', 'POST', formData);
      
      const newLocation = {
        id: Date.now(),
        ...formData
      };
      
      setSavedLocations(prev => [...prev, newLocation]);
      setFormData({
        name: '',
        type: 'home',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        instructions: '',
        preferredTime: 'anytime'
      });
      setShowAddForm(false);
      
      // Show success message
      alert('Location saved successfully!');
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Failed to save location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditLocation = (location) => {
    setFormData(location);
    setShowAddForm(true);
  };

  const handleDeleteLocation = (locationId) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      setSavedLocations(prev => prev.filter(loc => loc.id !== locationId));
      if (selectedLocation?.id === locationId) {
        setSelectedLocation(savedLocations[0] || null);
      }
    }
  };

  const handleSetDefault = (location) => {
    setSelectedLocation(location);
    // Here you would call the backend to set as default
    // await callBackendFunction('setDefaultLocation', 'POST', { locationId: location.id });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Delivery & Pickup Locations
          </h1>
          <p className="text-lg text-gray-600">
            Manage your delivery addresses and pickup preferences
          </p>
        </div>

        {/* Current Default Location */}
        {selectedLocation && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FaMapMarkerAlt className="text-primary-600 mr-2" />
                Default Location
              </h2>
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-900">{selectedLocation.name}</p>
                <p className="text-gray-600">{selectedLocation.address}</p>
                <p className="text-gray-600">{selectedLocation.city}, {selectedLocation.state} {selectedLocation.pincode}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone: {selectedLocation.phone}</p>
                <p className="text-gray-600">Preferred Time: {selectedLocation.preferredTime}</p>
                {selectedLocation.instructions && (
                  <p className="text-gray-600">Instructions: {selectedLocation.instructions}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Saved Locations */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Saved Locations</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <FaEdit className="mr-2" />
              Add New
            </button>
          </div>

          <div className="space-y-4">
            {savedLocations.map((location) => (
              <div
                key={location.id}
                className={`border rounded-lg p-4 ${
                  selectedLocation?.id === location.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {location.type === 'home' ? (
                      <FaHome className="text-primary-600" />
                    ) : (
                      <FaBuilding className="text-secondary-600" />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{location.name}</h3>
                      <p className="text-sm text-gray-600">{location.address}</p>
                      <p className="text-sm text-gray-600">{location.city}, {location.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedLocation?.id !== location.id && (
                      <button
                        onClick={() => handleSetDefault(location)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEditLocation(location)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(location.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add/Edit Location Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {formData.id ? 'Edit Location' : 'Add New Location'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    name: '',
                    type: 'home',
                    address: '',
                    city: '',
                    state: '',
                    pincode: '',
                    phone: '',
                    instructions: '',
                    preferredTime: 'anytime'
                  });
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Home, Office"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Full address"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Mumbai"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Maharashtra"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="400001"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Delivery Time
                  </label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="anytime">Anytime</option>
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                    <option value="evening">Evening (4 PM - 8 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Call before delivery, Leave at reception"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    'Saving...'
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Location
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delivery Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FaTruck className="text-primary-600 mr-2" />
            Delivery Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Standard Delivery</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 2-3 business days</li>
                <li>• Professional third-party delivery</li>
                <li>• Item verification at pickup and delivery</li>
                <li>• Contactless delivery available</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Express Delivery</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Same day delivery (Mumbai)</li>
                <li>• Next day delivery (other cities)</li>
                <li>• Priority handling</li>
                <li>• Additional charges apply</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPage; 