import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CUSTOMERS = [
  { name: 'Dr. Evelyn Hayes', email: 'e.hayes@astratos.io', phone: '+1 555-0192' },
  { name: 'Marcus Chen', email: 'marcus.chen@nexus.corp', phone: '+1 555-0234' },
  { name: 'Sofia Petrov', email: 'sofia.p@orion-logistics.com', phone: '+44 20 7946 0111' },
  { name: 'James Nakamura', email: 'j.nakamura@atlas-tech.io', phone: '+81 3-5555-0198' },
  { name: 'Amara Osei', email: 'amara.osei@zenith.co', phone: '+233 55-987-6543' },
  { name: 'Nikolai Volkov', email: 'n.volkov@ares-ind.com', phone: '+7 495-555-0132' },
  { name: 'Isabella Romano', email: 'i.romano@vega-supply.eu', phone: '+39 06-555-0187' },
  { name: 'Raj Patel', email: 'raj.patel@titan-group.in', phone: '+91 98765-43210' },
  { name: 'Luna Martinez', email: 'luna.m@stellarworks.co', phone: '+1 555-0276' },
  { name: 'Kwame Asante', email: 'k.asante@phoenix-mfg.com', phone: '+233 24-555-0145' },
  { name: 'Yuki Tanaka', email: 'yuki.t@horizon-labs.jp', phone: '+81 3-5555-0223' },
  { name: 'Elena Kowalski', email: 'elena.k@nova-dynamics.pl', phone: '+48 22-555-0198' },
  { name: 'Omar Farouk', email: 'omar.f@crescent-trade.ae', phone: '+971 4-555-0167' },
  { name: 'Priya Sharma', email: 'priya.s@quantum-solutions.in', phone: '+91 98123-45678' },
  { name: 'Diego Alvarez', email: 'diego.a@meridian-corp.mx', phone: '+52 55-5555-0134' },
  { name: 'Aisha Bello', email: 'aisha.b@apex-industries.ng', phone: '+234 802-555-0123' },
  { name: "Liam O'Connor", email: 'liam.oc@celtic-freight.ie', phone: '+353 1-555-0198' },
  { name: 'Mei Lin Wu', email: 'meiling.w@dragontech.cn', phone: '+86 10-5555-0145' }
];

