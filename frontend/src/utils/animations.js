export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

export const fadeInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

export const fadeInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

export const scaleUp = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

export const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.3, ease: "easeIn" }
    }
};

export const cardHover = {
    rest: { scale: 1, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
    hover: {
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        transition: { duration: 0.3, ease: "easeOut" }
    }
};

export const buttonTap = {
    whileTap: { scale: 0.98 }
};

export const floatingAnimation = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

export const pulseAnimation = {
    animate: {
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

export const glowAnimation = {
    animate: {
        boxShadow: [
            "0 0 20px rgba(99, 102, 241, 0.3)",
            "0 0 40px rgba(99, 102, 241, 0.5)",
            "0 0 20px rgba(99, 102, 241, 0.3)"
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

export const sidebarSlide = {
    hidden: { x: -280 },
    visible: {
        x: 0,
        transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: {
        x: -280,
        transition: { duration: 0.2, ease: "easeIn" }
    }
};

export const counterConfig = {
    duration: 0.5,
    ease: "easeOut"
};

export const chartBarAnimation = (index) => ({
    hidden: { scaleY: 0, originY: 1 },
    visible: {
        scaleY: 1,
        transition: {
            delay: index * 0.05,
            duration: 0.4,
            ease: "easeOut"
        }
    }
});

export const listItemAnimation = (index) => ({
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            delay: index * 0.1,
            duration: 0.4,
            ease: "easeOut"
        }
    }
});
