import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
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

  if (!isOpen) return null;

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

  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder-gray-400";
  const labelCls = "block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-display font-600 text-gray-900 dark:text-white">{initialData?._id ? 'Edit class' : 'Add class'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">{error}</div>}
          <div>
            <label className={labelCls}>Subject name *</label>
            <input required className={inputCls} placeholder="e.g. Applied Physics" value={form.subject} onChange={set('subject')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Course code</label><input className={inputCls} placeholder="e.g. Ph111" value={form.code} onChange={set('code')} /></div>
            <div>
              <label className={labelCls}>Day *</label>
              <select className={inputCls} value={form.day} onChange={set('day')}>
                {DAY_SHORT.map(d => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Start time *</label><input type="time" className={inputCls} value={form.startTime} onChange={set('startTime')} /></div>
            <div><label className={labelCls}>End time *</label><input type="time" className={inputCls} value={form.endTime} onChange={set('endTime')} /></div>
          </div>
          <div><label className={labelCls}>Teacher</label><input className={inputCls} placeholder="Teacher name" value={form.teacher} onChange={set('teacher')} /></div>
          <div><label className={labelCls}>Room / Lab</label><input className={inputCls} placeholder="e.g. Lab 11, C-205" value={form.room} onChange={set('room')} /></div>
          <div>
            <label className={labelCls}>Color</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({...p, color: c}))}
                  className={`w-7 h-7 rounded-lg transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div><label className={labelCls}>Notes</label><textarea className={inputCls} rows={2} placeholder="Any extra notes..." value={form.notes} onChange={set('notes')} /></div>
        </form>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium transition flex items-center justify-center gap-2">
            <Save size={15} />{loading ? 'Saving...' : 'Save class'}
          </button>
        </div>
      </div>
    </div>
  );
}
