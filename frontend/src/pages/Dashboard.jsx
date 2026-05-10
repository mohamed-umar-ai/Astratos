import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWebSocket } from '../utils/websocket';
import Sidebar from '../components/Sidebar';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';

const API_URL = 'http://localhost:5000/api/auth';

const formatCurrency = (val) => {
    if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return '$' + (val / 1000).toFixed(1) + 'K';
    return '$' + (val || 0).toLocaleString();
};

const ExpandableCurrency = ({ value }) => {
    const [expanded, setExpanded] = useState(false);
    if ((value || 0) < 1000) return <span>{formatCurrency(value)}</span>;
    
    return (
        <span 
            onClick={() => setExpanded(!expanded)} 
            className="inline-flex items-center gap-2 cursor-pointer group select-none relative"
            title={expanded ? "Collapse number" : "Expand full exact amount"}
        >
            <span>{expanded ? '$' + value.toLocaleString() : formatCurrency(value)}</span>
            <span className="text-[9px] flex items-center justify-center w-[18px] h-[18px] bg-slate-800/80 text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 border border-slate-700/50 group-hover:border-blue-500/30 rounded-full transition-all shadow-sm">
                {expanded ? '◀' : '▶'}
            </span>
        </span>
    );
};

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

// Removed random ChartPlaceholder

