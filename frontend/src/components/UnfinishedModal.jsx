import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function UnfinishedModal({ onProceed }) {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-center"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-amber-400"></div>
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    🚧
                </div>
                <h2 className="text-3xl font-light text-white mb-3">Work in Progress</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    This page is still being worked on. Would you still like to see it?
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors shadow-lg border border-slate-700 w-32"
                    >
                        No
                    </button>
                    <button
                        onClick={onProceed}
                        className="px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-500 transition-colors shadow-lg shadow-amber-600/20 w-32"
                    >
                        Yes
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
