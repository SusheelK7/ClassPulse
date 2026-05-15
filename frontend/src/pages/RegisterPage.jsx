import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', program: '', semester: '', rollNumber: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to ClassSync.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-display font-semibold text-xl text-gray-900 dark:text-white">ClassSync</span>
        </div>

        <div className="card p-8">
          <h2 className="font-display font-semibold text-2xl text-gray-900 dark:text-white mb-1">Create account</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Set up your student profile.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Full name *</label>
              <input className="input" placeholder="Ahmed Khan" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" placeholder="ahmed@university.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="label">Password *</label>
              <input type="password" className="input" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Program</label>
                <input className="input" placeholder="e.g. BSCS" value={form.program} onChange={e => set('program', e.target.value)} />
              </div>
              <div>
                <label className="label">Semester</label>
                <input className="input" placeholder="e.g. Sem 2" value={form.semester} onChange={e => set('semester', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Roll number</label>
              <input className="input" placeholder="e.g. 2023-CS-001" value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
