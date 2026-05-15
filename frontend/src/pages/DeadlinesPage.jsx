import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { daysUntil, formatDate } from '../utils/time';
import { Plus, X, Check, Trash2, AlertTriangle, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES = ['assignment', 'exam', 'quiz', 'project', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];
const TYPE_COLORS = { assignment: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', exam: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', quiz: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', project: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', other: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' };
const PRIO_COLORS = { high: 'text-red-500', medium: 'text-amber-500', low: 'text-green-500' };

const defaultForm = { title: '', subject: '', dueDate: '', type: 'assignment', priority: 'medium', notes: '' };

function DeadlineForm({ onSave, onCancel }) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };

  return (
    <div className="card p-5 border-2 border-brand-200 dark:border-brand-800 animate-slide-up">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Title *</label>
            <input className="input" placeholder="e.g. Physics Assignment 3" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>
          <div>
            <label className="label">Subject</label>
            <input className="input" placeholder="e.g. Applied Physics" value={form.subject} onChange={e => set('subject', e.target.value)} />
          </div>
          <div>
            <label className="label">Due date *</label>
            <input type="date" className="input" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} required />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <input className="input" placeholder="Optional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Adding...' : 'Add deadline'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all | active | completed

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/deadlines');
      setDeadlines(res.data.deadlines);
    } catch { toast.error('Failed to load deadlines.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async (form) => {
    const res = await api.post('/deadlines', form);
    setDeadlines(ds => [res.data.deadline, ...ds]);
    setShowForm(false);
    toast.success('Deadline added!');
  };

  const toggleComplete = async (dl) => {
    const res = await api.put(`/deadlines/${dl._id}`, { completed: !dl.completed });
    setDeadlines(ds => ds.map(d => d._id === dl._id ? res.data.deadline : d));
  };

  const handleDelete = async (id) => {
    await api.delete(`/deadlines/${id}`);
    setDeadlines(ds => ds.filter(d => d._id !== id));
    toast.success('Deadline removed.');
  };

  const filtered = deadlines.filter(d => {
    if (filter === 'active') return !d.completed;
    if (filter === 'completed') return d.completed;
    return true;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl text-gray-900 dark:text-white">Deadlines</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {deadlines.filter(d => !d.completed).length} pending
          </p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-1.5 text-sm">
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'Add deadline'}
        </button>
      </div>

      {showForm && <div className="mb-4"><DeadlineForm onSave={handleSave} onCancel={() => setShowForm(false)} /></div>}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {['all', 'active', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
              filter === f ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList size={36} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No deadlines here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(dl => {
            const days = daysUntil(dl.dueDate);
            const urgent = days <= 1 && !dl.completed;
            const overdue = days < 0 && !dl.completed;
            return (
              <div key={dl._id} className={`card p-4 flex items-start gap-3 transition-all ${dl.completed ? 'opacity-50' : ''} ${urgent && !overdue ? 'border-amber-200 dark:border-amber-800' : ''} ${overdue ? 'border-red-200 dark:border-red-800' : ''}`}>
                <button onClick={() => toggleComplete(dl)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                    dl.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                  }`}>
                  {dl.completed && <Check size={11} className="text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-medium text-sm text-gray-900 dark:text-white ${dl.completed ? 'line-through' : ''}`}>{dl.title}</p>
                    <span className={`badge text-[10px] ${TYPE_COLORS[dl.type]}`}>{dl.type}</span>
                    {dl.priority === 'high' && !dl.completed && (
                      <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  {dl.subject && <p className="text-xs text-gray-400 mt-0.5">{dl.subject}</p>}
                  <p className={`text-xs mt-1 font-medium ${
                    overdue ? 'text-red-500' : urgent ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {overdue ? `Overdue by ${Math.abs(days)}d` : days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due in ${days} days — ${formatDate(dl.dueDate)}`}
                  </p>
                </div>

                <button onClick={() => handleDelete(dl._id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex-shrink-0">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
