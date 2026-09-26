import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2 } from 'lucide-react';
import { useNotes } from '../context/NoteContext';
import { useClasses } from '../context/ClassContext';
import { DAY_NAMES, DAY_SHORT } from '../utils/timeUtils';

const COLORS = ['#F59E0B','#3B82F6','#10B981','#8B5CF6','#EF4444','#06B6D4','#EC4899','#F97316'];
const empty = { title: '', content: '', classId: '', color: '#F59E0B' };

export default function NoteModal({ isOpen, onClose, initialNote, initialClass }) {
  const { addNote, updateNote, deleteNote } = useNotes();
  const { classes } = useClasses();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (initialNote) {
      setForm({ title: initialNote.title, content: initialNote.content, classId: initialNote.classId || '', color: initialNote.color || '#F59E0B' });
    } else if (initialClass) {
      setForm({ ...empty, classId: initialClass._id, color: initialClass.color || '#F59E0B' });
    } else {
      setForm(empty);
    }
    setConfirmDelete(false);
  }, [initialNote, initialClass, isOpen]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const selectedClass = classes.find(c => c._id === form.classId);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        classId: form.classId || null,
        classDay: selectedClass?.day || '',
        className: selectedClass?.subject || '',
        classColor: selectedClass?.color || '',
      };
      if (initialNote?._id) await updateNote(initialNote._id, payload);
      else await addNote(payload);
      onClose();
    } catch {}
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return setConfirmDelete(true);
    setLoading(true);
    try { await deleteNote(initialNote._id); onClose(); }
    catch {} finally { setLoading(false); }
  };

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition placeholder-gray-400";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white/95 dark:bg-[#0d1222]/95 backdrop-blur-2xl rounded-3xl border border-gray-200/80 dark:border-gray-800/80 w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                {initialNote ? 'Edit Study Note' : 'Create Study Note'}
              </h2>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onClose} 
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={18} />
              </motion.button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Title *</label>
                <input className={inputCls} placeholder="e.g. Chapter 4 Key Formulas & Exercises" value={form.title} onChange={set('title')} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Link to class (optional)</label>
                <select className={inputCls} value={form.classId} onChange={set('classId')}>
                  <option value="">— General note (not linked) —</option>
                  {DAY_SHORT.map(day => {
                    const dayClasses = classes.filter(c => c.day === day);
                    if (!dayClasses.length) return null;
                    return (
                      <optgroup key={day} label={DAY_NAMES[day]}>
                        {dayClasses.map(c => (
                          <option key={c._id} value={c._id}>{c.subject}{c.code ? ` (${c.code})` : ''}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Content</label>
                <textarea className={inputCls} rows={6} placeholder="Write key lecture points, assignments or reminders..." value={form.content} onChange={set('content')} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Note Tag Color</label>
                <div className="flex gap-2.5 flex-wrap mt-1">
                  {COLORS.map(c => (
                    <motion.button 
                      key={c} 
                      type="button" 
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setForm(p => ({ ...p, color: c }))}
                      className={`w-7 h-7 rounded-xl transition-all ${form.color === c ? 'scale-115 ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-gray-900 shadow-sm' : ''}`}
                      style={{ backgroundColor: c }} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              {initialNote && (
                <motion.button 
                  whileTap={{ scale: 0.94 }}
                  onClick={handleDelete} 
                  disabled={loading}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${confirmDelete ? 'bg-red-500 text-white' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                >
                  <Trash2 size={14} />
                  <span>{confirmDelete ? 'Confirm delete' : 'Delete'}</span>
                </motion.button>
              )}
              <div className="flex gap-2 ml-auto">
                <motion.button 
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose} 
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSave} 
                  disabled={loading || !form.title.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Save size={14} />
                  <span>{loading ? 'Saving...' : 'Save note'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
