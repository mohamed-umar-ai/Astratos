import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useWebSocket } from '../utils/websocket';

const API_BASE = 'http://localhost:5000/api';

const useAuthAxios = () => {
    const token = localStorage.getItem('token');
    return axios.create({
        baseURL: API_BASE,
        headers: { Authorization: `Bearer ${token}` }
    });
};

const ManageUsers = () => {
    const api = useAuthAxios();
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', role: 'viewer', status: 'active', id: null });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSave = async () => {
        try {
            if (formData.id) {
                await api.put(`/admin/users/${formData.id}`, { email: formData.email, role: formData.role, status: formData.status });
            } else {
                await api.post('/admin/users', { email: formData.email, password: formData.password, role: formData.role, status: formData.status });
            }
            setShowModal(false);
            fetchUsers();
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || 'Error saving user');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (e) {
            console.error(e);
        }
    };

    const handlePromotion = async (id, approve) => {
        try {
            await api.put(`/admin/users/${id}/promotion`, { approve });
            fetchUsers();
        } catch (e) {
            console.error(e);
            alert('Error handling promotion');
        }
    };

    const openEdit = (u) => {
        setFormData({ email: u.email, password: '', role: u.role, id: u._id });
        setShowModal(true);
    };

    const RoleBadge = ({ role }) => {
        const colors = {
            admin: 'bg-red-500/20 text-red-400 border-red-500/30',
            operator: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            viewer: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        };
        return <span className={`px-2 py-1 flex-shrink-0 rounded text-xs font-semibold border uppercase tracking-wide ${colors[role] || colors.viewer}`}>{role}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Manage Users</h2>
                    <p className="text-slate-400 text-sm">Add, edit, promote, or remove user accounts.</p>
                </div>
                <button
                    onClick={() => { setFormData({ email: '', password: '', role: 'viewer', status: 'active', id: null }); setShowModal(true); }}
                    className="btn-primary whitespace-nowrap"
                >
                    + Add User
                </button>
            </div>

            <div className="glass rounded-xl overflow-x-auto border border-white/5">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="p-4 font-medium text-slate-300">User Email</th>
                            <th className="p-4 font-medium text-slate-300 w-32">Role</th>
                            <th className="p-4 font-medium text-slate-300 w-24">Status</th>
                            <th className="p-4 font-medium text-slate-300 w-48">Joined Date</th>
                            <th className="p-4 font-medium text-slate-300 text-right w-48">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="font-semibold text-white">{u.email}</div>
                                </td>
                                <td className="p-4"><RoleBadge role={u.role} /></td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${u.status === 'inactive' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                        {u.status || 'active'}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <div className="flex flex-col items-end gap-2 w-full">
                                        {u.promotionRequested && (
                                            <div className="flex gap-1 border border-blue-500/30 rounded p-1 bg-blue-500/10 justify-center w-fit">
                                                <span className="text-xs text-blue-300 px-1 py-0.5 flex items-center mr-1">Wants Operator:</span>
                                                <button onClick={() => handlePromotion(u._id, true)} className="px-2 py-0.5 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded text-xs transition-colors">Accept</button>
                                                <button onClick={() => handlePromotion(u._id, false)} className="px-2 py-0.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded text-xs transition-colors">Reject</button>
                                            </div>
                                        )}
                                        <div className="flex justify-end gap-2 w-full">
                                            <button onClick={() => openEdit(u)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors border border-white/10 font-medium">Edit</button>
                                            <button onClick={() => handleDelete(u._id)} className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-sm transition-colors border border-red-500/20 font-medium">Delete</button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-400">No users found...</td></tr>}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="glass p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                            <h3 className="text-2xl font-bold mb-6 relative">{formData.id ? 'Edit User' : 'Add New User'}</h3>
                            <div className="space-y-5 relative">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-900 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl p-3 text-white transition-all outline-none" placeholder="user@example.com" />
                                </div>
                                {!formData.id && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                                        <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-900 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl p-3 text-white transition-all outline-none" placeholder="••••••••" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Assign Role</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-900 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl p-3 text-white transition-all outline-none appearance-none">
                                        <option value="viewer">Viewer (Read-only)</option>
                                        <option value="operator">Operator (Standard)</option>
                                        <option value="admin">Admin (Full Access)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Account Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-900 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl p-3 text-white transition-all outline-none appearance-none">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3 relative">
                                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">Cancel</button>
                                <button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all font-medium">Save User</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SystemSettings = () => {
    const api = useAuthAxios();
    const [saving, setSaving] = useState(null);
    const [toast, setToast] = useState('');
    const [settings, setSettings] = useState({
        inventory: { autoReorder: true, multiplier: 1.5 },
        forecast: { model: 'Prophet v2 (Default)', overnight: true },
        notifications: { email: true, push: true, sms: false },
        security: { twoFa: false, rotate: true, lockout: true },
        general: { timezone: 'UTC (Default)', format24: true }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                if (Object.keys(res.data).length > 0) {
                    setSettings(prev => ({ ...prev, ...res.data }));
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (endpoint, key, value) => {
        setSettings(prev => ({ ...prev, [endpoint]: { ...prev[endpoint], [key]: value } }));
    };

    const handleSave = async (endpoint) => {
        setSaving(endpoint);
        try {
            await api.post(`/settings/${endpoint}`, settings[endpoint]);
            setToast(`${endpoint.toUpperCase()} settings saved successfully!`);
            setTimeout(() => { setSaving(null); setToast(''); }, 3000);
        } catch (e) {
            console.error(e);
            setSaving(null);
            setToast('Error saving settings.');
            setTimeout(() => setToast(''), 3000);
        }
    };

    const SettingCard = ({ title, desc, endpoint, children }) => (
        <div className="glass p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500" />
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-sm text-slate-400 mb-6">{desc}</p>
            <div className="space-y-4 mb-8">{children}</div>
            <button
                onClick={() => handleSave(endpoint)}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-all border border-white/10 flex items-center justify-center gap-2"
                disabled={saving === endpoint}
            >
                <span>{saving === endpoint ? 'Saving...' : `Save ${title}`}</span>
                {saving === endpoint && <span className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-white animate-spin" />}
            </button>
        </div>
    );

    const Toggle = ({ label, endpoint, settingKey }) => (
        <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
            <div className="relative">
                <input type="checkbox" className="sr-only peer" checked={settings[endpoint][settingKey] || false} onChange={e => handleChange(endpoint, settingKey, e.target.checked)} />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 transition-colors"></div>
            </div>
        </label>
    );

    return (
        <div className="space-y-8 relative">
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute -top-16 left-1/2 -translate-x-1/2 bg-green-500/90 text-white px-6 py-3 rounded-full shadow-lg shadow-green-500/20 backdrop-blur-md z-50 flex items-center gap-2 text-sm font-semibold">
                        <span>✓</span> {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
                <h2 className="text-2xl font-bold">System Configuration</h2>
                <p className="text-slate-400 text-sm">Fine-tune logic parameters, notification delivery, and security rules.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SettingCard title="Inventory Logic" desc="Set automated safety protocols and rules." endpoint="inventory">
                    <Toggle label="Auto-reorder on < Safety Stock" endpoint="inventory" settingKey="autoReorder" />
                    <div className="pt-2">
                        <div className="flex justify-between text-sm mb-2 text-slate-400">
                            <span>Reorder Multiplier</span>
                            <span className="text-blue-400 font-medium">{settings.inventory.multiplier}x</span>
                        </div>
                        <input type="range" min="1" max="3" step="0.1" value={settings.inventory.multiplier} onChange={e => handleChange('inventory', 'multiplier', e.target.value)} className="w-full accent-blue-500 bg-slate-800 h-1.5 rounded-lg appearance-none" />
                    </div>
                </SettingCard>

                <SettingCard title="AI Forecast" desc="Data processing and prediction models." endpoint="forecast">
                    <div className="pt-1">
                        <div className="text-sm mb-2 text-slate-400">Primary AI Model</div>
                        <select value={settings.forecast.model} onChange={e => handleChange('forecast', 'model', e.target.value)} className="w-full bg-slate-900 border border-white/10 focus:border-blue-500/50 rounded-xl p-2.5 text-slate-300 text-sm outline-none appearance-none">
                            <option>Prophet v2 (Default)</option>
                            <option>ARIMA Time-Series</option>
                            <option>LSTM Neural Network</option>
                        </select>
                    </div>
                    <div className="pt-2 h-px bg-white/5 w-full my-2" />
                    <Toggle label="Overnight Retraining" endpoint="forecast" settingKey="overnight" />
                </SettingCard>

                <SettingCard title="Notifications" desc="Manage alerting and broadcast channels." endpoint="notifications">
                    <Toggle label="Email Daily Digests" endpoint="notifications" settingKey="email" />
                    <Toggle label="Push Notifications" endpoint="notifications" settingKey="push" />
                    <Toggle label="SMS Alerts (Critical Only)" endpoint="notifications" settingKey="sms" />
                </SettingCard>

                <SettingCard title="Security Policies" desc="Enforce global authentication flows." endpoint="security">
                    <Toggle label="Require 2FA for ALL roles" endpoint="security" settingKey="twoFa" />
                    <Toggle label="Mandatory 90-day password rotation" endpoint="security" settingKey="rotate" />
                    <Toggle label="Lockout after 3 failed attempts" endpoint="security" settingKey="lockout" />
                </SettingCard>

                <SettingCard title="Localization" desc="Regional formatting and timelines." endpoint="general">
                    <div className="pt-1">
                        <div className="text-sm mb-2 text-slate-400">System Timezone</div>
                        <select value={settings.general.timezone} onChange={e => handleChange('general', 'timezone', e.target.value)} className="w-full bg-slate-900 border border-white/10 focus:border-blue-500/50 rounded-xl p-2.5 text-slate-300 text-sm outline-none appearance-none">
                            <option>UTC (Default)</option>
                            <option>America/New_York (EST)</option>
                            <option>Europe/London (GMT)</option>
                            <option>Asia/Tokyo (JST)</option>
                        </select>
                    </div>
                    <div className="pt-2 h-px bg-white/5 w-full my-2" />
                    <Toggle label="Use 24-hour time format" endpoint="general" settingKey="format24" />
                </SettingCard>
            </div>
        </div>
    );
};

const ViewLogs = () => {
    const api = useAuthAxios();
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const wsClient = useWebSocket();

    const fetchLogs = async () => {
        try {
            await api.post('/logs/seed'); // Automatically ensure data is seeded
            const res = await api.get('/logs');
            setLogs(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchLogs();
        wsClient.connect();
        
        const updateLogs = () => fetchLogs();
        
        const u1 = wsClient.on('INVENTORY_UPDATE', updateLogs);
        const u2 = wsClient.on('ORDER_CREATED', updateLogs);
        const u3 = wsClient.on('ORDER_UPDATED', updateLogs);
        const u4 = wsClient.on('NOTIFICATION', updateLogs);
        const u5 = wsClient.on('SHIPMENT_CREATED', updateLogs);
        const u6 = wsClient.on('SALES_UPDATE', updateLogs);
        const u7 = wsClient.on('SYSTEM_UPDATE', updateLogs);
        const u8 = wsClient.on('SECURITY_UPDATE', updateLogs);

        return () => {
            u1(); u2(); u3(); u4(); u5(); u6(); u7(); u8();
        };
    }, [wsClient]);

    const filteredLogs = logs
        .filter(l => filter === 'all' || l.type === filter)
        .filter(l => search === '' || l.message.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()));

    const logTypes = ['all', 'login', 'inventory', 'forecast', 'security', 'notification', 'system'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Audit & System Logs</h2>
                    <p className="text-slate-400 text-sm">Review full traceability matrix and system events.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-900 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 w-64 transition-all"
                        />
                    </div>
                    <button onClick={fetchLogs} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors group">
                        <span className="block group-hover:rotate-180 transition-transform duration-500">🔄</span>
                    </button>
                </div>
            </div>

            <div className="flex gap-2 flex-wrap pb-2">
                {logTypes.map(t => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${filter === t ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {(filter === 'forecast' || filter === 'security' || filter === 'system') ? (
                <div className="flex justify-center items-center py-20">
                    <div className="glass p-8 rounded-3xl border border-white/5 text-center max-w-md shadow-2xl relative overflow-hidden bg-slate-900/50">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="text-5xl mb-4">🚧</div>
                        <h3 className="text-xl font-bold text-white mb-2">Under Development</h3>
                        <p className="text-slate-400 text-sm">
                            Sorry, we are currently working on the <span className="uppercase font-semibold text-blue-400">{filter}</span> module. It will be available soon!
                        </p>
                    </div>
                </div>
            ) : (
                <div className="glass rounded-2xl overflow-x-auto border border-white/5 shadow-xl">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/10 bg-slate-900/50 uppercase text-xs tracking-wider">
                                <th className="p-4 font-semibold text-slate-400 w-48">Timestamp</th>
                                <th className="p-4 font-semibold text-slate-400 w-32">Module</th>
                                <th className="p-4 font-semibold text-slate-400 w-64">User / Actor</th>
                                <th className="p-4 font-semibold text-slate-400">Event Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-sm">
                            {filteredLogs.map(l => (
                                <tr key={l._id} className="hover:bg-white-[0.02] transition-colors">
                                    <td className="p-4 text-slate-500 whitespace-nowrap">
                                        {new Date(l.createdAt).toLocaleDateString()} <span className="text-slate-600">|</span> {new Date(l.createdAt).toLocaleTimeString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold tracking-widest ${l.type === 'security' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                            l.type === 'notification' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                'bg-white/5 text-slate-300 border border-white/5'
                                            }`}>
                                            {l.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-blue-400">{l.user}</td>
                                    <td className="p-4 text-slate-300 truncate max-w-md">{l.message}</td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr><td colSpan="4" className="p-12 text-center text-slate-500 font-sans italic">No entries match the current filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { tab } = useParams();
    const [activeTab, setActiveTab] = useState(tab || 'users');
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || role !== 'admin') {
            navigate('/dashboard');
        } else {
            setIsAuthorized(true);
        }
    }, [navigate]);

    useEffect(() => {
        if (tab && ['users', 'settings', 'logs'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [tab]);

    if (!isAuthorized) return <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white">Verifying credentials...</div>;

    const tabs = [
        { id: 'users', label: 'User Directory', icon: '👥' },
        { id: 'settings', label: 'System Config', icon: '⚙️' },
        { id: 'logs', label: 'Audit Trail', icon: '📋' }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">
            <Sidebar />

            <main className="flex-1 ml-0 md:ml-0 p-6 md:p-10 pt-24 transition-all duration-300">
                <div className="container mx-auto max-w-7xl">

                    <header className="mb-10 flex flex-col xl:flex-row xl:justify-between xl:items-end gap-6 relative">
                        <div className="absolute top-0 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                                    🛡️
                                </div>
                                <div>
                                    <h1 className="text-4xl font-extrabold tracking-tight">Admin Console</h1>
                                    <p className="text-slate-400 mt-1 uppercase text-xs font-bold tracking-widest">Global Command Center</p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md self-start xl:self-end">
                            {tabs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => { setActiveTab(t.id); navigate(`/admin/${t.id}`); }}
                                    className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === t.id ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white shadow-lg border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                                >
                                    <span className="text-base">{t.icon}</span>
                                    <span>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </header>

                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {activeTab === 'users' && <ManageUsers />}
                                {activeTab === 'settings' && <SystemSettings />}
                                {activeTab === 'logs' && <ViewLogs />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
