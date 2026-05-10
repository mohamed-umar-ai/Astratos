import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWebSocket } from '../utils/websocket';
import Sidebar from '../components/Sidebar';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const ViewerBanner = () => {
    const [requestStatus, setRequestStatus] = useState('idle');

    const handleRequest = async () => {
        try {
            setRequestStatus('loading');
            await axios.post('http://localhost:5000/api/auth/request-promotion', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRequestStatus('sent');
        } catch (err) {
            setRequestStatus('error');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="glass p-6 rounded-3xl border border-blue-500/10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg shrink-0">👁️</div>
                <div>
                    <h3 className="font-semibold text-blue-400">Read-Only Access</h3>
                    <p className="text-slate-400 text-sm">You have viewer access. Contact an admin or request elevated permissions.</p>
                </div>
            </div>
            <button 
                onClick={handleRequest}
                disabled={requestStatus !== 'idle'}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-semibold rounded-xl border border-blue-500/30 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
                {requestStatus === 'idle' ? 'Request Operator Access' : 
                 requestStatus === 'loading' ? 'Sending...' : 
                 requestStatus === 'sent' ? 'Request Sent ✓' : 'Error Sending'}
            </button>
        </motion.div>
    );
};

const CongratsScreen = ({ onDismiss }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center p-6 text-center"
        >
            <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="max-w-md"
            >
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                    🎉
                </div>
                <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Congratulations!</h1>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                    An admin has approved your request. You have been officially promoted to <span className="text-emerald-400 font-bold uppercase tracking-widest">Operator</span>.
                    <br/><br/>
                    You now have full access to process orders, manage stock, and oversee shipping logistics.
                </p>
                <button
                    onClick={onDismiss}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1"
                >
                    Access Dashboard
                </button>
            </motion.div>
        </motion.div>
    );
};

const RejectionScreen = ({ onDismiss }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center p-6 text-center"
        >
            <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="max-w-md"
            >
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                    💪
                </div>
                <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-600">Keep Pushing Forward</h1>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                    The administrator has reviewed your request but has decided not to grant <span className="text-orange-400 font-bold uppercase tracking-widest">Operator</span> access at this time.
                    <br/><br/>
                    <span className="italic text-slate-400">"Success is not final, failure is not fatal: it is the courage to continue that counts."</span>
                </p>
                <button
                    onClick={onDismiss}
                    className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-red-500/30 transition-all hover:-translate-y-1"
                >
                    Return to Dashboard
                </button>
            </motion.div>
        </motion.div>
    );
};

const DemotionScreen = ({ onDismiss }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center p-6 text-center"
        >
            <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="max-w-md"
            >
                <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                    🌱
                </div>
                <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">Access Restructured</h1>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                    An administrator has adjusted your account permissions. You have been placed into the <span className="text-indigo-400 font-bold uppercase tracking-widest">Viewer</span> role.
                    <br/><br/>
                    <span className="italic text-slate-400 font-medium">"A setback is just a setup for a powerful comeback. Take this time to observe and learn."</span>
                </p>
                <button
                    onClick={onDismiss}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1"
                >
                    Acknowledge
                </button>
            </motion.div>
        </motion.div>
    );
};