export default function ProcessOrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [products, setProducts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAudit, setShowAudit] = useState(false);

  const [newOrder, setNewOrder] = useState({
    customer: { name: '', email: '', phone: '' },
    items: [],
    status: 'pending',
    totalAmount: 0,
    discount: 0
  });
  const [newItem, setNewItem] = useState({ product: '', quantity: 1, price: 0 });
  const [editingItemIdx, setEditingItemIdx] = useState(null);
  const [editQty, setEditQty] = useState(1);
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'operator');
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/operator/orders');
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/operator/stock');
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (err) {}
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/operator/audit-trail?category=orders');
      const data = await res.json();
      if (data.success) setAuditLogs(data.data);
    } catch (err) {}
  }, []);

  const fetchSimStatus = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/simulation/status');
      const data = await res.json();
      if (data.success) setIsSimulating(data.isRunning);
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchAuditLogs();
    fetchSimStatus();
    setUserRole(localStorage.getItem('role') || 'operator');
  }, []);

  const toggleSimulation = async () => {
    const action = isSimulating ? 'stop' : 'start';
    try {
      const res = await fetch(`http://localhost:5000/api/simulation/${action}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsSimulating(!isSimulating);
        fetchAuditLogs();
      }
    } catch (err) {}
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
      fetchAuditLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/operator/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === id ? data.data : o));
        if (selectedOrder && selectedOrder._id === id) setSelectedOrder(data.data);
        fetchAuditLogs();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const shipOrder = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/operator/orders/${id}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrier: 'FedEx', trackingNumber: 'TRK' + Date.now() })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === id ? data.data : o));
        if (selectedOrder && selectedOrder._id === id) setSelectedOrder(data.data);
        fetchAuditLogs();
      }
    } catch (error) {
      console.error('Error shipping order:', error);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (newOrder.items.length === 0) return alert('Add at least one item');
    try {
      const res = await fetch('http://localhost:5000/api/operator/orders/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => [data.data, ...prev]);
        setIsCreating(false);
        setNewOrder({ customer: { name: '', email: '', phone: '' }, items: [], status: 'pending', totalAmount: 0 });
        fetchAuditLogs();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectCustomer = (name) => {
    const c = CUSTOMERS.find(cu => cu.name === name);
    if (c) {
      setNewOrder({ ...newOrder, customer: { name: c.name, email: c.email, phone: c.phone } });
    } else {
      setNewOrder({ ...newOrder, customer: { ...newOrder.customer, name } });
    }
  };

  const calculateTotal = (items, discount = 0) => {
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountAmount = subtotal * (discount / 100);
    return Math.max(0, subtotal - discountAmount);
  };

  const handleSelectProduct = (productName) => {
    const p = products.find(pr => pr.name === productName);
    if (p) {
      setNewItem({ ...newItem, product: p.name, price: p.price });
    } else {
      setNewItem({ ...newItem, product: productName });
    }
  };

  const addItemToNewOrder = () => {
    if (!newItem.product || newItem.price <= 0 || newItem.quantity <= 0) return;
    const items = [...newOrder.items, newItem];
    setNewOrder({ ...newOrder, items, totalAmount: calculateTotal(items, newOrder.discount) });
    setNewItem({ product: '', quantity: 1, price: 0 });
  };

  const handleDiscountChange = (val) => {
    const discount = Math.min(100, Math.max(0, Number(val)));
    setNewOrder({ ...newOrder, discount, totalAmount: calculateTotal(newOrder.items, discount) });
  };

  const removeItemFromOrder = (idx) => {
    const items = newOrder.items.filter((_, i) => i !== idx);
    setNewOrder({ ...newOrder, items, totalAmount: calculateTotal(items, newOrder.discount) });
  };

  const startEditItem = (idx) => {
    setEditingItemIdx(idx);
    setEditQty(newOrder.items[idx].quantity);
  };

  const saveEditItem = () => {
    if (editingItemIdx === null) return;
    const items = [...newOrder.items];
    items[editingItemIdx] = { ...items[editingItemIdx], quantity: editQty };
    setNewOrder({ ...newOrder, items, totalAmount: calculateTotal(items, newOrder.discount) });
    setEditingItemIdx(null);
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/operator/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o._id !== id));
        setSelectedOrder(null);
        fetchAuditLogs();
      }
    } catch (err) {}
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'processed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'shipped': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      <div className={`${showAudit ? 'w-5/12' : 'w-1/2'} flex flex-col gap-3 min-h-0 pr-2 transition-all duration-300`}>
        <div className="flex justify-between items-center mb-2 px-1">
          <h2 className="text-xl font-light text-slate-200">Order Queue</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAudit(!showAudit)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors border ${showAudit ? 'bg-violet-500/20 text-violet-400 border-violet-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
            >
              📋 Audit
            </button>
            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors border ${isSimulating ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
            >
              <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></div>
              Live Traffic
            </button>
            <button
              onClick={() => { setIsCreating(true); setSelectedOrder(null); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              + Manual
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pb-4 pr-1">
          {loading ? (
            <div className="text-slate-400 text-center py-10">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-slate-400 text-center py-10 bg-slate-800/30 rounded-xl border border-slate-700/50">No orders currently in queue.</div>
          ) : (
            orders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => { setSelectedOrder(order); setIsCreating(false); }}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  selectedOrder?._id === order._id
                    ? 'bg-slate-800 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                    : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg truncate pr-4 text-slate-100">{order.customer?.name}</h3>
                  <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(order.status)} uppercase tracking-wider font-semibold`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{order.items?.length} Items</span>
                  <span className="font-medium text-emerald-400">${order.totalAmount?.toFixed(2)}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className={`${showAudit ? 'w-4/12' : 'w-1/2'} rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6 flex flex-col pt-6 min-h-0 overflow-hidden relative transition-all duration-300`}>
        <AnimatePresence mode="wait">
          {isCreating ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-light tracking-tight text-white mb-1">Create Manual Order</h2>
                <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white text-sm">Cancel</button>
              </div>

              <form onSubmit={handleCreateOrder} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0 space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3 shrink-0">
                    <h3 className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Customer Details</h3>
                    <select
                      required
                      value={newOrder.customer.name}
                      onChange={e => handleSelectCustomer(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    >
                      <option value="">-- Select Customer --</option>
                      {CUSTOMERS.map(c => (
                        <option key={c.email} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-3">
                      <input type="email" placeholder="Email" readOnly value={newOrder.customer.email} className="w-1/2 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-400 cursor-not-allowed" />
                      <input type="text" placeholder="Phone" readOnly value={newOrder.customer.phone} className="w-1/2 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-400 cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col items-start flex-1 min-h-[200px]">
                    <h3 className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Add Order Items</h3>
                    <div className="flex gap-2 w-full mb-4 shrink-0">
                      <select
                        value={newItem.product}
                        onChange={e => handleSelectProduct(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/50"
                      >
                        <option value="">-- Select Product --</option>
                        {products.map(p => (
                          <option key={p._id} value={p.name}>{p.name} (${p.price})</option>
                        ))}
                      </select>
                      <input type="number" min="1" placeholder="Qty" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                      <input 
                        type="number" 
                        min="0.01" 
                        step="0.01" 
                        placeholder="Price" 
                        readOnly={userRole === 'operator'}
                        value={newItem.product ? newItem.price : ''} 
                        onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} 
                        className={`w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white ${userRole === 'operator' ? 'opacity-50 cursor-not-allowed font-mono' : ''}`} 
                      />
                      <button type="button" onClick={addItemToNewOrder} className="px-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-bold transition-colors shadow-lg shadow-cyan-600/20">+</button>
                    </div>

                    <div className="space-y-2 w-full flex-1 overflow-y-auto pr-1 min-h-0">
                      <AnimatePresence initial={false}>
                      {newOrder.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                          <span className="text-2xl mb-2">📥</span>
                          <p className="text-xs uppercase tracking-widest font-bold">No items added</p>
                        </div>
                      ) : (
                        newOrder.items.map((it, idx) => (
                          <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex justify-between items-center text-sm bg-slate-800/80 p-4 rounded-xl group border border-slate-700/30 hover:border-cyan-500/30 transition-all mb-2 last:mb-0"
                          >
                            <div className="flex flex-col min-w-0 flex-1 pr-4">
                              <span className="text-slate-100 font-bold text-lg leading-tight truncate">{it.product}</span>
                              <div className="flex items-center gap-2 mt-2">
                                {editingItemIdx === idx ? (
                                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-md border border-cyan-500/30">
                                    <input
                                      type="number"
                                      min="1"
                                      value={editQty}
                                      onChange={e => setEditQty(Number(e.target.value))}
                                      className="w-12 bg-transparent border-none focus:ring-0 px-1 py-0.5 text-xs text-white text-center font-bold"
                                      autoFocus
                                    />
                                    <button type="button" onClick={saveEditItem} className="bg-cyan-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white hover:bg-cyan-500">Save</button>
                                    <button type="button" onClick={() => setEditingItemIdx(null)} className="text-slate-500 px-1 hover:text-white transition-colors">✕</button>
                                  </div>
                                ) : (
                                  <span className="bg-slate-900/80 px-2 py-0.5 rounded text-slate-400 text-[10px] uppercase font-bold">Qty: <span className="text-cyan-400">{it.quantity}</span></span>
                                )}
                                <span className="text-slate-700 text-xs">•</span>
                                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Unit: ${it.price.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <span className="text-emerald-400 font-bold text-xl">${(it.price * it.quantity).toFixed(2)}</span>
                              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="button" onClick={() => startEditItem(idx)} className="p-1.5 bg-slate-700 hover:bg-cyan-600 rounded-lg text-slate-300 transition-colors" title="Edit">✏️</button>
                                <button type="button" onClick={() => removeItemFromOrder(idx)} className="p-1.5 bg-slate-700 hover:bg-red-600 rounded-lg text-slate-300 transition-colors" title="Remove">✕</button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 bg-slate-900/80 p-4 mt-2 rounded-xl border border-slate-700/50 shadow-2xl space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1.5">
                       <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Applied Discount (%)</span>
                       <div className="flex items-center gap-2">
                         <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={newOrder.discount} 
                          onChange={e => handleDiscountChange(e.target.value)} 
                          className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-cyan-400 font-bold text-center outline-none focus:ring-2 focus:ring-cyan-500/30"
                         />
                         <span className="text-slate-600 text-[10px] text-center font-bold">% OFF</span>
                       </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-500 text-[10px] mb-1 uppercase font-bold tracking-widest text-right">Final Amount</div>
                      <span className="text-emerald-400 text-3xl font-light tracking-tighter">${newOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.01] active:scale-[0.99] uppercase tracking-widest text-xs">
                    Submit Manual Order
                  </button>
                </div>
              </form>
            </motion.div>
          ) : selectedOrder ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-light tracking-tight text-white mb-1">Order Details</h2>
                  <p className="text-slate-400 font-mono text-xs">ID: {selectedOrder._id}</p>
                </div>
                <span className={`px-4 py-1.5 text-sm rounded-full border ${getStatusColor(selectedOrder.status)} uppercase tracking-wider font-bold`}>
                  {selectedOrder.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-medium text-slate-200">{selectedOrder.customer?.name}</p>
                  <p className="text-sm text-slate-400">{selectedOrder.customer?.email}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedOrder.customer?.phone}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="text-3xl font-light text-emerald-400">${selectedOrder.totalAmount?.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto mb-4 pr-2">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="text-sm uppercase tracking-wider text-slate-500 font-semibold">Order Items</h3>
                   {selectedOrder.status === 'pending' && (
                     <button 
                      onClick={() => {
                        setIsEditingExisting(!isEditingExisting);
                        setEditingOrder(JSON.parse(JSON.stringify(selectedOrder)));
                      }}
                      className="text-cyan-400 text-xs font-bold hover:underline"
                     >
                       {isEditingExisting ? 'Cancel Edit' : 'Edit Items'}
                     </button>
                   )}
                </div>

                {isEditingExisting && (
                  <div className="mb-4 p-3 bg-slate-900/80 rounded-xl border border-cyan-500/30 space-y-3">
                    <div className="flex gap-2">
                      <select
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                        onChange={(e) => {
                          const p = products.find(pr => pr.name === e.target.value);
                          if(p) {
                            const items = [...editingOrder.items, { product: p.name, quantity: 1, price: p.price }];
                            setEditingOrder({...editingOrder, items, totalAmount: calculateTotal(items)});
                          }
                        }}
                      >
                        <option value="">+ Add Item...</option>
                        {products.map(p => <option key={p._id} value={p.name}>{p.name} (${p.price})</option>)}
                      </select>
                      <button 
                        onClick={async () => {
                          try {
                            const res = await fetch(`http://localhost:5000/api/operator/orders/${editingOrder._id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ items: editingOrder.items, totalAmount: editingOrder.totalAmount })
                            });
                            const data = await res.json();
                            if (data.success) {
                              setOrders(prev => prev.map(o => o._id === data.data._id ? data.data : o));
                              setSelectedOrder(data.data);
                              setIsEditingExisting(false);
                            }
                          } catch (err) {}
                        }}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded-lg text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {(isEditingExisting ? editingOrder.items : selectedOrder.items)?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 group">
                      <div className="flex flex-col">
                        <p className="font-medium text-slate-200">{item.product}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">Qty: {item.quantity}</p>
                           <p className="text-[10px] text-slate-500 font-mono">• ${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-emerald-400 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        {isEditingExisting && (
                          <button 
                            onClick={() => {
                              const items = editingOrder.items.filter((_, idx) => idx !== i);
                              setEditingOrder({...editingOrder, items, totalAmount: calculateTotal(items)});
                            }}
                            className="p-1 px-2 bg-slate-700 hover:bg-red-600 rounded text-xs text-white"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 bg-slate-800/95 backdrop-blur-md pt-4 pb-2 border-t border-slate-700/50 flex flex-col gap-3 z-10">
                <div className="flex gap-3">
                  {selectedOrder.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder._id, 'processed')}
                        className="flex-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-6 flex items-center justify-center rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] sticky bottom-0 z-20 gap-2 grow"
                      >
                        <span className="text-xl">⚙️</span> Process Order
                      </button>
                      <button
                        onClick={() => updateOrderStatus(selectedOrder._id, 'rejected')}
                        className="flex-1 bg-slate-800 hover:bg-red-500/20 text-red-400 border border-slate-700 hover:border-red-500/50 font-semibold py-3 rounded-xl transition-all"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'processed' && (
                    <button
                      onClick={() => shipOrder(selectedOrder._id)}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 flex items-center justify-center gap-2 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                      <span className="text-xl">🚚</span> Ship Order (Auto-Dispatch)
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => deleteOrder(selectedOrder._id)}
                  className="w-full text-slate-500 hover:text-red-400 text-[10px] uppercase font-bold tracking-widest transition-colors py-1"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-slate-500 pb-10"
            >
              <div className="w-20 h-20 mb-6 rounded-full bg-slate-800 flex items-center justify-center text-3xl shadow-inner shadow-slate-900 border border-slate-700/50 ring-4 ring-slate-800/30">
                🚀
              </div>
              <p className="text-lg">Select an order or create a new one.</p>
            </motion.div>
          )}
        </AnimatePresence>
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
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-semibold">Order Audit Trail</h3>
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
