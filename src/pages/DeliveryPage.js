import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { callBackendFunction } from '../AuthContext';
import '../styles.css';

const DeliveryPage = () => {
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeliveryData();
  }, [id]);

  const fetchDeliveryData = async () => {
    try {
      const deliveryData = await callBackendFunction('getDelivery', 'GET', { id });
      setDelivery(deliveryData);
      
      if (deliveryData?.address) {
        setDeliveryAddress(deliveryData.address);
      }
    } catch (error) {
      showToast('Failed to load delivery details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateAddress = async () => {
    setUpdating(true);
    try {
      await callBackendFunction('updateDeliveryAddress', 'PUT', {
        deliveryId: id,
        address: deliveryAddress
      });
      showToast('Delivery address updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update address', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleTrackDelivery = () => {
    if (delivery?.trackingNumber) {
      window.open(`https://tracking.example.com/${delivery.trackingNumber}`, '_blank');
    } else {
      showToast('Tracking number not available yet', 'warning');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'picked_up': return 'text-purple-600 bg-purple-100';
      case 'in_transit': return 'text-indigo-600 bg-indigo-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'picked_up': return '📦';
      case 'in_transit': return '🚚';
      case 'delivered': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-orange-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-violet-600 font-semibold">Loading delivery details...</p>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-orange-50">
        <div className="card text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Delivery Not Found</h2>
          <p className="text-gray-500 mb-6">The delivery you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="button primary"
          >
            🏠 Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-orange-600 bg-clip-text text-transparent mb-4">
            🚚 Delivery Details
          </h1>
          <p className="text-gray-600 text-lg">
            Track your delivery and manage delivery information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Delivery Status */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">📊</span>
              Delivery Status
            </h2>
            
            <div className="space-y-6">
              {/* Current Status */}
              <div className="text-center p-6 bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg border border-violet-200">
                <div className="text-4xl mb-3">{getStatusIcon(delivery.status)}</div>
                <div className={`text-lg font-bold px-4 py-2 rounded-full inline-block ${getStatusColor(delivery.status)}`}>
                  {delivery.status?.replace('_', ' ').toUpperCase()}
                </div>
                <p className="text-gray-600 mt-2">
                  {delivery.status === 'pending' && 'Your delivery is being processed'}
                  {delivery.status === 'confirmed' && 'Delivery has been confirmed'}
                  {delivery.status === 'picked_up' && 'Package has been picked up'}
                  {delivery.status === 'in_transit' && 'Package is on its way'}
                  {delivery.status === 'delivered' && 'Package has been delivered'}
                  {delivery.status === 'cancelled' && 'Delivery has been cancelled'}
                </p>
              </div>

              {/* Tracking Information */}
              {delivery.trackingNumber && (
                <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <span className="mr-2">🔍</span>
                    Tracking Number
                  </h3>
                  <div className="flex items-center justify-between">
                    <code className="bg-white px-3 py-2 rounded border font-mono text-sm">
                      {delivery.trackingNumber}
                    </code>
                    <button
                      onClick={handleTrackDelivery}
                      className="button secondary text-sm px-4 py-2"
                    >
                      Track
                    </button>
                  </div>
                </div>
              )}

              {/* Delivery Partner */}
              {delivery.partner && (
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <span className="mr-2">🤝</span>
                    Delivery Partner
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">{delivery.partner}</span>
                    <div className="badge orange">Verified</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">📍</span>
              Delivery Address
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏠 Street Address
                </label>
                <input
                  type="text"
                  value={deliveryAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-violet-200 bg-white/80 backdrop-blur-sm rounded-lg focus:border-violet-500 focus:ring-4 focus:ring-violet-200 transition-all duration-300"
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏙️ City
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-violet-200 bg-white/80 backdrop-blur-sm rounded-lg focus:border-violet-500 focus:ring-4 focus:ring-violet-200 transition-all duration-300"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🗺️ State
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-violet-200 bg-white/80 backdrop-blur-sm rounded-lg focus:border-violet-500 focus:ring-4 focus:ring-violet-200 transition-all duration-300"
                    placeholder="Enter state"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📮 Pincode
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-violet-200 bg-white/80 backdrop-blur-sm rounded-lg focus:border-violet-500 focus:ring-4 focus:ring-violet-200 transition-all duration-300"
                    placeholder="Enter pincode"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📞 Phone Number
                  </label>
                  <input
                    type="tel"
                    value={deliveryAddress.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-violet-200 bg-white/80 backdrop-blur-sm rounded-lg focus:border-violet-500 focus:ring-4 focus:ring-violet-200 transition-all duration-300"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateAddress}
                disabled={updating}
                className="w-full button primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Updating Address...
                  </div>
                ) : (
                  '💾 Update Address'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Timeline */}
        {delivery.timeline && delivery.timeline.length > 0 && (
          <div className="card mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">⏰</span>
              Delivery Timeline
            </h2>
            
            <div className="space-y-4">
              {delivery.timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{event.status}</div>
                    <div className="text-sm text-gray-600">{event.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(event.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card text-center">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="font-semibold text-gray-800 mb-2">Package Weight</h3>
            <div className="text-2xl font-bold text-orange-600">
              {delivery.weight || 'N/A'} kg
            </div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-3">📏</div>
            <h3 className="font-semibold text-gray-800 mb-2">Package Size</h3>
            <div className="text-2xl font-bold text-blue-600">
              {delivery.dimensions || 'N/A'}
            </div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-gray-800 mb-2">Delivery Cost</h3>
            <div className="text-2xl font-bold text-violet-600">
              ₹{delivery.cost || '0'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="button primary text-lg px-8 py-4"
          >
            🏠 Back to Home
          </button>
          
          <button
            onClick={() => navigate('/notifications')}
            className="button secondary text-lg px-8 py-4"
          >
            🔔 View Notifications
          </button>
          
          <button
            onClick={() => showToast('Support feature coming soon!', 'info')}
            className="button accent text-lg px-8 py-4"
          >
            🆘 Get Help
          </button>
        </div>

        {/* Delivery Tips */}
        <div className="mt-12 card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Delivery Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📱</div>
              <div>
                <div className="font-semibold text-gray-800">Keep Phone Ready</div>
                <div className="text-sm text-gray-600">Ensure your phone is charged and accessible for delivery calls</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🏠</div>
              <div>
                <div className="font-semibold text-gray-800">Be Available</div>
                <div className="text-sm text-gray-600">Try to be available during the estimated delivery window</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📋</div>
              <div>
                <div className="font-semibold text-gray-800">Check Package</div>
                <div className="text-sm text-gray-600">Inspect the package before signing for delivery</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📞</div>
              <div>
                <div className="font-semibold text-gray-800">Contact Support</div>
                <div className="text-sm text-gray-600">Reach out if you have any delivery concerns</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;
