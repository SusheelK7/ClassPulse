import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../context/NoteContext';
import { useClasses } from '../context/ClassContext';
import { getCurrentDay, DAY_NAMES, DAY_SHORT } from '../utils/timeUtils';
import { Plus, StickyNote, Search, Calendar, BookOpen, Edit2, Trash2, Clock } from 'lucide-react';
import NoteModal from '../components/NoteModal';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return DAY_SHORT.map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { day, date: d };
  });
}

function NoteCard({ note, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <motion.div 
      layout
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-white/95 dark:bg-[#0d1222]/80 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-gray-800/80 p-4 shadow-sm dark:shadow-[0_8px_25px_rgba(0,0,0,0.45)] hover:border-primary-300 dark:hover:border-primary-700/60 transition-colors"
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-3 h-3 rounded-full shrink-0 mt-1" style={{ backgroundColor: note.color || '#F59E0B' }} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{note.title}</h3>
          {note.className && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: note.classColor || '#3B82F6' }} />
              <span className="text-xs text-gray-400 truncate">{note.className}</span>
            </div>
          )}
        </div>
      </div>
      {note.content && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 ml-6 mb-3 leading-relaxed">
          {note.content}
        </p>
      )}
      <div className="flex items-center justify-between ml-6 pt-2 border-t border-gray-100 dark:border-gray-800/60">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <Clock size={11} />
          <span>{formatDate(note.updatedAt)} {formatTime(note.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(note)} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors"
            title="Edit note"
          >
            <Edit2 size={13} />
          </motion.button>
          {confirmDelete ? (
            <button 
              onClick={() => onDelete(note._id)} 
              className="p-1 rounded-lg text-red-500 bg-red-50 dark:bg-red-900/20 text-xs font-semibold px-2"
            >
              Confirm
            </button>
          ) : (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setConfirmDelete(true)} 
              onBlur={() => setConfirmDelete(false)} 
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              title="Delete note"
            >
              <Trash2 size={13} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Notes() {
  const { notes, loading, fetchNotes, deleteNote } = useNotes();
  const { classes } = useClasses();
  const [activeDay, setActiveDay] = useState(getCurrentDay());
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [filter, setFilter] = useState('all');
  const weekDates = getWeekDates();
  const today = getCurrentDay();

  useEffect(() => { fetchNotes(); }, []);

  const dayNotes = notes.filter(n => {
    const matchDay = n.classDay === activeDay || (!n.classId && filter !== 'class');
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'class' && n.classId) || (filter === 'general' && !n.classId);
    return matchDay && matchSearch && matchFilter;
  });

  const dayClasses = classes.filter(c => c.day === activeDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleEdit = (note) => { setEditNote(note); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditNote(null); };

  const noteCountForDay = (day) => notes.filter(n => n.classDay === day).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
            Study Notes
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{notes.length} notes organized across subjects</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { setEditNote(null); setShowModal(true); }}
          className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
        >
          <Plus size={15} />
          <span>New note</span>
        </motion.button>
      </div>

      {/* Weekly calendar with layoutId pill */}
      <div className="bg-white/95 dark:bg-[#0d1222]/80 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-gray-800/80 p-4 mb-6 shadow-sm dark:shadow-[0_8px_25px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={15} className="text-primary-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Weekly Calendar</span>
          <span className="text-xs text-gray-400 ml-auto">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDates.map(({ day, date }) => {
            const isToday = day === today;
            const isActive = day === activeDay;
            const count = noteCountForDay(day);
            const classCount = classes.filter(c => c.day === day).length;
            return (
              <button 
                key={day} 
                onClick={() => setActiveDay(day)}
                className={`relative flex flex-col items-center p-2 rounded-2xl transition-colors focus:outline-none ${
                  isActive ? 'text-white' : isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNotesCalendarDay"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute inset-0 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-2xl shadow-md shadow-primary-500/25"
                  />
                )}
                {!isActive && isToday && (
                  <div className="absolute inset-0 bg-primary-50 dark:bg-primary-900/25 rounded-2xl border border-primary-200 dark:border-primary-700/50" />
                )}
                <span className="relative z-10 text-[10px] font-semibold uppercase mb-1">{day}</span>
                <span className={`relative z-10 text-base sm:text-lg font-display font-bold leading-none ${isActive ? 'text-white' : ''}`}>
                  {date.getDate()}
                </span>
                <div className="relative z-10 flex gap-1 mt-1.5">
                  {classCount > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/80' : 'bg-primary-400'}`} />}
                  {count > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-300' : 'bg-amber-400'}`} />}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/80">
          <span className="text-xs text-gray-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-500 inline-block" />Classes</span>
          <span className="text-xs text-gray-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Notes</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — classes on this day */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <BookOpen size={14} className="text-primary-500" />
            <span>{DAY_NAMES[activeDay]} Classes</span>
          </h2>
          {dayClasses.length === 0 ? (
            <div className="bg-white/95 dark:bg-[#0d1222]/80 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-xs text-gray-400">No classes scheduled on {DAY_NAMES[activeDay]}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dayClasses.map(cls => {
                const clsNotes = notes.filter(n => n.classId === cls._id);
                return (
                  <motion.div 
                    key={cls._id} 
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/95 dark:bg-[#0d1222]/80 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-3.5 shadow-sm hover:border-primary-300 dark:hover:border-primary-700/60 transition-colors"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: cls.color || '#3B82F6' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{cls.subject}</p>
                        <p className="text-xs text-gray-400">{cls.startTime} – {cls.endTime}{cls.room ? ` · ${cls.room}` : ''}</p>
                      </div>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setEditNote(null); setShowModal(true); }}
                        className="shrink-0 p-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                      >
                        <Plus size={13} />
                      </motion.button>
                    </div>
                    {clsNotes.length > 0 && (
                      <div className="ml-4 space-y-1 pt-1 border-t border-gray-100 dark:border-gray-800/60">
                        {clsNotes.map(n => (
                          <button 
                            key={n._id} 
                            onClick={() => handleEdit(n)}
                            className="w-full text-left text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 truncate flex items-center gap-1.5"
                          >
                            <StickyNote size={11} className="text-amber-500 shrink-0" />
                            <span className="truncate">{n.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — notes for this day */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <StickyNote size={15} className="text-amber-500" />
              <span>Notes — {DAY_NAMES[activeDay]}</span>
            </h2>
            <div className="flex p-0.5 bg-gray-100 dark:bg-gray-800/80 rounded-xl relative border border-gray-200/50 dark:border-gray-700/50">
              {['all', 'class', 'general'].map(f => {
                const isActive = filter === f;
                return (
                  <button 
                    key={f} 
                    onClick={() => setFilter(f)}
                    className={`relative px-3 py-1 text-xs font-semibold rounded-lg transition-colors focus:outline-none ${
                      isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNotesFilterTab"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="absolute inset-0 bg-white dark:bg-[#151c30] rounded-lg shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{f.charAt(0).toUpperCase() + f.slice(1)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-white/90 dark:bg-[#0d1222]/80 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 shadow-sm transition"
              placeholder="Search notes..." 
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : dayNotes.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-white/40 dark:bg-gray-900/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800"
            >
              <StickyNote size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No notes found for {DAY_NAMES[activeDay]}</p>
              <p className="text-xs text-gray-400 mt-1">Add a note linked to your class schedule or write a general note</p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { setEditNote(null); setShowModal(true); }}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Plus size={14} />Add note
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key={`${activeDay}-${filter}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="grid gap-3 sm:grid-cols-2"
            >
              {dayNotes.map(note => (
                <NoteCard key={note._id} note={note} onEdit={handleEdit} onDelete={deleteNote} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <NoteModal isOpen={showModal} onClose={handleClose} initialNote={editNote} />
    </motion.div>
  );
}
