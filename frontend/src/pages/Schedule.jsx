import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClasses } from '../context/ClassContext';
import { getCurrentDay, classStatus, getCurrentTimeMinutes, DAY_NAMES, DAY_SHORT, formatTime } from '../utils/timeUtils';
import { Plus, Sparkles, Trash2, Search, CalendarDays } from 'lucide-react';
import ClassCard from '../components/ClassCard';
import ClassFormModal from '../components/ClassFormModal';
import AIUploadModal from '../components/AIUploadModal';

export default function Schedule() {
  const { classes, loading, fetchClasses, addClass, updateClass, deleteClass, clearAll } = useClasses();
  const [activeDay, setActiveDay] = useState(getCurrentDay());
  const [showAdd, setShowAdd] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [editCls, setEditCls] = useState(null);
  const [search, setSearch] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => { fetchClasses(); }, []);

  const currentDay = getCurrentDay();
  const currentMinutes = getCurrentTimeMinutes();

  const filtered = classes.filter(c =>
    c.day === activeDay &&
    (!search || c.subject.toLowerCase().includes(search.toLowerCase()) || c.teacher?.toLowerCase().includes(search.toLowerCase()) || c.room?.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const dayCount = (d) => classes.filter(c => c.day === d).length;

  const handleSave = async (form) => {
    if (editCls?._id) await updateClass(editCls._id, form);
    else await addClass(form);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
            Weekly Schedule
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{classes.length} total classes configured</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowAI(true)} 
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm"
          >
            <Sparkles size={15} />AI Import
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { setEditCls(null); setShowAdd(true); }} 
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-xs"
          >
            <Plus size={15} />Add class
          </motion.button>
        </div>
      </div>

      {/* Day tabs with animated layoutId pill */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {DAY_SHORT.map(d => {
          const isActive = activeDay === d;
          const isToday = d === currentDay;
          return (
            <button 
              key={d} 
              onClick={() => setActiveDay(d)}
              className={`relative flex flex-col items-center px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors whitespace-nowrap min-w-[58px] focus:outline-none ${
                isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeScheduleDayTab"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl shadow-md shadow-primary-500/25 dark:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                />
              )}
              {!isActive && (
                <div className={`absolute inset-0 bg-white/90 dark:bg-[#0d1222]/80 backdrop-blur-md rounded-2xl border ${
                  isToday ? 'border-primary-400 dark:border-primary-600' : 'border-gray-200/80 dark:border-gray-800/80'
                } -z-0`} />
              )}
              <span className="relative z-10">{d}</span>
              {dayCount(d) > 0 && (
                <span className={`relative z-10 mt-0.5 text-[10px] font-medium ${isActive ? 'text-primary-100' : 'text-gray-400'}`}>
                  {dayCount(d)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      {classes.length > 0 && (
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white/90 dark:bg-[#0d1222]/80 backdrop-blur-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 shadow-sm transition"
            placeholder="Search by subject, teacher, or room..." 
          />
        </div>
      )}

      {/* Classes list with key change animation */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div 
          key="empty"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-14 bg-white/40 dark:bg-gray-900/20 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200 dark:border-gray-800"
        >
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-400">
            <Plus size={22} />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {search ? 'No matching classes found' : `No classes on ${DAY_NAMES[activeDay]}`}
          </p>
          {!search && (
            <p className="text-xs text-gray-400 mt-1">
              Add a class manually or use AI Import to parse your syllabus
            </p>
          )}
        </motion.div>
      ) : (
        <motion.div 
          key={activeDay}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid gap-3 sm:grid-cols-2"
        >
          {filtered.map(cls => (
            <ClassCard 
              key={cls._id} 
              cls={cls}
              status={activeDay === currentDay ? classStatus(cls, currentDay, currentMinutes) : 'other'}
              onEdit={c => { setEditCls(c); setShowAdd(true); }}
              onDelete={deleteClass} 
            />
          ))}
        </motion.div>
      )}

      {/* Clear all confirm */}
      {classes.length > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between text-xs text-gray-400">
          <span>{classes.length} classes active in semester</span>
          {showClearConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-medium">Delete all classes?</span>
              <button 
                onClick={async () => { await clearAll(); setShowClearConfirm(false); }} 
                className="px-2.5 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, delete
              </button>
              <button 
                onClick={() => setShowClearConfirm(false)} 
                className="px-2.5 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowClearConfirm(true)} 
              className="hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={13} />
              <span>Clear timetable</span>
            </button>
          )}
        </div>
      )}

      <ClassFormModal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditCls(null); }} onSave={handleSave} initialData={editCls} />
      <AIUploadModal isOpen={showAI} onClose={() => setShowAI(false)} />
    </motion.div>
  );
}
