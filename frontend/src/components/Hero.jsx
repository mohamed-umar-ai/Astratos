import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import wsClient from '../utils/websocket';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

const Counter = ({ value, label, color }) => {
    const spring = useSpring(0, { bounce: 0, duration: 2000 });
    const rounded = useTransform(spring, (latest) => Math.round(latest));

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return (
        <div className="flex flex-col items-center p-4 glass rounded-2xl">
            <motion.div className={`text-4xl font-bold ${color}`}>
                {rounded}
            </motion.div>
            <div className="text-slate-400 text-sm mt-1">{label}</div>
        </div>
    );
};

const Hero = () => {
    const [metrics, setMetrics] = useState({
        incoming: 15000,
        outgoing: 12000,
        notDetected: 10
    });

    useEffect(() => {
        // Connect to WebSocket
        wsClient.connect();

        // Listen for updates
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

        return () => {
            unsubscribe();
            // Don't disconnect here as other components might use it, 
            // but for a landing page usually we might want to if it's the only one.
            // However, the singleton handles connection state.
        };
    }, []);

    return (
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
            {/* Background Elements */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="container relative z-10 px-4">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="text-center max-w-5xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div variants={staggerItem} className="mb-8 flex justify-center">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                            Live System Status
                        </span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        variants={staggerItem}
                        className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight"
                    >
                        Real-Time Inventory
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            Intelligence
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        variants={staggerItem}
                        className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Monitor your entire supply chain with military-grade precision.
                        Detect anomalies, forecast demand, and optimize stock levels in real-time.
                    </motion.p>

                    {/* Live Counters */}
                    <motion.div
                        variants={staggerItem}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16"
                    >
                        <Counter
                            value={metrics.incoming}
                            label="Incoming Packages"
                            color="text-emerald-400"
                        />
                        <Counter
                            value={metrics.outgoing}
                            label="Outgoing Packages"
                            color="text-blue-400"
                        />
                        <Counter
                            value={metrics.notDetected}
                            label="Package Not Detected"
                            color="text-red-400"
                        />
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={staggerItem}
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                    >
                        <Link to="/auth?mode=signup">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg hover:underline transition-all shadow-lg shadow-blue-500/25"
                            >
                                Start Free Trial
                            </motion.button>
                        </Link>

                        <Link to="/auth?mode=login">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 glass text-white hover:text-blue-400 rounded-xl font-semibold text-lg hover:underline transition-all"
                            >
                                Log In
                            </motion.button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
