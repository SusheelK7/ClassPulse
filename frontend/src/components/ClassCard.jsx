import { useState } from 'react';
import { Clock, MapPin, User, Edit2, Trash2, StickyNote } from 'lucide-react';
import { formatTime, progressPercent, getCurrentTimeMinutes } from '../utils/timeUtils';
import { useNotes } from '../context/NoteContext';
import NoteModal from './NoteModal';

export default function ClassCard({ cls, status, onEdit, onDelete }) {
  const { notes } = useNotes();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const progress = status === 'current' ? progressPercent(cls.startTime, cls.endTime, getCurrentTimeMinutes()) : 0;
  const classNotes = notes.filter(n => n.classId === cls._id);

  const statusStyles = {
    current: 'ring-2 ring-green-400 dark:ring-green-500 bg-white/95 dark:bg-[#0d1222]/85 backdrop-blur-md shadow-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(34,197,94,0.12)]',
    upcoming: 'bg-white/95 dark:bg-[#0d1222]/75 backdrop-blur-md shadow-sm dark:shadow-[0_8px_25px_rgba(0,0,0,0.45)] hover:dark:shadow-[0_12px_32px_rgba(0,0,0,0.65),0_0_20px_rgba(59,130,246,0.12)] hover:-translate-y-0.5',
    ended: 'bg-gray-50/90 dark:bg-[#0d1222]/40 backdrop-blur-sm opacity-60 shadow-none',
    other: 'bg-white/95 dark:bg-[#0d1222]/75 backdrop-blur-md shadow-sm dark:shadow-[0_8px_25px_rgba(0,0,0,0.45)]'
  };

  const statusBadge = {
    current: <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Live now</span>,
    upcoming: <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Upcoming</span>,
    ended: <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">Ended</span>,
    other: null
  };

  return (
    <>
      <div className={`relative rounded-2xl border border-gray-200/80 dark:border-gray-800/80 p-4 transition-all duration-200 ${statusStyles[status]}`}>
        {status === 'current' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 rounded-b-2xl overflow-hidden">
            <div className="h-full bg-green-400 dark:bg-green-500 transition-all duration-1000 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        )}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {statusBadge[status]}
              {cls.code && <span className="text-xs text-gray-400 font-mono">{cls.code}</span>}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{cls.subject}</h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Notes icon with count */}
            <button onClick={() => setShowNoteModal(true)}
              className="relative flex items-center gap-1 p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition">
              <StickyNote size={14} />
              {classNotes.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] font-bold flex items-center justify-center">
                  {classNotes.length}
                </span>
              )}
            </button>
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cls.color || '#3B82F6' }} />
          </div>
        </div>
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={13} />{formatTime(cls.startTime)} – {formatTime(cls.endTime)}
          </div>
          {cls.room && <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><MapPin size={13} />{cls.room}</div>}
          {cls.teacher && <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><User size={13} />{cls.teacher}</div>}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2 pt-2.5 border-t border-gray-100 dark:border-gray-800">
            {onEdit && <button onClick={() => onEdit(cls)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"><Edit2 size={13} />Edit</button>}
            {onDelete && <button onClick={() => onDelete(cls._id)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors font-medium ml-auto"><Trash2 size={13} />Delete</button>}
          </div>
        )}
      </div>
      <NoteModal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} initialClass={cls} />
    </>
  );
}
