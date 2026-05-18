import { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, X, Clock, CheckCheck } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatTime, getCurrentDay, getCurrentTimeMinutes, timeToMinutes, DAY_NAMES } from '../utils/timeUtils';

export default function NotificationBell({ classes }) {
  const { requestPermission } = useNotifications(classes);
  const [permission, setPermission] = useState(Notification.permission);
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef();

  useEffect(() => {
    if (!classes?.length) return;
    const day = getCurrentDay();
    const now = getCurrentTimeMinutes();
    const upcoming = classes
      .filter(c => c.day === day && timeToMinutes(c.startTime) > now)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 5)
      .map(c => ({ ...c, minsUntil: timeToMinutes(c.startTime) - now }));
    setAlerts(upcoming);
    setUnread(upcoming.filter(c => c.minsUntil <= 60).length);
  }, [classes]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleEnable = async () => {
    const result = await requestPermission();
    setPermission(result);
  };

  const formatCountdown = (mins) => {
    if (mins < 1) return 'Starting now';
    if (mins < 60) return `in ${Math.round(mins)} min${Math.round(mins) !== 1 ? 's' : ''}`;
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `in ${h}h ${m > 0 ? m + 'm' : ''}`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(o => !o); setUnread(0); }}
        className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {permission === 'denied' ? <BellOff size={18} className="text-gray-400" /> : <Bell size={18} />}
        Notifications
        {unread > 0 && permission === 'granted' && (
          <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell size={15} className="text-primary-500" /> Notifications
            </span>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={15} />
            </button>
          </div>

          {permission !== 'granted' && (
            <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800">
              {permission === 'denied' ? (
                <div>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5"><BellOff size={13} /> Notifications blocked</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Enable in your browser settings.</p>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Enable notifications</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Get alerts 10 mins before class</p>
                  </div>
                  <button onClick={handleEnable} className="shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition">
                    Enable
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="max-h-64 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <CheckCheck size={22} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-xs text-gray-400">No more classes today</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {alerts.map(cls => (
                  <div key={cls._id} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl ${cls.minsUntil <= 10 ? 'bg-red-50 dark:bg-red-900/10' : cls.minsUntil <= 60 ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: cls.color || '#3B82F6' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{cls.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock size={11} /> {formatTime(cls.startTime)}{cls.room ? ` · ${cls.room}` : ''}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold shrink-0 ${cls.minsUntil <= 10 ? 'text-red-500' : cls.minsUntil <= 60 ? 'text-amber-500' : 'text-gray-400'}`}>
                      {formatCountdown(cls.minsUntil)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {permission === 'granted' && (
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <Bell size={11} className="text-green-500" /> You'll be notified 10 mins before each class
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
