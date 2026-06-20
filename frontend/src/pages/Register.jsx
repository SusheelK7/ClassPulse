import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, BookOpen, AlertCircle } from 'lucide-react';
import { validatePassword, PASSWORD_HINT } from '../utils/passwordValidation';

export default function Register() {
  const { register } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', program: '', semester: '', section: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const passwordCheck = validatePassword(form.password);
    if (!passwordCheck.valid) return setError(passwordCheck.message);
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try { await register(form); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <button onClick={toggle} className="fixed top-4 right-4 p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-200 dark:shadow-primary-900/30">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-700 text-gray-900 dark:text-white">Create account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Join ClassPulse and manage your schedule</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle size={16} />{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className={labelCls}>Full name</label><input required className={inputCls} placeholder="Your name" value={form.name} onChange={set('name')} /></div>
            <div><label className={labelCls}>Email</label><input type="email" required className={inputCls} placeholder="student@university.edu" value={form.email} onChange={set('email')} /></div>
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" required className={inputCls} placeholder="Create a strong password" value={form.password} onChange={set('password')} />
              <p className="text-xs text-gray-400 mt-1.5">{PASSWORD_HINT}</p>
            </div>
            <div>
              <label className={labelCls}>Confirm password</label>
              <input type="password" required className={inputCls} placeholder="Re-enter your password" value={form.confirmPassword} onChange={set('confirmPassword')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Program</label><input className={inputCls} placeholder="e.g. BSCS" value={form.program} onChange={set('program')} /></div>
              <div><label className={labelCls}>Semester</label><input className={inputCls} placeholder="e.g. Fall 2025" value={form.semester} onChange={set('semester')} /></div>
            </div>
            <div><label className={labelCls}>Section</label><input className={inputCls} placeholder="e.g. ADSCS-I-A" value={form.section} onChange={set('section')} /></div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors shadow-sm text-sm">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
