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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center w-64 group relative"
        >
            <div className={`mb-4 p-4 rounded-2xl bg-white/5 border border-white/5 ${color} transition-all duration-300 group-hover:bg-white/10 group-hover:scale-110 shadow-2xl shadow-black/50`}>
                {icon}
            </div>
            <motion.div className={`text-5xl md:text-6xl font-bold mb-2 ${color} text-center tracking-tighter`}>
                {rounded}
            </motion.div>
            <div className="text-slate-400 text-xs font-semibold tracking-widest text-center uppercase">
                {label}
            </div>
        </motion.div>
    );
};

const LineChart = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="w-full max-w-4xl h-40 mt-12 relative px-8 border-l border-b border-white/5"
    >
        <svg className="w-full h-full overflow-visible" viewBox="0 0 800 150" preserveAspectRatio="none">
            <motion.path
                d="M0,100 C100,90 200,60 300,80 S500,50 600,60 T800,20"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut", delay: 1.6 }}
            />
            <motion.path
                d="M0,130 C150,110 250,100 350,110 S550,80 650,90 T800,70"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut", delay: 1.8 }}
            />
            <circle cx="800" cy="20" r="3" fill="#10b981" className="animate-pulse" />
            <circle cx="800" cy="70" r="3" fill="#3b82f6" className="animate-pulse" />
        </svg>
        <div className="absolute -top-4 right-0 flex gap-4 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Incoming</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Outgoing</span>
        </div>
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
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 py-24 md:py-32">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

            <div className="container relative z-10 px-4 flex flex-col items-center justify-center text-center">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                >
                    <motion.h1
                        className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-100 mb-8 tracking-tight leading-none max-w-6xl drop-shadow-2xl"
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        Real-Time Inventory Intelligence
                    </motion.h1>

                    <motion.p
                        className="text-lg md:text-xl text-slate-400 mb-20 max-w-3xl leading-relaxed font-light mx-auto"
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        Monitor your entire supply chain with military-grade precision.
                        Detect anomalies, forecast demand, and optimize stock levels in real-time.
                    </motion.p>
                </motion.div>

                <div className="flex flex-col items-center w-full mb-20">
                    <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 w-full max-w-6xl">
                        <Counter
                            value={metrics.incoming}
                            label="Incoming Packages"
                            color="text-emerald-400"
                            delay={0.6}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                            delay={0.8}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                            }
                        />
                        <Counter
                            value={metrics.notDetected}
                            label="Package Not Detected"
                            color="text-rose-400"
                            delay={1.0}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            }
                        />
                    </div>
                    <LineChart />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-8"
                >
                    <Link to="/auth?mode=signup">
                        <button className="w-64 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:bg-blue-500 hover:scale-105 shadow-xl shadow-blue-600/20 ring-1 ring-blue-500/50">
                            Start Free Trial
                        </button>
                    </Link>

                    <Link to="/auth?mode=login">
                        <button className="w-64 bg-transparent border border-white/10 text-slate-300 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:bg-white/5 hover:text-white hover:border-white/30 hover:scale-105">
                            Log In
                        </button>
                    </Link>
                </motion.div>

            </div>
        </section>
    );
};

export default Hero;
