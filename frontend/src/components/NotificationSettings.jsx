import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotificationSettings } from '../context/NotificationContext';
import { Bell, X } from 'lucide-react';
import api from '../utils/api';

export default function NotificationSettings({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const { notificationsEnabled, requestNotificationPermission } = useNotificationSettings();
  const [settings, setSettings] = useState({
    notificationEnabled: user?.notificationEnabled || true,
    notificationMinutesBefore: user?.notificationMinutesBefore || 10,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setSettings({
        notificationEnabled: user.notificationEnabled || true,
        notificationMinutesBefore: user.notificationMinutesBefore || 10,
      });
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile(settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleEnableNotifications = async () => {
    if (notificationsEnabled) {
      setSettings({ ...settings, notificationEnabled: false });
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        setSettings({ ...settings, notificationEnabled: true });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Enable/Disable Notifications */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">Enable Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {notificationsEnabled ? 'Notifications are enabled' : 'Click to enable notifications'}
                </p>
              </div>
              <button
                onClick={handleEnableNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Minutes Before Class */}
          {notificationsEnabled && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <label className="block mb-2">
                <span className="font-medium text-gray-900 dark:text-white block mb-2">
                  Notify me before (minutes)
                </span>
                <select
                  value={settings.notificationMinutesBefore}
                  onChange={(e) =>
                    setSettings({ ...settings, notificationMinutesBefore: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="5">5 minutes before</option>
                  <option value="10">10 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="20">20 minutes before</option>
                  <option value="30">30 minutes before</option>
                </select>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You'll get a notification when a class is starting in the selected time window.
              </p>
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.includes('success')
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
