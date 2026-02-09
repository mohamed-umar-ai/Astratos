import { motion } from 'framer-motion';
import { pageTransition } from '../utils/animations';
import Hero from '../components/Hero';
import Features from '../components/Features';
import FakeSection from '../components/FakeSection';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <motion.div {...pageTransition}>
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="container flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center font-bold text-lg">
                            A
                        </div>
                        <span className="font-bold text-xl">Astratos</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-slate-400 hover:text-white transition-colors">
                            Features
                        </a>
                        <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">
                            Pricing
                        </a>
                        <a href="#faq" className="text-slate-400 hover:text-white transition-colors">
                            FAQ
                        </a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/auth" className="text-slate-400 hover:text-white transition-colors">
                            Sign In
                        </Link>
                        <Link to="/dashboard">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary"
                            >
                                Get Started
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <Hero />

            {/* Features Section */}
            <Features />

            {/* Pricing, Testimonials, FAQ, Footer */}
            <FakeSection />
        </motion.div>
    );
};

export default LandingPage;
