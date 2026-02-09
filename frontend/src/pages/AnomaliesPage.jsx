import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations';

// Mock anomaly data generator
const generateAnomalies = () => {
    const types = ['Stock Discrepancy', 'Unusual Sale Pattern', 'Price Anomaly', 'Supplier Issue', 'Demand Spike'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const items = ['Widget Pro', 'Gadget X', 'Component A', 'Module Z', 'Device Pro', 'Sensor Unit'];

    return Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        type: types[Math.floor(Math.random() * types.length)],
        item: items[Math.floor(Math.random() * items.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        detected: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
        description: 'Detected unusual pattern in inventory data that requires attention.',
        status: Math.random() > 0.3 ? 'active' : 'resolved'
    }));
};

const AnomaliesPage = () => {
    const [anomalies, setAnomalies] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedAnomaly, setSelectedAnomaly] = useState(null);

    useEffect(() => {
        setAnomalies(generateAnomalies());
    }, []);

    const filteredAnomalies = anomalies.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'active') return a.status === 'active';
        if (filter === 'resolved') return a.status === 'resolved';
        return a.severity === filter;
    });

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
            default: return 'bg-blue-500/20 text-blue-400 border-blue-500';
        }
    };

    const stats = {
        total: anomalies.length,
        critical: anomalies.filter(a => a.severity === 'critical').length,
        active: anomalies.filter(a => a.status === 'active').length,
        resolved: anomalies.filter(a => a.status === 'resolved').length
    };

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <motion.main {...pageTransition} className="flex-1 lg:ml-64 p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Anomaly Detection</h1>
                    <p className="text-slate-400 mt-1">Monitor and resolve inventory anomalies</p>
                </div>

                {/* Stats */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid sm:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        { label: 'Total Anomalies', value: stats.total, icon: '⚠️' },
                        { label: 'Critical', value: stats.critical, icon: '🔴' },
                        { label: 'Active', value: stats.active, icon: '🟡' },
                        { label: 'Resolved', value: stats.resolved, icon: '🟢' }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={staggerItem}
                            className="glass rounded-xl p-4"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{stat.icon}</span>
                                <div>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <div className="text-sm text-slate-400">{stat.label}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['all', 'active', 'resolved', 'critical', 'high', 'medium', 'low'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Anomalies List */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {filteredAnomalies.map((anomaly, index) => (
                        <motion.div
                            key={anomaly.id}
                            variants={staggerItem}
                            onClick={() => setSelectedAnomaly(anomaly)}
                            className={`glass rounded-xl p-6 cursor-pointer transition-all hover:bg-slate-800/50 border-l-4 ${getSeverityColor(anomaly.severity)}`}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-lg">{anomaly.type}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                                            {anomaly.severity}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${anomaly.status === 'active' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                                            }`}>
                                            {anomaly.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-2">{anomaly.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span>📦 {anomaly.item}</span>
                                        <span>🕐 {new Date(anomaly.detected).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="btn-secondary px-4 py-2 text-sm">View Details</button>
                                    {anomaly.status === 'active' && (
                                        <button className="btn-primary px-4 py-2 text-sm">Resolve</button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {filteredAnomalies.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <span className="text-4xl mb-4 block">✨</span>
                        No anomalies found with current filter
                    </div>
                )}
            </motion.main>
        </div>
    );
};

export default AnomaliesPage;
