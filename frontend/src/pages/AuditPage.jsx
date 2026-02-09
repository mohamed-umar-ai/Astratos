import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations';

// Generate mock audit trail data
const generateAuditData = () => {
    const actions = ['Stock Update', 'Price Change', 'New Order', 'Restock', 'Adjustment', 'Delete Item', 'User Login'];
    const users = ['admin@astratos.com', 'john.doe@company.com', 'jane.smith@company.com', 'system'];
    const items = ['Widget Pro', 'Gadget X', 'Component A', 'Module Z', 'Device Pro', 'N/A'];

    return Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        action: actions[Math.floor(Math.random() * actions.length)],
        user: users[Math.floor(Math.random() * users.length)],
        item: items[Math.floor(Math.random() * items.length)],
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        details: `Changed quantity from ${Math.floor(Math.random() * 100)} to ${Math.floor(Math.random() * 100)}`,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const AuditPage = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [dateRange, setDateRange] = useState('7d');

    useEffect(() => {
        setAuditLogs(generateAuditData());
    }, []);

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.item.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === 'all' || log.action === filterAction;
        return matchesSearch && matchesAction;
    });

    const uniqueActions = [...new Set(auditLogs.map(log => log.action))];

    const getActionIcon = (action) => {
        switch (action) {
            case 'Stock Update': return '📦';
            case 'Price Change': return '💰';
            case 'New Order': return '🛒';
            case 'Restock': return '📥';
            case 'Adjustment': return '⚙️';
            case 'Delete Item': return '🗑️';
            case 'User Login': return '🔐';
            default: return '📋';
        }
    };

    const stats = {
        total: auditLogs.length,
        today: auditLogs.filter(log =>
            new Date(log.timestamp).toDateString() === new Date().toDateString()
        ).length,
        uniqueUsers: new Set(auditLogs.map(log => log.user)).size
    };

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <motion.main {...pageTransition} className="flex-1 lg:ml-64 p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Audit Trail</h1>
                    <p className="text-slate-400 mt-1">Complete transaction history and user activity</p>
                </div>

                {/* Stats */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid sm:grid-cols-3 gap-4 mb-8"
                >
                    <motion.div variants={staggerItem} className="glass rounded-xl p-6">
                        <div className="text-3xl mb-2">📝</div>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-slate-400 text-sm">Total Entries</div>
                    </motion.div>
                    <motion.div variants={staggerItem} className="glass rounded-xl p-6">
                        <div className="text-3xl mb-2">📅</div>
                        <div className="text-2xl font-bold">{stats.today}</div>
                        <div className="text-slate-400 text-sm">Today's Activity</div>
                    </motion.div>
                    <motion.div variants={staggerItem} className="glass rounded-xl p-6">
                        <div className="text-3xl mb-2">👥</div>
                        <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
                        <div className="text-slate-400 text-sm">Active Users</div>
                    </motion.div>
                </motion.div>

                {/* Filters */}
                <div className="glass rounded-xl p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="all">All Actions</option>
                            {uniqueActions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:outline-none"
                        >
                            <option value="1d">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="all">All Time</option>
                        </select>
                        <button className="btn-secondary px-6 py-3">
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Audit Logs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-slate-400 text-sm bg-slate-800/50">
                                    <th className="p-4 font-medium">Action</th>
                                    <th className="p-4 font-medium">User</th>
                                    <th className="p-4 font-medium">Item</th>
                                    <th className="p-4 font-medium">Details</th>
                                    <th className="p-4 font-medium">IP Address</th>
                                    <th className="p-4 font-medium">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredLogs.map((log, index) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="data-row"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span>{getActionIcon(log.action)}</span>
                                                <span className="font-medium">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-400">{log.user}</td>
                                        <td className="p-4">{log.item}</td>
                                        <td className="p-4 text-slate-500 text-sm max-w-xs truncate">
                                            {log.details}
                                        </td>
                                        <td className="p-4 text-slate-500 font-mono text-sm">
                                            {log.ipAddress}
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">
                                            <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                                            <div className="text-xs">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredLogs.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <span className="text-4xl mb-4 block">🔍</span>
                            No logs found matching your criteria
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between p-4 border-t border-slate-800">
                        <span className="text-sm text-slate-400">
                            Showing {filteredLogs.length} of {auditLogs.length} entries
                        </span>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700">
                                Previous
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-indigo-500 text-white">
                                1
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700">
                                2
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700">
                                Next
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.main>
        </div>
    );
};

export default AuditPage;
