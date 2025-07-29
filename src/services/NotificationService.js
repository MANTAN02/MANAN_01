import { callBackendFunction } from '../AuthContext';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.listeners = [];
    this.isInitialized = false;
  }

  // Initialize notification service
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      }

      // Initialize Firebase Cloud Messaging
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        await this.initializeFCM();
      }

      // Load existing notifications
      await this.loadNotifications();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Initialize Firebase Cloud Messaging
  async initializeFCM() {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      // Get FCM token
      const messaging = window.firebase?.messaging();
      if (messaging) {
        const token = await messaging.getToken({
          vapidKey: process.env.REACT_APP_FCM_VAPID_KEY
        });

        // Send token to backend
        await callBackendFunction('updateFCMToken', 'POST', { fcmToken: token });
        
        // Listen for token refresh
        messaging.onTokenRefresh(() => {
          messaging.getToken().then(refreshedToken => {
            callBackendFunction('updateFCMToken', 'POST', { fcmToken: refreshedToken });
          });
        });

        // Listen for messages
        messaging.onMessage((payload) => {
          this.handlePushNotification(payload);
        });
      }
    } catch (error) {
      console.error('FCM initialization failed:', error);
    }
  }

  // Load notifications from backend
  async loadNotifications(page = 1, limit = 20) {
    try {
      const response = await callBackendFunction('getNotifications', 'GET', {}, 
        `?page=${page}&limit=${limit}`);
      
      this.notifications = response.notifications || [];
      this.unreadCount = response.unreadCount || 0;
      
      this.notifyListeners();
      return response;
    } catch (error) {
      console.error('Failed to load notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await callBackendFunction('markNotificationRead', 'POST', { notificationId });
      
      // Update local state
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await callBackendFunction('markAllNotificationsRead', 'POST');
      
      // Update local state
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
      this.notifyListeners();
      
      return response;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Send notification to user
  async sendNotification(userId, notification) {
    try {
      await callBackendFunction('sendNotification', 'POST', {
        toUserId: userId,
        ...notification
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  // Handle push notification
  handlePushNotification(payload) {
    const { notification, data } = payload;
    
    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: data.type,
        data: data
      });

      // Handle notification click
      browserNotification.onclick = () => {
        this.handleNotificationClick(data);
        browserNotification.close();
      };
    }

    // Add to local notifications
    const newNotification = {
      id: Date.now().toString(),
      type: data.type,
      title: notification.title,
      message: notification.body,
      itemId: data.itemId,
      swapId: data.swapId,
      isRead: false,
      timestamp: new Date()
    };

    this.notifications.unshift(newNotification);
    this.unreadCount++;
    this.notifyListeners();
  }

  // Handle notification click
  handleNotificationClick(data) {
    // Navigate based on notification type
    switch (data.type) {
      case 'swap_proposed':
        window.location.href = `/swaps/${data.swapId}`;
        break;
      case 'swap_accepted':
        window.location.href = `/swaps/${data.swapId}`;
        break;
      case 'new_message':
        window.location.href = `/chat/${data.chatId}`;
        break;
      case 'item_listed':
        window.location.href = `/items/${data.itemId}`;
        break;
      default:
        window.location.href = '/notifications';
    }
  }

  // Send email notification
  async sendEmailNotification(userId, emailData) {
    try {
      await callBackendFunction('sendEmailNotification', 'POST', {
        toUserId: userId,
        subject: emailData.subject,
        template: emailData.template,
        data: emailData.data
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
      throw error;
    }
  }

  // Send SMS notification
  async sendSMSNotification(phoneNumber, message) {
    try {
      await callBackendFunction('sendSMSNotification', 'POST', {
        phoneNumber,
        message
      });
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
      throw error;
    }
  }

  // Get notification templates
  getNotificationTemplates() {
    return {
      swap_proposed: {
        title: 'New Swap Offer',
        message: 'Someone wants to swap with you!',
        icon: '🔄'
      },
      swap_accepted: {
        title: 'Swap Accepted!',
        message: 'Your swap offer has been accepted',
        icon: '✅'
      },
      swap_declined: {
        title: 'Swap Declined',
        message: 'Your swap offer was declined',
        icon: '❌'
      },
      new_message: {
        title: 'New Message',
        message: 'You have a new message',
        icon: '💬'
      },
      item_listed: {
        title: 'Item Listed',
        message: 'Your item has been successfully listed',
        icon: '📦'
      },
      payment_received: {
        title: 'Payment Received',
        message: 'Payment has been received for your swap',
        icon: '💰'
      },
      verification_approved: {
        title: 'Verification Approved',
        message: 'Your verification has been approved',
        icon: '✅'
      },
      verification_rejected: {
        title: 'Verification Rejected',
        message: 'Your verification was not approved',
        icon: '❌'
      }
    };
  }

  // Subscribe to notification updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        notifications: this.notifications,
        unreadCount: this.unreadCount
      });
    });
  }

  // Get notifications
  getNotifications() {
    return this.notifications;
  }

  // Get unread count
  getUnreadCount() {
    return this.unreadCount;
  }

  // Clear notifications
  clearNotifications() {
    this.notifications = [];
    this.unreadCount = 0;
    this.notifyListeners();
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      await callBackendFunction('deleteNotification', 'POST', { notificationId });
      
      // Update local state
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const response = await callBackendFunction('getNotificationSettings', 'GET');
      return response;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      throw error;
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      const response = await callBackendFunction('updateNotificationSettings', 'POST', settings);
      return response;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }
}

export default new NotificationService(); 