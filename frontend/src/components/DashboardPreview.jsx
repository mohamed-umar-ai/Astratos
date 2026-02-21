import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

const StatCard = ({ title, value, trend, categories, delay }) => {
    const spring = useSpring(0, { bounce: 0, duration: 2000 });
    const rounded = useTransform(spring, (latest) => Math.round(latest).toLocaleString());

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                    <span className="text-sm font-medium text-slate-300">{title}</span>
                </div>
                <select className="text-xs bg-transparent text-slate-400 border-none outline-none">
                    <option>Weekly</option>
                </select>
            </div>

            <div className="mb-3">
                <motion.div className="text-3xl font-bold text-white mb-1">
                    {rounded}
                </motion.div>
                <div className="flex items-center gap-1 text-xs">
                    <span className={trend > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                    <span className="text-slate-500">Last Week</span>
                </div>
            </div>

            <div className="space-y-2">
                {categories.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>
                            <span className="text-slate-400">{cat.name}</span>
                        </div>
                        <span className="text-slate-300 font-medium">{cat.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>

            <div className="mt-3 space-y-1">
                {categories.map((cat, idx) => (
                    <motion.div
                        key={idx}
                        className="h-1 bg-white/5 rounded-full overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: delay + 0.3 + idx * 0.1 }}
                    >
                        <motion.div
                            className={`h-full ${cat.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(cat.value / value) * 100}%` }}
                            transition={{ delay: delay + 0.5 + idx * 0.1, duration: 1, ease: "easeOut" }}
                        />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

const DashboardPreview = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
    }, []);

    const incomingCategories = [
        { name: 'Electronics', value: 18860, color: 'bg-blue-500' },
        { name: 'Apparel', value: 9330, color: 'bg-orange-500' },
        { name: 'Raw Materials', value: 4665, color: 'bg-emerald-500' },
        { name: 'Other', value: 2333, color: 'bg-purple-500' }
    ];

    const outgoingCategories = [
        { name: 'Electronics', value: 6089, color: 'bg-blue-500' },
        { name: 'Apparel', value: 3050, color: 'bg-orange-500' },
        { name: 'Raw Materials', value: 1527, color: 'bg-emerald-500' },
        { name: 'Other', value: 5083, color: 'bg-purple-500' }
    ];

    const notDetectedCategories = [
        { name: 'Electronics', value: 147, color: 'bg-blue-500' },
        { name: 'Apparel', value: 184, color: 'bg-orange-500' },
        { name: 'Raw Materials', value: 0, color: 'bg-emerald-500' },
        { name: 'Other', value: 0, color: 'bg-purple-500' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full max-w-6xl mx-auto mt-12 relative"
        >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="flex">
                    <div className="w-64 bg-white/5 border-r border-white/10 p-6 hidden lg:block">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-white font-bold">Astratos</div>
                                <div className="text-xs text-slate-400">project@gmail.com</div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-xs text-slate-500 font-semibold mb-2">MAIN MENU</div>
                            {[
                                { icon: '📊', label: 'Dashboard' },
                                { icon: '📦', label: 'Inventory Overview' },
                                { icon: '🔍', label: 'Stock Search & Tracking' },
                                { icon: '📈', label: 'Movement & Transactions' },
                                { icon: '🤖', label: 'AI Features' }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + idx * 0.1 }}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${idx === 0 ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'} transition-colors cursor-pointer`}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Warehouse Inventory</h2>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                                <button className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </button>
                                <button className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard
                                title="Incoming Package"
                                value={30089}
                                trend={8}
                                categories={incomingCategories}
                                delay={1.0}
                            />
                            <StatCard
                                title="Outgoing Package"
                                value={11182}
                                trend={-3}
                                categories={outgoingCategories}
                                delay={1.2}
                            />
                            <StatCard
                                title="Package not Detected"
                                value={1815}
                                trend={-16}
                                categories={notDetectedCategories}
                                delay={1.4}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardPreview;
