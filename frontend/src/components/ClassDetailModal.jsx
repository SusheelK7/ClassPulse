import { useState } from 'react';
import { X, Clock, MapPin, User, Tag, Calendar, StickyNote, Edit2, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { DAY_NAMES, formatTime, formatDuration } from '../utils/timeUtils';
import { useNotes } from '../context/NoteContext';
import NoteModal from './NoteModal';

export default function ClassDetailModal({ isOpen, onClose, cls, status, onEdit, onDelete }) {
  const { notes } = useNotes();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !cls) return null;

  const classNotes = notes.filter(n => n.classId === cls._id);
  const duration = formatDuration(cls.startTime, cls.endTime);

  const statusBadge = {
    current: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Live now
      </span>
    ),
    upcoming: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
        Upcoming
      </span>
    ),
    ended: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        Ended
      </span>
    ),
    other: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
        {DAY_NAMES[cls.day] || cls.day}
      </span>
    )
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (onDelete) {
      onDelete(cls._id);
      onClose();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div className="relative bg-white dark:bg-[#0d1222] rounded-3xl border border-gray-200/90 dark:border-gray-800/90 w-full max-w-lg shadow-2xl overflow-hidden transition-all">
          {/* Subtle colored accent line at top */}
          <div
            className="h-1.5 w-full"
            style={{ backgroundColor: cls.color || '#3B82F6' }}
          />

          {/* Header */}
          <div className="flex items-start justify-between p-5 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {statusBadge[status] || statusBadge.other}
              {cls.code && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-gray-100 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  <Tag size={11} className="text-gray-400" />
                  {cls.code}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Title banner */}
          <div className="px-6 pb-4">
            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white leading-tight">
              {cls.subject}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
              <Calendar size={13} className="text-primary-500" />
              <span>{DAY_NAMES[cls.day] || cls.day} schedule</span>
            </p>
          </div>

          {/* Detail cards list / grid */}
          <div className="px-6 space-y-3 max-h-[58vh] overflow-y-auto pb-6">
            {/* Class Time highlight card */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/25 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">Class Time</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatTime(cls.startTime)} – {formatTime(cls.endTime)}
                  </p>
                </div>
              </div>
              {duration && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#0d1222] text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 shadow-xs">
                  {duration}
                </span>
              )}
            </div>

            {/* Room and Teacher 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Class Room */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Class Room / Lab</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {cls.room || <span className="text-gray-400 font-normal italic">Not specified</span>}
                  </p>
                </div>
              </div>

              {/* Teacher */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-100 dark:border-amber-900/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <User size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">Teacher / Instructor</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {cls.teacher || <span className="text-gray-400 font-normal italic">Not assigned</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Class Code & Day grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-gray-50/90 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-200/70 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                  <Tag size={17} />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Class Code</p>
                  <p className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200">
                    {cls.code || 'None'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50/90 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-200/70 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                  <Calendar size={17} />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Day</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {DAY_NAMES[cls.day] || cls.day}
                  </p>
                </div>
              </div>
            </div>

            {/* Class Extra Notes */}
            {cls.notes && (
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-800">
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <BookOpen size={13} /> Class Notes / Syllabus Info
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {cls.notes}
                </p>
              </div>
            )}

            {/* Student study notes counter / quick link */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/25 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <StickyNote size={19} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {classNotes.length === 0 ? 'No study notes saved' : `${classNotes.length} saved study note${classNotes.length > 1 ? 's' : ''}`}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Keep personal revision & assignment notes</p>
                </div>
              </div>
              <button
                onClick={() => setShowNoteModal(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm"
              >
                {classNotes.length > 0 ? 'View notes' : '+ Add note'}
              </button>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(cls);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-800 transition"
                >
                  <Edit2 size={13} />
                  Edit class
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    confirmDelete
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                  }`}
                >
                  <Trash2 size={13} />
                  {confirmDelete ? 'Confirm delete' : 'Delete'}
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <NoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        initialClass={cls}
      />
    </>
  );
}
