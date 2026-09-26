import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import ClassDetailModal from '../components/ClassDetailModal';

function useTime() {
  const [now, setNow] = useState({ day: getCurrentDay(), minutes: getCurrentTimeMinutes() });
  useEffect(() => {
    const id = setInterval(() => setNow({ day: getCurrentDay(), minutes: getCurrentTimeMinutes() }), 10000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function Dashboard() {
  const { classes, loading, fetchClasses, addClass, updateClass, deleteClass } = useClasses();
  const { user } = useAuth();
  const { notificationsEnabled, requestNotificationPermission } = useNotificationSettings();
  const { currentNotification, dismissCurrentNotification, remindLater } = useNotificationQueue();
  const { day, minutes } = useTime();
  const [showAdd, setShowAdd] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [editCls, setEditCls] = useState(null);
  const [detailModalCls, setDetailModalCls] = useState(null);

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-medium">{greeting}</p>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
            {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {DAY_NAMES[day]} · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!notificationsEnabled && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={requestNotificationPermission} 
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-xs"
              title="Enable notifications for upcoming classes"
            >
              <Bell size={15} />
              <span>Notifications</span>
            </motion.button>
          )}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowAI(true)} 
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm shadow-primary-500/20"
          >
            <Sparkles size={15} />
            <span>AI Import</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setEditCls(null); setShowAdd(true); }} 
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-xs"
          >
            <Plus size={15} />
            <span>Add class</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats row with interactive hover and stagger */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 mb-7">
        {[
          { label: 'Today', value: todayClasses.length, icon: CalendarDays, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/40' },
          { label: 'Remaining', value: upcomingClasses.length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40' },
          { label: 'Total', value: classes.length, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div 
            key={label} 
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="bg-white/95 dark:bg-[#0d1222]/80 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-gray-800/80 p-4 shadow-sm dark:shadow-[0_8px_25px_rgba(0,0,0,0.45)] hover:border-primary-300 dark:hover:border-primary-700/60 transition-colors"
          >
            <div className={`w-8 h-8 rounded-xl ${bg} ${color} flex items-center justify-center mb-2.5`}>
              <Icon size={17} />
            </div>
            <p className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Current class - hero card */}
      <motion.div variants={itemVariants}>
        {currentClass ? (
          <motion.div 
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-700 rounded-3xl p-5 sm:p-6 mb-7 text-white shadow-xl shadow-primary-500/20 dark:shadow-[0_12px_35px_rgba(37,99,235,0.35),0_4px_20px_rgba(0,0,0,0.7)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                  <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                  Live now
                </span>
              </div>
              <span className="text-xs font-medium text-primary-100 bg-black/15 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                {formatTime(currentClass.startTime)} – {formatTime(currentClass.endTime)}
              </span>
            </div>

            <div className="flex items-start justify-between gap-3 mb-2 relative z-10">
              <h2
                onClick={() => setDetailModalCls(currentClass)}
                className="text-xl sm:text-2xl font-display font-bold leading-tight cursor-pointer hover:underline"
                title="Click to view full class details"
              >
                {currentClass.subject}
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDetailModalCls(currentClass)}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md transition-all shadow-xs"
              >
                More details
              </motion.button>
            </div>

            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-primary-100 mb-4 flex-wrap relative z-10">
              {currentClass.room && (
                <span className="inline-flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-lg font-medium backdrop-blur-sm">
                  Room: {currentClass.room}
                </span>
              )}
              {currentClass.teacher && (
                <span className="inline-flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-lg font-medium backdrop-blur-sm">
                  Teacher: {currentClass.teacher}
                </span>
              )}
            </div>

            <div className="space-y-1.5 relative z-10">
              <div className="flex justify-between text-xs text-primary-200">
                <span>Progress</span>
                <span>{Math.round(progressPercent(currentClass.startTime, currentClass.endTime, minutes))}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent(currentClass.startTime, currentClass.endTime, minutes)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-white rounded-full" 
                />
              </div>
            </div>

            {/* Up Next Class Footer */}
            {nextClass ? (
              <div className="mt-4 pt-3.5 border-t border-white/15 flex items-center justify-between text-xs text-primary-100 relative z-10 flex-wrap gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold uppercase tracking-wider text-[10px] bg-white/20 px-2 py-0.5 rounded-md text-white shrink-0">
                    Up next
                  </span>
                  <span className="font-bold text-white truncate text-xs sm:text-sm">
                    {nextClass.subject}
                  </span>
                  {nextClass.room && (
                    <span className="hidden sm:inline text-primary-200 text-xs">
                      • {nextClass.room}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-white/90 shrink-0">
                  <Clock size={12} className="text-primary-200" />
                  <span>{formatTime(nextClass.startTime)} ({minutesUntil(nextClass.startTime, minutes)}m)</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-3.5 border-t border-white/15 flex items-center justify-between text-xs text-primary-200 relative z-10">
                <span className="text-[10px] uppercase tracking-wider font-bold bg-white/10 px-2 py-0.5 rounded-md text-white/80">
                  Up next
                </span>
                <span className="text-xs text-white/90 font-medium">Last lecture of today 🎉</span>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="bg-white/95 dark:bg-[#0d1222]/80 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-6 mb-7 text-center shadow-sm dark:shadow-[0_8px_25px_rgba(0,0,0,0.45)]">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center mx-auto mb-2 text-gray-400">
              <Zap size={22} />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No class running right now</p>
            {nextClass && (
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">
                Next: {nextClass.subject} in {minutesUntil(nextClass.startTime, minutes)} mins
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Upcoming classes */}
      <AnimatePresence>
        {upcomingClasses.length > 0 && (
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Clock size={15} className="text-amber-500" />
              <span>Upcoming today ({upcomingClasses.length})</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {upcomingClasses.map(cls => (
                <ClassCard 
                  key={cls._id} 
                  cls={cls} 
                  status="upcoming"
                  onEdit={c => { setEditCls(c); setShowAdd(true); }}
                  onDelete={deleteClass} 
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ended classes */}
      <AnimatePresence>
        {endedClasses.length > 0 && (
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-3">
              Earlier today
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {endedClasses.map(cls => (
                <ClassCard 
                  key={cls._id} 
                  cls={cls} 
                  status="ended"
                  onEdit={c => { setEditCls(c); setShowAdd(true); }}
                  onDelete={deleteClass} 
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {todayClasses.length === 0 && !loading && (
        <motion.div variants={itemVariants} className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-300 dark:text-gray-600">
            <CalendarDays size={32} />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">No classes scheduled for today</p>
          <p className="text-gray-400 text-xs mt-1">
            {classes.length === 0 ? 'Use "AI Import" to upload your timetable, or add classes manually.' : 'Enjoy your free day!'}
          </p>
          {classes.length === 0 && (
            <div className="flex gap-2 justify-center mt-4">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowAI(true)} 
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                <Sparkles size={14} />AI Import
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { setEditCls(null); setShowAdd(true); }} 
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus size={14} />Manual add
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* Schedule link */}
      <motion.div variants={itemVariants} className="mt-4 flex items-center justify-end">
        <Link 
          to="/schedule" 
          className="group flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium transition-colors"
        >
          <span>View full schedule</span>
          <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      <ClassFormModal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditCls(null); }} onSave={handleSave} initialData={editCls} />
      <AIUploadModal isOpen={showAI} onClose={() => setShowAI(false)} />
      
      <ClassDetailModal
        isOpen={!!detailModalCls}
        onClose={() => setDetailModalCls(null)}
        cls={detailModalCls}
        status={currentClass?._id === detailModalCls?._id ? 'current' : 'other'}
        onEdit={(c) => { setEditCls(c); setShowAdd(true); }}
        onDelete={deleteClass}
      />

      {currentNotification && (
        <NotificationPopup
          notification={currentNotification}
          onDismiss={dismissCurrentNotification}
          onRemindLater={() => remindLater(currentNotification, 300000)}
        />
      )}
    </motion.div>
  );
}
