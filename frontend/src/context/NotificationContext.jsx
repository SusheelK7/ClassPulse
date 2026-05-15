import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Check and request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      } else if (Notification.permission === 'denied') {
        setNotificationsEnabled(false);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setNotificationsEnabled(granted);
      return granted;
    }

    setNotificationsEnabled(false);
    return false;
  };

  const disableNotifications = () => {
    setNotificationsEnabled(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        setNotificationsEnabled,
        requestNotificationPermission,
        disableNotifications,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotificationSettings = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationSettings must be used within NotificationProvider');
  }
  return context;
};
