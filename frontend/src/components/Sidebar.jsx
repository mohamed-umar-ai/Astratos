import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sidebarSlide } from '../utils/animations';

const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/anomalies', label: 'Anomalies', icon: '⚠️' },
    { path: '/forecasts', label: 'Forecasts', icon: '📈' },
    { path: '/audit', label: 'Audit Trail', icon: '📝' }
];

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const location = useLocation();

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden glass p-3 rounded-xl"
            >
                <div className="w-6 h-5 flex flex-col justify-between">
                    <motion.span
                        animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }}
                        className="w-full h-0.5 bg-white block"
                    />
                    <motion.span
                        animate={{ opacity: isOpen ? 0 : 1 }}
                        className="w-full h-0.5 bg-white block"
                    />
                    <motion.span
                        animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
                        className="w-full h-0.5 bg-white block"
                    />
                </div>
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {(isOpen || window.innerWidth >= 1024) && (
                    <motion.aside
                        variants={sidebarSlide}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`fixed left-0 top-0 h-screen z-50 lg:z-30 glass ${isExpanded ? 'w-64' : 'w-20'
                            } transition-all duration-300`}
                    >
                        <div className="p-4 h-full flex flex-col">
                            {/* Logo */}
                            <div className="flex items-center gap-3 mb-8 px-2">
                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center font-bold text-lg">
                                    A
                                </div>
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="font-bold text-xl"
                                    >
                                        Astratos
                                    </motion.span>
                                )}
                            </div>

                            {/* Toggle Button (Desktop) */}
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-indigo-500 items-center justify-center text-xs"
                            >
                                {isExpanded ? '←' : '→'}
                            </button>

                            {/* Navigation */}
                            <nav className="flex-1">
                                <ul className="space-y-2">
                                    {menuItems.map((item) => (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                onClick={() => setIsOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                                                        ? 'bg-indigo-500/20 text-indigo-400'
                                                        : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                                    }`}
                                            >
                                                <span className="text-xl">{item.icon}</span>
                                                {isExpanded && (
                                                    <motion.span
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="font-medium"
                                                    >
                                                        {item.label}
                                                    </motion.span>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>

                            {/* Connection Status */}
                            <div className="px-4 py-3 glass-light rounded-xl">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400 pulse" />
                                    {isExpanded && (
                                        <span className="text-sm text-slate-400">Connected</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
