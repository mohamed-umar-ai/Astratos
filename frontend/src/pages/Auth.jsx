import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { pageTransition } from '../utils/animations';

const Auth = () => {
    const [searchParams] = useSearchParams();
    const isSignup = searchParams.get('mode') === 'signup';
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Simple mock validation error state
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error on typing
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all required fields.');
            return;
        }

        // Mock authentication success
        // In a real app, you would call an API start session here
        navigate('/dashboard');
    };

    return (
        <motion.div
            {...pageTransition}
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black z-0" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none" />

            {/* Return to Home */}
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

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                    >
                        {isSignup ? 'Sign Up' : 'Log In'}
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
