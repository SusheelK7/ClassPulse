import { useEffect, useState } from 'react';
import { useClasses } from '../context/ClassContext';
import { useAuth } from '../context/AuthContext';
import { useNotificationSettings } from '../context/NotificationContext';
import { useNotificationQueue } from '../context/NotificationQueueContext';
import { useNotifications } from '../hooks/useNotifications';
import { getCurrentDay, getCurrentTimeMinutes, classStatus, DAY_NAMES, formatTime, minutesUntil, durationMinutes, progressPercent } from '../utils/timeUtils';
import { Clock, BookOpen, CalendarDays, Zap, Plus, Sparkles, ChevronRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClassCard from '../components/ClassCard';
import ClassFormModal from '../components/ClassFormModal';
import AIUploadModal from '../components/AIUploadModal';
import NotificationPopup from '../components/NotificationPopup';

function useTime() {
  const [now, setNow] = useState({ day: getCurrentDay(), minutes: getCurrentTimeMinutes() });
  useEffect(() => {
    const id = setInterval(() => setNow({ day: getCurrentDay(), minutes: getCurrentTimeMinutes() }), 10000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Dashboard() {
  const { classes, loading, fetchClasses, addClass, updateClass, deleteClass } = useClasses();
  const { user } = useAuth();
  const { notificationsEnabled, requestNotificationPermission } = useNotificationSettings();
  const { currentNotification, dismissCurrentNotification, remindLater } = useNotificationQueue();
  const { day, minutes } = useTime();
  const [showAdd, setShowAdd] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [editCls, setEditCls] = useState(null);

  // Enable notifications
  useNotifications(classes);

  useEffect(() => { fetchClasses(); }, []);

  const todayClasses = classes.filter(c => c.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const currentClass = todayClasses.find(c => classStatus(c, day, minutes) === 'current');
  const upcomingClasses = todayClasses.filter(c => classStatus(c, day, minutes) === 'upcoming');
  const endedClasses = todayClasses.filter(c => classStatus(c, day, minutes) === 'ended');
  const nextClass = upcomingClasses[0];

  const handleSave = async (form) => {
    if (editCls?._id) await updateClass(editCls._id, form);
    else await addClass(form);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div>
          <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">{greeting}</p>
          <h1 className="text-2xl font-display font-600 text-gray-900 dark:text-white">{user?.name?.split(' ')[0] || 'Student'}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{DAY_NAMES[day]} · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          {!notificationsEnabled && (
            <button onClick={requestNotificationPermission} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition" title="Enable notifications for upcoming classes">
              <Bell size={15} />Notifications
            </button>
          )}
          <button onClick={() => setShowAI(true)} className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition shadow-sm shadow-primary-200 dark:shadow-none">
            <Sparkles size={15} />AI Import
          </button>
          <button onClick={() => { setEditCls(null); setShowAdd(true); }} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <Plus size={15} />Add class
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        {[
          { label: 'Today', value: todayClasses.length, icon: CalendarDays, color: 'text-primary-500' },
          { label: 'Remaining', value: upcomingClasses.length, icon: Clock, color: 'text-amber-500' },
          { label: 'Total', value: classes.length, icon: BookOpen, color: 'text-purple-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            <Icon size={18} className={`${color} mb-2`} />
            <p className="text-2xl font-display font-600 text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Current class - hero card */}
      {currentClass ? (
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 mb-7 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium bg-white/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />Live now
              </span>
            </div>
            <span className="text-xs text-primary-200">{formatTime(currentClass.startTime)} – {formatTime(currentClass.endTime)}</span>
          </div>
          <h2 className="text-xl font-display font-600 mb-1">{currentClass.subject}</h2>
          <div className="flex items-center gap-3 text-sm text-primary-200 mb-4 flex-wrap">
            {currentClass.room && <span>{currentClass.room}</span>}
            {currentClass.teacher && <span>{currentClass.teacher}</span>}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-primary-200">
              <span>Progress</span>
              <span>{Math.round(progressPercent(currentClass.startTime, currentClass.endTime, minutes))}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progressPercent(currentClass.startTime, currentClass.endTime, minutes)}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-7 text-center">
          <Zap size={24} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No class running right now</p>
          {nextClass && <p className="text-xs text-gray-400 mt-1">Next: {nextClass.subject} in {minutesUntil(nextClass.startTime, minutes)} mins</p>}
        </div>
      )}

      {/* Upcoming */}
      {upcomingClasses.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Clock size={15} className="text-amber-500" />Upcoming today ({upcomingClasses.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcomingClasses.map(cls => (
              <ClassCard key={cls._id} cls={cls} status="upcoming"
                onEdit={c => { setEditCls(c); setShowAdd(true); }}
                onDelete={deleteClass} />
            ))}
          </div>
        </div>
      )}

      {/* Ended */}
      {endedClasses.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-3">Earlier today</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {endedClasses.map(cls => (
              <ClassCard key={cls._id} cls={cls} status="ended"
                onEdit={c => { setEditCls(c); setShowAdd(true); }}
                onDelete={deleteClass} />
            ))}
          </div>
        </div>
      )}

      {todayClasses.length === 0 && !loading && (
        <div className="text-center py-12">
          <CalendarDays size={36} className="mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">No classes today</p>
          <p className="text-gray-400 text-xs mt-1">
            {classes.length === 0 ? 'Use "AI Import" to upload your timetable, or add classes manually.' : 'Enjoy your free day!'}
          </p>
          {classes.length === 0 && (
            <div className="flex gap-2 justify-center mt-4">
              <button onClick={() => setShowAI(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition"><Sparkles size={14} />AI Import</button>
              <button onClick={() => { setEditCls(null); setShowAdd(true); }} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"><Plus size={14} />Manual add</button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-end">
        <Link to="/schedule" className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">
          View full schedule <ChevronRight size={15} />
        </Link>
      </div>

      <ClassFormModal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditCls(null); }} onSave={handleSave} initialData={editCls} />
      <AIUploadModal isOpen={showAI} onClose={() => setShowAI(false)} />
      
      {currentNotification && (
        <NotificationPopup
          notification={currentNotification}
          onDismiss={dismissCurrentNotification}
          onRemindLater={() => remindLater(currentNotification, 300000)}
        />
      )}
    </div>
  );
}
