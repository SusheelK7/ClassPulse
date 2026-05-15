import { useEffect, useState } from 'react';
import { Bell, Clock, X, CheckCircle } from 'lucide-react';

export default function NotificationPopup({ notification, onDismiss, onRemindLater }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Auto-dismiss after 30 seconds
    const dismissTimer = setTimeout(() => onDismiss(), 30000);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.max(0, prev - (100 / 30)));
    }, 1000);

    return () => {
      clearTimeout(dismissTimer);
      clearInterval(progressInterval);
    };
  }, [onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-end justify-end p-4">
      <div className="pointer-events-auto animate-in slide-in-from-right-full duration-300 flex flex-col">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-w-sm w-full">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-600 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/50 dark:to-primary-900/30">
                  <Bell size={22} className="text-primary-600 dark:text-primary-400 animate-pulse" />
                </div>
              </div>
              <div className="flex-1 pt-0.5">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                  {notification.subject}
                </h3>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mt-1">
                  Starts in {notification.minutesUntil} minute{notification.minutesUntil !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={onDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                title="Dismiss"
              >
                <X size={18} />
              </button>
            </div>

            {/* Class Details Card */}
            {(notification.room || notification.teacher) && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl p-3 mb-4 space-y-2 border border-gray-200/50 dark:border-gray-700/50">
                {notification.room && notification.room !== 'N/A' && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-fit">Room:</span>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{notification.room}</span>
                  </div>
                )}
                {notification.teacher && notification.teacher !== 'N/A' && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-fit">Instructor:</span>
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{notification.teacher}</span>
                  </div>
                )}
                {notification.startTime && (
                  <div className="flex items-center gap-2 text-sm pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                    <Clock size={14} className="text-primary-600 dark:text-primary-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {notification.startTime} - {notification.endTime}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onDismiss}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition active:scale-95 duration-150"
              >
                <CheckCircle size={16} />
                OK
              </button>
              <button
                onClick={onRemindLater}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg text-sm font-semibold hover:from-primary-700 hover:to-primary-800 transition active:scale-95 duration-150 shadow-lg shadow-primary-500/30"
              >
                <Clock size={16} />
                Remind in 5 min
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
