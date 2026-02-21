import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations';
import Hero from '../components/Hero';
import TrustedBy from '../components/TrustedBy';
import KeyFeatures from '../components/KeyFeatures';
import {
    NewFeatures as Features,
    InventoryOverview,
    AIFeatures,
    HowItWorks,
    Pricing,
    Testimonials,
    FAQ,
    Footer
} from '../components/LandingSections';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <motion.div {...pageTransition}>
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
                <div className="container mx-auto px-4 flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                            A
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">Astratos</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'About Us', 'Pricing', 'Contact'].map((item) => (
                            <span
                                key={item}
                                className="text-slate-400 hover:text-white hover:underline cursor-pointer transition-colors font-medium"
                            >
                                {item}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/auth?mode=login" className="text-slate-400 hover:text-white font-medium hover:underline transition-colors">
                            Log In
                        </Link>
                        <Link to="/auth?mode=signup">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white text-black px-2 py-1 rounded-full font-semibold tracking-wide hover:bg-slate-200 transition-colors"
                            >
                                Start free trial
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </nav>

            <Hero />
            <TrustedBy />
            <KeyFeatures />

            <div className="space-y-12 pb-20">
                <Features />
                <InventoryOverview />
                <AIFeatures />
                <HowItWorks />
                <Pricing />
                <Testimonials />
                <FAQ />
            </div>

            <Footer />
        </motion.div>
    );
};

export default LandingPage;
