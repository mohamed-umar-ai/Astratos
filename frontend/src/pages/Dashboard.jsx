import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { pageTransition, staggerContainer, staggerItem, cardHover } from '../utils/animations';
import wsClient from '../utils/websocket';

const Dashboard = () => {
    const [metrics, setMetrics] = useState({
        activeUsers: 0,
        ordersPerMinute: 0,
        revenue: 0,
        systemHealth: { cpu: 0, memory: 0, responseTime: 0 }
    });
    const [alerts, setAlerts] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to WebSocket
        wsClient.connect();

        // Listen for connection status
        const unsubConnection = wsClient.on('connection', (data) => {
            setIsConnected(data.status === 'connected');
        });

        // Listen for simulation updates
        const unsubUpdate = wsClient.on('SIMULATION_UPDATE', (data) => {
            setMetrics(data.metrics);
            if (data.alerts && data.alerts.length > 0) {
                setAlerts(prev => [...data.alerts, ...prev].slice(0, 5));
            }
        });

        return () => {
            unsubConnection();
            unsubUpdate();
            wsClient.disconnect();
        };
    }, []);

    const statCards = [
        {
            title: 'Active Users',
            value: metrics.activeUsers,
            icon: '👥',
            color: 'from-blue-500 to-cyan-500',
            suffix: ''
        },
        {
            title: 'Orders/Min',
            value: metrics.ordersPerMinute,
            icon: '📦',
            color: 'from-green-500 to-emerald-500',
            suffix: ''
        },
        {
            title: 'Revenue',
            value: metrics.revenue,
            icon: '💰',
            color: 'from-purple-500 to-pink-500',
            suffix: '$',
            prefix: true
        },
        {
            title: 'Response Time',
            value: metrics.systemHealth.responseTime,
            icon: '⚡',
            color: 'from-orange-500 to-yellow-500',
            suffix: 'ms'
        }
    ];

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <motion.main
                {...pageTransition}
                className="flex-1 lg:ml-64 p-6"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-slate-400 mt-1">Real-time inventory overview</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 pulse' : 'bg-red-400'}`} />
                        <span className="text-sm text-slate-400">
                            {isConnected ? 'Live' : 'Disconnected'}
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {statCards.map((card, index) => (
                        <motion.div
                            key={index}
                            variants={staggerItem}
                            initial="rest"
                            whileHover="hover"
                            className="glass rounded-2xl p-6 card-hover"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-3xl">{card.icon}</span>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} opacity-20`} />
                            </div>
                            <div className="text-2xl font-bold mb-1">
                                {card.prefix && card.suffix}
                                <motion.span
                                    key={card.value}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                                </motion.span>
                                {!card.prefix && card.suffix}
                            </div>
                            <div className="text-sm text-slate-400">{card.title}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* System Health & Alerts */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* System Health */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 glass rounded-2xl p-6"
                    >
                        <h2 className="text-xl font-semibold mb-6">System Health</h2>
                        <div className="grid sm:grid-cols-3 gap-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-400">CPU Usage</span>
                                    <span className="font-semibold">{metrics.systemHealth.cpu}%</span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${metrics.systemHealth.cpu > 80 ? 'bg-red-500' :
                                                metrics.systemHealth.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${metrics.systemHealth.cpu}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-400">Memory</span>
                                    <span className="font-semibold">{metrics.systemHealth.memory}%</span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${metrics.systemHealth.memory > 80 ? 'bg-red-500' :
                                                metrics.systemHealth.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${metrics.systemHealth.memory}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-400">Latency</span>
                                    <span className="font-semibold">{metrics.systemHealth.responseTime}ms</span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${metrics.systemHealth.responseTime > 200 ? 'bg-red-500' :
                                                metrics.systemHealth.responseTime > 100 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(metrics.systemHealth.responseTime / 3, 100)}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent Alerts */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass rounded-2xl p-6"
                    >
                        <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
                        <div className="space-y-3">
                            {alerts.length === 0 ? (
                                <p className="text-slate-500 text-sm">No recent alerts</p>
                            ) : (
                                alerts.map((alert, index) => (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-3 rounded-lg ${alert.type === 'warning' ? 'bg-yellow-500/10 border-l-2 border-yellow-500' :
                                                alert.type === 'success' ? 'bg-green-500/10 border-l-2 border-green-500' :
                                                    'bg-blue-500/10 border-l-2 border-blue-500'
                                            }`}
                                    >
                                        <p className="text-sm">{alert.text}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {new Date(alert.timestamp).toLocaleTimeString()}
                                        </p>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Inventory Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Inventory Overview</h2>
                        <button className="btn-secondary text-sm px-4 py-2">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                                    <th className="pb-4 font-medium">Item</th>
                                    <th className="pb-4 font-medium">Category</th>
                                    <th className="pb-4 font-medium">Quantity</th>
                                    <th className="pb-4 font-medium">Status</th>
                                    <th className="pb-4 font-medium">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {[
                                    { name: 'Widget Pro', category: 'Electronics', qty: 245, status: 'In Stock' },
                                    { name: 'Gadget X', category: 'Electronics', qty: 12, status: 'Low Stock' },
                                    { name: 'Component A', category: 'Parts', qty: 890, status: 'In Stock' },
                                    { name: 'Module Z', category: 'Parts', qty: 0, status: 'Out of Stock' },
                                    { name: 'Device Pro', category: 'Hardware', qty: 156, status: 'In Stock' }
                                ].map((item, index) => (
                                    <tr key={index} className="data-row">
                                        <td className="py-4 font-medium">{item.name}</td>
                                        <td className="py-4 text-slate-400">{item.category}</td>
                                        <td className="py-4">{item.qty}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'In Stock' ? 'bg-green-500/20 text-green-400' :
                                                    item.status === 'Low Stock' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-slate-500 text-sm">Just now</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.main>
        </div>
    );
};

export default Dashboard;
