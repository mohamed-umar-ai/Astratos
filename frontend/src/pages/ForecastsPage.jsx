import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations';

// Generate mock forecast data
const generateForecastData = () => {
    const items = ['Widget Pro', 'Gadget X', 'Component A', 'Module Z', 'Device Pro'];
    return items.map(item => ({
        item,
        currentStock: Math.floor(Math.random() * 500) + 50,
        predictedDemand: Math.floor(Math.random() * 200) + 50,
        reorderPoint: Math.floor(Math.random() * 100) + 20,
        confidence: Math.floor(Math.random() * 30) + 70,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        weeklyForecast: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10)
    }));
};

const ForecastsPage = () => {
    const [forecasts, setForecasts] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        setForecasts(generateForecastData());
    }, []);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <motion.main {...pageTransition} className="flex-1 lg:ml-64 p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Demand Forecasts</h1>
                        <p className="text-slate-400 mt-1">AI-powered inventory predictions</p>
                    </div>
                    <div className="flex gap-2">
                        {['7d', '14d', '30d', '90d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary Cards */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid sm:grid-cols-3 gap-4 mb-8"
                >
                    <motion.div variants={staggerItem} className="glass rounded-xl p-6">
                        <div className="text-3xl mb-2">📈</div>
                        <div className="text-2xl font-bold text-green-400">+15%</div>
                        <div className="text-slate-400 text-sm">Predicted Demand Growth</div>
                    </motion.div>
                    <motion.div variants={staggerItem} className="glass rounded-xl p-6">
                        <div className="text-3xl mb-2">📦</div>
                        <div className="text-2xl font-bold">3 Items</div>
                        <div className="text-slate-400 text-sm">Require Reorder Soon</div>
                    </motion.div>
                    <motion.div variants={staggerItem} className="glass rounded-xl p-6">
                        <div className="text-3xl mb-2">🎯</div>
                        <div className="text-2xl font-bold">87%</div>
                        <div className="text-slate-400 text-sm">Average Confidence</div>
                    </motion.div>
                </motion.div>

                {/* Forecast Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6 mb-8"
                >
                    <h2 className="text-xl font-semibold mb-6">Item Forecasts</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                                    <th className="pb-4 font-medium">Item</th>
                                    <th className="pb-4 font-medium">Current Stock</th>
                                    <th className="pb-4 font-medium">Predicted Demand</th>
                                    <th className="pb-4 font-medium">Reorder Point</th>
                                    <th className="pb-4 font-medium">Confidence</th>
                                    <th className="pb-4 font-medium">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {forecasts.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="data-row cursor-pointer"
                                        onClick={() => setSelectedItem(item)}
                                    >
                                        <td className="py-4 font-medium">{item.item}</td>
                                        <td className="py-4">{item.currentStock}</td>
                                        <td className="py-4">{item.predictedDemand}</td>
                                        <td className="py-4">
                                            <span className={`${item.currentStock <= item.reorderPoint
                                                    ? 'text-red-400'
                                                    : 'text-slate-300'
                                                }`}>
                                                {item.reorderPoint}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${item.confidence >= 80 ? 'bg-green-500' :
                                                                item.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${item.confidence}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm">{item.confidence}%</span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`${item.trend === 'up' ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {item.trend === 'up' ? '↑' : '↓'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Weekly Chart */}
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">
                                Weekly Forecast: {selectedItem.item}
                            </h2>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex items-end justify-between gap-4 h-48">
                            {selectedItem.weeklyForecast.map((value, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(value / 60) * 100}%` }}
                                        transition={{ delay: index * 0.05, duration: 0.4 }}
                                        className="w-full bg-gradient-to-t from-indigo-500 to-cyan-500 rounded-t-lg"
                                    />
                                    <span className="text-xs text-slate-400">{days[index]}</span>
                                    <span className="text-sm font-medium">{value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.main>
        </div>
    );
};

export default ForecastsPage;
