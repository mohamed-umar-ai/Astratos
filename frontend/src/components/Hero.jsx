import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import wsClient from '../utils/websocket';

const Counter = ({ value, label, color, delay }) => {
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
            className="flex flex-col items-center justify-center w-64"
        >
            <motion.div className={`text-5xl font-bold mb-4 ${color} text-center`}>
                {rounded}
            </motion.div>
            <div className="text-gray-400 text-sm font-medium tracking-wide text-center uppercase">
                {label}
            </div>
        </motion.div>
    );
};

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
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 py-32">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            <div className="container relative z-10 px-4 flex flex-col items-center justify-center text-center">

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-5xl md:text-7xl font-bold text-white mb-16 tracking-tight leading-tight max-w-5xl"
                >
                    Real-Time Inventory Intelligence
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                    className="text-lg md:text-2xl text-gray-400 mb-32 max-w-3xl leading-relaxed font-light"
                >
                    Monitor your entire supply chain with military-grade precision.
                    Detect anomalies, forecast demand, and optimize stock levels in real-time.
                </motion.p>

                <div
                    className="flex flex-col md:flex-row items-center justify-center gap-24 w-full max-w-6xl"
                    style={{ marginBottom: '80px' }}
                >
                    <Counter
                        value={metrics.incoming}
                        label="Incoming Packages"
                        color="text-emerald-400"
                        delay={0.4}
                    />
                    <Counter
                        value={metrics.outgoing}
                        label="Outgoing Packages"
                        color="text-blue-400"
                        delay={0.6}
                    />
                    <Counter
                        value={metrics.notDetected}
                        label="Package Not Detected"
                        color="text-red-400"
                        delay={0.8}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-12"
                >
                    <Link to="/auth?mode=signup">
                        <button className="w-64 bg-blue-600 text-white px-8 py-5 rounded-lg font-semibold text-xl transition-all duration-300 hover:bg-blue-700 hover:scale-105 shadow-lg shadow-blue-600/20">
                            Start Free Trial
                        </button>
                    </Link>

                    <Link to="/auth?mode=login">
                        <button className="w-64 bg-white/5 border border-white/10 text-white px-8 py-5 rounded-lg font-semibold text-xl transition-all duration-300 hover:bg-white hover:text-blue-900 hover:scale-105 backdrop-blur-sm">
                            Log In
                        </button>
                    </Link>
                </motion.div>

            </div>
        </section>
    );
};

export default Hero;
