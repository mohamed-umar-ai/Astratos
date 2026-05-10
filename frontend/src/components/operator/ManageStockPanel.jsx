import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../../utils/websocket';
import LineChart from '../LineChart';

export default function ManageStockPanel() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionType, setActionType] = useState('add');
  const [selectedStockId, setSelectedStockId] = useState('');
  const [amount, setAmount] = useState('');
  const [department, setDepartment] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: '', quantity: 0, threshold: 10, department: 'Main Warehouse', price: 0 });

  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [inventoryValue, setInventoryValue] = useState({ totalValue: 0, totalItems: 0, productCount: 0 });
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAudit, setShowAudit] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');

  const [graphData, setGraphData] = useState([]);
  const ws = useWebSocket();

  const fetchStock = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/operator/stock');
      const data = await res.json();
      if (data.success) setStock(data.data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/operator/stock/meta');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories);
        setDepartments(data.data.departments);
      }
    } catch (err) {}
  }, []);

  const fetchValue = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/operator/stock/value');
      const data = await res.json();
      if (data.success) setInventoryValue(data.data);
    } catch (err) {}
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/operator/stock/alerts');
      const data = await res.json();
      if (data.success) setLowStockAlerts(data.data);
    } catch (err) {}
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/operator/audit-trail?category=stock');
      const data = await res.json();
      if (data.success) setAuditLogs(data.data);
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchStock();
    fetchMeta();
    fetchValue();
    fetchAlerts();
    fetchAuditLogs();
  }, [fetchStock, fetchMeta, fetchValue, fetchAlerts, fetchAuditLogs]);

  useEffect(() => {
    // We only poll non-graph lists here per requirement, or we skip polling if WS is robust.
    const interval = setInterval(() => {
      fetchAlerts();
      fetchAuditLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchAlerts, fetchAuditLogs]);

  useEffect(() => {
    if (inventoryValue.totalItems > 0 && graphData.length === 0) {
      setGraphData([{ label: 'Init', value: inventoryValue.totalItems }]);
    }
  }, [inventoryValue.totalItems, graphData.length]);

  useEffect(() => {
    const handleInventoryUpdate = async () => {
      // Fetch latest value on event and strictly update graph
      try {
        const res = await fetch('http://localhost:5000/api/operator/stock/value');
        const data = await res.json();
        if (data.success) {
          setInventoryValue(data.data);
          setGraphData(prev => [...prev.slice(-30), { label: new Date().toLocaleTimeString(), value: data.data.totalItems }]);
        }
        fetchStock(); // update list
      } catch (err) {}
    };

    const unsub = ws.on('INVENTORY_UPDATE', handleInventoryUpdate);
    return () => unsub();
  }, [ws, fetchStock]);

  const handleAction = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      let payload = {};

      if (isCreatingNew) {
        endpoint = '/api/operator/stock/add';
        payload = newProduct;
      } else {
        if (actionType === 'add') {
          endpoint = '/api/operator/stock/add';
          payload = { id: selectedStockId, quantity: Number(amount) };
        } else if (actionType === 'reduce') {
          endpoint = '/api/operator/stock/reduce';
          payload = { id: selectedStockId, quantity: Number(amount) };
        } else if (actionType === 'transfer') {
          endpoint = '/api/operator/stock/transfer';
          payload = { id: selectedStockId, department };
        } else if (actionType === 'delete') {
          endpoint = '/api/operator/stock/delete';
          payload = { id: selectedStockId };
        }
      }

      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        fetchStock();
        fetchValue();
        fetchAlerts();
        fetchMeta();
        fetchAuditLogs();
        setAmount('');
        setIsCreatingNew(false);
        setNewProduct({ name: '', sku: '', category: '', quantity: 0, threshold: 10, department: 'Main Warehouse', price: 0 });
      }
    } catch (error) {
      console.error('Error performing stock action:', error);
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    setCategories(prev => [...prev, newCategoryName.trim()].sort());
    setNewProduct({ ...newProduct, category: newCategoryName.trim() });
    setNewCategoryName('');
    setShowCategoryModal(false);
  };

  const handleAddDept = () => {
    if (!newDeptName.trim()) return;
    setDepartments(prev => [...prev, newDeptName.trim()].sort());
    setNewProduct({ ...newProduct, department: newDeptName.trim() });
    setNewDeptName('');
    setShowDeptModal(false);
  };

  const handleCategoryChange = (val) => {
    if (val === '__ADD_NEW__') {
      setShowCategoryModal(true);
    } else {
      setNewProduct({ ...newProduct, category: val });
    }
  };

  const handleDeptChange = (val) => {
    if (val === '__ADD_NEW__') {
      setShowDeptModal(true);
    } else {
      if (isCreatingNew) {
        setNewProduct({ ...newProduct, department: val });
      } else {
        setDepartment(val);
      }
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex gap-6 h-full overflow-hidden relative">
      <div className={`${showAudit ? 'w-5/12' : 'w-7/12'} flex flex-col pt-2 min-h-0 transition-all duration-300`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-light text-slate-200">Current Inventory Overview</h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowAudit(!showAudit)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors border ${showAudit ? 'bg-violet-500/20 text-violet-400 border-violet-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
            >
              📋 Audit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 shrink-0">
          <div className="bg-gradient-to-br from-cyan-900/30 to-slate-800/50 border border-cyan-700/30 p-4 rounded-xl">
            <p className="text-[10px] text-cyan-400/70 uppercase tracking-widest font-semibold mb-1">Total Value</p>
            <p className="text-xl font-light text-cyan-300">${inventoryValue.totalValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Total Units</p>
            <p className="text-xl font-light text-slate-200">{inventoryValue.totalItems?.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Products</p>
            <p className="text-xl font-light text-slate-200">{inventoryValue.productCount}</p>
          </div>
        </div>



        {lowStockAlerts.length > 0 && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <h3 className="text-xs text-amber-400 uppercase tracking-wider font-semibold">Low Stock Alerts ({lowStockAlerts.length})</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {lowStockAlerts.slice(0, 5).map(alert => (
                <div key={alert._id} className="shrink-0 bg-slate-900/60 border border-amber-500/20 rounded-lg px-3 py-2 text-xs">
                  <p className="text-amber-300 font-medium">{alert.name}</p>
                  <p className="text-slate-500 mt-0.5">
                    <span className="text-red-400 font-mono">{alert.quantity}</span>/{alert.threshold} — Reorder <span className="text-emerald-400">+{alert.suggestedReorder}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 rounded-2xl bg-slate-900 border border-slate-700/50 min-h-0">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 sticky top-0 text-slate-400 capitalize pb-2 z-10">
              <tr>
                <th className="p-4 font-semibold">SKU / Item</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold text-right">Qty</th>
                <th className="p-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan="5" className="text-center p-8 border-none">Loading...</td></tr>
              ) : stock.map((item, idx) => (
                <motion.tr
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-medium text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{item.sku}</p>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-xs font-medium border border-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-800/60 text-slate-400 px-2 py-0.5 rounded-md text-xs font-medium border border-slate-700/50">
                      {item.department}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-mono font-medium ${item.quantity <= item.threshold ? 'text-red-400' : 'text-slate-300'}`}>
                    {item.quantity}
                  </td>
                  <td className="p-4 text-center">
                    {item.quantity <= 0 ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                    ) : item.quantity <= item.threshold ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block shadow-[0_0_8px_rgba(234,179,8,0.8)]"></span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`${showAudit ? 'w-4/12' : 'w-5/12'} bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col min-h-0 relative overflow-hidden transition-all duration-300`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

        <h2 className="text-xl font-light mb-6 text-slate-200">Stock Modifications</h2>

        <div className="flex bg-slate-900/80 p-1.5 rounded-xl mb-6 shadow-inner border border-slate-800 shrink-0">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isCreatingNew && actionType === 'add' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => { setIsCreatingNew(false); setActionType('add'); }}
          >Add</button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isCreatingNew && actionType === 'reduce' ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => { setIsCreatingNew(false); setActionType('reduce'); }}
          >Reduce</button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isCreatingNew && actionType === 'transfer' ? 'bg-purple-500 text-slate-100 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => { setIsCreatingNew(false); setActionType('transfer'); }}
          >Transfer</button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isCreatingNew && actionType === 'delete' ? 'bg-red-500 text-slate-100 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => { setIsCreatingNew(false); setActionType('delete'); }}
          >Delete</button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isCreatingNew ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            onClick={() => setIsCreatingNew(true)}
          >New</button>
        </div>

        <form onSubmit={handleAction} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-5">
            {!isCreatingNew ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Select Item</label>
                  <select
                    required
                    value={selectedStockId}
                    onChange={e => setSelectedStockId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/50 text-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                  >
                    <option value="">-- Choose item --</option>
                    {stock.map(s => <option key={s._id} value={s._id}>{s.name} (Qty: {s.quantity})</option>)}
                  </select>
                </div>

                {actionType !== 'transfer' && actionType !== 'delete' ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Quantity</label>
                    <input
                      type="number" min="1" required
                      value={amount} onChange={e => setAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/50 text-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    />
                  </div>
                ) : actionType === 'transfer' ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">New Department</label>
                    <select
                      required
                      value={department}
                      onChange={e => handleDeptChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/50 text-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      <option value="__ADD_NEW__">➕ Add New Department</option>
                    </select>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Name</label>
                  <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">SKU</label>
                  <input type="text" required value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:ring-2 focus:ring-cyan-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                  <select
                    required
                    value={newProduct.category}
                    onChange={e => handleCategoryChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="">-- Select --</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="__ADD_NEW__">➕ Add New Category</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Initial Qty</label>
                  <input type="number" required value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Price</label>
                  <input type="number" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/50" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Department</label>
                  <select
                    required
                    value={newProduct.department}
                    onChange={e => handleDeptChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="">-- Select --</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    <option value="__ADD_NEW__">➕ Add New Department</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="shrink-0 mt-4 w-full py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
          >
            Execute {isCreatingNew ? 'Creation' : actionType.charAt(0).toUpperCase() + actionType.slice(1)}
          </button>
        </form>
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
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold">Stock Audit Trail</h3>
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

      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-80 shadow-2xl"
            >
              <h3 className="text-lg font-light text-white mb-4">Add New Category</h3>
              <input
                type="text"
                autoFocus
                placeholder="Category name"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white mb-4 outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <div className="flex gap-2">
                <button onClick={handleAddCategory} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded-lg transition-colors text-sm">Save</button>
                <button onClick={() => setShowCategoryModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 rounded-lg transition-colors text-sm">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeptModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-80 shadow-2xl"
            >
              <h3 className="text-lg font-light text-white mb-4">Add New Department</h3>
              <input
                type="text"
                autoFocus
                placeholder="Department name"
                value={newDeptName}
                onChange={e => setNewDeptName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddDept()}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white mb-4 outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <div className="flex gap-2">
                <button onClick={handleAddDept} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded-lg transition-colors text-sm">Save</button>
                <button onClick={() => setShowDeptModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 rounded-lg transition-colors text-sm">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
