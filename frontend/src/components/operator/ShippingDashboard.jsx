import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShippingDashboard() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editTrackingId, setEditTrackingId] = useState(null);
  const [editTracking, setEditTracking] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAudit, setShowAudit] = useState(false);

  const fetchShipments = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/operator/shipping');
      const data = await res.json();
      if (data.success) setShipments(data.data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/operator/audit-trail?category=shipping');
      const data = await res.json();
      if (data.success) setAuditLogs(data.data);
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchShipments();
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchShipments();
      fetchAuditLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/operator/shipping/${id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus })
      });
      const data = await res.json();
      if (data.success) {
        setShipments(shipments.map(s => s._id === id ? { ...s, status: data.data.status } : s));
        setEditingId(null);
        fetchAuditLogs();
      }
    } catch (error) {
      console.error('Error updating shipping status:', error);
    }
  };

  const updateTracking = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/operator/shipping/${id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: editTracking })
      });
      const data = await res.json();
      if (data.success) {
        setShipments(shipments.map(s => s._id === id ? { ...s, trackingNumber: data.data.trackingNumber } : s));
        setEditTrackingId(null);
        fetchAuditLogs();
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
      case 'in transit': return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">In Transit</span>;
      case 'delivered': return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-full text-xs font-bold uppercase tracking-wider">Delivered</span>;
      case 'exception': return <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded-full text-xs font-bold uppercase tracking-wider">Exception</span>;
      default: return <span className="px-3 py-1 bg-slate-500/20 text-slate-400 border border-slate-500/50 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const getCarrierLogo = (carrier) => {
    const c = carrier.toLowerCase();
    if (c.includes('fedex')) return <div className="w-10 h-10 rounded-lg bg-indigo-900/50 border border-indigo-700 flex items-center justify-center font-bold text-indigo-300 text-xs">FDX</div>;
    if (c.includes('ups')) return <div className="w-10 h-10 rounded-lg bg-orange-900/50 border border-orange-700 flex items-center justify-center font-bold text-orange-300 text-xs">UPS</div>;
    if (c.includes('dhl')) return <div className="w-10 h-10 rounded-lg bg-yellow-900/30 border border-yellow-700 flex items-center justify-center font-bold text-yellow-500 text-xs">DHL</div>;
    if (c.includes('usps')) return <div className="w-10 h-10 rounded-lg bg-blue-900/50 border border-blue-700 flex items-center justify-center font-bold text-blue-300 text-xs">USPS</div>;
    if (c.includes('blue dart')) return <div className="w-10 h-10 rounded-lg bg-sky-900/50 border border-sky-600 flex items-center justify-center font-bold text-sky-300 text-xs">BD</div>;
    if (c.includes('aramex')) return <div className="w-10 h-10 rounded-lg bg-red-900/50 border border-red-700 flex items-center justify-center font-bold text-red-300 text-xs">ARX</div>;
    if (c.includes('astratos')) return <div className="w-10 h-10 rounded-lg bg-cyan-900/50 border border-cyan-600 flex items-center justify-center font-bold text-cyan-300 text-xs">AEX</div>;
    return <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400 text-xs">{carrier.substring(0,3).toUpperCase()}</div>;
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full flex-1 flex gap-6 h-full overflow-hidden">
      <div className={`${showAudit ? 'w-9/12' : 'w-full'} flex flex-col min-h-0 transition-all duration-300`}>
        <div className="mb-6 flex justify-between items-start">
          <div className="flex gap-4 flex-1">
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl flex-1 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-2xl border border-blue-500/30">
                🚚
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">In Transit</p>
                <h3 className="text-3xl font-light text-slate-100">{shipments.filter(s => s.status === 'in transit').length}</h3>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl flex-1 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-2xl border border-yellow-500/30">
                📦
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Pending</p>
                <h3 className="text-3xl font-light text-slate-100">{shipments.filter(s => s.status === 'pending').length}</h3>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl flex-1 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl border border-emerald-500/30">
                ✅
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Delivered</p>
                <h3 className="text-3xl font-light text-slate-100">{shipments.filter(s => s.status === 'delivered').length}</h3>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAudit(!showAudit)}
            className={`ml-4 mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors border shrink-0 ${showAudit ? 'bg-violet-500/20 text-violet-400 border-violet-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
          >
            📋 Audit
          </button>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-light mb-6 text-slate-200">Active Shipments</h2>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10 text-slate-400">Loading shipments...</div>
            ) : shipments.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-700/50 rounded-xl bg-slate-900/30 text-slate-500">
                <p className="mb-2 text-2xl">📪</p>
                <p>No active shipments found.</p>
              </div>
            ) : shipments.map((shipment, idx) => (
              <motion.div
                key={shipment._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center gap-6 bg-slate-900/80 p-5 rounded-2xl border border-slate-700/80 hover:border-slate-600 transition-colors shadow-sm"
              >
                {getCarrierLogo(shipment.carrier)}

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-200 text-lg">{shipment.carrier}</h4>
                      {editTrackingId === shipment._id ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <input
                            type="text"
                            value={editTracking}
                            onChange={e => setEditTracking(e.target.value)}
                            className="bg-slate-950 border border-cyan-500/50 text-white text-xs rounded-md px-2 py-1 font-mono w-48 outline-none focus:ring-1 focus:ring-cyan-500"
                            autoFocus
                          />
                          <button onClick={() => updateTracking(shipment._id)} className="text-cyan-400 hover:text-cyan-300 text-xs font-bold">✓</button>
                          <button onClick={() => setEditTrackingId(null)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
                        </div>
                      ) : (
                        <p
                          className="text-xs text-slate-500 font-mono tracking-widest mt-0.5 cursor-pointer hover:text-cyan-400 transition-colors group"
                          onClick={() => { setEditTrackingId(shipment._id); setEditTracking(shipment.trackingNumber); }}
                          title="Click to edit tracking number"
                        >
                          #{shipment.trackingNumber} <span className="opacity-0 group-hover:opacity-100 text-cyan-400 ml-1">✏️</span>
                        </p>
                      )}
                    </div>
                    {getStatusBadge(shipment.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm mt-3 border-t border-slate-800 pt-3">
                    <span className="text-slate-400">
                      <span className="font-medium text-slate-500 uppercase text-xs mr-2">Dest:</span>
                      {shipment.destination}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400 font-mono text-xs">
                      <span className="font-medium text-slate-500 uppercase mr-2 font-sans">Created:</span>
                      {new Date(shipment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="border-l border-slate-800 pl-6 w-48 shrink-0">
                  {editingId === shipment._id ? (
                    <div className="flex flex-col gap-2">
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-cyan-500/50 text-slate-200 text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="exception">Exception</option>
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(shipment._id)} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs py-1.5 rounded-md font-medium transition-colors">Save</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-1.5 rounded-md font-medium transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(shipment._id); setEditStatus(shipment.status); }}
                      className="w-full h-full flex items-center justify-center px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-transparent hover:border-cyan-500/30 rounded-xl transition-all font-medium text-sm gap-2"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAudit && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="w-3/12 rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></div>
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold">Shipping Audit Trail</h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {auditLogs.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No audit logs yet.</p>
              ) : auditLogs.map((log, i) => (
                <motion.div
                  key={log.id || i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-cyan-400">{log.action}</span>
                    <span className="text-[10px] text-slate-600 font-mono">{formatTime(log.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{log.details}</p>
                  {log.item && log.item !== 'N/A' && (
                    <p className="text-[10px] text-slate-500 mt-1">→ {log.item}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
