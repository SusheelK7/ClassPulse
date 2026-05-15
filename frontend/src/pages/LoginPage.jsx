import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-brand-500 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-display font-semibold text-white text-lg">ClassSync</span>
        </div>
        <div>
          <h1 className="font-display font-semibold text-4xl text-white leading-tight mb-4">
            Never miss a class again.
          </h1>
          <p className="text-brand-100 text-lg leading-relaxed">
            Your smart student schedule — see what's happening now, what's coming next, and stay on top of every deadline.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[['Live tracking', 'Know exactly which class is running'], ['AI import', 'Upload timetable photo to auto-fill'], ['Attendance', 'Track your presence per subject']].map(([t, d]) => (
            <div key={t} className="bg-white/10 rounded-2xl p-4">
              <p className="font-medium text-white text-sm mb-1">{t}</p>
              <p className="text-brand-100 text-xs">{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-display font-semibold text-xl text-gray-900 dark:text-white">ClassSync</span>
          </div>

          <h2 className="font-display font-semibold text-2xl text-gray-900 dark:text-white mb-1">Sign in</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Welcome back! Enter your details.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@university.edu"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => set('password', e.target.value)} required />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 hover:text-brand-600 font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
