import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../utils/websocket';
import BarChart from '../BarChart';

export default function CarrierDashboard() {
  const [carriers, setCarriers] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCarrier, setNewCarrier] = useState({ name: '', contactEmail: '', phone: '' });

  const ws = useWebSocket();

  const fetchCarriers = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/suppliers/carriers');
      const data = await res.json();
      if (data.success) setCarriers(data.data);
    } catch (err) {}
  }, []);

  const fetchShipmentGraph = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/operator/shipping');
      const data = await res.json();
      if (data.success) {
        const carrierMap = {};
        data.data.forEach(s => {
          const c = s.carrier || 'Unknown';
          carrierMap[c] = (carrierMap[c] || 0) + 1;
        });
        const sorted = Object.entries(carrierMap)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value);
        setGraphData(sorted);
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    Promise.all([fetchCarriers(), fetchShipmentGraph()]).then(() => setLoading(false));
  }, [fetchCarriers, fetchShipmentGraph]);

  useEffect(() => {
    const handleNotification = (payload) => {
      if (payload.type === 'NEW_CARRIER') fetchCarriers();
    };
    const handleShipment = () => fetchShipmentGraph();

    const unsubNotif = ws.on('NOTIFICATION', handleNotification);
    const unsubShipment = ws.on('SHIPMENT_CREATED', handleShipment);
    return () => { unsubNotif(); unsubShipment(); };
  }, [ws, fetchCarriers, fetchShipmentGraph]);

  const handleAddCarrier = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/suppliers/carriers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCarrier)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewCarrier({ name: '', contactEmail: '', phone: '' });
        fetchCarriers();
      }
    } catch (err) { console.error(err); }
  };

  const activeCount = carriers.filter(c => c.status === 'Active').length;
  const inactiveCount = carriers.length - activeCount;
  const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500';

  return (
    <div className="flex flex-col h-full gap-6">

      {/* ── Top Row: Stats + Shipments Graph ── */}
      <div className="flex gap-6 h-[38%]">
        <div className="w-1/3 min-h-0 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Carrier Network</h2>
          <div className="flex justify-between items-end relative z-10">
            <div>
              <div className="text-5xl font-light text-white mb-2">{carriers.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Carriers</div>
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
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Per Carrier</h2>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono border border-slate-700">LIVE FEED</span>
          </div>
          <div className="flex-1 min-h-0 relative">
            <BarChart key={JSON.stringify(graphData)} data={graphData} height={160} color="#06b6d4" labelText="Shipments" />
          </div>
        </div>
      </div>

      {/* ── Carrier Directory ── */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center sticky top-0 bg-slate-900/90 backdrop-blur z-10">
          <h2 className="text-xl font-light text-slate-200">Carrier Directory</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-colors"
          >
            + Add Carrier
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {loading ? (
            <div className="text-center text-slate-500 py-10 text-sm">Loading carriers...</div>
          ) : carriers.length === 0 ? (
            <div className="text-center text-slate-500 py-10 bg-slate-800/30 rounded-xl border border-slate-700/50">No carriers registered yet.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {carriers.map(c => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-cyan-900/40 border border-cyan-700/50 flex items-center justify-center font-bold text-cyan-300 text-xs shrink-0">
                        {c.name.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-200 text-base leading-tight">{c.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Carrier</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] rounded border font-bold uppercase tracking-wider ${
                      c.status === 'Active'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 font-mono border-t border-slate-700/50 pt-3">
                    <p>{c.contactEmail}</p>
                    <p>{c.phone}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Carrier Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-cyan-900/50 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-light text-white">New Carrier</h2>
                  <p className="text-xs text-cyan-400/70 mt-1">Register a new carrier to the network</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
              </div>
              <form onSubmit={handleAddCarrier} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Carrier Name</label>
                  <input required type="text" value={newCarrier.name} onChange={e => setNewCarrier({...newCarrier, name: e.target.value})} className={inputCls} placeholder="e.g. FedEx, UPS, Blue Dart" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Contact Email</label>
                    <input required type="email" value={newCarrier.contactEmail} onChange={e => setNewCarrier({...newCarrier, contactEmail: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1.5">Phone</label>
                    <input required type="text" value={newCarrier.phone} onChange={e => setNewCarrier({...newCarrier, phone: e.target.value})} className={inputCls} />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-cyan-600 text-white hover:bg-cyan-500 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.35)]">Add Carrier</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
