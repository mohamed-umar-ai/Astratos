import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

const TrustedBy = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
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

    const companies = [
        { name: 'Amazon', src: '/logos/amazon.png' },
        { name: 'Costco', src: '/logos/costco.png' },
        { name: 'Ikea', src: '/logos/ikea.png' },
        { name: 'Reliance', src: '/logos/reliance.png' },
        { name: 'Shopify', src: '/logos/shopify.png' },
        { name: 'Walmart', src: '/logos/walmart.png' },
        { name: 'AdithyaBirla', src: '/logos/adithyabirla.png' }
    ];

    return (
        <section ref={sectionRef} className="py-32 bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Trusted by industry leaders</p>
                </motion.div>

                <div className="relative overflow-hidden max-w-full">
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

                    <motion.div
                        className="flex gap-24 items-center"
                        animate={{
                            x: [0, -1680], // Adjusted based on estimated width of items + gap
                        }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 35,
                                ease: "linear",
                            },
                        }}
                    >
                        {[...companies, ...companies, ...companies, ...companies].map((company, idx) => (
                            <div
                                key={idx}
                                className="flex-shrink-0 transition-all duration-300"
                                style={{
                                    width: '180px',
                                    height: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <img
                                    src={company.src}
                                    alt={company.name}
                                    className="max-w-full max-h-full object-contain filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                                />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default TrustedBy;
