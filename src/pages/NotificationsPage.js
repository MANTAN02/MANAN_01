import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, callBackendFunction } from '../AuthContext';
import { FaBell, FaExchangeAlt, FaHeart, FaEye, FaCheck, FaTimes, FaTrash, FaFilter } from 'react-icons/fa';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [success, setSuccess] = useState("");

  // Fetch notifications in real-time (poll every 10s)
  useEffect(() => {
    let interval;
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user) {
          const data = await callBackendFunction('getNotifications', 'GET');
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.isRead).length);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (e) {
        setError('Failed to load notifications');
      }
      setLoading(false);
    };
    fetchNotifications();
    interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Mark all as read on page load
  useEffect(() => {
    const markAllRead = async () => {
      if (user && notifications.some(n => !n.isRead)) {
        try {
          await Promise.all(
            notifications.filter(n => !n.isRead).map(n =>
              callBackendFunction('markNotificationRead', 'POST', { notificationId: n.id })
            )
          );
          setSuccess('All notifications marked as read.');
        } catch (e) {
          // ignore error
        }
      }
    };
    if (notifications.length > 0) markAllRead();
    // eslint-disable-next-line
  }, [notifications, user]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      // Here you would call the backend to mark as read
      // await callBackendFunction('markNotificationRead', 'POST', { notificationId });
      
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Here you would call the backend to mark all as read
      // await callBackendFunction('markAllNotificationsRead', 'POST');
      
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      // Here you would call the backend to delete the notification
      // await callBackendFunction('deleteNotification', 'POST', { notificationId });
      
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      if (!notification.isRead) {
        setUnreadCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        // Here you would call the backend to clear all notifications
        // await callBackendFunction('clearAllNotifications', 'POST');
        
        setNotifications([]);
        setUnreadCount(0);
      } catch (error) {
        console.error('Error clearing all notifications:', error);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'exchange_offer': return <FaExchangeAlt className="text-blue-600" />;
      case 'like': return <FaHeart className="text-red-600" />;
      case 'view': return <FaEye className="text-green-600" />;
      case 'delivery': return <FaBell className="text-orange-600" />;
      default: return <FaBell className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-green-500';
      default: return 'border-l-4 border-gray-300';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <FaBell className="text-primary-600 mr-3" />
            Notifications
          </h1>
          <p className="text-lg text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
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
                <option value="all">All ({notifications.length})</option>
                <option value="unread">Unread ({unreadCount})</option>
                <option value="exchange_offer">Exchange Offers ({notifications.filter(n => n.type === 'exchange_offer').length})</option>
                <option value="like">Likes ({notifications.filter(n => n.type === 'like').length})</option>
                <option value="view">Views ({notifications.filter(n => n.type === 'view').length})</option>
                <option value="delivery">Delivery ({notifications.filter(n => n.type === 'delivery').length})</option>
                <option value="system">System ({notifications.filter(n => n.type === 'system').length})</option>
              </select>
            </div>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center"
                >
                  <FaCheck className="mr-2" />
                  Mark All Read
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center"
              >
                <FaTrash className="mr-2" />
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FaBell className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No notifications yet' : 'No notifications match your filter'}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'You\'ll see notifications here when you receive exchange offers, likes, and updates.' 
                : 'Try adjusting your filter to see more notifications.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-lg p-6 ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'ring-2 ring-primary-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {getTimeAgo(notification.timestamp)}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {notification.message}
                      </p>
                      {notification.itemId && (
                        <Link
                          to={`/product/${notification.itemId}`}
                          className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                        >
                          View Item: {notification.itemTitle}
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-primary-600 hover:text-primary-700 p-1"
                        title="Mark as read"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete notification"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Email Notifications</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Exchange offers</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Likes and views</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Delivery updates</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Marketing emails</span>
                </label>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Push Notifications</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">New exchange offers</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Item interactions</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Delivery status</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">Promotional alerts</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 