import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, callBackendFunction } from '../AuthContext';
import { FaList, FaEdit, FaTrash, FaEye, FaPause, FaPlay, FaChartLine, FaExchangeAlt, FaHeart } from 'react-icons/fa';

const MyListingsPage = () => {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    sold: 0,
    totalViews: 0,
    totalLikes: 0
  });

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user) {
          const data = await callBackendFunction('getItems', 'GET', { ownerId: user.uid });
          setMyListings(data);
          // Calculate stats
          const total = data.length;
          const active = data.filter(item => item.status === 'active').length;
          const paused = data.filter(item => item.status === 'paused').length;
          const sold = data.filter(item => item.status === 'sold').length;
          const totalViews = data.reduce((sum, item) => sum + (item.views || 0), 0);
          const totalLikes = data.reduce((sum, item) => sum + (item.likes || 0), 0);
          setStats({ total, active, paused, sold, totalViews, totalLikes });
        }
      } catch (e) {
        setError('Failed to load listings');
      }
      setLoading(false);
    };
    fetchListings();
  }, [user]);

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      // Here you would call the backend to update status
      // await callBackendFunction('updateListingStatus', 'POST', { itemId, status: newStatus });
      
      setMyListings(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: newStatus } : item
      ));
      
      // Update stats
      const updatedListings = myListings.map(item => 
        item.id === itemId ? { ...item, status: newStatus } : item
      );
      const active = updatedListings.filter(item => item.status === 'active').length;
      const paused = updatedListings.filter(item => item.status === 'paused').length;
      const sold = updatedListings.filter(item => item.status === 'sold').length;
      
      setStats(prev => ({ ...prev, active, paused, sold }));
      
      alert(`Listing ${newStatus === 'active' ? 'activated' : newStatus === 'paused' ? 'paused' : 'marked as sold'} successfully!`);
    } catch (error) {
      console.error('Error updating listing status:', error);
      alert('Failed to update listing status');
    }
  };

  const handleDeleteListing = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        // Here you would call the backend to delete the listing
        // await callBackendFunction('deleteListing', 'POST', { itemId });
        
        setMyListings(prev => prev.filter(item => item.id !== itemId));
        alert('Listing deleted successfully!');
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FaPlay className="text-green-600" />;
      case 'paused': return <FaPause className="text-yellow-600" />;
      case 'sold': return <FaChartLine className="text-gray-600" />;
      default: return <FaList className="text-gray-600" />;
    }
  };

  const filteredListings = myListings.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <FaList className="text-primary-600 mr-3" />
            My Listings
          </h1>
          <p className="text-lg text-gray-600">
            Manage your posted items and track their performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FaList className="text-3xl text-primary-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <FaPlay className="text-3xl text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
              </div>
              <FaEye className="text-3xl text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalLikes}</p>
              </div>
              <FaHeart className="text-3xl text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Listings ({stats.total})</option>
                <option value="active">Active ({stats.active})</option>
                <option value="paused">Paused ({stats.paused})</option>
                <option value="sold">Sold ({stats.sold})</option>
              </select>
            </div>
            <Link
              to="/list"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center"
            >
              <FaEdit className="mr-2" />
              Post New Item
            </Link>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FaList className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No listings yet' : 'No listings match your filter'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Start by posting your first item for exchange!' 
                : 'Try adjusting your filter to see more listings.'
              }
            </p>
            {filter === 'all' && (
              <Link
                to="/list"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Post Your First Item
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Item Image */}
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 flex space-x-2">
                    <Link
                      to={`/product/${item.id}`}
                      className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
                      title="View"
                    >
                      <FaEye className="text-gray-600" />
                    </Link>
                    <button
                      onClick={() => handleDeleteListing(item.id)}
                      className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
                      title="Delete"
                    >
                      <FaTrash className="text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="text-xs">
                      <div className="font-medium text-gray-900">{item.views}</div>
                      <div className="text-gray-500">Views</div>
                    </div>
                    <div className="text-xs">
                      <div className="font-medium text-gray-900">{item.likes}</div>
                      <div className="text-gray-500">Likes</div>
                    </div>
                    <div className="text-xs">
                      <div className="font-medium text-gray-900">{item.exchanges}</div>
                      <div className="text-gray-500">Offers</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Posted: {new Date(item.postedAt).toLocaleDateString()}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {item.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'paused')}
                        className="w-full bg-yellow-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center"
                      >
                        <FaPause className="mr-2" />
                        Pause Listing
                      </button>
                    )}
                    
                    {item.status === 'paused' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'active')}
                        className="w-full bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <FaPlay className="mr-2" />
                        Activate Listing
                      </button>
                    )}
                    
                    {item.status !== 'sold' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'sold')}
                        className="w-full bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
                      >
                        <FaChartLine className="mr-2" />
                        Mark as Sold
                      </button>
                    )}
                    
                    <Link
                      to={`/edit-listing/${item.id}`}
                      className="w-full bg-primary-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center"
                    >
                      <FaEdit className="mr-2" />
                      Edit Listing
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Performance Summary */}
        {filteredListings.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredListings.reduce((sum, item) => sum + item.views, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredListings.reduce((sum, item) => sum + item.likes, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredListings.reduce((sum, item) => sum + item.exchanges, 0)}
                </div>
                <div className="text-sm text-gray-600">Exchange Offers</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListingsPage; 