import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';

const Section = ({ title, children, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className={`py-20 ${className}`}>
            <div className="container mx-auto px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-3xl md:text-4xl font-bold text-center mb-16"
                >
                    {title}
                </motion.h2>
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </section>
    );
};

export const NewFeatures = () => {
    const features = [
        { title: "Real-Time Tracking", desc: "Monitor stock levels with sub-second latency.", icon: "⚡" },
        { title: "Smart Alerts", desc: "Instant notifications for low stock and anomalies.", icon: "🔔" },
        { title: "Demand Forecasting", desc: "AI-driven predictions to prevent stockouts.", icon: "📈" },
    ];

    return (
        <Section title="Powerful Features">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                {features.map((f, i) => (
                    <motion.div
                        key={i}
                        variants={fadeInUp}
                        className="p-8 rounded-2xl glass hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                        <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
                        <p className="text-slate-400 group-hover:text-slate-300">{f.desc}</p>
                    </motion.div>
                ))}
            </motion.div>
        </Section>
    );
};

export const InventoryOverview = () => {
    const items = [
        { id: '#SKU-892', name: 'Quantum Processor', stock: 1250, status: 'In Stock' },
        { id: '#SKU-124', name: 'Neural Module', stock: 45, status: 'Low Stock' },
        { id: '#SKU-556', name: 'Flux Capacitor', stock: 0, status: 'Out of Stock' },
        { id: '#SKU-778', name: 'Holodisplay Unit', stock: 3400, status: 'In Stock' },
    ];

    return (
        <Section title="Inventory Overview">
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="overflow-hidden rounded-2xl glass border border-white/10"
            >
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-slate-300">
                        <tr>
                            <th className="p-4">SKU</th>
                            <th className="p-4">Item Name</th>
                            <th className="p-4">Stock Level</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <motion.tr
                                key={i}
                                variants={fadeInUp}
                                className="border-t border-white/5 hover:bg-white/5 transition-colors"
                            >
                                <td className="p-4 font-mono text-sm text-slate-400">{item.id}</td>
                                <td className="p-4 font-medium text-white">{item.name}</td>
                                <td className="p-4 text-slate-300">{item.stock}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'In Stock' ? 'bg-green-500/20 text-green-400' :
                                        item.status === 'Low Stock' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </Section>
    );
};

export const AIFeatures = () => (
    <Section title="AI-Powered Intelligence">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
            >
                <div className="glass p-6 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold mb-2">Anomaly Detection</h3>
                    <p className="text-slate-400">Algorithms scan for irregular patterns in sales and stock movements effectively.</p>
                </div>
                <div className="glass p-6 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold mb-2">Predictive Ordering</h3>
                    <p className="text-slate-400">Automatically suggests reorder points based on historical consumption rates.</p>
                </div>
                <div className="glass p-6 rounded-2xl border-l-4 border-pink-500">
                    <h3 className="text-xl font-bold mb-2">Sentiment Analysis</h3>
                    <p className="text-slate-400">Understand market trends through integrated social sentiment tracking.</p>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="glass rounded-3xl p-8 aspect-square flex items-center justify-center relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 text-center">
                    <div className="text-6xl mb-4 animate-bounce">🧠</div>
                    <div className="text-2xl font-bold">Neural Engine</div>
                    <div className="text-slate-400 mt-2">Processing Data...</div>
                </div>
            </motion.div>
        </div>
    </Section>
);

export const HowItWorks = () => (
    <Section title="How It Works">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0" />

            {[
                { step: "01", title: "Connect", desc: "Integrate with your existing ERP or POS system." },
                { step: "02", title: "Analyze", desc: "AI engine processes historical data patterns." },
                { step: "03", title: "Visualize", desc: "View real-time insights on your dashboard." },
                { step: "04", title: "Optimize", desc: "Receive actionable alerts and forecasts." }
            ].map((s, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative z-10 text-center"
                >
                    <div className="w-16 h-16 mx-auto bg-slate-900 rounded-full border-2 border-blue-500 flex items-center justify-center text-xl font-bold mb-6 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                        {s.step}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-400">{s.desc}</p>
                </motion.div>
            ))}
        </div>
    </Section>
);

