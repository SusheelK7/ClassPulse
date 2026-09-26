import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  GraduationCap, 
  CalendarDays, 
  Layers, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';
import { validatePassword, getPasswordChecks } from '../utils/passwordValidation';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    program: '',
    semester: '',
    section: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const checks = getPasswordChecks(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const passwordCheck = validatePassword(form.password);
    if (!passwordCheck.valid) return setError(passwordCheck.message);
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      await register(form);
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition text-sm shadow-sm";
  const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <AuthLayout
      activeTab="register"
      title="Create account"
      subtitle="Join ClassPulse to organize lectures, schedules & tasks"
    >
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 mb-5 text-xs sm:text-sm font-medium"
          >
            <AlertCircle size={17} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className={labelCls}>Full name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
              <User size={16} />
            </div>
            <input
              required
              className={inputCls}
              placeholder="e.g. Alex Henderson"
              value={form.name}
              onChange={set('name')}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelCls}>Student Email</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
              <Mail size={16} />
            </div>
            <input
              type="email"
              required
              className={inputCls}
              placeholder="student@university.edu"
              value={form.email}
              onChange={set('email')}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className={labelCls}>Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className={`${inputCls} pr-11`}
              placeholder="Create a strong password"
              value={form.password}
              onChange={set('password')}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password Checks Live Feedback */}
          {(passwordFocused || form.password) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-1.5"
            >
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-1.5 text-[11px]">
                  {c.met ? (
                    <Check size={13} className="text-emerald-500 font-bold shrink-0" />
                  ) : (
                    <X size={13} className="text-gray-400 shrink-0" />
                  )}
                  <span className={c.met ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-400'}>
                    {c.label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className={labelCls}>Confirm password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
              <Lock size={16} />
            </div>
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              className={`${inputCls} pr-11`}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              tabIndex={-1}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Academic Details (Grid) */}
        <div className="pt-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            Academic Information (Optional)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500">
                  <GraduationCap size={15} />
                </div>
                <input
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition text-xs sm:text-sm"
                  placeholder="Program (BSCS)"
                  value={form.program}
                  onChange={set('program')}
                />
              </div>
            </div>
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500">
                  <CalendarDays size={15} />
                </div>
                <input
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition text-xs sm:text-sm"
                  placeholder="Semester (Fall 25)"
                  value={form.semester}
                  onChange={set('semester')}
                />
              </div>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500">
                <Layers size={15} />
              </div>
              <input
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition text-xs sm:text-sm"
                placeholder="Section / Cohort (e.g. ADSCS-I-A)"
                value={form.section}
                onChange={set('section')}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-md shadow-primary-500/25 dark:shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Get Started with ClassPulse</span>
              <ArrowRight size={16} />
            </>
          )}
        </motion.button>
      </form>

      {/* Alternative prompt */}
      <div className="mt-5 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}