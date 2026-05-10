import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/auth');
    };

    const links = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/operator', label: 'Operator', icon: '⚡' },
        { path: '/anomalies', label: 'Anomalies', icon: '🚨' },
        { path: '/forecasts', label: 'Forecasts', icon: '🔮' },
        { path: '/audit', label: 'Audit Trail', icon: '📝' },
    ];

    return (
        <>
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-50 p-2 rounded-lg glass hover:bg-white/10 transition-colors group"
                aria-label="Toggle Menu"
            >
                <div className="w-6 h-5 flex flex-col justify-between">
                    <span className={`h-0.5 w-full bg-white transition-transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`h-0.5 w-full bg-white transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
                    <span className={`h-0.5 w-full bg-white transition-transform ${isOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: isOpen ? 0 : '-100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-white/5 z-50 shadow-2xl"
            >
                <div className="p-6 pt-20">
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold">
                            A
                        </div>
                        <span className="font-bold text-xl">Astratos</span>
                    </div>

                    <nav className="space-y-2">
                        {links.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                                    ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                <span className="text-xl">{link.icon}</span>
                                <span className="font-medium">{link.label}</span>
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute left-0 w-1 h-8 bg-blue-400 rounded-r-full"
                                    />
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="absolute bottom-8 left-6 right-6 space-y-3">
                        <div className="p-4 rounded-xl glass bg-gradient-to-br from-white/5 to-transparent">
                            <div className="text-xs text-slate-400 mb-1">Status</div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-medium text-green-400">System Online</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3 border border-red-500/10"
                        >
                            <span>🚪</span>
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
