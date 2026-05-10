import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DashboardPreview from './DashboardPreview';

const Hero = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 pt-24 md:pt-20 pb-16">

            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Noise */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            <div className="relative z-10 px-6 mx-auto flex flex-col items-center text-center">

                {/* User Friendly Tag */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-2 text-base text-slate-400 mb-8"
                >
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span>User-Friendly Interface</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.8 }}
                    className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.03] max-w-5xl mb-3"
                >
                    Streamline Warehouse Management
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                        with Astratos Smart Solution
                    </span>
                </motion.h1>

                {/* Subtext */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-lg md:text-xl text-slate-300 max-w-2xl leading-[1.7] mb-6"
                >
                    Efficiently track, manage, and predict inventory with Astratos AI-driven platform, ensuring smooth operations and real-time stock visibility.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="mb-6"
                >
                    <Link
                        to="/auth?mode=signup"
                        className="inline-flex items-center justify-center gap-6
                        bg-blue-600 text-white
                        px-14 py-5 
                        rounded-full
                        text-lg
                        font-semibold tracking-wide uppercase
                        transition-all duration-300 ease-out
                        hover:bg-blue-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/40 active:scale-95"
                    >
                        <span>Get Started →</span>
                    </Link>
                </motion.div>

                {/* Dashboard Preview */}
                <div className="-mt-4">
                    <DashboardPreview />
                </div>

            </div>
        </section>
    );
};

export default Hero;