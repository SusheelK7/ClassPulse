import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Sparkles } from 'lucide-react';
import { DAY_SHORT, DAY_NAMES } from '../utils/timeUtils';

const COLORS = ['#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444','#06B6D4','#EC4899','#F97316'];

const empty = { subject:'', code:'', teacher:'', room:'', day:'Mo', startTime:'08:00', endTime:'09:00', color:'#3B82F6', notes:'' };

export default function ClassFormModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) setForm({ ...empty, ...initialData });
    else setForm(empty);
    setError('');
  }, [initialData, isOpen]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim()) return setError('Subject name is required');
    if (form.startTime >= form.endTime) return setError('End time must be after start time');
    setError('');
    setLoading(true);
    try { await onSave(form); onClose(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition placeholder-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1";

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
            className="bg-white/95 dark:bg-[#0d1222]/95 backdrop-blur-2xl rounded-3xl border border-gray-200/80 dark:border-gray-800/80 w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                {initialData?._id ? 'Edit Class Details' : 'Add New Class'}
              </h2>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onClose} 
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X size={18} />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl px-3.5 py-2 font-medium">
                  {error}
                </div>
              )}
              <div>
                <label className={labelCls}>Subject name *</label>
                <input required className={inputCls} placeholder="e.g. Applied Physics" value={form.subject} onChange={set('subject')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Course code</label>
                  <input className={inputCls} placeholder="e.g. CS-201" value={form.code} onChange={set('code')} />
                </div>
                <div>
                  <label className={labelCls}>Day *</label>
                  <select className={inputCls} value={form.day} onChange={set('day')}>
                    {DAY_SHORT.map(d => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Start time *</label>
                  <input type="time" className={inputCls} value={form.startTime} onChange={set('startTime')} />
                </div>
                <div>
                  <label className={labelCls}>End time *</label>
                  <input type="time" className={inputCls} value={form.endTime} onChange={set('endTime')} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Teacher</label>
                <input className={inputCls} placeholder="Teacher name" value={form.teacher} onChange={set('teacher')} />
              </div>
              <div>
                <label className={labelCls}>Room / Lab</label>
                <input className={inputCls} placeholder="e.g. Lab 11, Room C-205" value={form.room} onChange={set('room')} />
              </div>
              <div>
                <label className={labelCls}>Class Accent Color</label>
                <div className="flex gap-2.5 flex-wrap mt-1">
                  {COLORS.map(c => (
                    <motion.button 
                      key={c} 
                      type="button" 
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setForm(p => ({...p, color: c}))}
                      className={`w-7 h-7 rounded-xl transition-all ${form.color === c ? 'scale-115 ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-gray-900 shadow-sm' : ''}`}
                      style={{ backgroundColor: c }} 
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Extra Notes (Optional)</label>
                <textarea className={inputCls} rows={2} placeholder="Any specific instructions or remarks..." value={form.notes} onChange={set('notes')} />
              </div>
            </form>

            <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={onClose} 
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit} 
                disabled={loading} 
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Save size={15} />
                <span>{loading ? 'Saving...' : 'Save class'}</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
