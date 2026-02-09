import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import wsClient from '../utils/websocket';
import Sidebar from '../components/Sidebar';
import { fadeInUp, staggerContainer } from '../utils/animations';

const AuditPage = () => {
    const [auditCount, setAuditCount] = useState(0);

    useEffect(() => {
        wsClient.connect();
        const handleUpdate = (data) => {
            if (data.metrics) {
                setAuditCount(data.metrics.audit || 0);
            }
        };
        const unsubscribe = wsClient.on('SIMULATION_UPDATE', handleUpdate);
        return () => unsubscribe();
    }, []);

    // Mock Audit Logs
    const logs = Array.from({ length: 15 }, (_, i) => ({
        id: `LOG-${5000 - i}`,
        action: ['Stock Update', 'System Login', 'Config Change', 'Export Data'][Math.floor(Math.random() * 4)],
        user: ['admin@astratos.com', 'system_bot', 'warehouse_mgr'][Math.floor(Math.random() * 3)],
        ip: `192.168.1.${100 + i}`,
        time: new Date(Date.now() - i * 600000).toLocaleString()
    }));

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            <Sidebar />
            <main className="flex-1 p-8 pt-20">
                <div className="container mx-auto max-w-5xl">
                    <header className="mb-12 flex justify-between items-center">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl font-bold"
                        >
                            Audit Trail
                        </motion.h1>
                        <div className="text-right">
                            <div className="text-sm text-slate-400">Daily Transactions</div>
                            <div className="text-3xl font-bold font-mono text-blue-400">
                                {auditCount.toLocaleString()}
                            </div>
                        </div>
                    </header>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="glass rounded-2xl border border-white/5 overflow-hidden"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="p-4 text-slate-400 font-medium">Log ID</th>
                                    <th className="p-4 text-slate-400 font-medium">Action</th>
                                    <th className="p-4 text-slate-400 font-medium">User</th>
                                    <th className="p-4 text-slate-400 font-medium">IP Address</th>
                                    <th className="p-4 text-slate-400 font-medium">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => (
                                    <motion.tr
                                        key={i}
                                        variants={fadeInUp}
                                        className="border-t border-white/5 hover:bg-white/5 transition-colors font-mono text-sm"
                                    >
                                        <td className="p-4 text-blue-400">{log.id}</td>
                                        <td className="p-4 text-white font-sans font-bold">{log.action}</td>
                                        <td className="p-4 text-slate-300 opacity-70">{log.user}</td>
                                        <td className="p-4 text-slate-500">{log.ip}</td>
                                        <td className="p-4 text-slate-400">{log.time}</td>
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

export default AuditPage;
