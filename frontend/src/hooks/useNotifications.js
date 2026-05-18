import { useEffect, useRef, useCallback } from 'react';
import { getCurrentDay, getCurrentTimeMinutes, timeToMinutes, formatTime } from '../utils/timeUtils';

const NOTIFY_BEFORE_MINUTES = 10;
const NOTIFIED_KEY = 'classpulse_notified';

function getTodayKey() { return new Date().toDateString(); }

function getNotifiedSet() {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const today = getTodayKey();
    if (data.date !== today) return { date: today, ids: [] };
    return data;
  } catch { return { date: getTodayKey(), ids: [] }; }
}

function markNotified(id) {
  const data = getNotifiedSet();
  if (!data.ids.includes(id)) { data.ids.push(id); localStorage.setItem(NOTIFIED_KEY, JSON.stringify(data)); }
}

function wasNotified(id) { return getNotifiedSet().ids.includes(id); }

export function useNotifications(classes) {
  const permissionRef = useRef(Notification.permission);

  const requestPermission = useCallback(async () => {
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      permissionRef.current = result;
      return result;
    }
    permissionRef.current = Notification.permission;
    return Notification.permission;
  }, []);

  const sendNotification = useCallback((title, body, tag) => {
    if (Notification.permission !== 'granted') return;
    const n = new Notification(title, { body, icon: '/favicon.ico', tag, requireInteraction: false });
    setTimeout(() => n.close(), 8000);
  }, []);

  useEffect(() => {
    if (!classes?.length) return;
    const check = () => {
      const day = getCurrentDay();
      const now = getCurrentTimeMinutes();
      classes.filter(c => c.day === day).forEach(cls => {
        const startMin = timeToMinutes(cls.startTime);
        const minsUntil = startMin - now;
        const warnKey = `${cls._id}_warn`;
        if (minsUntil >= 9.5 && minsUntil <= 10.5 && !wasNotified(warnKey)) {
          sendNotification(`Class in ${NOTIFY_BEFORE_MINUTES} minutes`, `${cls.subject}${cls.room ? ' · ' + cls.room : ''}${cls.teacher ? ' · ' + cls.teacher : ''} at ${formatTime(cls.startTime)}`, warnKey);
          markNotified(warnKey);
        }
        const startKey = `${cls._id}_start`;
        if (minsUntil >= 0 && minsUntil < 0.5 && !wasNotified(startKey)) {
          sendNotification('Class starting now!', `${cls.subject}${cls.room ? ' · Room ' + cls.room : ''}`, startKey);
          markNotified(startKey);
        }
      });
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [classes, sendNotification]);

  return { requestPermission, permission: permissionRef.current };
}