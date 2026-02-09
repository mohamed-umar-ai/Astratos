import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock authentication - simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Store mock user session
            localStorage.setItem('astratos_user', JSON.stringify({
                email: formData.email,
                name: formData.name || 'Demo User',
                token: 'mock_token_' + Date.now()
            }));
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="relative z-10 w-full max-w-md px-6"
            >
                {/* Logo */}
                <motion.div variants={staggerItem} className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                        A
                    </div>
                    <h1 className="text-3xl font-bold">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {isLogin
                            ? 'Sign in to access your dashboard'
                            : 'Join Astratos to get started'}
                    </p>
                </motion.div>

                {/* Auth Form */}
                <motion.div variants={staggerItem} className="glass rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                        placeholder="John Doe"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {isLogin && (
                            <div className="text-right">
                                <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300">
                                    Forgot password?
                                </a>
                            </div>
                        )}

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    Processing...
                                </span>
                            ) : (
                                isLogin ? 'Sign In' : 'Create Account'
                            )}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-700" />
                        <span className="text-slate-500 text-sm">or</span>
                        <div className="flex-1 h-px bg-slate-700" />
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="btn-secondary px-4 py-3 flex items-center justify-center gap-2">
                            <span>🔵</span> Google
                        </button>
                        <button className="btn-secondary px-4 py-3 flex items-center justify-center gap-2">
                            <span>⚫</span> GitHub
                        </button>
                    </div>
                </motion.div>

                {/* Toggle Auth Mode */}
                <motion.p variants={staggerItem} className="text-center mt-6 text-slate-400">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </motion.p>

                {/* Back to Home */}
                <motion.div variants={staggerItem} className="text-center mt-4">
                    <a href="/" className="text-sm text-slate-500 hover:text-slate-400">
                        ← Back to Home
                    </a>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Auth;
