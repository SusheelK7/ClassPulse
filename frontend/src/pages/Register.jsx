import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, BookOpen, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import { validatePassword, getPasswordChecks } from '../utils/passwordValidation';

export default function Register() {
  const { register } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', program: '', semester: '', section: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const checks = getPasswordChecks(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const passwordCheck = validatePassword(form.password);
    if (!passwordCheck.valid) return setError(passwordCheck.message);
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      const data = await register(form);
      navigate('/verify-email', { state: { email: form.email } });
    }
    catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative">
      <button onClick={toggle} className="fixed top-4 right-4 p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors z-20">
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-500/25 dark:shadow-[0_0_30px_rgba(37,99,235,0.35)]">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-700 text-gray-900 dark:text-white">Create account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Join ClassPulse and manage your schedule</p>
        </div>
        <div className="bg-white/95 dark:bg-[#0c101d]/85 backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-gray-800/80 p-8 shadow-xl shadow-gray-200/50 dark:shadow-[0_20px_50px_rgba(0,0,0,0.75),0_0_35px_rgba(37,99,235,0.12)]">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 mb-5 text-sm"
            >
              <AlertCircle size={16} />{error}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className={labelCls}>Full name</label><input required className={inputCls} placeholder="Your name" value={form.name} onChange={set('name')} /></div>
            <div><label className={labelCls}>Email</label><input type="email" required className={inputCls} placeholder="student@university.edu" value={form.email} onChange={set('email')} /></div>

            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
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
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {(passwordFocused || form.password) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 space-y-1"
                >
                  {checks.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5 text-xs">
                      {c.met ? <Check size={12} className="text-green-500" /> : <X size={12} className="text-gray-400" />}
                      <span className={c.met ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>{c.label}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            <div>
              <label className={labelCls}>Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  className={`${inputCls} pr-11`}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Program</label><input className={inputCls} placeholder="e.g. BSCS" value={form.program} onChange={set('program')} /></div>
              <div><label className={labelCls}>Semester</label><input className={inputCls} placeholder="e.g. Fall 2025" value={form.semester} onChange={set('semester')} /></div>
            </div>
            <div><label className={labelCls}>Section</label><input className={inputCls} placeholder="e.g. ADSCS-I-A" value={form.section} onChange={set('section')} /></div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors shadow-sm text-sm">
              {loading ? 'Creating account...' : 'Create account'}
            </motion.button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}