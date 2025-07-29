import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { callBackendFunction } from '../AuthContext';
import '../styles.css';

const ExchangePage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch the target item
      const targetItem = await callBackendFunction('getItem', 'GET', { id });
      setItem(targetItem);

      // Fetch user's items for exchange
      const userItemsData = await callBackendFunction('getUserItems', 'GET');
      setUserItems(userItemsData || []);
    } catch (error) {
      showToast('Failed to load exchange data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (selectedItemId) => {
    const item = userItems.find(i => i.id === selectedItemId);
    setSelectedItem(item);
  };

  const calculateNetAmount = () => {
    if (!item || !selectedItem) return 0;
    return item.price - selectedItem.price;
  };

  const handleSubmitExchange = async () => {
    if (!selectedItem) {
      showToast('Please select an item to exchange', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await callBackendFunction('proposeSwap', 'POST', {
        targetItemId: id,
        offeredItemId: selectedItem.id,
        message: `I would like to exchange my ${selectedItem.title} for your ${item.title}`
      });

      showToast('Exchange proposal sent successfully! 🎉', 'success');
      navigate('/exchange-offers');
    } catch (error) {
      showToast('Failed to submit exchange proposal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBuyNow = () => {
    navigate(`/product/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-orange-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-violet-600 font-semibold">Loading exchange details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-orange-50">
        <div className="card text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Item Not Found</h2>
          <p className="text-gray-500 mb-6">The item you're looking for doesn't exist or has been removed.</p>
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

  const netAmount = calculateNetAmount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-orange-600 bg-clip-text text-transparent mb-4">
            🔄 Exchange Items
          </h1>
          <p className="text-gray-600 text-lg">
            Select an item from your collection to exchange for this amazing item!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Target Item */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">🎯</span>
              Item You Want
            </h2>
            
            <div className="bg-gradient-to-r from-violet-50 to-blue-50 p-6 rounded-lg border border-violet-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/150x150?text=Item'}
                  alt={item.title}
                  className="w-32 h-32 object-cover rounded-lg border-2 border-violet-300"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-orange-600">
                      ₹{item.price?.toLocaleString()}
                    </div>
                    <div className="badge violet">
                      {item.condition || 'Good'}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    Listed by: {item.ownerName || 'Anonymous'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User's Items */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">📦</span>
              Your Items for Exchange
            </h2>

            {userItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No items to exchange</h3>
                <p className="text-gray-500 mb-4">List some items first to start exchanging!</p>
                <button 
                  onClick={() => navigate('/list')}
                  className="button primary"
                >
                  🚀 List Your First Item
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userItems.map((userItem) => (
                  <div
                    key={userItem.id}
                    onClick={() => handleItemSelect(userItem.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      selectedItem?.id === userItem.id
                        ? 'border-violet-500 bg-gradient-to-r from-violet-50 to-purple-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-violet-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex gap-4">
                      <img
                        src={userItem.imageUrl || 'https://via.placeholder.com/80x80?text=Item'}
                        alt={userItem.title}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{userItem.title}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{userItem.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-orange-600">
                            ₹{userItem.price?.toLocaleString()}
                          </div>
                          <div className="badge blue">
                            {userItem.condition || 'Good'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Exchange Summary */}
        {selectedItem && (
          <div className="card mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">📊</span>
              Exchange Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gradient-to-r from-violet-50 to-blue-50 rounded-lg border border-violet-200">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-gray-800">{item.title}</div>
                <div className="text-orange-600 font-bold">₹{item.price?.toLocaleString()}</div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="text-4xl animate-pulse">🔄</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border border-blue-200">
                <div className="text-2xl mb-2">📦</div>
                <div className="font-semibold text-gray-800">{selectedItem.title}</div>
                <div className="text-orange-600 font-bold">₹{selectedItem.price?.toLocaleString()}</div>
              </div>
            </div>

            {/* Net Amount */}
            <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Net Payment</h3>
              <div className={`text-3xl font-bold ${
                netAmount > 0 ? 'text-red-600' : netAmount < 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {netAmount > 0 ? `+₹${netAmount.toLocaleString()}` : 
                 netAmount < 0 ? `-₹${Math.abs(netAmount).toLocaleString()}` : 
                 '₹0 (Even Exchange)'}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {netAmount > 0 ? 'You pay this amount' : 
                 netAmount < 0 ? 'You receive this amount' : 
                 'Perfect match! No payment needed'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={handleSubmitExchange}
            disabled={!selectedItem || submitting}
            className="button primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner mr-2"></div>
                Submitting Exchange...
              </div>
            ) : (
              '🔄 Propose Exchange'
            )}
          </button>
          
          <button
            onClick={handleBuyNow}
            className="button secondary text-lg px-8 py-4"
          >
            💰 Buy Now
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="button accent text-lg px-8 py-4"
          >
            🏠 Back to Browse
          </button>
        </div>

        {/* Exchange Tips */}
        <div className="mt-12 card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Exchange Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <div className="font-semibold text-gray-800">Fair Value</div>
                <div className="text-sm text-gray-600">Ensure both items have similar market values for better acceptance</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📸</div>
              <div>
                <div className="font-semibold text-gray-800">Clear Photos</div>
                <div className="text-sm text-gray-600">Use high-quality images showing the actual condition</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📝</div>
              <div>
                <div className="font-semibold text-gray-800">Detailed Description</div>
                <div className="text-sm text-gray-600">Be honest about any defects or wear</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🤝</div>
              <div>
                <div className="font-semibold text-gray-800">Quick Response</div>
                <div className="text-sm text-gray-600">Respond promptly to exchange requests</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangePage;