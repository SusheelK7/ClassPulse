import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, User, X } from 'lucide-react';
import { formatTime } from '../utils/timeUtils';

export default function NotificationPopup({ notification, onDismiss, onRemindLater }) {
  const [dismissCountdown, setDismissCountdown] = useState(30);

  useEffect(() => {
    setDismissCountdown(30);
  }, [notification?.id]);

  useEffect(() => {
    if (dismissCountdown <= 0) {
      onDismiss();
      return;
    }
    const timer = setTimeout(() => setDismissCountdown(dismissCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [dismissCountdown, onDismiss]);

  if (!notification) return null;

  const progressPercent = ((30 - dismissCountdown) / 30) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full"
    >
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-700 rounded-3xl p-5 text-white shadow-2xl shadow-primary-500/30 border border-white/20 backdrop-blur-xl">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
              Class Starting Soon
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        <h3 className="text-lg font-display font-bold mb-3">{notification.subject}</h3>

        <div className="space-y-1.5 mb-4 text-xs sm:text-sm text-primary-100">
          {notification.room && (
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-primary-200" />
              <span>{notification.room}</span>
            </div>
          )}
          {notification.teacher && (
            <div className="flex items-center gap-2">
              <User size={13} className="text-primary-200" />
              <span>{notification.teacher}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-primary-200" />
            <span>{formatTime(notification.startTime)} – {formatTime(notification.endTime)}</span>
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-primary-200 text-center">
            Dismissing automatically in {dismissCountdown}s
          </p>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onRemindLater()}
            className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            Remind in 5 mins
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onDismiss}
            className="flex-1 px-3 py-2 bg-white text-primary-700 hover:bg-white/90 rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-xs"
          >
            Got it
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
