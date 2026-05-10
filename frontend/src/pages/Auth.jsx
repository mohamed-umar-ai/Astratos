import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { pageTransition } from '../utils/animations';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const Auth = () => {
    const [searchParams] = useSearchParams();
    const isSignup = searchParams.get('mode') === 'signup';
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all required fields.');
            return;
        }

        if (isSignup && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (isSignup) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                setError('Password must contain at least 8 characters, one UPPERCASE, one lowercase, one number, and one special character (@$!%*?&).');
                return;
            }
        }

        setLoading(true);

        try {
            if (isSignup) {
                await axios.post(`${API_URL}/register`, {
                    email: formData.email,
                    password: formData.password
                });
                setSuccess('Account created successfully! You can now log in.');
                setFormData({ email: '', password: '', confirmPassword: '' });
            } else {
                const response = await axios.post(`${API_URL}/login`, {
                    email: formData.email,
                    password: formData.password
                });
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);
                navigate('/dashboard');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Something went wrong. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            {...pageTransition}
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black z-0" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none" />

            <Link to="/" className="absolute top-8 left-8 z-20 text-slate-400 hover:text-white flex items-center gap-2">
                ← Back to Home
            </Link>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        {isSignup ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-slate-400">
                        {isSignup ? 'Join the future of inventory management' : 'Enter your credentials to access dashboard'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mx-auto w-96 max-w-full">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg text-sm text-center"
                            >
                                {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@company.com"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {isSignup && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-1"
                        >
                            <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}
                    </motion.button>

                    <div className="text-center mt-4">
                        <Link
                            to={`/auth?mode=${isSignup ? 'login' : 'signup'}`}
                            className="text-sm text-slate-400 hover:text-white hover:underline transition-colors"
                        >
                            {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                        </Link>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default Auth;
