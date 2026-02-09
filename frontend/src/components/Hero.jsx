import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem, floatingAnimation } from '../utils/animations';

const Hero = () => {
    return (
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Gradient Orbs */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />

            <div className="container relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="text-center max-w-4xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div variants={staggerItem} className="mb-6">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-400 pulse" />
                            Live Dashboard Demo
                        </span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        variants={staggerItem}
                        className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                    >
                        Real-Time{' '}
                        <span className="gradient-text">Inventory</span>
                        <br />
                        Intelligence
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        variants={staggerItem}
                        className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
                    >
                        Monitor inventory levels, track sales, and detect anomalies in real-time
                        with our AI-powered dashboard platform.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={staggerItem}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary px-8 py-4 text-lg"
                        >
                            Launch Dashboard
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-secondary px-8 py-4 text-lg"
                        >
                            View Demo
                        </motion.button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={staggerItem}
                        className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto"
                    >
                        {[
                            { value: '99.9%', label: 'Uptime' },
                            { value: '<100ms', label: 'Latency' },
                            { value: '24/7', label: 'Monitoring' }
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Floating Dashboard Preview */}
                <motion.div
                    {...floatingAnimation}
                    className="mt-20 relative"
                >
                    <div className="glass rounded-2xl p-4 max-w-4xl mx-auto">
                        <div className="bg-slate-900 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-slate-800 rounded-lg p-4 h-24 animate-pulse" />
                                ))}
                            </div>
                            <div className="mt-4 bg-slate-800 rounded-lg h-40 animate-pulse" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
