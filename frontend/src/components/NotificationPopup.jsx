import { useEffect, useState } from 'react';
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
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white shadow-2xl max-w-sm w-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium bg-white/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
              Class Starting Soon
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <h3 className="text-lg font-display font-600 mb-3">{notification.subject}</h3>

        <div className="space-y-2 mb-4 text-sm text-primary-100">
          {notification.room && (
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{notification.room}</span>
            </div>
          )}
          {notification.teacher && (
            <div className="flex items-center gap-2">
              <User size={14} />
              <span>{notification.teacher}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{formatTime(notification.startTime)} – {formatTime(notification.endTime)}</span>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-primary-200 text-center">
            Dismissing in {dismissCountdown}s
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onRemindLater()}
            className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            Remind in 5 mins
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 px-3 py-2 bg-white/40 hover:bg-white/50 rounded-lg text-sm font-medium transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
