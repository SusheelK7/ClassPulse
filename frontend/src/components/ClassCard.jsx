import { Clock, MapPin, User, Edit2, Trash2 } from 'lucide-react';
import { formatTime, progressPercent, getCurrentTimeMinutes } from '../utils/timeUtils';

export default function ClassCard({ cls, status, onEdit, onDelete }) {
  const progress = status === 'current' ? progressPercent(cls.startTime, cls.endTime, getCurrentTimeMinutes()) : 0;

  const statusStyles = {
    current: 'ring-2 ring-green-400 dark:ring-green-500 bg-white dark:bg-gray-900',
    upcoming: 'bg-white dark:bg-gray-900',
    ended: 'bg-gray-50 dark:bg-gray-900/50 opacity-60',
    other: 'bg-white dark:bg-gray-900'
  };

  const statusBadge = {
    current: <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Live now</span>,
    upcoming: <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Upcoming</span>,
    ended: <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">Ended</span>,
    other: null
  };

  return (
    <div className={`relative rounded-2xl border border-gray-200 dark:border-gray-800 p-4 transition-all ${statusStyles[status]}`}>
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
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full mt-0.5" style={{ backgroundColor: cls.color || '#3B82F6' }} />
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
  );
}