const RoleBadge = ({ role }) => {
    const colors = {
        admin: 'bg-red-500/20 text-red-400 border-red-500/30',
        operator: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        viewer: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wide ${colors[role] || colors.viewer}`}>
            {role}
        </span>
    );
};

const AdminPanel = ({ navigate }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass p-8 rounded-3xl border border-red-500/10"
    >
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-lg">🛡️</div>
            <div>
                <h2 className="text-2xl font-bold">Admin Controls</h2>
                <p className="text-slate-400 text-sm">Full system access</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
                { label: 'Manage Users', icon: '👥', desc: 'Add, edit, or remove users', link: '/admin/users' },
                { label: 'System Settings', icon: '⚙️', desc: 'Configure system parameters', link: '/admin/settings' },
                { label: 'View Logs', icon: '📋', desc: 'Access all audit logs', link: '/admin/logs' }
            ].map((item) => (
                <div key={item.label} onClick={() => navigate(item.link)} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="font-semibold mb-1">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
            ))}
        </div>
    </motion.section>
);

const OperatorPanel = ({ navigate }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass p-8 rounded-3xl border border-amber-500/10"
    >
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-lg">🔧</div>
            <div>
                <h2 className="text-2xl font-bold">Operator Dashboard</h2>
                <p className="text-slate-400 text-sm">Operations management tools</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
                { label: 'Process Orders', icon: '📦', desc: 'Handle incoming orders', tab: 'orders' },
                { label: 'Manage Stock', icon: '🏷️', desc: 'Update inventory levels', tab: 'stock' },
                { label: 'Shipping', icon: '🚚', desc: 'Track shipments', tab: 'shipping' }
            ].map((item) => (
                <div key={item.label} onClick={() => navigate('/operator', { state: { activeTab: item.tab } })} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="font-semibold mb-1">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
            ))}
        </div>
    </motion.section>
);

const ViewerBanner = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass p-6 rounded-3xl border border-blue-500/10 flex items-center gap-4"
    >
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg shrink-0">👁️</div>
        <div>
            <h3 className="font-semibold text-blue-400">Read-Only Access</h3>
            <p className="text-slate-400 text-sm">You have viewer access. Contact an admin to request elevated permissions.</p>
        </div>
    </motion.div>
);

const ScenarioController = () => {
    const [status, setStatus] = useState({ isRunning: false });
    const [loading, setLoading] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/simulation/status');
            setStatus(res.data);
        } catch (err) {}
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const toggleSim = async () => {
        setLoading(true);
        try {
            const endpoint = status.isRunning ? 'stop' : 'start';
            await axios.post(`http://localhost:5000/api/simulation/${endpoint}`);
            await fetchStatus();
        } catch (err) {}
        setLoading(false);
    };

    const triggerAction = async (type) => {
        try {
            await axios.post(`http://localhost:5000/api/simulation/trigger/${type}`);
        } catch (err) {}
    };

    return (
        <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass border-cyan-500/20 bg-cyan-500/5 p-6 rounded-3xl mb-8 border"
        >
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${status.isRunning ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-slate-600'}`} />
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            Scenario Controller
                            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-tighter">Live Demo Tools</span>
                        </h2>
                        <p className="text-xs text-slate-400">Manage simulation parameters and live data trends</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => triggerAction('delivery')}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20 transition-all uppercase tracking-wider"
                    >
                        ↑ Inject Restock
                    </button>
                    <button 
                        onClick={() => triggerAction('order')}
                        className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/20 transition-all uppercase tracking-wider"
                    >
                        ↓ Inject Orders
                    </button>
                    <div className="w-px h-8 bg-white/10 mx-2" />
                    <button 
                        onClick={toggleSim}
                        disabled={loading}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest border ${status.isRunning ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20' : 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'}`}
                    >
                        {loading ? '...' : status.isRunning ? 'Stop Auto-Pilot' : 'Start Auto-Pilot'}
                    </button>
                </div>
            </div>
        </motion.section>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [profileLoaded, setProfileLoaded] = useState(false);

    const [metrics, setMetrics] = useState({
        inventory: 0,
        sales: 0,
        suppliers: 0,
        anomalies: 0,
        stockValue: 0,
        lowStockCount: 0,
        turnoverRate: '0.0x'
    });

    const [graphs, setGraphs] = useState({
        inventory: [],
        sales: [{ label: 'Init', value: 0 }],
        suppliers: [],
        deliveries: []
    });

    const wsClient = useWebSocket();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API_URL}/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserEmail(res.data.email);
                setUserRole(res.data.role);
                setProfileLoaded(true);
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                navigate('/auth');
            }
        };

        fetchProfile();
    }, [navigate]);

    useEffect(() => {
        let isMounted = true;
        const fetchMetrics = async () => {
            try {
                const [valRes, alertsRes, ordersRes, stockRes, suppRes, suppGraphRes, shippingRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/operator/stock/value'),
                    axios.get('http://localhost:5000/api/operator/stock/alerts'),
                    axios.get('http://localhost:5000/api/operator/orders'),
                    axios.get('http://localhost:5000/api/operator/stock'),
                    axios.get('http://localhost:5000/api/suppliers'),
                    axios.get('http://localhost:5000/api/suppliers/graph-data'),
                    axios.get('http://localhost:5000/api/operator/shipping')
                ]);
                if (!isMounted) return;

                let newInv = metrics.inventory;
                if (valRes.data.success) {
                    newInv = valRes.data.data.totalItems;
                    if (newInv === 0) newInv = 450; // Fake initial inventory baseline if DB is empty
                    setMetrics(prev => ({
                        ...prev,
                        inventory: newInv,
                        stockValue: valRes.data.data.totalValue || (newInv * 45), // Fake value based on baseline
                        productCount: valRes.data.data.productCount || 12
                    }));
                }
                if (alertsRes.data.success) {
                    setMetrics(prev => ({ ...prev, lowStockCount: alertsRes.data.data.length }));
                }

                // Calculate Turnover Rate
                if (ordersRes.data.success && stockRes.data.success) {
                    let totalDays = 0;
                    let validOrdersCount = 0;
                    const stockItems = stockRes.data.data;
                    
                    ordersRes.data.data.forEach(order => {
                        const orderDate = new Date(order.createdAt);
                        order.items.forEach(item => {
                            const stockRef = stockItems.find(s => s.name === item.product);
                            if (stockRef) {
                                const stockDate = new Date(stockRef.createdAt);
                                const diffDays = Math.max(0, (orderDate - stockDate) / (1000 * 60 * 60 * 24));
                                totalDays += diffDays;
                                validOrdersCount++;
                            }
                        });
                    });
                    
                    const turnover = validOrdersCount > 0 ? (totalDays / validOrdersCount).toFixed(1) + 'd' : '0.0d';
                    setMetrics(prev => ({ ...prev, turnoverRate: turnover }));
                }

                if (suppRes.data.success) {
                    const activeSupps = suppRes.data.data.filter(s => s.status === 'Active').length;
                    setMetrics(prev => ({ ...prev, suppliers: activeSupps }));
                    setGraphs(prev => {
                        if (prev.suppliers.length === 0) return { ...prev, suppliers: [{ label: 'Init', value: activeSupps }] };
                        return prev;
                    });
                }

                // Populate historical jitter for an instantly alive chart (simulating past 3 minutes)
                const generateHistory = (current, isSales) => {
                    const arr = [];
                    let historicalTemp = current;
                    
                    for (let i = 0; i < 18; i++) {
                        // random deviation
                        const drift = (Math.random() - 0.5) * (current * 0.04);
                        // Sales should have a slight upward bias going forward (so backward = subtract)
                        const bias = isSales ? -30 : 0; 
                        historicalTemp = Math.max(0, historicalTemp + drift + bias);
                        
                        arr.unshift({
                            label: new Date(Date.now() - (18 - i) * 10000).toLocaleTimeString(),
                            value: Math.round(historicalTemp)
                        });
                    }
                    arr.push({ label: new Date().toLocaleTimeString(), value: current });
                    return arr;
                };

                const activeSuppsCount = suppRes.data.success ? suppRes.data.data.filter(s => s.status === 'Active').length : 0;

                let initialSales = 0;
                if (ordersRes.data.success) {
                    initialSales = ordersRes.data.data.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
                }
                if (initialSales === 0) initialSales = 1250; // Fake initial sales baseline if DB is empty

                setMetrics(prev => ({ ...prev, sales: initialSales }));

                // Supplier bar chart — deliveries per supplier
                let supplierGraphData = [];
                if (suppGraphRes && suppGraphRes.data && suppGraphRes.data.success) {
                    supplierGraphData = suppGraphRes.data.data.map(d => ({ label: d.name, value: d.deliveries }));
                }

                // Delivery bar chart — shipments per carrier
                let deliveryGraphData = [];
                if (shippingRes && shippingRes.data && shippingRes.data.success) {
                    const carrierMap = {};
                    shippingRes.data.data.forEach(s => {
                        const c = s.carrier || 'Unknown';
                        carrierMap[c] = (carrierMap[c] || 0) + 1;
                    });
                    deliveryGraphData = Object.entries(carrierMap)
                        .map(([label, value]) => ({ label, value }))
                        .sort((a, b) => b.value - a.value);
                }

                setGraphs(prev => ({
                    inventory: generateHistory(newInv, false),
                    sales: generateHistory(initialSales, true),
                    suppliers: supplierGraphData,
                    deliveries: deliveryGraphData
                }));

            } catch (err) {}
        };

        fetchMetrics();
        // Don't poll every 5s for graphs to keep them strictly event driven per instruction
    }, []);

    useEffect(() => {
        wsClient.connect();

        const handleInventoryUpdate = async () => {
            const res = await axios.get('http://localhost:5000/api/operator/stock/value');
            if (res.data.success) {
                const newInv = res.data.data.totalItems;
                setMetrics(prev => ({ ...prev, inventory: newInv, stockValue: res.data.data.totalValue }));
                setGraphs(prev => ({
                    ...prev,
                    inventory: [...prev.inventory.slice(-20), { label: new Date().toLocaleTimeString(), value: newInv }]
                }));
            }
        };

        const handleSalesUpdate = (order) => {
            setMetrics(prev => {
                const newSales = prev.sales + (order.totalAmount || 0);
                setGraphs(g => ({
                    ...g,
                    sales: [...g.sales.slice(-20), { label: new Date().toLocaleTimeString(), value: newSales }]
                }));
                return { ...prev, sales: newSales };
            });
        };

        const handleSupplierDelivery = async () => {
            const suppGraphRes = await axios.get('http://localhost:5000/api/suppliers/graph-data');
            if (suppGraphRes.data.success) {
                const supplierGraphData = suppGraphRes.data.data.map(d => ({ label: d.name, value: d.deliveries }));
                const activeSupps = suppGraphRes.data.data.length;
                setMetrics(prev => ({ ...prev, suppliers: activeSupps }));
                setGraphs(g => ({ ...g, suppliers: supplierGraphData }));
            }
        };

        const handleShipmentCreated = async () => {
            const shippingRes = await axios.get('http://localhost:5000/api/operator/shipping');
            if (shippingRes.data.success) {
                const carrierMap = {};
                shippingRes.data.data.forEach(s => {
                    const c = s.carrier || 'Unknown';
                    carrierMap[c] = (carrierMap[c] || 0) + 1;
                });
                const deliveryGraphData = Object.entries(carrierMap)
                    .map(([label, value]) => ({ label, value }))
                    .sort((a, b) => b.value - a.value);
                setGraphs(g => ({ ...g, deliveries: deliveryGraphData }));
            }
        };

        const unsubInv = wsClient.on('INVENTORY_UPDATE', handleInventoryUpdate);
        const unsubSales = wsClient.on('SALES_UPDATE', handleSalesUpdate);
        const unsubSupp = wsClient.on('SUPPLIER_DELIVERY', handleSupplierDelivery);
        const unsubShipment = wsClient.on('SHIPMENT_CREATED', handleShipmentCreated);

        return () => {
            unsubInv();
            unsubSales();
            unsubSupp();
            unsubShipment();
        };
    }, [wsClient]);

    if (!profileLoaded) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-400 text-lg"
                >
                    Loading...
                </motion.div>
            </div>
        );
    }

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
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium">{userEmail}</div>
                                <RoleBadge role={userRole} />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary"
                            >
                                Generate Report
                            </motion.button>
                        </motion.div>
                    </header>

                    <div className="space-y-8">
                        <ScenarioController />

                        {userRole === 'admin' && <AdminPanel navigate={navigate} />}
                        {userRole === 'operator' && <OperatorPanel navigate={navigate} />}
                        {userRole === 'viewer' && <ViewerBanner />}

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
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Inventory Volume Over Time</h3>
                                    <LineChart data={graphs.inventory} height={200} color="#3b82f6" labelText="Units" />
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div className="text-sm text-slate-400">Stock Value</div>
                                        <div className="text-2xl font-bold text-blue-400">
                                            <ExpandableCurrency value={metrics.stockValue} />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div className="text-sm text-slate-400">Low Stock SKUs</div>
                                        <div className="text-2xl font-bold text-yellow-400">{metrics.lowStockCount}</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <div className="text-sm text-slate-400">Turnover Metric</div>
                                        <div className="text-2xl font-bold text-green-400">{metrics.turnoverRate}</div>
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
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-1.5">
                                    Total Active Sales: <ExpandableCurrency value={metrics.sales} />
                                </span>
                            </div>
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Processed Order Revenue</h3>
                            <div className="relative overflow-hidden flex items-end">
                                <LineChart data={graphs.sales} height={200} color="#10b981" labelText="USD" />
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            {/* Supplier Deliveries — updates on Inject Restock */}
                            <div className="glass p-8 rounded-3xl border border-white/5">
                                <h2 className="text-2xl font-bold mb-1">Supplier Network</h2>
                                <div className="mb-2">
                                     <span className="text-3xl font-bold mr-2">{metrics.suppliers}</span>
                                     <span className="text-xs text-slate-400">Active Partners</span>
                                </div>
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 mt-2">Deliveries per Supplier</h3>
                                <BarChart key={JSON.stringify(graphs.suppliers)} data={graphs.suppliers} height={180} color="#8b5cf6" labelText="Deliveries" />
                            </div>

                            {/* Shipments per Carrier — updates on Inject Orders */}
                            <div className="glass p-8 rounded-3xl border border-white/5">
                                <h2 className="text-2xl font-bold mb-1">Delivery Network</h2>
                                <div className="mb-2">
                                    <span className="text-3xl font-bold mr-2">{graphs.deliveries.reduce((a, d) => a + d.value, 0)}</span>
                                    <span className="text-xs text-slate-400">Total Shipments</span>
                                </div>
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 mt-2">Shipments per Carrier</h3>
                                <BarChart key={JSON.stringify(graphs.deliveries)} data={graphs.deliveries} height={180} color="#06b6d4" labelText="Shipments" />
                            </div>
                        </motion.section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
