import { useEffect, useState } from 'react';
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
  const dayOfWeek = today.getDay(); // 0=Sun
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
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-3 h-3 rounded-full shrink-0 mt-1" style={{ backgroundColor: note.color || '#F59E0B' }} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{note.title}</h3>
          {note.className && (
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: note.classColor || '#3B82F6' }} />
              <span className="text-xs text-gray-400 truncate">{note.className}</span>
            </div>
          )}
        </div>
      </div>
      {note.content && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 ml-6 mb-3">{note.content}</p>
      )}
      <div className="flex items-center justify-between ml-6">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={11} />
          <span>{formatDate(note.updatedAt)} {formatTime(note.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(note)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition"><Edit2 size={13} /></button>
          {confirmDelete ? (
            <button onClick={() => onDelete(note._id)} className="p-1.5 rounded-lg text-red-500 bg-red-50 dark:bg-red-900/10 text-xs font-medium px-2">Confirm</button>
          ) : (
            <button onClick={() => setConfirmDelete(true)} onBlur={() => setConfirmDelete(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition"><Trash2 size={13} /></button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const { notes, loading, fetchNotes, deleteNote } = useNotes();
  const { classes } = useClasses();
  const [activeDay, setActiveDay] = useState(getCurrentDay());
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [filter, setFilter] = useState('all'); // all, class, general
  const weekDates = getWeekDates();
  const today = getCurrentDay();

  useEffect(() => { fetchNotes(); }, []);

  // Notes for active day (linked to classes on that day) + general notes
  const dayNotes = notes.filter(n => {
    const matchDay = n.classDay === activeDay || (!n.classId && filter !== 'class');
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'class' && n.classId) || (filter === 'general' && !n.classId);
    return matchDay && matchSearch && matchFilter;
  });

  // Classes on active day
  const dayClasses = classes.filter(c => c.day === activeDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleEdit = (note) => { setEditNote(note); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditNote(null); };

  const noteCountForDay = (day) => notes.filter(n => n.classDay === day).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-600 text-gray-900 dark:text-white">Notes</h1>
          <p className="text-sm text-gray-400 mt-0.5">{notes.length} total notes</p>
        </div>
        <button onClick={() => { setEditNote(null); setShowModal(true); }}
          className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition shadow-sm">
          <Plus size={15} />New note
        </button>
      </div>

      {/* Weekly calendar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={15} className="text-primary-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Weekly Calendar</span>
          <span className="text-xs text-gray-400 ml-auto">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDates.map(({ day, date }) => {
            const isToday = day === today;
            const isActive = day === activeDay;
            const count = noteCountForDay(day);
            const classCount = classes.filter(c => c.day === day).length;
            return (
              <button key={day} onClick={() => setActiveDay(day)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${isActive ? 'bg-primary-600 text-white' : isToday ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                <span className="text-[10px] font-medium mb-1">{day}</span>
                <span className={`text-lg font-display font-600 leading-none ${isActive ? 'text-white' : ''}`}>{date.getDate()}</span>
                <div className="flex gap-1 mt-1.5">
                  {classCount > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/60' : 'bg-primary-400'}`} />}
                  {count > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-yellow-300' : 'bg-amber-400'}`} />}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-400 inline-block" />Classes</span>
          <span className="text-xs text-gray-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Notes</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — classes on this day */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <BookOpen size={14} className="text-primary-500" />{DAY_NAMES[activeDay]} Classes
          </h2>
          {dayClasses.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-center">
              <p className="text-xs text-gray-400">No classes on {DAY_NAMES[activeDay]}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dayClasses.map(cls => {
                const clsNotes = notes.filter(n => n.classId === cls._id);
                return (
                  <div key={cls._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: cls.color || '#3B82F6' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{cls.subject}</p>
                        <p className="text-xs text-gray-400">{cls.startTime} – {cls.endTime}{cls.room ? ` · ${cls.room}` : ''}</p>
                      </div>
                      <button onClick={() => { setEditNote(null); setShowModal(true); }}
                        className="shrink-0 p-1 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition">
                        <Plus size={13} />
                      </button>
                    </div>
                    {clsNotes.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {clsNotes.map(n => (
                          <button key={n._id} onClick={() => handleEdit(n)}
                            className="w-full text-left text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 truncate flex items-center gap-1">
                            <StickyNote size={10} />{n.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — notes for this day */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <StickyNote size={14} className="text-amber-500" />Notes — {DAY_NAMES[activeDay]}
            </h2>
            <div className="flex gap-1 ml-auto">
              {['all','class','general'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${filter === f ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Search notes..." />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : dayNotes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <StickyNote size={32} className="mx-auto mb-3 text-gray-200 dark:text-gray-700" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No notes for {DAY_NAMES[activeDay]}</p>
              <p className="text-xs text-gray-400 mt-1">Add a note linked to a class or a general note</p>
              <button onClick={() => { setEditNote(null); setShowModal(true); }}
                className="mt-3 flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-xl text-xs font-medium mx-auto hover:bg-primary-700 transition">
                <Plus size={13} />Add note
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {dayNotes.map(note => (
                <NoteCard key={note._id} note={note} onEdit={handleEdit} onDelete={deleteNote} />
              ))}
            </div>
          )}
        </div>
      </div>

      <NoteModal isOpen={showModal} onClose={handleClose} initialNote={editNote} />
    </div>
  );
}
