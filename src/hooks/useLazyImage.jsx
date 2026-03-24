import { useState, useEffect, useRef } from 'react';

/**
 * 图片懒加载 Hook
 * 使用 IntersectionObserver 检测元素是否进入视口
 */
export const useLazyImage = (options = {}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                rootMargin: options.rootMargin || '100px',
                threshold: options.threshold || 0,
            }
        );

        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [options.rootMargin, options.threshold]);

    const handleLoad = () => setIsLoaded(true);

    return { ref, isInView, isLoaded, handleLoad };
};

/**
 * 骨架屏占位组件
 */
export const ImageSkeleton = ({ className = '' }) => (
    <div className={`skeleton-shimmer bg-gradient-to-r from-[#EDEAE4] via-[#FAF8F5] to-[#EDEAE4] bg-[length:200%_100%] ${className}`} />
);

/**
 * 懒加载图片组件
 */
export const LazyImage = ({
    src,
    alt,
    className = '',
    skeletonClassName = '',
    ...props
}) => {
    const { ref, isInView, isLoaded, handleLoad } = useLazyImage();

    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`}>
            {!isLoaded && <ImageSkeleton className={`absolute inset-0 ${skeletonClassName}`} />}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    {...props}
                />
            )}
        </div>
    );
};
