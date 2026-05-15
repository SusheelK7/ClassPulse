import { useEffect, useRef } from 'react';
import { getCurrentDay, getCurrentTimeMinutes, timeToMinutes, minutesUntil } from '../utils/timeUtils';
import { useNotificationQueue } from '../context/NotificationQueueContext';

export function useNotification(classes) {
  const notifiedClasses = useRef(new Set());
  const { showNotification } = useNotificationQueue();

  useEffect(() => {
    // Request notification permission on component mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!classes || classes.length === 0) {
      return;
    }

    const checkNotifications = () => {
      const currentDay = getCurrentDay();
      const currentMinutes = getCurrentTimeMinutes();

      classes.forEach(cls => {
        // Check if class is today
        if (cls.day !== currentDay) return;

        const classStartMinutes = timeToMinutes(cls.startTime);
        const minutesUntilClass = classStartMinutes - currentMinutes;

        // Check if class is within 10 minutes and not already notified
        if (minutesUntilClass > 0 && minutesUntilClass <= 10 && !notifiedClasses.current.has(cls._id)) {
          // Mark as notified
          notifiedClasses.current.add(cls._id);

          // Show custom notification popup
          showNotification({
            classId: cls._id,
            subject: cls.subject,
            room: cls.room || 'N/A',
            teacher: cls.teacher || 'N/A',
            minutesUntil: Math.round(minutesUntilClass),
            startTime: cls.startTime,
            endTime: cls.endTime,
          });

          // Play notification sound
          playNotificationSound();
        }

        // Reset notification if class has started (15 minutes have passed)
        if (minutesUntilClass <= -15) {
          notifiedClasses.current.delete(cls._id);
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkNotifications, 60000);
    // Also check immediately
    checkNotifications();

    return () => clearInterval(interval);
  }, [classes, showNotification]);
}

function playNotificationSound() {
  // Create a simple beep sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log('Could not play notification sound:', e);
  }
}
