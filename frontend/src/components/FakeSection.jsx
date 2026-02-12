import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../utils/animations';

const pricingPlans = [
    {
        name: 'Starter',
        price: '$29',
        period: '/month',
        description: 'Perfect for small businesses',
        features: ['Up to 1,000 items', 'Real-time updates', 'Basic analytics', 'Email support'],
        highlighted: false
    },
    {
        name: 'Professional',
        price: '$99',
        period: '/month',
        description: 'For growing companies',
        features: ['Up to 10,000 items', 'Advanced analytics', 'Anomaly detection', 'Priority support', 'API access'],
        highlighted: true
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'For large organizations',
        features: ['Unlimited items', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'On-premise option'],
        highlighted: false
    }
];

const testimonials = [
    {
        quote: "Astratos transformed how we manage inventory. Real-time updates saved us thousands.",
        author: "Sarah Chen",
        role: "Operations Manager",
        company: "TechRetail Co."
    },
    {
        quote: "The anomaly detection caught a major discrepancy before it became a problem.",
        author: "Michael Roberts",
        role: "Supply Chain Director",
        company: "Global Logistics"
    },
    {
        quote: "Finally, a dashboard that actually feels modern and responsive.",
        author: "Emily Davis",
        role: "CTO",
        company: "StartupXYZ"
    }
];

const faqs = [
    {
        question: "How does real-time tracking work?",
        answer: "We use WebSocket connections to push updates instantly to your dashboard. No refresh needed."
    },
    {
        question: "Can I integrate with my existing systems?",
        answer: "Yes! Our REST API and webhooks allow seamless integration with ERP, POS, and warehouse systems."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use enterprise-grade encryption, regular audits, and comply with SOC 2 standards."
    },
    {
        question: "What kind of support do you offer?",
        answer: "All plans include email support. Professional and Enterprise plans get priority support and dedicated account managers."
    }
];

const FakeSection = () => {
    return (
        <>
            <section className="section relative">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                            Pricing
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                            Simple, Transparent Pricing
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
                    >
                        {pricingPlans.map((plan, index) => (
                            <motion.div
                                key={index}
                                variants={staggerItem}
                                whileHover={{ y: -5 }}
                                className={`rounded-2xl p-8 ${plan.highlighted
                                    ? 'gradient-glow text-white'
                                    : 'glass'
                                    }`}
                            >
                                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                                <p className={`text-sm mb-4 ${plan.highlighted ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    {plan.description}
                                </p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className={plan.highlighted ? 'text-indigo-200' : 'text-slate-400'}>
                                        {plan.period}
                                    </span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <span className="text-green-400">✓</span>
                                            <span className={plan.highlighted ? '' : 'text-slate-300'}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.highlighted
                                        ? 'bg-white text-indigo-600 hover:bg-slate-100'
                                        : 'btn-secondary'
                                        }`}
                                >
                                    Get Started
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <section className="section relative bg-slate-900/50">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                            Testimonials
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4">
                            Loved by Teams
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                variants={staggerItem}
                                className="glass rounded-2xl p-6"
                            >
                                <p className="text-lg mb-6 text-slate-300">"{testimonial.quote}"</p>
                                <div>
                                    <div className="font-semibold">{testimonial.author}</div>
                                    <div className="text-sm text-slate-400">
                                        {testimonial.role}, {testimonial.company}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <section className="section">
                <div className="container max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                            FAQ
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4">
                            Common Questions
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        {faqs.map((faq, index) => (
                            <motion.details
                                key={index}
                                variants={staggerItem}
                                className="glass rounded-xl group"
                            >
                                <summary className="p-6 cursor-pointer font-semibold list-none flex justify-between items-center">
                                    {faq.question}
                                    <span className="text-indigo-400 group-open:rotate-45 transition-transform">
                                        +
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-slate-400">
                                    {faq.answer}
                                </div>
                            </motion.details>
                        ))}
                    </motion.div>
                </div>
            </section>

            <footer className="py-12 border-t border-slate-800">
                <div className="container">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center font-bold">
                                    A
                                </div>
                                <span className="font-bold text-xl">Astratos</span>
                            </div>
                            <p className="text-slate-400 text-sm">
                                Real-time inventory intelligence for modern businesses.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-white">Features</a></li>
                                <li><a href="#" className="hover:text-white">Pricing</a></li>
                                <li><a href="#" className="hover:text-white">API</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-white">About</a></li>
                                <li><a href="#" className="hover:text-white">Blog</a></li>
                                <li><a href="#" className="hover:text-white">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#" className="hover:text-white">Privacy</a></li>
                                <li><a href="#" className="hover:text-white">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-center text-slate-500 text-sm pt-8 border-t border-slate-800">
                        © 2026 Astratos. All rights reserved.
                    </div>
                </div>
            </footer>
        </>
    );
};

export default FakeSection;
