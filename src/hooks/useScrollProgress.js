import { useState, useEffect, useCallback, useRef } from 'react';

export const useScrollProgress = () => {
    const [progress, setProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = windowHeight > 0 ? totalScroll / windowHeight : 0;

            setProgress(Number(scrollPercent.toFixed(4)));
            setShowScrollTop(totalScroll > 500);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return { progress, showScrollTop, scrollToTop };
};

export const useThrottle = (callback, delay) => {
    const lastRun = useRef(Date.now());

    return useCallback((...args) => {
        if (Date.now() - lastRun.current >= delay) {
            callback(...args);
            lastRun.current = Date.now();
        }
    }, [callback, delay]);
};
