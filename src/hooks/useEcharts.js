import { useState, useEffect, useRef, useCallback } from 'react';

let echartsInstance = null;
let echartsPromise = null;

// 动态加载 echarts 核心（按需加载，减少初始包体积）
const loadEcharts = async () => {
    if (echartsInstance) return echartsInstance;
    if (echartsPromise) return echartsPromise;

    echartsPromise = import('echarts').then(module => {
        echartsInstance = module;
        return module;
    });
    return echartsPromise;
};

// 加载 echarts 扩展（地图、雷达图、折线图等）
const loadEchartsExtensions = async (extensions = []) => {
    const echarts = await loadEcharts();

    const extensionPromises = extensions.map(ext => {
        switch (ext) {
            case 'map':
                return import('echarts/chart/lines').then(m => m.default);
            case 'radar':
                return import('echarts/chart/radar').then(m => m.default);
            case 'line':
                return import('echarts/chart/line').then(m => m.default);
            case 'scatter':
                return import('echarts/chart/scatter').then(m => m.default);
            case 'effectScatter':
                return import('echarts/chart/effectScatter').then(m => m.default);
            case 'geo':
                return import('echarts/component/geo').then(m => m.default);
            case 'title':
                return import('echarts/component/title').then(m => m.default);
            case 'tooltip':
                return import('echarts/component/tooltip').then(m => m.default);
            case 'legend':
                return import('echarts/component/legend').then(m => m.default);
            case 'toolbox':
                return import('echarts/component/toolbox').then(m => m.default);
            case 'visualMap':
                return import('echarts/component/visualMap').then(m => m.default);
            case 'timeline':
                return import('echarts/component/timeline').then(m => m.default);
            default:
                return Promise.resolve();
        }
    });

    await Promise.all(extensionPromises);
    return echarts;
};

// Hook: 使用 ECharts 实例（懒加载）
export const useEcharts = (extensions = []) => {
    const [echarts, setEcharts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        loadEchartsExtensions(extensions)
            .then(m => {
                if (mounted) {
                    setEcharts(m);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (mounted) {
                    setError(err);
                    setLoading(false);
                }
            });

        return () => { mounted = false; };
    }, [extensions.join(',')]);

    return { echarts, loading, error };
};

// Hook: 初始化 ECharts 实例
export const useEchartsInstance = (chartRef, extensions = []) => {
    const { echarts } = useEcharts(extensions);
    const instanceRef = useRef(null);

    const initChart = useCallback(() => {
        if (echarts && chartRef.current && !instanceRef.current) {
            instanceRef.current = echarts.init(chartRef.current);
        }
        return instanceRef.current;
    }, [echarts, chartRef]);

    const disposeChart = useCallback(() => {
        if (instanceRef.current) {
            instanceRef.current.dispose();
            instanceRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            if (instanceRef.current) {
                instanceRef.current.dispose();
                instanceRef.current = null;
            }
        };
    }, []);

    return { instance: instanceRef.current, initChart, disposeChart, echarts };
};

// 导出懒加载的 echarts 实例（供非 React 环境使用）
export const getEcharts = () => loadEcharts();

// 导出世界地图注册函数
export { ensureWorldMapRegistered } from './useWorldMapLoader';
