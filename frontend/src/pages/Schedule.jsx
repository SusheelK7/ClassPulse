import { useEffect, useState } from 'react';
import { useClasses } from '../context/ClassContext';
import { getCurrentDay, classStatus, getCurrentTimeMinutes, DAY_NAMES, DAY_SHORT, formatTime } from '../utils/timeUtils';
import { Plus, Sparkles, Trash2, Search } from 'lucide-react';
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
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-600 text-gray-900 dark:text-white">Weekly Schedule</h1>
          <p className="text-sm text-gray-400 mt-0.5">{classes.length} total classes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAI(true)} className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition">
            <Sparkles size={15} />AI Import
          </button>
          <button onClick={() => { setEditCls(null); setShowAdd(true); }} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <Plus size={15} />Add class
          </button>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {DAY_SHORT.map(d => (
          <button key={d} onClick={() => setActiveDay(d)}
            className={`flex flex-col items-center px-3 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap min-w-[52px] ${activeDay === d ? 'bg-primary-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-700'} ${d === currentDay && activeDay !== d ? 'ring-2 ring-primary-300 dark:ring-primary-700' : ''}`}>
            <span>{d}</span>
            {dayCount(d) > 0 && <span className={`mt-0.5 text-[10px] ${activeDay === d ? 'text-primary-200' : 'text-gray-400'}`}>{dayCount(d)}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      {classes.length > 0 && (
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Search by subject, teacher, or room..." />
        </div>
      )}

      {/* Classes list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Plus size={22} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {search ? 'No matching classes' : `No classes on ${DAY_NAMES[activeDay]}`}
          </p>
          {!search && <p className="text-xs text-gray-400 mt-1">Add a class or use AI Import</p>}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(cls => (
            <ClassCard key={cls._id} cls={cls}
              status={activeDay === currentDay ? classStatus(cls, currentDay, currentMinutes) : 'other'}
              onEdit={c => { setEditCls(c); setShowAdd(true); }}
              onDelete={deleteClass} />
          ))}
        </div>
      )}

      {/* Clear all */}
      {classes.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          {showClearConfirm ? (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600 dark:text-red-400 flex-1">Delete all {classes.length} classes?</p>
              <button onClick={() => { clearAll(); setShowClearConfirm(false); }} className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-lg transition">Yes, delete all</button>
              <button onClick={() => setShowClearConfirm(false)} className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowClearConfirm(true)} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500 transition">
              <Trash2 size={15} />Clear all classes
            </button>
          )}
        </div>
      )}

      <ClassFormModal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditCls(null); }} onSave={handleSave} initialData={editCls} />
      <AIUploadModal isOpen={showAI} onClose={() => setShowAI(false)} />
    </div>
  );
}
