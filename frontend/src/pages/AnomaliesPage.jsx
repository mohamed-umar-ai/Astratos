import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import wsClient from '../utils/websocket';
import Sidebar from '../components/Sidebar';
import { fadeInUp, staggerContainer } from '../utils/animations';

const AnomaliesPage = () => {
    const [count, setCount] = useState(0);
    const [anomalies, setAnomalies] = useState([]);

    useEffect(() => {
        wsClient.connect();
        const handleUpdate = (data) => {
            if (data.metrics) {
                setCount(data.metrics.anomalies || 0);
            }
        };
        const unsubscribe = wsClient.on('SIMULATION_UPDATE', handleUpdate);

        const mockData = Array.from({ length: 8 }, (_, i) => ({
            id: `ANOM-${1000 + i}`,
            severity: ['High', 'Critical', 'Medium', 'Low'][i % 4],
            type: ['Spike', 'Drop', 'Delay', 'Mismatch'][i % 4],
            timestamp: new Date().toLocaleTimeString(),
            status: i === 0 ? 'Active' : 'Resolved'
        }));
        setAnomalies(mockData);

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
                            className="text-4xl font-bold mb-2 flex items-center gap-3"
                        >
                            Anomaly Detection
                            <span className="px-3 py-1 bg-red-500/20 text-red-500 text-lg rounded-full border border-red-500/50 animate-pulse">
                                {count} Active
                            </span>
                        </motion.h1>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="lg:col-span-2 glass p-6 rounded-2xl border border-white/5"
                        >
                            <h3 className="font-bold mb-4">Real-Time Detection Stream</h3>
                            <div className="h-64 flex items-end gap-1">
                                {[...Array(40)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className={`flex-1 rounded-t ${Math.random() > 0.9 ? 'bg-red-500' : 'bg-slate-700'}`}
                                        animate={{ height: `${Math.random() * 80 + 10}%` }}
                                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-6 rounded-2xl border border-white/5 bg-red-900/10"
                        >
                            <h3 className="font-bold mb-4 text-red-400">Critical Alerts</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex gap-3 items-start p-3 bg-red-500/10 rounded-lg">
                                        <span className="text-xl">⚠️</span>
                                        <div>
                                            <div className="font-bold text-sm">Sudden Inventory Drop</div>
                                            <div className="text-xs text-red-300">Warehouse B - Zone 4</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="glass rounded-2xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Severity</th>
                                    <th className="p-4">Time</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {anomalies.map((item, i) => (
                                    <motion.tr
                                        key={i}
                                        variants={fadeInUp}
                                        className="border-t border-white/5 hover:bg-white/5"
                                    >
                                        <td className="p-4 font-mono text-sm text-slate-400">{item.id}</td>
                                        <td className="p-4">{item.type}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.severity === 'Critical' ? 'bg-red-500 text-white' :
                                                item.severity === 'High' ? 'bg-orange-500 text-white' :
                                                    item.severity === 'Medium' ? 'bg-yellow-500 text-black' :
                                                        'bg-blue-500 text-white'
                                                }`}>
                                                {item.severity}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400">{item.timestamp}</td>
                                        <td className="p-4">{item.status}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AnomaliesPage;
