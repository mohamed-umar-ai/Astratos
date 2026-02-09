import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import wsClient from '../utils/websocket';
import Sidebar from '../components/Sidebar';

const ForecastsPage = () => {
    const [demand, setDemand] = useState(0);

    useEffect(() => {
        wsClient.connect();
        const handleUpdate = (data) => {
            if (data.metrics) {
                setDemand(data.metrics.forecasts || 0);
            }
        };
        const unsubscribe = wsClient.on('SIMULATION_UPDATE', handleUpdate);
        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            <Sidebar />
            <main className="flex-1 p-8 pt-20">
                <div className="container mx-auto max-w-5xl">
                    <header className="mb-12">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl font-bold mb-2"
                        >
                            Demand Forecasts
                        </motion.h1>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-purple-900/20 to-blue-900/20"
                        >
                            <h3 className="text-slate-400 mb-4">Predicted Monthly Demand</h3>
                            <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                                {demand.toLocaleString()}
                            </div>
                            <div className="mt-4 text-sm text-purple-300">
                                Confidence Score: 94.2%
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-8 rounded-3xl border border-white/5 flex items-center justify-center relative overflow-hidden"
                        >
                            {/* Animated Chart Line */}
                            <svg className="w-full h-32 overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                                <motion.path
                                    d="M0,50 Q25,10 50,30 T100,10"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="2"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute top-4 right-4 text-xs text-slate-400">7-Day Trend</div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="glass p-6 rounded-2xl border border-white/5"
                    >
                        <h3 className="font-bold mb-6">Category Breakdown</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Electronics', val: 75 },
                                { label: 'Automotive', val: 45 },
                                { label: 'Home & Garden', val: 60 },
                                { label: 'Fashion', val: 30 }
                            ].map((cat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-2 text-sm">
                                        <span>{cat.label}</span>
                                        <span>{cat.val}% Growth</span>
                                    </div>
                                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-purple-500 rounded-full"
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${cat.val}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default ForecastsPage;
