import { useState, useEffect } from 'react';
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

  if (!isOpen) return null;

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

  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-display font-600 text-gray-900 dark:text-white">{initialNote ? 'Edit note' : 'New note'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title *</label>
            <input className={inputCls} placeholder="Note title..." value={form.title} onChange={set('title')} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Link to class (optional)</label>
            <select className={inputCls} value={form.classId} onChange={set('classId')}>
              <option value="">— General note —</option>
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
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Content</label>
            <textarea className={inputCls} rows={6} placeholder="Write your notes here..." value={form.content} onChange={set('content')} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Color</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                  className={`w-7 h-7 rounded-lg transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          {initialNote && (
            <button onClick={handleDelete} disabled={loading}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${confirmDelete ? 'bg-red-500 text-white' : 'text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10'}`}>
              <Trash2 size={14} />{confirmDelete ? 'Confirm delete' : 'Delete'}
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">Cancel</button>
            <button onClick={handleSave} disabled={loading || !form.title.trim()}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium transition flex items-center gap-2">
              <Save size={14} />{loading ? 'Saving...' : 'Save note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
