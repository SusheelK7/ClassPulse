import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DAYS, DAY_FULL, CLASS_COLORS } from '../utils/time';

const defaultForm = {
  subject: '', teacher: '', room: '', day: 'Mo',
  startTime: '08:00', endTime: '09:00',
  color: '#6366f1', semester: '', notes: ''
};

export default function ClassModal({ open, onClose, onSave, initial = null }) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const editing = !!initial;

  useEffect(() => {
    if (open) setForm(initial ? { ...defaultForm, ...initial } : defaultForm);
  }, [open, initial]);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.day || !form.startTime || !form.endTime) return;
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white">
            {editing ? 'Edit class' : 'Add class'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Subject / Course name *</label>
            <input className="input" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Applied Physics" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Teacher</label>
              <input className="input" value={form.teacher} onChange={e => set('teacher', e.target.value)} placeholder="e.g. Mr. Ahmed" />
            </div>
            <div>
              <label className="label">Room / Lab</label>
              <input className="input" value={form.room} onChange={e => set('room', e.target.value)} placeholder="e.g. C-204" />
            </div>
          </div>

          <div>
            <label className="label">Day *</label>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map(d => (
                <button type="button" key={d} onClick={() => set('day', d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    form.day === d
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start time *</label>
              <input type="time" className="input" value={form.startTime} onChange={e => set('startTime', e.target.value)} required />
            </div>
            <div>
              <label className="label">End time *</label>
              <input type="time" className="input" value={form.endTime} onChange={e => set('endTime', e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="label">Semester</label>
            <input className="input" value={form.semester} onChange={e => set('semester', e.target.value)} placeholder="e.g. Fall 2025" />
          </div>

          <div>
            <label className="label">Color label</label>
            <div className="flex gap-2 flex-wrap">
              {CLASS_COLORS.map(c => (
                <button type="button" key={c} onClick={() => set('color', c)}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes..." />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Add class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
