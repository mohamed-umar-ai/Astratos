import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function PageGuardModal({ title = 'Access Restricted' }) {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-center"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400"></div>
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    🛑
                </div>
                <h2 className="text-3xl font-light text-white mb-3">{title}</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    Your current role does not have permission to view or interact with this page. 
                    Please contact a system administrator if you believe you need access.
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors shadow-lg border border-slate-700"
                >
                    Return to Dashboard
                </button>
            </motion.div>
        </div>
    );
}
