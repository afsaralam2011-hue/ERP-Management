import React, { useState, useEffect } from 'react';
import { FiBell, FiCheck } from 'react-icons/fi';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      console.log('🔔 Fetching notifications...');
      const response = await fetch('http://localhost:5000/api/notifications');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📢 Notifications API Response:', data);
      
      if (data.success) {
        // data.data استعمال کریں کیونکہ API {data: [...]} format میں ہے
        const notificationsData = data.data || [];
        setNotifications(notificationsData);
        
        // Count unread notifications
        const unread = notificationsData.filter(n => !n.read).length;
        setUnreadCount(unread);
        console.log(`📊 ${unread} unread notifications`);
      } else {
        console.error('API returned success: false', data);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      console.log(`✅ Marking notification ${id} as read`);
      
      // Backend API call
      await fetch(`/api/notifications/${id}/read`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback: Update locally
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      console.log('✅ Marking all notifications as read');
      
      // Backend API call
      await fetch('/api/notifications/mark-all-read', { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Fallback: Update locally
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Format time function - UPDATED
  const formatTime = (timeString) => {
    if (!timeString) return 'Just now';
    
    try {
      const time = new Date(timeString);
      const now = new Date();
      const diffMs = now - time;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Recently';
    }
  };

  // Get notification icon based on type - UPDATED
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'production': return '🏭';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  return (
    <div className="notification-bell-container">
      <button
        className="notification-bell-btn"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Notifications"
      >
        <FiBell className="bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-count-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications ({notifications.length})</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={markAllAsRead}
              >
                <FiCheck /> Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="loading-notifications">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                No new notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatTime(notification.time)}
                      </span>
                      {notification.section && (
                        <span className="notification-section">
                          {notification.section}
                        </span>
                      )}
                      {notification.priority && (
                        <span className={`notification-priority ${notification.priority}`}>
                          {notification.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="unread-dot"></div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="notification-footer">
            <button
              className="view-all-btn"
              onClick={() => {
                // Navigate to notifications page
                window.location.href = '/notifications';
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;