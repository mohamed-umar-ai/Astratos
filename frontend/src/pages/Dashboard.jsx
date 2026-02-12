import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import wsClient from '../utils/websocket';
import Sidebar from '../components/Sidebar';
import { fadeInUp, staggerContainer } from '../utils/animations';

const StatCard = ({ title, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden"
    >
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${color}`} />
        <h3 className="text-slate-400 font-medium mb-2">{title}</h3>
        <div className="text-4xl font-bold">{value.toLocaleString()}</div>
        <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <span>▲</span> +{(Math.random() * 5).toFixed(1)}% since last hour
        </div>
    </motion.div>
);

const ChartPlaceholder = ({ color }) => (
    <div className="h-48 flex items-end gap-2 mt-4">
        {[...Array(12)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ height: '0%' }}
                animate={{ height: `${Math.random() * 80 + 20}%` }}
                transition={{ duration: 1, delay: i * 0.05 }}
                className={`flex-1 rounded-t-sm opacity-50 ${color}`}
            />
        ))}
    </div>
);

const Dashboard = () => {
    const [metrics, setMetrics] = useState({
        inventory: 100000,
        sales: 70000,
        suppliers: 200,
        anomalies: 12
    });

    useEffect(() => {
        wsClient.connect();
        const handleUpdate = (data) => {
            if (data.metrics) {
                setMetrics({
                    inventory: data.metrics.inventory,
                    sales: data.metrics.sales,
                    suppliers: data.metrics.suppliers,
                    anomalies: data.metrics.anomalies
                });
            }
        };
        const unsubscribe = wsClient.on('SIMULATION_UPDATE', handleUpdate);
        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            <Sidebar />

            <main className="flex-1 ml-0 md:ml-0 p-8 pt-20 transition-all duration-300">

                <div className="container mx-auto max-w-5xl">
                    <header className="mb-12 flex justify-between items-end">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                            <p className="text-slate-400">Real-time overview of your supply chain</p>
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary"
                        >
                            Generate Report
                        </motion.button>
                    </header>

                    <div className="space-y-8">

                        <motion.section
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="glass p-8 rounded-3xl border border-white/5"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Inventory Overview</h2>
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                                    Total Items: {metrics.inventory.toLocaleString()}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="col-span-2">
                                    <ChartPlaceholder color="bg-blue-500" />
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <div className="text-sm text-slate-400">Stock Value</div>
                                        <div className="text-2xl font-bold text-blue-400">$2.4M</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <div className="text-sm text-slate-400">Low Stock SKUs</div>
                                        <div className="text-2xl font-bold text-yellow-400">14</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl">
                                        <div className="text-sm text-slate-400">Turnover Rate</div>
                                        <div className="text-2xl font-bold text-green-400">4.2x</div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="glass p-8 rounded-3xl border border-white/5"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Sales Performance</h2>
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                    Active Sales: {metrics.sales.toLocaleString()}
                                </span>
                            </div>
                            <div className="h-64 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 relative overflow-hidden flex items-end px-4 gap-1">
                                {[...Array(24)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex-1 bg-green-500/50 hover:bg-green-400 transition-colors rounded-t"
                                        initial={{ height: '0%' }}
                                        animate={{ height: `${Math.random() * 60 + 20}%` }}
                                        transition={{ duration: 1, delay: 0.2 + i * 0.02 }}
                                    />
                                ))}
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            <div className="glass p-8 rounded-3xl border border-white/5">
                                <h2 className="text-2xl font-bold mb-6">Supplier Network</h2>
                                <div className="flex items-center justify-center">
                                    <div className="relative w-48 h-48">
                                        <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="10" />
                                            <motion.circle
                                                cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" strokeWidth="10"
                                                strokeDasharray="283"
                                                strokeDashoffset="70"
                                                initial={{ strokeDashoffset: 283 }}
                                                animate={{ strokeDashoffset: 283 - (283 * 0.75) }}
                                                transition={{ duration: 1.5 }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="text-3xl font-bold">{metrics.suppliers}</div>
                                            <div className="text-xs text-slate-400">Active Partners</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass p-8 rounded-3xl border border-white/5">
                                <h2 className="text-2xl font-bold mb-6">System Health</h2>
                                <div className="space-y-6">
                                    {['API Latency', 'Database Load', 'Error Rate'].map((label, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-slate-400">{label}</span>
                                                <span className="text-green-400">Normal</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: `${Math.random() * 40 + 30}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
