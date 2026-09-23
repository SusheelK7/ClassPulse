import { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { validatePassword, getPasswordChecks } from '../utils/passwordValidation';
import { BookOpen, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const { resetPassword, forgotPassword } = useAuth();
    const [email, setEmail] = useState(location.state?.email || '');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const inputRefs = useRef([]);
    const checks = getPasswordChecks(password);

    const handleDigitChange = (i, value) => {
        if (!/^[0-9]?$/.test(value)) return;
        const next = [...code];
        next[i] = value;
        setCode(next);
        if (value && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !code[i] && i > 0) inputRefs.current[i - 1]?.focus();
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        e.preventDefault();
        setCode(pasted.split('').concat(Array(6 - pasted.length).fill('')));
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const fullCode = code.join('');
        if (!email) return setError('Enter your email');
        if (fullCode.length !== 6) return setError('Enter the full 6-digit code');

        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) return setError(passwordCheck.message);
        if (password !== confirmPassword) return setError('Passwords do not match');

        setLoading(true);
        try {
            const data = await resetPassword(email, fullCode, password, confirmPassword);
            toast.success(data.message);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return setError('Enter your email first');
        setResending(true);
        setError('');
        try {
            const data = await forgotPassword(email);
            toast.success(data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not resend code');
        } finally {
            setResending(false);
        }
    };

    const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm";
    const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative">
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
                    <h1 className="text-2xl font-display font-700 text-gray-900 dark:text-white">Set a new password</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        {location.state?.email
                            ? <>Reset code sent to <span className="font-medium text-gray-700 dark:text-gray-300">{location.state.email}</span></>
                            : 'Enter your email and the code sent to it'}
                    </p>
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

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!location.state?.email && (
                            <div>
                                <label className={labelCls}>Email</label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="student@university.edu" />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">6-digit code</label>
                            <div className="flex justify-center gap-2" onPaste={handlePaste}>
                                {code.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => (inputRefs.current[i] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleDigitChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        className="w-11 h-13 text-center text-lg font-semibold rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>New password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className={`${inputCls} pr-11`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" tabIndex={-1}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {(passwordFocused || password) && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 space-y-1">
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
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" tabIndex={-1}>
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors shadow-sm text-sm">
                            {loading ? 'Resetting...' : 'Reset password'}
                        </motion.button>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
                        Didn&apos;t get a code?{' '}
                        <button onClick={handleResend} disabled={resending} className="text-primary-600 hover:text-primary-700 font-medium disabled:opacity-60">
                            {resending ? 'Sending...' : 'Resend'}
                        </button>
                    </p>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Back to login</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}