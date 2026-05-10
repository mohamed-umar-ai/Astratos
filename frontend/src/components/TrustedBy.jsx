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
        { name: 'Nexa Logistics' },
        { name: 'Atlas Retail Group' },
        { name: 'MetroSupply Co.' },
        { name: 'CoreChain Systems' },
        { name: 'PrimeFulfill' },
        { name: 'UrbanMart Wholesale' }
    ];

    return (
        <section ref={sectionRef} className="pt-10 bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <p className="text-slate-400 text-base md:text-lg uppercase opacity-80 tracking-[0.3em]">Trusted by industry leaders</p>
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
                               className="flex-shrink-0 px-10 py-6"
>
                                <span className="
                                    text-slate-500
                                    text-2xl
                                    font-semibold
                                    tracking-[0.25em]
                                    uppercase
                                    opacity-50
                                    hover:text-slate-300
                                    hover:opacity-85
                                    hover:scale-105
                                    transition-all duration-300 ease-out
                                ">
                                    {company.name}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default TrustedBy;
