import React, { useRef, useEffect } from 'react';

const Observer = ({ children, className = '', delay = 0, variant = 'fade-in-up' }) => {
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    ref.current?.classList.add('is-visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [delay]);

    return <div ref={ref} className={`${variant} ${className}`}>{children}</div>;
};

export default Observer;
