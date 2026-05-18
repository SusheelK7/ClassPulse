import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useClasses } from '../context/ClassContext';
import { LayoutDashboard, CalendarDays, Sun, Moon, LogOut, BookOpen, Menu, X, User, StickyNote, Bell, BellOff } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useNotifications } from '../hooks/useNotifications';

function MobileBellButton({ classes }) {
  const { requestPermission } = useNotifications(classes);
  const [perm, setPerm] = useState(Notification.permission);
  const handleClick = async () => {
    if (perm === 'default') { const r = await requestPermission(); setPerm(r); }
  };
  if (perm === 'denied') return null;
  return (
    <button onClick={handleClick} className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${perm === 'granted' ? 'text-primary-500' : 'text-gray-500'}`}>
      <Bell size={18} />
    </button>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { classes } = useClasses();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/schedule', icon: CalendarDays, label: 'Schedule' },
    { to: '/notes', icon: StickyNote, label: 'Notes' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-display font-600 text-gray-900 dark:text-white text-lg">ClassPulse</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(to) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}>
              <Icon size={18} />{label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <NotificationBell classes={classes} />
          <button onClick={toggle} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 mt-2">
            <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <User size={13} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.section || user?.program || 'Student'}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <LogOut size={18} />Log out
          </button>
        </div>
      </aside>

      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"><BookOpen size={16} className="text-white" /></div>
          <span className="font-display font-600 text-gray-900 dark:text-white">ClassPulse</span>
        </div>
        <div className="flex items-center gap-1">
          <MobileBellButton classes={classes} />
          <button onClick={toggle} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button onClick={() => setMenuOpen(m => !m)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </header>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-20 pt-14">
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 space-y-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(to) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
                <Icon size={18} />{label}
              </Link>
            ))}
            <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500"><LogOut size={18} />Log out</button>
          </div>
          <div className="flex-1" onClick={() => setMenuOpen(false)} />
        </div>
      )}
      <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">{children}</main>
    </div>
  );
}
