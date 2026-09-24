import { useState } from 'react';
import { Clock, MapPin, User, Tag, Calendar, Edit2, Trash2, StickyNote, ChevronDown, BookOpen, ExternalLink } from 'lucide-react';
import { formatTime, formatDuration, progressPercent, getCurrentTimeMinutes, DAY_NAMES } from '../utils/timeUtils';
import { useNotes } from '../context/NoteContext';
import NoteModal from './NoteModal';
import ClassDetailModal from './ClassDetailModal';

export default function ClassCard({ cls, status = 'other', onEdit, onDelete }) {
  const { notes } = useNotes();
  const [showDetails, setShowDetails] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const progress = status === 'current' ? progressPercent(cls.startTime, cls.endTime, getCurrentTimeMinutes()) : 0;
  const classNotes = notes.filter(n => n.classId === cls._id);
  const duration = formatDuration(cls.startTime, cls.endTime);

  const statusStyles = {
    current: 'ring-2 ring-emerald-400 dark:ring-emerald-500 bg-white/95 dark:bg-[#0d1222]/85 backdrop-blur-md shadow-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.12)]',
    upcoming: 'bg-white/95 dark:bg-[#0d1222]/75 backdrop-blur-md shadow-sm dark:shadow-[0_8px_25px_rgba(0,0,0,0.45)] hover:dark:shadow-[0_12px_32px_rgba(0,0,0,0.65),0_0_20px_rgba(59,130,246,0.12)] hover:-translate-y-0.5',
    ended: 'bg-gray-50/90 dark:bg-[#0d1222]/40 backdrop-blur-sm opacity-70 shadow-none',
    other: 'bg-white/95 dark:bg-[#0d1222]/75 backdrop-blur-md shadow-sm dark:shadow-[0_8px_25px_rgba(0,0,0,0.45)] hover:dark:shadow-[0_12px_32px_rgba(0,0,0,0.65),0_0_20px_rgba(59,130,246,0.12)]'
  };

  const statusBadge = {
    current: (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live now
      </span>
    ),
    upcoming: (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
        Upcoming
      </span>
    ),
    ended: (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        Ended
      </span>
    ),
    other: null
  };

  return (
    <>
      <div className={`relative rounded-2xl border border-gray-200/80 dark:border-gray-800/80 p-4 transition-all duration-200 ${statusStyles[status] || statusStyles.other}`}>
        {/* Progress bar for live running class */}
        {status === 'current' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-1000 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Top bar: Status & Color dot & Notes count */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {statusBadge[status]}
            {status === 'other' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400">
                {DAY_NAMES[cls.day] || cls.day}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Notes button with badge */}
            <button
              onClick={() => setShowNoteModal(true)}
              className="relative flex items-center gap-1 p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition"
              title="Class study notes"
            >
              <StickyNote size={14} />
              {classNotes.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {classNotes.length}
                </span>
              )}
            </button>
            <div
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#0d1222]"
              style={{ backgroundColor: cls.color || '#3B82F6' }}
              title="Class color tag"
            />
          </div>
        </div>

        {/* Highlighted Detail 1: Class Name */}
        <div className="mb-3">
          <h3
            className="font-bold text-gray-900 dark:text-white text-base leading-snug tracking-tight hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
            onClick={() => setShowDetailModal(true)}
            title="Click to view full details"
          >
            {cls.subject}
          </h3>
        </div>

        {/* Highlighted Details 2 & 3: Class Time and Class Room (Prominently Highlighted Above) */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          {/* Class Time Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 shadow-xs">
            <Clock size={13} className="text-blue-500 shrink-0" />
            <span>{formatTime(cls.startTime)} – {formatTime(cls.endTime)}</span>
          </div>

          {/* Class Room Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50 shadow-xs">
            <MapPin size={13} className="text-emerald-500 shrink-0" />
            <span>{cls.room || 'Room TBA'}</span>
          </div>
        </div>

        {/* Card Footer Bar: "More details" toggle & Quick Actions */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-gray-800">
          {/* More details trigger */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 py-1 px-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
          >
            <span>{showDetails ? 'Less details' : 'More details'}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Quick Edit and Delete buttons */}
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(cls)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Edit class"
              >
                <Edit2 size={13} />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(cls._id)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors font-medium p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Delete class"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable "More details" section */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-800/80 animate-fade-in space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              <span>Full Details</span>
              <button
                onClick={() => setShowDetailModal(true)}
                className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline normal-case text-xs font-semibold"
              >
                <ExternalLink size={12} />
                Modal view
              </button>
            </div>

            {/* Structured details rows */}
            <div className="grid grid-cols-1 gap-2 text-xs bg-gray-50/80 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/60">
              {/* Class Name */}
              <div className="flex items-start justify-between gap-2 py-0.5">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 shrink-0">
                  <BookOpen size={12} className="text-gray-400" />
                  Class name:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-right">
                  {cls.subject}
                </span>
              </div>

              {/* Class Time & Duration */}
              <div className="flex items-start justify-between gap-2 py-0.5">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 shrink-0">
                  <Clock size={12} className="text-gray-400" />
                  Class time:
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-right">
                  {formatTime(cls.startTime)} – {formatTime(cls.endTime)} {duration && <span className="text-gray-400 text-[11px]">({duration})</span>}
                </span>
              </div>

              {/* Teacher Name */}
              <div className="flex items-start justify-between gap-2 py-0.5">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 shrink-0">
                  <User size={12} className="text-gray-400" />
                  Teacher name:
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-right">
                  {cls.teacher || <span className="text-gray-400 italic">Not assigned</span>}
                </span>
              </div>

              {/* Class Code */}
              <div className="flex items-start justify-between gap-2 py-0.5">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 shrink-0">
                  <Tag size={12} className="text-gray-400" />
                  Class code:
                </span>
                <span className="font-mono font-medium text-gray-900 dark:text-white text-right">
                  {cls.code || <span className="text-gray-400 font-sans italic">None</span>}
                </span>
              </div>

              {/* Class Room No */}
              <div className="flex items-start justify-between gap-2 py-0.5">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 shrink-0">
                  <MapPin size={12} className="text-gray-400" />
                  Class room no:
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-right">
                  {cls.room || <span className="text-gray-400 italic">Not set</span>}
                </span>
              </div>

              {/* Day of Week */}
              <div className="flex items-start justify-between gap-2 py-0.5">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 shrink-0">
                  <Calendar size={12} className="text-gray-400" />
                  Schedule day:
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-right">
                  {DAY_NAMES[cls.day] || cls.day}
                </span>
              </div>

              {/* Extra notes if present */}
              {cls.notes && (
                <div className="pt-2 mt-1 border-t border-gray-200/60 dark:border-gray-800">
                  <p className="text-[11px] font-medium text-gray-400 mb-0.5">Notes:</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {cls.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Note modal */}
      <NoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        initialClass={cls}
      />

      {/* Full detail modal */}
      <ClassDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        cls={cls}
        status={status}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}