const ViewerReportModal = ({ onClose }) => {
    const [requestStatus, setRequestStatus] = useState('idle');

    const handleRequest = async () => {
        try {
            setRequestStatus('loading');
            await axios.post('http://localhost:5000/api/auth/request-promotion', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRequestStatus('sent');
        } catch (err) {
            setRequestStatus('error');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="glass p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl relative overflow-hidden"
            >
                <h3 className="text-2xl font-bold mb-4">Access Denied</h3>
                <p className="text-slate-400 mb-6">You must be an Operator to access the report generation module. Would you like to request permission from an administrator?</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">Cancel</button>
                    <button 
                        onClick={handleRequest}
                        disabled={requestStatus !== 'idle'}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl shadow-lg transition-all font-medium disabled:opacity-50"
                    >
                        {requestStatus === 'idle' ? 'Request Permission' : 
                         requestStatus === 'loading' ? 'Sending...' : 
                         requestStatus === 'sent' ? 'Request Sent ✓' : 'Error Sending'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const OperatorReportModal = ({ onClose }) => {
    const [status, setStatus] = useState('idle');

    const fetchReportData = async () => {
        const [stockRes, orderRes] = await Promise.all([
            axios.get('http://localhost:5000/api/operator/stock'),
            axios.get('http://localhost:5000/api/operator/orders')
        ]);
        return {
            stock: stockRes.data.success ? stockRes.data.data : [],
            orders: orderRes.data.success ? orderRes.data.data : []
        };
    };

    const handleDownloadCSV = async () => {
        setStatus('generating');
        try {
            const data = await fetchReportData();
            
            const salesCountByProduct = {};
            data.orders.forEach(order => {
                if (order.items) {
                    order.items.forEach(item => {
                        salesCountByProduct[item.product] = (salesCountByProduct[item.product] || 0) + item.quantity;
                    });
                }
            });

            const getMovingStatus = (productName, sku) => {
                const soldQty = (salesCountByProduct[productName] || 0) + (salesCountByProduct[sku] || 0);
                if (soldQty > 50) return 'Fast Moving';
                if (soldQty > 10) return 'Moving';
                return 'Low Moving';
            };

            let csv = 'Report Generated: ' + new Date().toLocaleString() + '\n\n';
            csv += '--- INVENTORY STATUS ---\n';
            csv += 'SKU,Name,Category,Quantity,Status,Unit Price\n';
            data.stock.forEach(item => {
                const movingStatus = getMovingStatus(item.name, item.sku);
                csv += `"${item.sku}","${item.name}","${item.category}",${item.quantity},"${movingStatus}",$${item.price}\n`;
            });

            csv += '\n--- RECENT SALES ---\n';
            csv += 'Order ID,Customer,Status,Total Amount,Date\n';
            data.orders.slice(0, 50).forEach(order => {
                const customerName = order.customer ? order.customer.name : 'Unknown';
                csv += `"${order._id}","${customerName}","${order.status}",$${order.totalAmount},"${new Date(order.createdAt).toLocaleDateString()}"\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Astratos_Report_${new Date().getTime()}.csv`;
            link.click();

            setStatus('done');
            setTimeout(onClose, 2000);
        } catch (err) {
            console.error(err);
            setStatus('idle');
            alert('Error generating CSV report.');
        }
    };

    const handleDownloadPDF = async () => {
        setStatus('generating');
        try {
            const data = await fetchReportData();
            
            const salesCountByProduct = {};
            data.orders.forEach(order => {
                if (order.items) {
                    order.items.forEach(item => {
                        salesCountByProduct[item.product] = (salesCountByProduct[item.product] || 0) + item.quantity;
                    });
                }
            });

            const getMovingStatus = (productName, sku) => {
                const soldQty = (salesCountByProduct[productName] || 0) + (salesCountByProduct[sku] || 0);
                if (soldQty > 50) return 'Fast Moving';
                if (soldQty > 10) return 'Moving';
                return 'Low Moving';
            };

            const doc = new jsPDF();
            
            doc.setFontSize(22);
            doc.text('Astratos Supply Chain Report', 14, 22);
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
            doc.text(`Total SKUs: ${data.stock.length} | Total Sales volume: $${data.orders.reduce((a,b)=>a+(b.totalAmount||0),0).toLocaleString()}`, 14, 36);

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Inventory Status', 14, 48);

            const inventoryBody = data.stock.map(item => [
                item.sku,
                item.name,
                item.quantity.toString(),
                getMovingStatus(item.name, item.sku),
                `$${item.price}`
            ]);

            autoTable(doc, {
                startY: 52,
                head: [['SKU', 'Product Name', 'Qty', 'Status', 'Price']],
                body: inventoryBody,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] },
                styles: { fontSize: 9 }
            });

            let finalY = doc.lastAutoTable.finalY || 52;
            doc.setFontSize(14);
            doc.text('Recent Sales Operations', 14, finalY + 14);

            const salesBody = data.orders.slice(0, 30).map(order => {
                const customerName = order.customer ? order.customer.name : 'Unknown';
                return [
                    order._id.substring(0, 8) + '...',
                    customerName,
                    order.status,
                    `$${order.totalAmount.toLocaleString()}`,
                    new Date(order.createdAt).toLocaleDateString()
                ];
            });

            autoTable(doc, {
                startY: finalY + 18,
                head: [['Order ID', 'Customer', 'Status', 'Total Amount', 'Date']],
                body: salesBody,
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] },
                styles: { fontSize: 9 }
            });

            doc.save(`Astratos_Report_${new Date().getTime()}.pdf`);
            
            setStatus('done');
            setTimeout(onClose, 2000);
        } catch (err) {
            console.error(err);
            setStatus('idle');
            alert('Error generating PDF report: ' + err.message);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="glass p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl relative overflow-hidden"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center text-2xl">
                        📊
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">Export Report</h3>
                        <p className="text-sm text-slate-400">Generate analytics data.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={status !== 'idle'}
                        className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition-all flex flex-col items-center gap-3 disabled:opacity-50"
                    >
                        <span className="text-4xl text-red-400">📄</span>
                        <span className="font-semibold text-slate-200">PDF Document</span>
                        <span className="text-[10px] text-slate-400 text-center">Formatted for printing & presentation</span>
                    </button>
                    
                    <button 
                        onClick={handleDownloadCSV}
                        disabled={status !== 'idle'}
                        className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all flex flex-col items-center gap-3 disabled:opacity-50"
                    >
                        <span className="text-4xl text-emerald-400">📊</span>
                        <span className="font-semibold text-slate-200">CSV Data</span>
                        <span className="text-[10px] text-slate-400 text-center">Raw data for Excel or processing</span>
                    </button>
                </div>

                {status === 'generating' && (
                    <div className="text-center text-sm text-blue-400 animate-pulse mb-4">
                        Fetching data and generating report...
                    </div>
                )}
                {status === 'done' && (
                    <div className="text-center text-sm text-green-400 font-bold mb-4">
                        Download complete!
                    </div>
                )}

                <button onClick={onClose} className="w-full px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium border border-white/5">Cancel</button>
            </motion.div>
        </motion.div>
    );
};

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
    const [justPromoted, setJustPromoted] = useState(false);
    const [promotionRejected, setPromotionRejected] = useState(false);
    const [demotedToViewer, setDemotedToViewer] = useState(false);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

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
                if (res.data.justPromoted) {
                    setJustPromoted(true);
                }
                if (res.data.promotionRejected) {
                    setPromotionRejected(true);
                }
                if (res.data.demotedToViewer) {
                    setDemotedToViewer(true);
                }
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

    const handleDismissOverlay = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/acknowledge-promotion', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setJustPromoted(false);
            setPromotionRejected(false);
            setDemotedToViewer(false);
        } catch (e) {
            console.error(e);
            setJustPromoted(false);
            setPromotionRejected(false);
            setDemotedToViewer(false);
        }
    };

    const handleGenerateReport = () => {
        if (userRole === 'viewer') {
            setShowReportModal(true);
        } else {
            setShowExportModal(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            <AnimatePresence>
                {justPromoted && <CongratsScreen onDismiss={handleDismissOverlay} />}
                {promotionRejected && <RejectionScreen onDismiss={handleDismissOverlay} />}
                {demotedToViewer && <DemotionScreen onDismiss={handleDismissOverlay} />}
                {showReportModal && <ViewerReportModal onClose={() => setShowReportModal(false)} />}
                {showExportModal && <OperatorReportModal onClose={() => setShowExportModal(false)} />}
            </AnimatePresence>
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
                                onClick={handleGenerateReport}
                                className="btn-primary"
                            >
                                Generate Report
                            </motion.button>
                        </motion.div>
                    </header>

                    <div className="space-y-8">
                        {userRole === 'admin' && <ScenarioController />}

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
