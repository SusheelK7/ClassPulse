import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useClasses } from '../context/ClassContext';
import { LayoutDashboard, CalendarDays, Sun, Moon, LogOut, BookOpen, Menu, X, User, StickyNote, Bell } from 'lucide-react';
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
    <motion.button 
      whileTap={{ scale: 0.9 }}
      onClick={handleClick} 
      className={`p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${perm === 'granted' ? 'text-primary-500' : 'text-gray-500'}`}
    >
      <Bell size={18} />
    </motion.button>
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
    <div className="min-h-screen bg-transparent relative">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-white/90 dark:bg-[#0c101d]/85 backdrop-blur-2xl border-r border-gray-200/80 dark:border-gray-800/80 z-30 shadow-sm dark:shadow-[4px_0_30px_rgba(0,0,0,0.6)]">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800/80">
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/25 dark:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              <BookOpen size={19} className="text-white transform group-hover:scale-110 transition-transform" />
            </motion.div>
            <div>
              <span className="font-display font-700 text-gray-900 dark:text-white text-lg tracking-tight block">
                ClassPulse
              </span>
              <span className="text-[11px] text-primary-600 dark:text-primary-400 font-medium">
                Academic Hub
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {navLinks.map(({ to, icon: Icon, label }) => {
            const active = isActive(to);
            return (
              <Link 
                key={to} 
                to={to}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active 
                    ? 'text-primary-700 dark:text-primary-300 font-semibold' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-gray-800/40'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeSidebarNav"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="absolute inset-0 bg-primary-50/90 dark:bg-primary-900/30 rounded-xl border border-primary-200/60 dark:border-primary-700/50 shadow-xs -z-0"
                  />
                )}
                <Icon size={18} className={`relative z-10 ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800/80 space-y-1.5">
          <NotificationBell classes={classes} />
          
          <motion.button 
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggle} 
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 transition-colors"
          >
            <motion.div
              initial={false}
              animate={{ rotate: dark ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </motion.div>
            <span>{dark ? 'Light mode' : 'Dark mode'}</span>
          </motion.button>

          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gray-50/90 dark:bg-gray-800/50 border border-gray-100/80 dark:border-gray-700/40 mt-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center shrink-0">
              <User size={15} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.section || user?.program || 'Student'}</p>
            </div>
          </div>

          <motion.button 
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout} 
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </motion.button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 dark:bg-[#0c101d]/85 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between px-4 z-30 shadow-sm dark:shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-display font-700 text-gray-900 dark:text-white">ClassPulse</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <MobileBellButton classes={classes} />
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={toggle} 
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen((m) => !m)} 
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </motion.button>
        </div>
      </header>

      {/* Mobile Dropdown Nav Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden fixed inset-x-0 top-14 z-20 bg-white/95 dark:bg-[#0c101d]/95 backdrop-blur-2xl border-b border-gray-200 dark:border-gray-800/80 shadow-2xl p-4 space-y-1.5 overflow-hidden"
          >
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link 
                key={to} 
                to={to} 
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(to) 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => { setMenuOpen(false); logout(); }} 
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={18} />
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="md:ml-64 pt-14 md:pt-0 min-h-screen">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