export const Pricing = () => (
    <Section title="Simple Pricing">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { name: "Starter", price: "$0", desc: "Perfect for pilots", features: ["100 SKUs", "Real-time updates", "Basic Alerts"] },
                { name: "Pro", price: "$49", desc: "For growing teams", features: ["Unlimited SKUs", "Advanced AI", "Priority Support"], popular: true },
                { name: "Enterprise", price: "Custom", desc: "For large scale", features: ["Dedicated Server", "Custom API", "SLA Guarantee"] }
            ].map((plan, i) => (
                <motion.div
                    key={i}
                    whileHover={{ y: -10 }}
                    className={`p-8 rounded-2xl border ${plan.popular ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border-blue-500/50' : 'glass border-white/5'} flex flex-col pointer-events-auto hover:underline cursor-pointer transition-all`}
                >
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold mb-2">{plan.price}<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                    <p className="text-slate-400 mb-6 text-sm">{plan.desc}</p>
                    <ul className="mb-8 space-y-3 flex-1">
                        {plan.features.map((f, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="text-blue-400">✓</span> {f}
                            </li>
                        ))}
                    </ul>
                    <button className={`w-full py-3 rounded-lg font-medium transition-colors ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                        Choose {plan.name}
                    </button>
                </motion.div>
            ))}
        </div>
    </Section>
);

export const Testimonials = () => (
    <Section title="Trusted by Leaders">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
                { name: "Sarah Connor", role: "Ops Director, Skynet", quote: "Astratos completely transformed how we manage our termination... err, manufacturing supplies." },
                { name: "Tony Stark", role: "CEO, Stark Ind", quote: "The AI predictions are Jarvis-level. I can monitor global inventory from my suit." }
            ].map((t, i) => (
                <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="glass p-8 rounded-2xl cursor-pointer hover:underline"
                >
                    <p className="text-lg text-slate-300 italic mb-6">"{t.quote}"</p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500" />
                        <div>
                            <div className="font-bold">{t.name}</div>
                            <div className="text-sm text-slate-500">{t.role}</div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    </Section>
);

export const FAQ = () => (
    <Section title="Frequently Asked Questions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
                { q: "Is it really real-time?", a: "Yes, updates are pushed via WebSocket with <50ms latency." },
                { q: "Can I export data?", a: "Absolutely. Export to CSV, PDF, or connect via API." },
                { q: "Is my data secure?", a: "We use AES-256 encryption for all stored data." },
                { q: "Do you offer efficient support?", a: "24/7 support for all Pro and Enterprise tiers." }
            ].map((faq, i) => (
                <motion.div
                    key={i}
                    className="glass p-6 rounded-xl cursor-pointer hover:underline hover:bg-white/5 transition-colors"
                >
                    <h3 className="font-bold text-lg mb-2 text-white">{faq.q}</h3>
                    <p className="text-slate-400">{faq.a}</p>
                </motion.div>
            ))}
        </div>
    </Section>
);

export const Footer = () => (
    <footer className="py-12 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
                <div className="font-bold text-2xl mb-4 gradient-text">Astratos</div>
                <p className="text-slate-400 max-w-sm">
                    Reinventing inventory management for the modern enterprise.
                    Built with love and coffee.
                </p>
            </div>
            {['Product', 'Company'].map((col, i) => (
                <div key={i}>
                    <h4 className="font-bold mb-4 text-white">{col}</h4>
                    <ul className="space-y-2">
                        {['Link One', 'Link Two', 'Link Three'].map((link, j) => (
                            <li key={j}>
                                <span className="text-slate-400 hover:text-white hover:underline cursor-pointer transition-colors block py-1">
                                    {link}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/5 text-center text-slate-500">
            © 2026 Astratos Inc. All rights reserved.
        </div>
    </footer>
);
