import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../utils/animations';

const features = [
    {
        icon: '📊',
        title: 'Real-Time Analytics',
        description: 'Monitor inventory levels and sales metrics as they happen with live updates.'
    },
    {
        icon: '🔔',
        title: 'Anomaly Detection',
        description: 'AI-powered alerts for unusual patterns, stock discrepancies, and potential issues.'
    },
    {
        icon: '📈',
        title: 'Smart Forecasting',
        description: 'Predict demand trends and optimize stock levels using machine learning.'
    },
    {
        icon: '📝',
        title: 'Audit Trail',
        description: 'Complete transaction history with timestamps and user accountability.'
    },
    {
        icon: '⚡',
        title: 'Lightning Fast',
        description: 'Sub-100ms response times with WebSocket-powered real-time updates.'
    },
    {
        icon: '🔒',
        title: 'Secure & Reliable',
        description: '99.9% uptime with enterprise-grade security and data protection.'
    }
];

const Features = () => {
    return (
        <section className="section relative">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />

            <div className="container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                        Features
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                        Everything You Need
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Powerful tools to manage, monitor, and optimize your inventory operations.
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={staggerItem}
                            whileHover={{ y: -5 }}
                            className="glass rounded-2xl p-6 card-hover"
                        >
                            <div className="text-4xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-slate-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
