import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  classStatus, formatTime12, getProgressPercent,
  getTimeUntil, getTimeAgo, getTodayKey, DAY_FULL,
  daysUntil, formatDate, getTodayString
} from '../utils/time';
import { Clock, BookOpen, ChevronRight, CalendarCheck, AlertTriangle, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';

function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow" />
      LIVE
    </span>
  );
}

function ClassCard({ cls, status }) {
  const [progress, setProgress] = useState(getProgressPercent(cls));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (status !== 'current') return;
    const id = setInterval(() => { setProgress(getProgressPercent(cls)); setNow(Date.now()); }, 30000);
    return () => clearInterval(id);
  }, [cls, status]);

  const statusStyles = {
    current: 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10',
    upcoming: 'border-brand-200 dark:border-brand-800 bg-brand-50/30 dark:bg-brand-900/10',
    past: 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 opacity-60',
  };

  return (
    <div className={`card border p-4 ${statusStyles[status] || statusStyles.past} animate-fade-in`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: cls.color || '#6366f1' }} />
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm leading-tight">{cls.subject}</p>
            {cls.teacher && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cls.teacher}</p>}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {status === 'current' && <LiveBadge />}
          {status === 'upcoming' && getTimeUntil(cls.startTime) && (
            <span className="text-xs font-medium text-brand-600 dark:text-brand-400">in {getTimeUntil(cls.startTime)}</span>
          )}
          {status === 'past' && (
            <span className="text-xs text-gray-400">ended {getTimeAgo(cls.endTime)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
        <span className="flex items-center gap-1"><Clock size={11} />{formatTime12(cls.startTime)} – {formatTime12(cls.endTime)}</span>
        {cls.room && <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">{cls.room}</span>}
      </div>

      {status === 'current' && (
        <div>
          <div className="flex justify-between text-[11px] text-gray-400 mb-1">
            <span>Progress</span><span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const today = getTodayKey();

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [clsRes, dlRes] = await Promise.all([
        api.get('/classes'),
        api.get('/deadlines')
      ]);
      setClasses(clsRes.data.classes);
      setDeadlines(dlRes.data.deadlines.filter(d => !d.completed && daysUntil(d.dueDate) <= 7).slice(0, 5));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const todayClasses = classes
    .filter(c => c.day === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const currentClass = todayClasses.find(c => classStatus(c) === 'current');
  const upcomingClasses = todayClasses.filter(c => classStatus(c) === 'upcoming');
  const pastClasses = todayClasses.filter(c => classStatus(c) === 'past');

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{greeting()}</p>
        <h1 className="font-display font-semibold text-2xl text-gray-900 dark:text-white mt-0.5">
          {user?.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {DAY_FULL[today]}, {time.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Today's classes", value: todayClasses.length, icon: BookOpen, color: 'text-brand-500' },
          { label: 'Currently running', value: currentClass ? 1 : 0, icon: Wifi, color: 'text-green-500' },
          { label: 'Upcoming today', value: upcomingClasses.length, icon: Clock, color: 'text-blue-500' },
          { label: 'Due this week', value: deadlines.length, icon: AlertTriangle, color: 'text-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <Icon size={15} className={color} />
            </div>
            <p className="font-display font-semibold text-2xl text-gray-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-medium text-gray-900 dark:text-white">Today's schedule</h2>
            <Link to="/timetable" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
              Full timetable <ChevronRight size={13} />
            </Link>
          </div>

          {todayClasses.length === 0 ? (
            <div className="card p-8 text-center">
              <CalendarCheck size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="font-medium text-gray-500 dark:text-gray-400 text-sm">No classes today</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Enjoy your free day!</p>
            </div>
          ) : (
            <>
              {currentClass && <ClassCard cls={currentClass} status="current" />}
              {upcomingClasses.map(cls => <ClassCard key={cls._id} cls={cls} status="upcoming" />)}
              {pastClasses.slice(-2).map(cls => <ClassCard key={cls._id} cls={cls} status="past" />)}
            </>
          )}
        </div>

        {/* Sidebar: Upcoming deadlines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-medium text-gray-900 dark:text-white">Deadlines</h2>
            <Link to="/deadlines" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
              All <ChevronRight size={13} />
            </Link>
          </div>

          {deadlines.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-2">
              {deadlines.map(dl => {
                const days = daysUntil(dl.dueDate);
                const urgent = days <= 1;
                return (
                  <div key={dl._id} className="card p-3 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{dl.title}</p>
                        {dl.subject && <p className="text-xs text-gray-400 truncate">{dl.subject}</p>}
                      </div>
                      <span className={`badge flex-shrink-0 ${urgent ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                        {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Weekly preview */}
          <div className="card p-4 mt-4">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">This week</h3>
            <div className="space-y-1.5">
              {['Mo','Tu','We','Th','Fr'].map(day => {
                const count = classes.filter(c => c.day === day).length;
                const isToday = day === today;
                return (
                  <div key={day} className={`flex items-center justify-between py-1 px-2 rounded-lg ${isToday ? 'bg-brand-50 dark:bg-brand-500/10' : ''}`}>
                    <span className={`text-xs font-medium ${isToday ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {DAY_FULL[day].slice(0, 3)}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-brand-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      ))}
                      {count === 0 && <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
