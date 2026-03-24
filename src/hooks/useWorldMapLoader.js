import { useState, useEffect } from 'react';

const WORLD_MAP_NAME = 'world';
const WORLD_MAP_URL = '/world.json';
let worldMapLoaderPromise = null;

// 动态加载 echarts
const loadEcharts = () => import('echarts').then(m => m.default || m);

export const useWorldMapLoader = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadMap = async () => {
            const echarts = await loadEcharts();
            if (echarts.getMap(WORLD_MAP_NAME)) {
                setIsLoaded(true);
                return true;
            }

            if (!worldMapLoaderPromise) {
                worldMapLoaderPromise = fetch(WORLD_MAP_URL)
                    .then(res => {
                        if (!res.ok) throw new Error(`地图加载失败: ${res.status}`);
                        return res.json();
                    })
                    .then(json => {
                        echarts.registerMap(WORLD_MAP_NAME, json);
                        return true;
                    })
                    .catch(err => {
                        worldMapLoaderPromise = null;
                        throw err;
                    });
            }

            try {
                await worldMapLoaderPromise;
                setIsLoaded(true);
            } catch (err) {
                setError(err);
                console.warn('世界地图加载失败:', err);
            }
        };

        loadMap();
    }, []);

    return { isLoaded, error };
};

export const ensureWorldMapRegistered = () => {
    return loadEcharts().then(echarts => {
        if (echarts.getMap(WORLD_MAP_NAME)) return Promise.resolve(true);

        if (!worldMapLoaderPromise) {
            worldMapLoaderPromise = fetch(WORLD_MAP_URL)
                .then(res => {
                    if (!res.ok) throw new Error(`加载地图失败: ${res.status} ${res.statusText}`);
                    return res.json();
                })
                .then(json => {
                    echarts.registerMap(WORLD_MAP_NAME, json);
                    return true;
                })
                .catch(err => {
                    worldMapLoaderPromise = null;
                    throw err;
                });
        }
        return worldMapLoaderPromise;
    });
};
