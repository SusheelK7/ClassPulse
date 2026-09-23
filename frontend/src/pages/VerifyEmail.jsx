import { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { BookOpen, AlertCircle } from 'lucide-react';

export default function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyEmail, resendVerification } = useAuth();
    const [email, setEmail] = useState(location.state?.email || '');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const inputRefs = useRef([]);

    const handleDigitChange = (i, value) => {
        if (!/^[0-9]?$/.test(value)) return;
        const next = [...code];
        next[i] = value;
        setCode(next);
        if (value && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !code[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        }
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

        setLoading(true);
        try {
            const data = await verifyEmail(email, fullCode);
            toast.success(data.message);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return setError('Enter your email first');
        setResending(true);
        setError('');
        try {
            const data = await resendVerification(email);
            toast.success(data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not resend code');
        } finally {
            setResending(false);
        }
    };

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
                    <h1 className="text-2xl font-display font-700 text-gray-900 dark:text-white">Verify your email</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        {location.state?.email
                            ? <>Verification code sent to <span className="font-medium text-gray-700 dark:text-gray-300">{location.state.email}</span></>
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
                                    placeholder="student@university.edu"
                                />
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

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors shadow-sm text-sm"
                        >
                            {loading ? 'Verifying...' : 'Verify email'}
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