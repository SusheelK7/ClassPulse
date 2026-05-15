import { createContext, useContext, useState, useRef } from 'react';

const NotificationQueueContext = createContext(null);

export function NotificationQueueProvider({ children }) {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [queue, setQueue] = useState([]);
  const snoozedTimersRef = useRef(new Map());

  const showNotification = (notification) => {
    // Add to queue
    const id = Date.now();
    const notificationWithId = { ...notification, id };

    if (!currentNotification) {
      setCurrentNotification(notificationWithId);
    } else {
      setQueue(prev => [...prev, notificationWithId]);
    }

    return id;
  };

  const dismissNotification = (id) => {
    if (currentNotification?.id === id) {
      if (queue.length > 0) {
        const [next, ...rest] = queue;
        setCurrentNotification(next);
        setQueue(rest);
      } else {
        setCurrentNotification(null);
      }
    } else {
      setQueue(prev => prev.filter(n => n.id !== id));
    }
  };

  const dismissCurrentNotification = () => {
    if (currentNotification) {
      dismissNotification(currentNotification.id);
    }
  };

  const remindLater = (notification, delayMs = 300000) => {
    // Store original notification info
    const notificationCopy = { ...notification };
    
    // Dismiss current
    dismissCurrentNotification();

    // Clear any existing timer for this notification
    if (snoozedTimersRef.current.has(notification.classId)) {
      clearTimeout(snoozedTimersRef.current.get(notification.classId));
    }

    // Set new timer
    const timer = setTimeout(() => {
      showNotification(notificationCopy);
      snoozedTimersRef.current.delete(notification.classId);
    }, delayMs);

    snoozedTimersRef.current.set(notification.classId, timer);
  };

  return (
    <NotificationQueueContext.Provider
      value={{
        currentNotification,
        queue,
        showNotification,
        dismissNotification,
        dismissCurrentNotification,
        remindLater,
      }}
    >
      {children}
    </NotificationQueueContext.Provider>
  );
}

export const useNotificationQueue = () => {
  const context = useContext(NotificationQueueContext);
  if (!context) {
    throw new Error('useNotificationQueue must be used within NotificationQueueProvider');
  }
  return context;
};
