import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import wsClient from '../utils/websocket';

const Counter = ({ value, label, color, delay, icon }) => {
    const spring = useSpring(0, { bounce: 0, duration: 2500 });
    const rounded = useTransform(spring, (latest) => Math.round(latest));

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center w-72 group"
        >
            <div className={`mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 ${color} transition-all duration-300 group-hover:bg-white/10 group-hover:scale-110 shadow-2xl shadow-black/50`}>
                {icon}
            </div>
            <motion.div className={`text-6xl font-bold mb-4 ${color} text-center tracking-tighter`}>
                {rounded}
            </motion.div>
            <div className="text-slate-400 text-sm font-semibold tracking-widest text-center uppercase">
                {label}
            </div>
        </motion.div>
    );
};

const FlowGraph = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="w-full max-w-4xl h-32 mt-12 relative overflow-hidden"
    >
        <svg className="w-full h-full" viewBox="0 0 800 100" preserveAspectRatio="none">
            <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                </linearGradient>
            </defs>
            <motion.path
                d="M0,50 Q200,80 400,50 T800,50"
                fill="none"
                stroke="url(#flowGradient)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.path
                d="M0,50 Q200,20 400,50 T800,50"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1"
                strokeOpacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
            />
        </svg>
    </motion.div>
);

const Hero = () => {
    const [metrics, setMetrics] = useState({
        incoming: 15000,
        outgoing: 12000,
        notDetected: 10
    });

    useEffect(() => {
        wsClient.connect();
        const handleUpdate = (data) => {
            if (data.metrics) {
                setMetrics(prev => ({
                    incoming: data.metrics.incoming || prev.incoming,
                    outgoing: data.metrics.outgoing || prev.outgoing,
                    notDetected: data.metrics.notDetected || prev.notDetected
                }));
            }
        };
        const unsubscribe = wsClient.on('SIMULATION_UPDATE', handleUpdate);
        return () => unsubscribe();
    }, []);

    return (
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 py-40">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

            <div className="container relative z-10 px-4 flex flex-col items-center justify-center text-center">

                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="text-6xl md:text-8xl font-extrabold text-slate-100 mb-20 tracking-tight leading-tight max-w-6xl drop-shadow-2xl"
                >
                    Real-Time Inventory Intelligence
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                    className="text-xl md:text-2xl text-slate-400 mb-36 max-w-4xl leading-relaxed font-normal"
                >
                    Monitor your entire supply chain with military-grade precision.
                    Detect anomalies, forecast demand, and optimize stock levels in real-time.
                </motion.p>

                <div className="flex flex-col items-center w-full mb-32">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-32 w-full max-w-7xl">
                        <Counter
                            value={metrics.incoming}
                            label="Incoming Packages"
                            color="text-emerald-400"
                            delay={0.5}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                </svg>
                            }
                        />
                        <Counter
                            value={metrics.outgoing}
                            label="Outgoing Packages"
                            color="text-blue-400"
                            delay={0.7}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                            }
                        />
                        <Counter
                            value={metrics.notDetected}
                            label="Package Not Detected"
                            color="text-rose-400"
                            delay={0.9}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            }
                        />
                    </div>
                    <FlowGraph />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-10"
                >
                    <Link to="/auth?mode=signup">
                        <button className="w-72 bg-blue-600 text-white px-10 py-6 rounded-xl font-bold text-xl transition-all duration-300 hover:bg-blue-500 hover:scale-105 shadow-2xl shadow-blue-600/30 ring-2 ring-blue-500/50 hover:ring-blue-400">
                            Start Free Trial
                        </button>
                    </Link>

                    <Link to="/auth?mode=login">
                        <button className="w-72 bg-slate-900 border border-slate-700 text-slate-300 px-10 py-6 rounded-xl font-bold text-xl transition-all duration-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 hover:scale-105 backdrop-blur-md">
                            Log In
                        </button>
                    </Link>
                </motion.div>

            </div>
        </section>
    );
};

export default Hero;
