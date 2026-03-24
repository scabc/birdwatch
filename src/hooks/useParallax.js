import { useState, useEffect, useRef } from 'react';

/**
 * 视差滚动 Hook
 * @param {number} speed - 速度系数，0.1-0.5 较柔和，越小越慢
 */
export const useParallax = (speed = 0.3) => {
    const [offset, setOffset] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const elementCenter = rect.top + rect.height / 2;
            const viewportCenter = windowHeight / 2;
            const distanceFromCenter = elementCenter - viewportCenter;
            setOffset(distanceFromCenter * speed);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return { ref, offset };
};

/**
 * 简单视差背景 Hook
 */
export const useParallaxBackground = (speed = 0.5) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setOffset(window.scrollY * speed);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return offset;
};
