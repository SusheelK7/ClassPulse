import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  BookOpen, 
  Sun, 
  Moon, 
  Clock, 
  CalendarDays, 
  Bell, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  GraduationCap, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function AuthLayout({ children, activeTab, title, subtitle }) {
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden select-none">
      {/* Top Navbar Bar with Brand & Theme Toggle */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-20 mb-4 sm:mb-8">
        <Link to="/" className="flex items-center gap-3 group focus:outline-none">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-primary-500/25 dark:shadow-[0_0_25px_rgba(37,99,235,0.45)] ring-1 ring-white/20"
          >
            <BookOpen size={20} className="text-white transform group-hover:scale-110 transition-transform" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-700 text-xl sm:text-2xl text-gray-900 dark:text-white tracking-tight">
                ClassPulse
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700/50">
                v2.0
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400 font-medium tracking-wide">
              Smart Academic Workspace
            </p>
          </div>
        </Link>

        {/* Theme switcher with micro-animation */}
        <motion.button 
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggle} 
          aria-label="Toggle dark/light theme"
          className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#0f1424]/80 backdrop-blur-xl border border-gray-200/80 dark:border-gray-800/80 shadow-md text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-700 transition-colors z-30"
        >
          <motion.div
            initial={false}
            animate={{ rotate: dark ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {dark ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} className="text-indigo-600" />}
          </motion.div>
        </motion.button>
      </header>

      {/* Main Split Section (Left Showcase & Right Form) */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex items-center justify-center z-10 my-auto py-2 sm:py-6">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ================= LEFT SECTION: Visual Brand Showcase ================= */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8"
          >
            {/* Pill Tag */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-primary-500/10 via-indigo-500/10 to-sky-500/10 dark:from-primary-500/20 dark:via-indigo-500/20 dark:to-sky-500/20 border border-primary-500/20 dark:border-primary-500/30 text-primary-700 dark:text-primary-300 text-xs sm:text-sm font-medium w-fit shadow-sm"
            >
              <Sparkles size={14} className="text-primary-500 animate-pulse" />
              <span>Intelligent Timetable & Lecture Management</span>
            </motion.div>

            {/* Hero Title & Subtext */}
            <div className="space-y-3 sm:space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="font-display font-700 text-3xl sm:text-4xl md:text-5xl lg:text-[46px] leading-[1.12] text-gray-900 dark:text-white tracking-tight"
              >
                Master your academic schedule with{' '}
                <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent dark:from-primary-400 dark:via-indigo-300 dark:to-sky-300">
                  effortless clarity.
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-gray-600 dark:text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl"
              >
                Track live lectures, receive sound & web alert reminders before class starts, organize notes per subject, and conquer your semester with confidence.
              </motion.p>
            </div>

            {/* Interactive Live Mockup Showcase Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="relative"
            >
              {/* Animated Floating Notification Pill */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="hidden sm:flex absolute -top-5 -right-3 sm:-right-4 z-20 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-[#11172a]/95 backdrop-blur-xl border border-primary-200/80 dark:border-primary-700/60 shadow-xl shadow-primary-500/10 text-xs font-medium text-gray-800 dark:text-gray-200"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Bell size={13} className="animate-bounce" />
                </div>
                <div>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">Class Alert: </span>
                  Starts in 10 mins!
                </div>
              </motion.div>

              {/* Main Simulated Live Class Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-white/90 to-white/70 dark:from-[#0d1222]/90 dark:to-[#090d19]/90 backdrop-blur-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_35px_rgba(37,99,235,0.15)] relative overflow-hidden group">
                {/* Subtle card glow accent */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-gray-800/70">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Live Pulse • Ongoing
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 text-xs">
                    <Clock size={12} className="text-primary-500" />
                    <span>10:30 AM — 12:00 PM</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-bold">
                        CS-304
                      </span>
                      <h2 className="font-display font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                        Advanced Software Engineering
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Prof. Dr. Sarah Jenkins • Room 402, Science Hall
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-gray-800/60">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Attendance</span>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <TrendingUp size={14} />
                      <span>96% Optimal</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar of Current Lecture */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Session Progress: 48m elapsed</span>
                    <span className="font-semibold text-primary-600 dark:text-primary-400">42m remaining</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "54%" }}
                      transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Upcoming Schedule Mini Preview */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={13} className="text-gray-400" />
                    <span>Next up: Database Systems (2:00 PM)</span>
                  </div>
                  <span className="hidden sm:inline-flex text-[11px] text-primary-600 dark:text-primary-400 font-medium">
                    Lab 2B • Today
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Feature Highlights Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2"
            >
              {[
                { icon: Clock, title: 'Smart Timetable', desc: 'Real-time schedule pulses' },
                { icon: Bell, title: 'Class Alerts', desc: 'Audio & push notifications' },
                { icon: Layers, title: 'Lecture Notes', desc: 'Synchronized with subjects' },
              ].map(({ icon: Icon, title, desc }) => (
                <div 
                  key={title}
                  className="flex items-center sm:flex-col sm:items-start gap-3 p-3 rounded-2xl bg-white/60 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60 backdrop-blur-md hover:border-primary-400/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{title}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Social Trust / Student Counter */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex items-center gap-3 pt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  AK
                </div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gradient-to-tr from-purple-500 to-pink-500 text-white text-[10px] flex items-center justify-center font-bold">
                  SL
                </div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white text-[10px] flex items-center justify-center font-bold">
                  MR
                </div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] flex items-center justify-center font-bold">
                  +2k
                </div>
              </div>
              <p>
                Trusted by students from Computer Science, Engineering, and Business departments.
              </p>
            </motion.div>
          </motion.div>

          {/* ================= RIGHT SECTION: Authentication Form ================= */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 xl:col-span-5 w-full flex flex-col justify-center"
          >
            <div className="w-full bg-white/95 dark:bg-[#0c101d]/90 backdrop-blur-2xl rounded-3xl border border-gray-200/80 dark:border-gray-800/80 p-6 sm:p-8 lg:p-9 shadow-2xl shadow-gray-200/40 dark:shadow-[0_20px_50px_rgba(0,0,0,0.75),0_0_35px_rgba(37,99,235,0.12)] relative">
              
              {/* Top Tab Switcher (Sign In vs Register) */}
              {activeTab && (
                <div className="flex items-center p-1 bg-gray-100/90 dark:bg-gray-800/70 rounded-2xl mb-7 relative border border-gray-200/60 dark:border-gray-700/60">
                  <Link
                    to="/login"
                    className={`flex-1 text-center py-2 text-xs sm:text-sm font-semibold rounded-xl relative z-10 transition-colors ${
                      activeTab === 'login'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {activeTab === 'login' && (
                      <motion.div
                        layoutId="activeAuthTab"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="absolute inset-0 bg-white dark:bg-[#151c30] rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700/80"
                      />
                    )}
                    <span className="relative z-10">Sign in</span>
                  </Link>

                  <Link
                    to="/register"
                    className={`flex-1 text-center py-2 text-xs sm:text-sm font-semibold rounded-xl relative z-10 transition-colors ${
                      activeTab === 'register'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {activeTab === 'register' && (
                      <motion.div
                        layoutId="activeAuthTab"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="absolute inset-0 bg-white dark:bg-[#151c30] rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700/80"
                      />
                    )}
                    <span className="relative z-10">Create account</span>
                  </Link>
                </div>
              )}

              {/* Form Heading & Subheading */}
              <div className="mb-6">
                <h2 className="font-display font-700 text-2xl sm:text-3xl text-gray-900 dark:text-white tracking-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-xs sm:text-sm">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Child Form Component */}
              {children}

            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 text-[12px] text-gray-400 dark:text-gray-500 z-10">
        <p>© {new Date().getFullYear()} ClassPulse. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="hover:text-primary-500 transition-colors cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-primary-500 transition-colors cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:text-primary-500 transition-colors cursor-pointer">Help & Support</span>
        </div>
      </footer>
    </div>
  );
}
