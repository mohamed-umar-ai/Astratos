import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ProcessOrdersPanel from '../components/operator/ProcessOrdersPanel';
import ManageStockPanel from '../components/operator/ManageStockPanel';
import ShippingDashboard from '../components/operator/ShippingDashboard';
import SupplierDashboard from '../components/operator/SupplierDashboard';
import CarrierDashboard from '../components/operator/CarrierDashboard';
import Sidebar from '../components/Sidebar';
import { useWebSocket } from '../utils/websocket';
import PageGuardModal from '../components/PageGuardModal';

export default function OperatorDashboard() {
  const role = localStorage.getItem('role');
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'orders');
  const [notifications, setNotifications] = useState([]);
  const ws = useWebSocket();

  useEffect(() => {
    ws.connect();
    
    const handleNotif = (payload) => {
      const id = Date.now() + Math.random();
      setNotifications(prev => [{ id, ...payload }, ...prev]);
    };
    
    const unsub = ws.on('NOTIFICATION', handleNotif);
    return () => unsub();
  }, [ws]);

  if (role === 'viewer') {
    return (
      <div className="flex bg-slate-950 h-screen text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
        <Sidebar />
        <PageGuardModal title="Operator Functions Restricted" />
      </div>
    );
  }

  return (
    <div className="flex bg-slate-950 h-screen text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-8 pt-20 flex flex-col overflow-hidden">
        <div className="container mx-auto max-w-6xl flex flex-col flex-1 min-h-0">
          <header className="mb-8 flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-1">
              Operator <span className="font-semibold text-cyan-400">Directive</span>
            </h1>
            <p className="text-slate-400 text-sm">Unified control center for logistics, stock, and distribution.</p>
          </div>
          <div className="flex gap-2">
            {['orders', 'stock', 'shipping', 'suppliers', 'carriers'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? tab === 'carriers'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-800/50 text-slate-400 border border-transparent hover:bg-slate-700/50 hover:text-slate-200'
                }`}
              >
                {tab === 'carriers' ? 'Carriers' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </header>

        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.3 }}
           className="flex-1 min-h-0"
        >
          {activeTab === 'orders' && <ProcessOrdersPanel />}
          {activeTab === 'stock' && <ManageStockPanel />}
          {activeTab === 'shipping' && <ShippingDashboard />}
          {activeTab === 'suppliers' && <SupplierDashboard />}
          {activeTab === 'carriers' && <CarrierDashboard />}
        </motion.div>
        </div>
      </div>

      {/* Global Notifications Toaster */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80 max-h-[70vh]">
        {notifications.length > 1 && (
          <div className="flex justify-end">
             <button onClick={() => setNotifications([])} className="text-xs text-slate-400 hover:text-white bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 transition-colors shadow-lg">
               Clear All
             </button>
          </div>
        )}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1 pb-2 custom-scrollbar flex-1">
          <AnimatePresence>
            {notifications.map(n => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-slate-800/95 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-2xl flex items-start gap-3 shrink-0"
              >
                <div className="mt-0.5 text-xl">
                  {n.type === 'LOW_STOCK' ? '⚠️' : 
                   n.type === 'RESTOCK' ? '📦' : 
                   n.type === 'NEW_SUPPLIER' ? '🤝' : '🔔'}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-200 mb-1">{n.type.replace('_', ' ')}</h4>
                  <p className="text-xs text-slate-400 leading-snug">{n.message}</p>
                </div>
                <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="text-slate-500 hover:text-white transition-colors text-xs p-1">✕</button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
