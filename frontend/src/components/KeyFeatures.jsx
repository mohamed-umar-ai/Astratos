import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

const FeatureCard = ({ title, description, delay, chartType }) => {
    const renderChart = () => {
        if (chartType === 'stats') {
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="text-4xl font-bold text-white">12,450</div>
                        <div className="text-xs text-emerald-400">↑ 12% Last Week</div>
                    </div>
                    <div className="space-y-3 text-xs pt-2">
                        {[
                            { name: 'Electronics', value: 450, color: 'bg-blue-500' },
                            { name: 'Apparel', value: 320, color: 'bg-orange-500' },
                            { name: 'Raw Materials', value: 210, color: 'bg-emerald-500' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                    <span className="text-slate-400">{item.name}</span>
                                </div>
                                <span className="text-slate-300 font-medium">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else if (chartType === 'table') {
            return (
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 pb-2 border-b border-white/5 font-medium">
                        <div>Date</div>
                        <div>Type</div>
                        <div className="text-right">Status</div>
                    </div>
                    {[
                        { date: 'Oct 24', type: 'Inbound', status: 'Completed' },
                        { date: 'Oct 23', type: 'Outbound', status: 'Pending' },
                        { date: 'Oct 22', type: 'Audit', status: 'Completed' }
                    ].map((row, idx) => (
                        <div key={idx} className="grid grid-cols-3 gap-2 text-xs text-slate-400 py-1">
                            <div>{row.date}</div>
                            <div>{row.type}</div>
                            <div className={`text-right ${row.status === 'Completed' ? 'text-emerald-400' : 'text-yellow-400'}`}>{row.status}</div>
                        </div>
                    ))}
                </div>
            );
        } else {
            return (
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        <span>Stock Movement Trend</span>
                    </div>
                    <div className="h-32 relative w-full">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100" preserveAspectRatio="none">
                            {/* Grid lines */}
                            <line x1="0" y1="80" x2="200" y2="80" stroke="currentColor" strokeWidth="0.5" className="text-white/5" />
                            <line x1="0" y1="50" x2="200" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-white/5" />
                            <line x1="0" y1="20" x2="200" y2="20" stroke="currentColor" strokeWidth="0.5" className="text-white/5" />

                            {/* Area fill */}
                            <path
                                d="M0,80 L0,70 L40,60 L80,65 L120,45 L160,50 L200,30 L200,80 Z"
                                fill="url(#gradient)"
                                opacity="0.2"
                            />

                            {/* Line */}
                            <polyline
                                points="0,70 40,60 80,65 120,45 160,50 200,30"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Data points */}
                        <div className="absolute top-[30%] left-[20%] w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900 shadow-lg glow-blue"></div>
                        <div className="absolute top-[45%] left-[60%] w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900 shadow-lg glow-blue"></div>
                        <div className="absolute top-[30%] right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900 shadow-lg glow-blue animate-pulse"></div>
                    </div>
                </div>
            );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-10 border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] group h-full flex flex-col w-full max-w-md mx-auto"
        >
            <div className="mb-10 bg-slate-950/80 rounded-2xl p-8 border border-white/5 group-hover:border-blue-500/20 transition-colors shadow-inner min-h-[220px] flex flex-col justify-center">
                {renderChart()}
            </div>

            <h3 className="text-2xl font-medium tracking-wide text-white mb-4 group-hover:text-blue-400 transition-colors">{title}</h3>
            <p className="text-slate-400 font-light text-lg leading-relaxed">{description}</p>
        </motion.div>
    );
};

const KeyFeatures = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const features = [
        {
            title: 'Real-Time Inventory Overview',
            description: 'Get a comprehensive snapshot of your warehouse stock status with live updates and category breakdowns.',
            chartType: 'stats'
        },
        {
            title: 'Movement History & Tracking',
            description: 'Track every item movement with detailed logs including dates, types, and status for complete audit trails.',
            chartType: 'table'
        },
        {
            title: 'Predictive Stock Analytics',
            description: 'Forecast potential shortages and optimize stock levels using advanced trend analysis and historical data.',
            chartType: 'chart'
        }
    ];

    return (
        <section ref={sectionRef} className="py-40 bg-slate-950 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-900/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-24 max-w-4xl mx-auto"
                >
                    <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Key Features
                    </p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-white mb-8 leading-tight">
                        Unlock Seamless <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Inventory Management</span>
                    </h2>
                    <p className="text-slate-400 font-light text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Discover advanced tools for tracking, predicting, and optimizing your warehouse operations with ease.
                    </p>
                </motion.div>

                {/* Grid Container - Centered using Flexbox for 3 items */}
                <div className="flex flex-col md:flex-row justify-center gap-8 lg:gap-12 max-w-7xl mx-auto px-4 md:px-0">
                    {features.map((feature, idx) => (
                        <FeatureCard
                            key={idx}
                            title={feature.title}
                            description={feature.description}
                            chartType={feature.chartType}
                            delay={idx * 0.15}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default KeyFeatures;
