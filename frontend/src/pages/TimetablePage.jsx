import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { DAYS, DAY_FULL, formatTime12, classStatus } from '../utils/time';
import ClassModal from '../components/ClassModal';
import AIUploadModal from '../components/AIUploadModal';
import { Plus, Sparkles, Edit2, Trash2, Clock, MapPin, User, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

function ClassChip({ cls, onEdit, onDelete }) {
  const status = classStatus(cls);
  const statusRing = status === 'current' ? 'ring-2 ring-green-400 ring-offset-1' : '';

  return (
    <div
      className={`relative group rounded-xl p-2.5 cursor-default transition-all hover:scale-[1.01] ${statusRing}`}
      style={{ backgroundColor: `${cls.color}18`, borderLeft: `3px solid ${cls.color}` }}
    >
      {status === 'current' && (
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow" />
      )}
      <p className="text-xs font-medium text-gray-900 dark:text-white leading-tight pr-4" style={{ color: cls.color }}>
        {cls.subject}
      </p>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
        {formatTime12(cls.startTime)} – {formatTime12(cls.endTime)}
      </p>
      {cls.room && <p className="text-[10px] text-gray-400 dark:text-gray-500">{cls.room}</p>}

      {/* Actions on hover */}
      <div className="absolute top-1.5 right-1.5 hidden group-hover:flex gap-0.5">
        <button onClick={() => onEdit(cls)}
          className="p-1 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Edit2 size={10} className="text-gray-600 dark:text-gray-300" />
        </button>
        <button onClick={() => onDelete(cls._id)}
          className="p-1 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 size={10} className="text-red-500" />
        </button>
      </div>
    </div>
  );
}

export default function TimetablePage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classModal, setClassModal] = useState({ open: false, initial: null });
  const [aiModal, setAiModal] = useState(false);
  const [view, setView] = useState('week'); // week | list
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data.classes);
    } catch { toast.error('Failed to load classes.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async (form) => {
    if (form._id) {
      const res = await api.put(`/classes/${form._id}`, form);
      setClasses(cs => cs.map(c => c._id === form._id ? res.data.class : c));
      toast.success('Class updated!');
    } else {
      const res = await api.post('/classes', form);
      setClasses(cs => [...cs, res.data.class]);
      toast.success('Class added!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    await api.delete(`/classes/${id}`);
    setClasses(cs => cs.filter(c => c._id !== id));
    toast.success('Class deleted.');
  };

  const handleImport = async (extracted, clearExisting) => {
    const res = await api.post('/classes/bulk', { classes: extracted, clearExisting });
    await fetch();
    return res.data;
  };

  const openEdit = (cls) => setClassModal({ open: true, initial: cls });
  const openAdd = () => setClassModal({ open: true, initial: null });

  const classesByDay = (day) =>
    classes.filter(c => c.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl text-gray-900 dark:text-white">Timetable</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{classes.length} classes across the week</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {['week','list'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                  view === v ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>{v}</button>
            ))}
          </div>
          <button onClick={() => setAiModal(true)}
            className="flex items-center gap-1.5 btn-secondary text-sm py-1.5">
            <Sparkles size={15} className="text-brand-500" /> AI import
          </button>
          <button onClick={openAdd} className="flex items-center gap-1.5 btn-primary text-sm py-1.5">
            <Plus size={15} /> Add class
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="card p-16 text-center">
          <BookOpen size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-2">No classes yet</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Upload your timetable image or add classes manually.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => setAiModal(true)} className="btn-secondary flex items-center gap-2">
              <Sparkles size={15} className="text-brand-500" /> AI import
            </button>
            <button onClick={openAdd} className="btn-primary flex items-center gap-2">
              <Plus size={15} /> Add manually
            </button>
          </div>
        </div>
      ) : view === 'week' ? (
        /* Week grid */
        <div>
          {/* Mobile: day tabs */}
          <div className="md:hidden flex gap-1 mb-4 overflow-x-auto pb-1">
            {DAYS.slice(0, 6).map(d => (
              <button key={d} onClick={() => setSelectedDay(d)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedDay === d ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                {d} <span className="ml-1 opacity-70">{classesByDay(d).length}</span>
              </button>
            ))}
          </div>

          {/* Desktop: full grid */}
          <div className="hidden md:grid grid-cols-5 gap-3">
            {DAYS.slice(0, 5).map(day => (
              <div key={day}>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">
                  {DAY_FULL[day].slice(0, 3).toUpperCase()}
                  <span className="ml-1.5 text-gray-300 dark:text-gray-600">{classesByDay(day).length}</span>
                </div>
                <div className="space-y-2 min-h-20">
                  {classesByDay(day).map(cls => (
                    <ClassChip key={cls._id} cls={cls} onEdit={openEdit} onDelete={handleDelete} />
                  ))}
                  <button onClick={openAdd}
                    className="w-full py-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-300 dark:text-gray-600 hover:border-brand-300 hover:text-brand-400 transition-colors">
                    + add
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: selected day */}
          <div className="md:hidden space-y-2">
            {classesByDay(selectedDay).length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-sm text-gray-400">No classes on {DAY_FULL[selectedDay]}</p>
              </div>
            ) : (
              classesByDay(selectedDay).map(cls => (
                <div key={cls._id} className="card p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: cls.color }} />
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{cls.subject}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={11} />{formatTime12(cls.startTime)} – {formatTime12(cls.endTime)}
                      </p>
                      {cls.room && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={11} />{cls.room}</p>}
                      {cls.teacher && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><User size={11} />{cls.teacher}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(cls)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                      <Edit2 size={14} className="text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(cls._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="space-y-4">
          {DAYS.slice(0, 6).map(day => {
            const dayCls = classesByDay(day);
            if (dayCls.length === 0) return null;
            return (
              <div key={day}>
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">{DAY_FULL[day]}</h3>
                <div className="space-y-2">
                  {dayCls.map(cls => (
                    <div key={cls._id} className="card p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{cls.subject}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime12(cls.startTime)} – {formatTime12(cls.endTime)}
                            {cls.room && ` · ${cls.room}`}
                            {cls.teacher && ` · ${cls.teacher}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(cls)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                          <Edit2 size={15} className="text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(cls._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                          <Trash2 size={15} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ClassModal
        open={classModal.open}
        onClose={() => setClassModal({ open: false, initial: null })}
        onSave={handleSave}
        initial={classModal.initial}
      />
      <AIUploadModal open={aiModal} onClose={() => setAiModal(false)} onImport={handleImport} />
    </div>
  );
}
