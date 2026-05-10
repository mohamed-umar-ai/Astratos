import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../utils/websocket';
import BarChart from '../BarChart';

export default function SupplierDashboard() {
  const [suppliers, setSuppliers] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '', email: '', phone: '', department: 'Electronics', category: 'Components'
  });

  const ws = useWebSocket();

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/suppliers');
      const data = await res.json();
      if (data.success) setSuppliers(data.data);
    } catch (err) {}
  }, []);

  const fetchGraphData = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/suppliers/graph-data');
      const data = await res.json();
      if (data.success) {
        setGraphData(data.data.map(d => ({ label: d.name, value: d.deliveries })));
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    Promise.all([fetchSuppliers(), fetchGraphData()]).then(() => setLoading(false));
  }, [fetchSuppliers, fetchGraphData]);

  useEffect(() => {
    const handleSupplierDelivery = (payload) => {
      setGraphData(prev => {
        const idx = prev.findIndex(p => p.label === payload.supplier);
        if (idx !== -1) {
          const newData = [...prev];
          newData[idx] = { ...newData[idx], value: newData[idx].value + 1 };
          return newData;
        }
        return [...prev, { label: payload.supplier, value: 1 }];
      });
      setSuppliers(prev => prev.map(s =>
        s.name === payload.supplier
          ? { ...s, deliveryCount: s.deliveryCount + 1, status: 'Active', lastDelivery: new Date().toISOString() }
          : s
      ));
    };

    const handleNotification = (payload) => {
      if (payload.type === 'NEW_SUPPLIER') fetchSuppliers();
    };

    const unsubDelivery = ws.on('SUPPLIER_DELIVERY', handleSupplierDelivery);
    const unsubNotif = ws.on('NOTIFICATION', handleNotification);
    return () => { unsubDelivery(); unsubNotif(); };
  }, [ws, fetchSuppliers]);

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/suppliers/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewSupplier({ name: '', email: '', phone: '', department: 'Electronics', category: 'Components' });
      }
    } catch (err) { console.error(err); }
  };

  const activeCount = suppliers.filter(s => s.status === 'Active').length;
  const inactiveCount = suppliers.length - activeCount;

  const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500';

  return (
    <div className="flex flex-col h-full gap-6">

      {/* ── Top Row: Stats + Graph ── */}
      <div className="flex gap-6 h-[38%]">
        <div className="w-1/3 min-h-0 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Supplier Network</h2>
          <div className="flex justify-between items-end relative z-10">
            <div>
              <div className="text-5xl font-light text-white mb-2">{suppliers.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Suppliers</div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center justify-end gap-2">
                <span className="text-emerald-400 font-bold text-xl">{activeCount}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Active</span>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              <div className="flex items-center justify-end gap-2 text-slate-500">
                <span className="font-bold text-xl">{inactiveCount}</span>
                <span className="text-[10px] uppercase tracking-wider">Inactive</span>
                <div className="w-2 h-2 rounded-full border border-slate-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-2/3 min-h-0 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Per Supplier</h2>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono border border-slate-700">LIVE FEED</span>
          </div>
          <div className="flex-1 min-h-0 relative">
            <BarChart key={JSON.stringify(graphData)} data={graphData} height={160} color="#a78bfa" labelText="Deliveries" />
          </div>
        </div>
      </div>

      {/* ── Supplier Directory ── */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center sticky top-0 bg-slate-900/90 backdrop-blur z-10">
          <h2 className="text-xl font-light text-slate-200">Supplier Directory</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-colors"
          >
            + Add Supplier
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {loading ? (
            <div className="text-center text-slate-500 py-10 text-sm">Loading network...</div>
          ) : suppliers.length === 0 ? (
            <div className="text-center text-slate-500 py-10 bg-slate-800/30 rounded-xl border border-slate-700/50">No suppliers in the network.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {suppliers.map(s => (
                <div key={s._id} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex flex-col justify-between hover:border-violet-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-200 text-lg leading-tight">{s.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{s.category} • {s.department}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] rounded border font-bold uppercase tracking-wider ${s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="text-xs text-slate-400 space-y-1 font-mono">
                      <p>{s.email}</p>
                      <p>{s.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Deliveries</p>
                      <p className="text-xl text-violet-400 font-light">{s.deliveryCount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Supplier Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-light text-white">New Supplier</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
              </div>
              <form onSubmit={handleAddSupplier} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Company Name</label>
                  <input required type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Email</label>
                    <input required type="email" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Phone</label>
                    <input required type="text" value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Department</label>
                    <select value={newSupplier.department} onChange={e => setNewSupplier({...newSupplier, department: e.target.value})} className={inputCls}>
                      <option>Electronics</option><option>Apparel</option><option>Home &amp; Garden</option><option>Automotive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Category</label>
                    <input required type="text" value={newSupplier.category} onChange={e => setNewSupplier({...newSupplier, category: e.target.value})} className={inputCls} placeholder="e.g. Components" />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]">Create Supplier</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
