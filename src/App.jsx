import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';

// 共享组件
import { Observer, Icon, BrandLogo, ErrorBoundary } from './components/Shared';
import { useParallax, useParallaxBackground, LazyImage } from './hooks';

// Modals
import { SpeciesDetailModal, HabitatDetailModal, RegisterModal, ContactModal, TimelineDetailModal } from './components/Modals';

// 数据
import { BIRD_DB, CR_BIRD_KEYS, ALL_BIRD_KEYS } from './data/birds';
import { HABITAT_DB, MAP_NODES, SPRING_ROUTES, AUTUMN_ROUTES } from './data/habitats';
import { TIMELINE_DATA } from './data/timeline';

// Lucide React Icons
import {
    X, Heart, Target, Feather, Leaf, Globe, MapPin,
    ArrowRight, ArrowLeft, Users, Mail, User, MessageSquare,
    Activity, PieChart, BarChart3, TrendingDown, TrendingUp, AlertTriangle,
    Info, Fish, Bird, BookOpen, Compass, Radar, Zap, Shield,
    Volume2, Play, Pause, Music, CheckCircle, XCircle, Clock, Award,
    LayoutGrid, Home, MousePointer2, ChevronDown, Sun, Star, FileText, Flag,
    Search, Quote, Ruler, Utensils, Eye, Target as TargetIcon
} from 'lucide-react';

const WORLD_MAP_NAME = 'world';
const WORLD_MAP_URL = '/world.json';

// ECharts 懒加载
let echartsInstance = null;
let echartsPromise = null;

const loadEcharts = () => {
    if (echartsInstance) return Promise.resolve(echartsInstance);
    if (echartsPromise) return echartsPromise;
    echartsPromise = import('echarts').then(m => {
        echartsInstance = m.default || m;
        return echartsInstance;
    });
    return echartsPromise;
};

// 检查用户是否偏好减少动画
const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// 世界地图注册（懒加载）
const ensureWorldMapRegistered = async () => {
    const echarts = await loadEcharts();
    if (echarts.getMap(WORLD_MAP_NAME)) return true;
    const res = await fetch(WORLD_MAP_URL);
    if (!res.ok) throw new Error(`加载地图失败: ${res.status} ${res.statusText}`);
    const json = await res.json();
    echarts.registerMap(WORLD_MAP_NAME, json);
    return true;
};

// ==========================================
// 迁徙故事数据
// ==========================================

const MIGRATION_STORIES = {
    // 1. 勺嘴鹬
    'spoon_sandpiper': {
        name: '勺嘴鹬', en: 'Spoon-billed Sandpiper',
        chapters: [
            {
                id: '1', month: 'JUNE - AUGUST', monthCn: '6月 - 8月',
                title: '极北之境 | Arctic Genesis',
                location: 'Chukotka, Russia',
                coords: [175.0, 64.0], zoom: 3, themeColor: '#3B82F6',
                text: '在楚科奇半岛凛冽的寒风中，生命破壳而出。苔原短暂的夏季是它们唯一的成长窗口，雏鸟必须在六周内学会飞行，准备迎接一生的挑战。'
            },
            {
                id: '2', month: 'SEPTEMBER', monthCn: '9月',
                title: '生死跨越 | The Great Crossing',
                location: 'Yellow Sea / Bohai Bay',
                coords: [122.0, 39.0], zoom: 5, themeColor: '#F59E0B',
                text: '飞越数千公里，它们抵达黄渤海的泥质滩涂。这是迁徙途中至关重要的"加油站"。由于填海造陆，这里的补给食堂正在急剧萎缩。'
            },
            {
                id: '3', month: 'OCTOBER', monthCn: '10月',
                title: '关键补给 | Vital Stopover',
                location: 'Tiaozini, Jiangsu',
                coords: [120.9, 32.8], zoom: 6, themeColor: '#10B981',
                text: '在江苏条子泥，它们利用退潮的几小时疯狂进食。特化的勺状嘴像扫雷器一样在泥水中滤食，为下一段航程积蓄脂肪。'
            },
            {
                id: '4', month: 'DEC - MARCH', monthCn: '12月 - 次年3月',
                title: '热带避风港 | Tropical Haven',
                location: 'Gulf of Thailand',
                coords: [99.0, 14.0], zoom: 5, themeColor: '#6366F1',
                text: '最终抵达温暖的东南亚。在红树林与盐田的交界处，它们换上冬羽，混入其他鸻鹬群中，静候春风的召唤。'
            }
        ]
    },

    // 2. 中华凤头燕鸥
    'crested_tern': {
        name: '中华凤头燕鸥', en: 'Chinese Crested Tern',
        chapters: [
            {
                id: '1', month: 'MAY - AUGUST', monthCn: '5月 - 8月',
                title: '孤岛求生 | Island Sanctuary',
                location: 'Jiushan Islands, Zhejiang',
                coords: [122.0, 29.5], zoom: 6, themeColor: '#64748B',
                text: '曾经消失了63年的"神话之鸟"。在浙江沿海的无人荒岛上，它们在台风与海浪的夹缝中筑巢，每一枚卵都承载着物种的希望。'
            },
            {
                id: '2', month: 'SEPTEMBER', monthCn: '9月',
                title: '携幼学飞 | Fledging',
                location: 'Fujian Coast',
                coords: [119.8, 26.0], zoom: 5, themeColor: '#3B82F6',
                text: '繁殖季结束，亲鸟带着刚学会飞行的幼鸟离开繁殖岛，在福建河口湿地学习捕鱼技巧，为南迁做最后准备。'
            },
            {
                id: '3', month: 'OCT - NOV', monthCn: '10月 - 11月',
                title: '海洋漂泊 | Pelagic Drifting',
                location: 'South China Sea',
                coords: [115.0, 20.0], zoom: 4, themeColor: '#06B6D4',
                text: '它们不像候鸟那样有固定的路线，而是随鱼群在浩瀚的南中国海上漂泊。海洋塑料垃圾和过度捕捞是它们面临的最大隐形杀手。'
            },
            {
                id: '4', month: 'DEC - APRIL', monthCn: '12月 - 次年4月',
                title: '南洋越冬 | Winter Home',
                location: 'Philippines / Indonesia',
                coords: [124.0, 8.0], zoom: 4, themeColor: '#0891B2',
                text: '最终在菲律宾和印尼的群岛间越冬。全球种群数量不足200只，每一次归来都是奇迹。'
            }
        ]
    },

    // 3. 白鹤
    'siberian_crane': {
        name: '白鹤', en: 'Siberian Crane',
        chapters: [
            {
                id: '1', month: 'JUNE - AUGUST', monthCn: '6月 - 8月',
                title: '冻土育雏 | Tundra Breeding',
                location: 'Yakutia, Russia',
                coords: [140.0, 70.0], zoom: 3, themeColor: '#94A3B8',
                text: '在西伯利亚广袤的苔原湿地，白鹤利用极昼的阳光抚育后代。这里人迹罕至，是地球上最后的净土之一。'
            },
            {
                id: '2', month: 'SEPT - OCT', monthCn: '9月 - 10月',
                title: '千里南下 | The Long Descent',
                location: 'Momoge, Jilin',
                coords: [123.5, 45.8], zoom: 5, themeColor: '#FBBF24',
                text: '途经吉林莫莫格湿地，在这个关键的停歇地，它们取食植物块茎补充能量，准备跨越华北平原的人口稠密区。'
            },
            {
                id: '3', month: 'NOVEMBER', monthCn: '11月',
                title: '长江集结 | Yangtze Assembly',
                location: 'Yangtze River Basin',
                coords: [117.0, 31.0], zoom: 5, themeColor: '#F59E0B',
                text: '这是一场与水位的赛跑。它们需要恰到好处的水位深度才能觅食。三峡大坝的调度对下游湿地格局有着深远影响。'
            },
            {
                id: '4', month: 'DEC - MARCH', monthCn: '12月 - 次年3月',
                title: '鄱阳相守 | Poyang Promise',
                location: 'Poyang Lake, Jiangxi',
                coords: [116.6, 29.1], zoom: 6, themeColor: '#10B981',
                text: '鄱阳湖的浅水草洲是它们最终的越冬地。全球仅存的白鹤中，有95%在此过冬。保护这一池清水，就是守护一个物种的未来。'
            }
        ]
    },

    // 4. 青头潜鸭
    'baers_pochard': {
        name: '青头潜鸭', en: "Baer's Pochard",
        chapters: [
            {
                id: '1', month: 'APRIL - JUNE', monthCn: '4月 - 6月',
                title: '东北繁育 | Northeast Breeding',
                location: 'Northeast China',
                coords: [126.0, 46.0], zoom: 5, themeColor: '#10B981',
                text: '在中国东北的淡水湿地，青头潜鸭在芦苇丛中筑巢。它们的头部在阳光下泛出独特的绿色光泽，这是它们最醒目的标志。'
            },
            {
                id: '2', month: 'OCTOBER', monthCn: '10月',
                title: '南迁集结 | Southern Migration',
                location: 'Hebei Coast',
                coords: [118.5, 39.0], zoom: 5, themeColor: '#3B82F6',
                text: '随着气温下降，它们开始南迁。在河北沿海的湿地集结，补充迁徙途中消耗的能量。'
            },
            {
                id: '3', month: 'NOVEMBER', monthCn: '11月',
                title: '长江中游 | Middle Yangtze',
                location: 'Yangtze River Basin',
                coords: [114.0, 30.0], zoom: 5, themeColor: '#6366F1',
                text: '长江中游的通江湖泊是它们最重要的越冬地。但近年来水位的人工调控严重影响了它们的觅食环境。'
            },
            {
                id: '4', month: 'DEC - MARCH', monthCn: '12月 - 次年3月',
                title: '鄱阳越冬 | Poyang Wintering',
                location: 'Poyang Lake, Jiangxi',
                coords: [116.3, 29.2], zoom: 6, themeColor: '#F59E0B',
                text: '鄱阳湖是它们最主要的越冬场所。全球仅剩约500只，每一只都是这个物种延续的希望。'
            }
        ]
    },

    // 5. 黄胸鹀
    'yellow_bunting': {
        name: '黄胸鹀', en: 'Yellow-breasted Bunting',
        chapters: [
            {
                id: '1', month: 'MAY - JULY', monthCn: '5月 - 7月',
                title: '繁殖地 | Breeding Grounds',
                location: 'Siberia / Mongolia',
                coords: [105.0, 52.0], zoom: 4, themeColor: '#FBBF24',
                text: '在西伯利亚和蒙古的森林草原交界处，黄胸鹀在灌丛中筑巢。曾经的田间常见鸟，如今在繁殖地也难觅踪迹。'
            },
            {
                id: '2', month: 'AUGUST', monthCn: '8月',
                title: '南迁起点 | Migration Start',
                location: 'Northeast China',
                coords: [125.0, 45.0], zoom: 5, themeColor: '#F59E0B',
                text: '八月开始南迁，在东北地区的农田和湿地边缘停歇。此时它们体态丰腴，正是"禾花雀"被捕猎的目标。'
            },
            {
                id: '3', month: 'SEPT - OCT', monthCn: '9月 - 10月',
                title: '穿越华北 | Crossing North China',
                location: 'North China Plain',
                coords: [116.0, 36.0], zoom: 5, themeColor: '#EF4444',
                text: '穿越华北平原的农田，这里曾是它们迁徙途中的重要驿站。但密集的捕鸟网和交易市场让这段旅程充满杀机。'
            },
            {
                id: '4', month: 'NOV - MARCH', monthCn: '11月 - 次年3月',
                title: '华南越冬 | South China Wintering',
                location: 'Guangdong / SE Asia',
                coords: [113.0, 23.0], zoom: 5, themeColor: '#10B981',
                text: '最终抵达华南或东南亚越冬。短短二十年，这个曾经遍布欧亚的物种，从"无危"坠入"极危"，种群崩溃速度令人震惊。'
            }
        ]
    },

    // 6. 细纹苇莺
    'reed_warbler': {
        name: '细纹苇莺', en: 'Streaked Reed Warbler',
        chapters: [
            {
                id: '1', month: 'MAY', monthCn: '5月',
                title: '神秘的到来 | Mysterious Arrival',
                location: 'Coastal Wetlands, China',
                coords: [120.0, 35.0], zoom: 5, themeColor: '#10B981',
                text: '细纹苇莺的繁殖地至今成谜。五月，它们神秘地出现在中国东部沿海的芦苇荡中，开始繁殖季节。'
            },
            {
                id: '2', month: 'JUNE - JULY', monthCn: '6月 - 7月',
                title: '芦苇繁育 | Reed Nesting',
                location: 'Yellow River Delta',
                coords: [119.0, 37.5], zoom: 6, themeColor: '#6366F1',
                text: '在黄河三角洲的芦苇丛中，它们编织出精巧的巢穴。但沿海湿地的开发让这些隐秘的栖息地不断缩小。'
            },
            {
                id: '3', month: 'AUGUST - SEPT', monthCn: '8月 - 9月',
                title: '南迁开始 | Southern Migration',
                location: 'East China Coast',
                coords: [121.0, 31.0], zoom: 5, themeColor: '#3B82F6',
                text: '八月开始南迁，沿着中国东部海岸线移动。它们身形娇小，却要独自完成数千公里的迁徙旅程。'
            },
            {
                id: '4', month: 'OCT - APRIL', monthCn: '10月 - 次年4月',
                title: '南方越冬 | Southern Wintering',
                location: 'South China / SE Asia',
                coords: [110.0, 20.0], zoom: 5, themeColor: '#F59E0B',
                text: '在华南和东南亚的芦苇湿地越冬。第二年春天，它们又会消失在某个未知的北方繁殖地，延续着这个物种的神秘轮回。'
            }
        ]
    }
};


// 确保这里的 ID 都在 DB 里有数据
const CHINA_COASTAL_NODES_IDS = ['khanka', 'yalu', 'beidaihe', 'bohai', 'yellowriver', 'lianyungang', 'yancheng', 'chongming', 'hangzhou', 'minjiang', 'shenzhen', 'zhanjiang', 'poyang', 'dongting', 'qinghai'];

const STATS = [
    { labelCn: "受威胁物种", labelEn: "Species at Risk", value: "62%", subCn: "迁飞通道内水鸟种群", subEn: "of populations", trend: "warning", color: "text-danger" },
    { labelCn: "滩涂湿地损失", labelEn: "Tidal Flat Loss", value: "65%", subCn: "自1950年以来丧失", subEn: "lost since 1950", trend: "down", color: "text-orange-600" },
    { labelCn: "年迁徙鸟类", labelEn: "Annual Travelers", value: "50M+", subCn: "每年跨越22个国家", subEn: "across 22 countries", trend: "neutral", color: "text-blue-600" },
    { labelCn: "关键生态节点", labelEn: "Critical Hubs", value: "900+", subCn: "已确定的生态热点", subEn: "key biodiversity areas", trend: "up", color: "text-green-600" }
];

const NAV_LINKS = [
    { id: 'story', cn: '生命之旅', en: 'The Journey' },
    { id: 'map', cn: '迁徙轨迹', en: 'Pathways' },
    { id: 'species', cn: '红色名录', en: 'Red List' },
    { id: 'data-hub', cn: '生态哨兵', en: 'Sentinels' },
    { id: 'hub', cn: '探索中心', en: 'Discovery' },
    { id: 'timeline', cn: '保护历程', en: 'Legacy' },
];

// --- 2. 辅助组件 ---

const InteractiveTitle = ({ text, className }) => (
    <span className={`inline-block ${className}`}>
        {text.split('').map((char, index) => (
            <span key={index} className="inline-block transition-transform duration-300 hover:-translate-y-2 hover:text-accent hover:rotate-2 cursor-default">{char === ' ' ? '\u00A0' : char}</span>
        ))}
    </span>
);




// ==========================================
//  MigrationMap
// ==========================================

const MigrationMap = ({ onNodeClick }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [season, setSeason] = useState('autumn');
    const [viewMode, setViewMode] = useState('global');
    const [mapLoaded, setMapLoaded] = useState(false);

    // 安全获取坐标函数（防止白屏）
    const getCoords = (id) => {
        const node = MAP_NODES.find(n => n.id === id);
        return node ? node.value : null;
    };
    
    // [100% 完整线路定义]
    const SPRING_ROUTES = [
        { from: 'newzealand', to: 'yalu', isGlobal: true, curve: -0.3 },
        { from: 'australia', to: 'seasia', isGlobal: true, curve: 0.2 },
        { from: 'seasia', to: 'zhanjiang', isGlobal: true, curve: -0.1 },
        { from: 'australia', to: 'yancheng', isGlobal: true, curve: -0.2 },
        { from: 'zhanjiang', to: 'minjiang', isGlobal: true, isChina: true },
        { from: 'minjiang', to: 'yancheng', isGlobal: true, isChina: true, curve: 0.1 },
        { from: 'yancheng', to: 'yalu', isGlobal: true, isChina: true, curve: 0.1 },
        { from: 'yalu', to: 'siberia', isGlobal: true, curve: -0.1 },
        { from: 'yalu', to: 'alaska', isGlobal: true, curve: 0.3 },
        { from: 'seasia', to: 'qinghai', isGlobal: true, curve: 0.2 },
        { from: 'qinghai', to: 'siberia', isGlobal: true, curve: -0.1 },
        { from: 'shenzhen', to: 'minjiang', isChina: true },
        { from: 'minjiang', to: 'hangzhou', isChina: true },
        { from: 'hangzhou', to: 'chongming', isChina: true },
        { from: 'chongming', to: 'yancheng', isChina: true },
        { from: 'yancheng', to: 'lianyungang', isChina: true },
        { from: 'lianyungang', to: 'yellowriver', isChina: true },
        { from: 'yellowriver', to: 'bohai', isChina: true, curve: 0.1 },
        { from: 'bohai', to: 'beidaihe', isChina: true },
        { from: 'beidaihe', to: 'yalu', isChina: true },
        { from: 'poyang', to: 'yellowriver', isChina: true, curve: -0.1 },
        { from: 'dongting', to: 'khanka', isChina: true, curve: 0.15 },
    ];

    const AUTUMN_ROUTES = [
        { from: 'siberia', to: 'yalu', isGlobal: true, curve: 0.1 },
        { from: 'siberia', to: 'khanka', isGlobal: true, curve: 0.1 },
        { from: 'yalu', to: 'yancheng', isGlobal: true, isChina: true, curve: 0.1 },
        { from: 'khanka', to: 'beidaihe', isGlobal: true, isChina: true },
        { from: 'beidaihe', to: 'yancheng', isGlobal: true, isChina: true, curve: 0.1 },
        { from: 'yancheng', to: 'minjiang', isGlobal: true, isChina: true },
        { from: 'minjiang', to: 'zhanjiang', isGlobal: true, isChina: true, curve: 0.1 },
        { from: 'minjiang', to: 'seasia', isGlobal: true, curve: 0.2 },
        { from: 'yancheng', to: 'australia', isGlobal: true, curve: 0.2 }, 
        { from: 'alaska', to: 'newzealand', isGlobal: true, curve: -0.4 }, 
        { from: 'beidaihe', to: 'yellowriver', isChina: true },
        { from: 'yellowriver', to: 'poyang', isChina: true, curve: 0.1 }, 
        { from: 'yellowriver', to: 'dongting', isChina: true, curve: 0.05 }, 
        { from: 'yancheng', to: 'chongming', isChina: true },
        { from: 'chongming', to: 'minjiang', isChina: true },
        { from: 'minjiang', to: 'shenzhen', isChina: true },
        { from: 'hangzhou', to: 'seasia', isChina: true, curve: 0.25 },
    ];

    useEffect(() => {
        if (!chartRef.current) return;

        const initChart = async () => {
            if (!chartInstance.current) {
                const echarts = await loadEcharts();
                chartInstance.current = echarts.init(chartRef.current);
                console.log('✅ ECharts 实例已初始化');
                chartInstance.current.on('click', (params) => {
                    if (params.seriesType === 'effectScatter' && params.data.dataId) onNodeClick(params.data.dataId);
                });
            }
        };

        initChart();
        
        const renderChart = async () => {
            if (!chartInstance.current) return;
            const echarts = await loadEcharts();
            if (!echarts.getMap(WORLD_MAP_NAME)) {
                console.warn('⚠️ 世界地图未注册，跳过渲染');
                return;
            }
            console.log('🎨 开始渲染地图，季节:', season, '视图:', viewMode);
            const routeColor = season === 'spring' ? '#10B981' : '#F59E0B'; 
            const isGlobalView = viewMode === 'global';
            
            const activeLines = (season === 'spring' ? SPRING_ROUTES : AUTUMN_ROUTES)
                .filter(r => isGlobalView ? r.isGlobal : r.isChina)
                .map(r => {
                    const start = getCoords(r.from);
                    const end = getCoords(r.to);
                    if (!start || !end) return null;
                    return { coords: [start, end], lineStyle: { curveness: r.curve || 0.1 } };
                }).filter(Boolean);

            const activeNodes = MAP_NODES
                .filter(n => isGlobalView ? n.showInGlobal : CHINA_COASTAL_NODES_IDS.includes(n.id))
                .map(n => ({
                    name: n.cn, value: n.value, dataId: n.id,
                    itemStyle: { color: n.highlight ? '#1F2937' : '#94A3B8' }
                }));

            console.log('📍 活跃节点数:', activeNodes.length, '活跃线路数:', activeLines.length);

            chartInstance.current.setOption({
                backgroundColor: '#F0EFEC',
                geo: {
                    map: WORLD_MAP_NAME, roam: true, scaleLimit: { min: 1.0, max: 15 },
                    center: isGlobalView ? [150, 20] : [110, 32], zoom: isGlobalView ? 1.3 : 4.5,
                    animationDurationUpdate: 4500,
                    animationEasingUpdate: 'exponentialOut',
                    itemStyle: { 
                        areaColor: '#FFFFFF',
                        borderColor: '#E2E8F0', 
                        borderWidth: 1 
                    },
                    emphasis: { itemStyle: { areaColor: '#FDFCFB' } }
                },
                series: [
                    { type: 'lines', coordinateSystem: 'geo', data: activeLines, lineStyle: { color: routeColor, width: 1.5, opacity: 0.15 }, zlevel: 1 },
                    { type: 'lines', coordinateSystem: 'geo', data: activeLines, effect: { show: true, period: 5, trailLength: 0.4, color: routeColor, symbol: 'circle', symbolSize: 3 }, lineStyle: { opacity: 0 }, zlevel: 2 },
                    { type: 'effectScatter', coordinateSystem: 'geo', data: activeNodes, rippleEffect: { scale: 3, brushType: 'stroke', color: routeColor }, symbolSize: 8, label: { show: true, position: 'right', formatter: '{b}', color: '#64748B', fontSize: 10, fontFamily: 'serif' }, zlevel: 3 }
                ]
            }, { notMerge: true });
            console.log('✅ 地图渲染完成');
        };

        ensureWorldMapRegistered()
            .then(() => {
                console.log('✅ 世界地图已注册');
                setMapLoaded(true);
                renderChart();
            })
            .catch(err => {
                console.warn('❌ 本地 world.json 加载失败:', err);
                setMapLoaded(false);
            });
        
        const resize = () => chartInstance.current?.resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [season, viewMode]);

    // 清理
    useEffect(() => {
        return () => {
            if (chartInstance.current) {
                chartInstance.current.dispose();
            }
        };
    }, []);

    return (
        <section id="map" className="py-32 bg-[#FCFBFA] relative overflow-hidden">
            {/* IP 形象装饰 - 位于标题区域右侧边缘，只露出上半身 */}
            <div className="absolute top-16 right-[2%] z-10 w-32 overflow-hidden pointer-events-none">
                <div className="relative">
                    {/* 身体被容器遮挡，只露头 */}
                    <div className="overflow-hidden h-28">
                        <img src="/1@288x.png" alt="" className="w-full object-contain" />
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-12 relative z-10">
                
                {/* --- 迁徙轨迹：统一标题系统 (字号 6xl) --- */}
                <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12 border-b border-gray-100 pb-12">
                    <Observer className="max-w-2xl">
                        {/* 深色胶囊装饰条 */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="px-4 py-1.5 bg-[#1F2937] rounded-full flex items-center gap-3 shadow-lg">
                                <Globe size={14} className="text-amber-500 animate-pulse" />
                                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.2em]">Flight Cartography</span>
                            </div>
                        </div>
        
                        {/* 主标题区 */}
                        <div className="mb-10 leading-tight">
                            <h2 className="text-6xl font-serif font-black text-[#1F2937] tracking-tighter mb-2">
                                迁徙轨迹
                            </h2>
                            <p className="text-4xl font-serif italic text-gray-300">/ Flight Pathways</p>
                        </div>

                        {/* 描述文案 */}
                        <p className="text-gray-500 text-lg font-serif leading-relaxed opacity-90 border-l-4 border-amber-500/20 pl-10">
                            每一道航迹不仅是空间坐标的连接，更是候鸟生命的刻度。从北极苔原到南太平洋，金色线条承载着跨越半个地球的生存意志。
                        </p>
                    </Observer>

                    {/* 右侧科学标识：字号微调，更显精致 */}
                    <div className="hidden lg:flex flex-col items-end text-right pb-1 opacity-40">
                        <div className="font-mono text-[9px] text-gray-400 leading-relaxed uppercase tracking-[0.2em]">
                            Projection: Mercator Spherical<br/>
                            Data Source: EAAFP Partnership<br/>
                            Status: Telemetry Feed Active
                        </div>
                    </div>
                </div>

                {/* 🚀 地图主体 */}
                <Observer>
                    <div className="relative w-full h-[75vh] min-h-[600px] bg-[#F0EFEC] rounded-[3.5rem] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
                        <div ref={chartRef} className="w-full h-full" />

                        {/* 地图加载失败降级提示 */}
                        {!mapLoaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F0EFEC] z-30">
                                <Globe size={64} className="text-gray-300 mb-6" />
                                <p className="text-lg font-serif text-gray-400 mb-2">地图数据加载中...</p>
                                <p className="text-sm font-mono text-gray-300">Loading map data...</p>
                            </div>
                        )}

                        {/* 🚀 控制台：中英顺序修正 */}
                        <div className="absolute top-8 left-8 flex flex-col gap-4 z-20 pointer-events-auto">
                            <div className="glass glow-amber-hover flex p-1.5 rounded-2xl transition-all duration-300">
                                <button onClick={() => setSeason('spring')} className={`px-6 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all duration-300 ${season === 'spring' ? 'bg-[#10B981] text-white shadow-lg' : 'text-gray-400 hover:text-gray-700'}`}>春季 · SPRING</button>
                                <button onClick={() => setSeason('autumn')} className={`px-6 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all duration-300 ${season === 'autumn' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-700'}`}>秋季 · AUTUMN</button>
                            </div>
                            <div className="glass glow-amber-hover flex p-1.5 rounded-2xl w-fit transition-all duration-300">
                                <button onClick={() => setViewMode('global')} className={`px-6 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all duration-300 ${viewMode === 'global' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-700'}`}>全球 · GLOBAL</button>
                                <button onClick={() => setViewMode('china')} className={`px-6 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all duration-300 ${viewMode === 'china' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-700'}`}>区域 · REGIONAL</button>
                            </div>
                        </div>
                        
                        <div className="absolute bottom-10 right-10 opacity-20 pointer-events-none text-[#4A4238] flex flex-col items-end">
                            <Compass size={28} strokeWidth={1} />
                            <span className="text-[8px] font-mono font-black tracking-widest uppercase mt-2">True North</span>
                        </div>
                    </div>
                </Observer>
            </div>
        </section>
    );
};

// ==========================================
// DataHubSection
// ==========================================

const DataHubSection = () => {
    const [selectedTrendBird, setSelectedTrendBird] = useState('spoon_sandpiper');
    const [sentinelSearch, setSentinelSearch] = useState('');
    const [chartsLoading, setChartsLoading] = useState(true);

    const lineChartRef = useRef(null);
    const radarChartRef = useRef(null);
    const lineInstance = useRef(null);
    const radarInstance = useRef(null);

    // 1. 详实数据补充库 (确保信息全面且准确)
    const extraSpecs = useMemo(() => ({
        'spoon_sandpiper': { dist: '8,000', weight: '35', lifespan: '12', speed: '65', threat: '极高 · CRITICAL' },
        'baers_pochard': { dist: '3,500', weight: '680', lifespan: '15', speed: '55', threat: '极高 · CRITICAL' },
        'siberian_crane': { dist: '5,100', weight: '6,000', lifespan: '30', speed: '45', threat: '极高 · CRITICAL' },
        'yellow_bunting': { dist: '4,000', weight: '25', lifespan: '8', speed: '40', threat: '极高 · CRITICAL' },
        'crested_tern': { dist: '2,500', weight: '280', lifespan: '22', speed: '50', threat: '极高 · CRITICAL' },
        'reed_warbler': { dist: '3,200', weight: '12', lifespan: '7', speed: '38', threat: '极高 · CRITICAL' }
    }), []);

    // 2. 搜索过滤逻辑
    const filteredSentinels = useMemo(() => {
        return CR_BIRD_KEYS.filter(key => {
            const bird = BIRD_DB[key];
            return bird.cn.includes(sentinelSearch) || bird.en.toLowerCase().includes(sentinelSearch.toLowerCase());
        });
    }, [sentinelSearch]);

    const currentBirdData = BIRD_DB[selectedTrendBird];
    const specs = extraSpecs[selectedTrendBird] || extraSpecs['spoon_sandpiper'];

    const riskScore = useMemo(() => {
        if (!currentBirdData?.radarData) return 0;
        return Math.round(currentBirdData.radarData.reduce((a, b) => a + b, 0) / 5);
    }, [currentBirdData]);

    // 3. ECharts 初始化 (懒加载)
    useEffect(() => {
        const renderCharts = async () => {
            if (!lineChartRef.current || !radarChartRef.current) return;

            const echarts = await loadEcharts();

            // --- A. 种群趋势图 ---
            if (lineInstance.current) lineInstance.current.dispose();
            lineInstance.current = echarts.init(lineChartRef.current);
            lineInstance.current.setOption({
                backgroundColor: 'transparent',
                grid: { left: '10%', right: '5%', bottom: '15%', top: '15%', containLabel: true },
                xAxis: {
                    type: 'category', data: ['2000', '2005', '2010', '2015', '2020', '2025'],
                    axisLine: { lineStyle: { color: '#F3F4F6' } }, axisLabel: { color: '#A1A1AA', fontSize: 10, fontWeight: 'bold' }
                },
                yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#F3F4F6' } }, axisLabel: { color: '#A1A1AA', fontSize: 10 } },
                series: [{
                    data: currentBirdData.trendData, type: 'line', smooth: 0.5, symbol: 'circle', symbolSize: 8,
                    lineStyle: { width: 3, color: '#F59E0B', shadowBlur: 15, shadowColor: 'rgba(245, 158, 11, 0.2)' },
                    itemStyle: { color: '#F59E0B', borderColor: '#FFF', borderWidth: 2 },
                    areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: 'rgba(245, 158, 11, 0.1)'}, {offset: 1, color: 'transparent'}]) }
                }]
            });

            // --- B. 生存压力雷达 ---
            if (radarInstance.current) radarInstance.current.dispose();
            radarInstance.current = echarts.init(radarChartRef.current);
            radarInstance.current.setOption({
                radar: {
                    indicator: [
                        { name: '生境丧失 · HABITAT', max: 100 }, { name: '盗猎 · POACH', max: 100 },
                        { name: '气候 · CLIMATE', max: 100 }, { name: '干扰 · DISTURB', max: 100 },
                        { name: '消耗 · COST', max: 100 }
                    ],
                    center: ['50%', '50%'], radius: '60%',
                    axisName: { color: '#94A3B8', fontSize: 9, fontWeight: 'bold' },
                    splitArea: { show: false }, splitLine: { lineStyle: { color: '#F8FAFC' } },
                    axisLine: { lineStyle: { color: '#F1F5F9' } }
                },
                series: [{
                    type: 'radar', data: [{ value: currentBirdData.radarData }],
                    symbol: 'none', lineStyle: { width: 2, color: '#A0522D' },
                    areaStyle: { color: 'rgba(160, 82, 45, 0.3)' }
                }]
            });
        };

        renderCharts();
        setChartsLoading(false);
        const resize = () => { lineInstance.current?.resize(); radarInstance.current?.resize(); };
        window.addEventListener('resize', resize);
        const timer = setTimeout(resize, 200); // 🚀 确保 Grid 布局稳定后捕获高度
        return () => { window.removeEventListener('resize', resize); clearTimeout(timer); };
    }, [currentBirdData]);

    return (
        <section id="data-hub" className="py-40 bg-[#FCFBFA] relative overflow-hidden">
            {/* IP 形象装饰 - 位于左侧边缘，只露出上半身 */}
            <div className="absolute left-0 top-48 z-10 w-28 overflow-hidden pointer-events-none">
                <div className="overflow-hidden h-24">
                    <img src="/2@288x.png" alt="" className="w-full object-contain" />
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-12 relative z-10">

                {/* --- 生态哨兵：统一标题系统 (字号 6xl) --- */}
                <div className="flex flex-col lg:flex-row justify-between items-end mb-24 border-b border-gray-100 pb-12 gap-12">
                    <Observer className="max-w-2xl">
                        {/* 深色胶囊装饰条 */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="px-4 py-1.5 bg-[#1F2937] rounded-full flex items-center gap-3 shadow-lg">
                                <Activity size={14} className="text-amber-500 animate-pulse" />
                                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.2em]">Live Data Feed</span>
                            </div>
                        </div>
        
                        {/* 主标题区 */}
                        <div className="mb-10 leading-tight">
                            <h2 className="text-6xl font-serif font-black text-[#1F2937] tracking-tighter mb-2">
                                生态哨兵
                            </h2>
                            <p className="text-4xl font-serif italic text-gray-300">/ Eco-Sentinels</p>
                        </div>

                        {/* 描述文案 */}
                        <p className="text-gray-500 text-lg font-serif leading-relaxed opacity-90 border-l-4 border-amber-500/20 pl-10">
                            解密极危物种的种群波动。在这里，数据不再是冰冷的数字，而是它们生存压力的真实回响，指引我们精准守护每一片关键生境。
                        </p>
                    </Observer>

                    {/* 检索框：保持与全站一致的药丸设计 */}
                    <div className="relative w-full sm:w-80 group pointer-events-auto">
                        <input 
                            type="text"
                            placeholder="检索物种名称... SEARCH"
                            value={sentinelSearch}
                            onChange={(e) => setSentinelSearch(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-full text-sm text-[#1F2937] font-bold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all shadow-sm"
                        />
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-500 transition-colors" />
                    </div>
                </div>

                {/* --- 🚀 核心看板：Bento 矩阵布局 --- */}
                <div className="flex flex-col lg:flex-row gap-10 items-stretch">
                    
                    {/* 左侧：名录切换轨 */}
                    <div className="w-full lg:w-1/4 flex flex-col gap-4 pointer-events-auto">
                        {filteredSentinels.map(key => {
                            const bird = BIRD_DB[key];
                            const isActive = selectedTrendBird === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedTrendBird(key)}
                                    className={`relative p-8 rounded-[2.5rem] text-left transition-all duration-500 group border overflow-hidden flex flex-col gap-1 lift-hover ${
                                        isActive
                                        ? 'glass border-amber-200/50 shadow-[0_30px_60px_-15px_rgba(245,158,11,0.15)] scale-[1.02]'
                                        : 'glass border-white/20 hover:border-white/50'
                                    }`}
                                >
                                    <div className={`absolute left-0 top-1/4 bottom-1/4 w-1.5 rounded-r-full transition-all duration-500 ${isActive ? 'bg-amber-500 animate-pulse-glow' : 'bg-transparent'}`}></div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] mb-2 transition-colors duration-300 ${isActive ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-500'}`}>Sentinel Ref.</span>
                                    <div className={`text-2xl font-serif font-bold transition-colors duration-300 ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{bird.cn}</div>
                                    <div className={`text-[10px] font-bold tracking-widest uppercase italic transition-colors duration-300 ${isActive ? 'text-amber-600/60' : 'text-gray-400'}`}>{bird.en}</div>
                                </button>
                            )
                        })}
                    </div>

                    {/* 右侧：精密数据矩阵 */}
                    <div className="w-full lg:w-3/4 flex flex-col gap-10">
                        
                        {/* A. 顶层：风险仪表与生理指标 (严格对齐) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                            {/* 1. 风险指数测量仪 (5/12 宽度) */}
                            <Observer variant="fade-in-left" className="md:col-span-5 glass lift-hover p-10 rounded-[3.5rem] border border-white/20 flex flex-col justify-between h-[400px] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-[#A0522D]">
                                    <AlertTriangle size={120} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block mb-6">Survival Pressure / 风险</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-8xl font-serif font-black text-gray-900 leading-none">{riskScore}</span>
                                        <span className="text-xl font-bold text-gray-200">/ 100</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-black mb-4 tracking-widest">
                                        <span className="text-gray-400 uppercase">Risk Level / 威胁等级</span>
                                        <span className="text-[#A0522D] font-bold">{specs.threat}</span>
                                    </div>
                                    <div className="w-full h-[3px] bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-500 ease-out" style={{width: `${riskScore}%`}}></div>
                                    </div>
                                </div>
                            </Observer>

                            {/* 2. 生理指标库 (7/12 宽度) - 彻底修复拥挤问题 */}
                            <Observer variant="fade-in-right" className="md:col-span-7 glass lift-hover p-10 rounded-[3.5rem] border border-white/20 flex flex-col h-[400px] group">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-1 h-3 bg-amber-500 rounded-full animate-pulse-glow"></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Biological Specs / 指标库</span>
                                </div>

                                <div className="flex-grow flex flex-col justify-between pb-4">
                                    <div className="grid grid-cols-2 gap-x-10 gap-y-12">
                                        {[
                                            { icon: Globe, l: '迁徙行程', e: 'DISTANCE', v: specs.dist, u: 'KM', c: 'text-amber-600', bg: 'bg-amber-50' },
                                            { icon: Feather, l: '平均体重', e: 'WEIGHT', v: specs.weight, u: 'G', c: 'text-emerald-600', bg: 'bg-emerald-50' },
                                            { icon: Clock, l: '生命周期', e: 'LIFESPAN', v: specs.lifespan, u: 'YRS', c: 'text-blue-600', bg: 'bg-blue-50' },
                                            { icon: Zap, l: '巡航时速', e: 'SPEED', v: specs.speed, u: 'KM/H', c: 'text-rose-600', bg: 'bg-rose-50' }
                                        ].map((s, i) => (
                                            <div key={i} className="flex items-start gap-4 group/item">
                                                <div className={`w-11 h-11 rounded-2xl ${s.bg} ${s.c} flex items-center justify-center shrink-0 transition-transform duration-500 group-hover/item:scale-110`}>
                                                    <s.icon size={20} strokeWidth={1.5} />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-bold text-gray-800">{s.l}</span>
                                                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{s.e}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-2xl font-serif font-bold text-gray-900 leading-none">{s.v}</span>
                                                        <span className="text-[9px] font-bold text-gray-300 uppercase">{s.u}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-gray-50 flex justify-between items-center opacity-40">
                                     <span className="text-[8px] font-mono font-black uppercase tracking-[0.2em]">Scientific Data Reference 2025</span>
                                     <Eye size={12} strokeWidth={2} />
                                </div>
                            </Observer>
                        </div>

                        {/* B. 底层：趋势与雷达 (并排呈现) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* 3. 25年监测历史 */}
                            <Observer className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm h-[420px] relative overflow-hidden">
                                <span className="absolute top-10 left-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Population Dynamics / 种群趋势</span>
                                {chartsLoading ? (
                                    <div className="w-full h-full pt-8 flex flex-col justify-end gap-4">
                                        <div className="h-3 bg-gray-100 rounded-full skeleton-shimmer"></div>
                                        <div className="h-3 bg-gray-100 rounded-full skeleton-shimmer delay-100"></div>
                                        <div className="h-3 bg-gray-100 rounded-full skeleton-shimmer delay-200"></div>
                                        <div className="h-24 bg-amber-50 rounded-2xl mt-4 skeleton-shimmer delay-300"></div>
                                    </div>
                                ) : (
                                    <div ref={lineChartRef} className="w-full h-full pt-8"></div>
                                )}
                            </Observer>

                            {/* 4. 多维威胁矩阵 */}
                            <Observer className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm h-[420px] relative overflow-hidden">
                                <span className="absolute top-10 left-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Stress Matrix / 威胁矩阵</span>
                                {chartsLoading ? (
                                    <div className="w-full h-full pt-4 flex items-center justify-center">
                                        <div className="w-48 h-48 rounded-full border-8 border-gray-100 flex items-center justify-center skeleton-shimmer">
                                            <div className="w-32 h-32 rounded-full border-4 border-amber-100"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div ref={radarChartRef} className="w-full h-full pt-4"></div>
                                )}
                            </Observer>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

// ==========================================
// StorySection
// ==========================================

const StorySection = () => {
    const [activeBirdKey, setActiveBirdKey] = useState('spoon_sandpiper');
    const [activeChapterIndex, setActiveChapterIndex] = useState(0);
    const containerRef = useRef(null);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    
    const activeBird = MIGRATION_STORIES[activeBirdKey] || MIGRATION_STORIES['spoon_sandpiper'];
    const activeChapter = activeBird.chapters[activeChapterIndex] || activeBird.chapters[0];

    // 精致双语库
    const getBilingualLoc = (loc) => {
        const dict = {
            'Chukotka, Russia': ['俄罗斯 · 楚科奇', 'CHUKOTKA, RUSSIA'],
            'Yellow Sea / Bohai Bay': ['黄渤海湾', 'YELLOW SEA / BOHAI BAY'],
            'Tiaozini, Jiangsu': ['江苏 · 条子泥', 'TIAOZINI, JIANGSU'],
            'Gulf of Thailand': ['泰国湾', 'GULF OF THAILAND'],
            'Jiushan Islands, Zhejiang': ['浙江 · 韭山列岛', 'JIUSHAN ISLANDS'],
            'Fujian Coast': ['福建沿海', 'FUJIAN COAST'],
            'South China Sea': ['中国南海', 'SOUTH CHINA SEA'],
            'Philippines / Indonesia': ['菲律宾 / 印尼', 'INDONESIA'],
            'Yakutia, Russia': ['俄罗斯 · 雅库特', 'YAKUTIA, RUSSIA'],
            'Momoge, Jilin': ['吉林 · 莫莫格', 'MOMOGE, JILIN'],
            'Yangtze River Basin': ['长江流域', 'YANGTZE BASIN'],
            'Poyang Lake, Jiangxi': ['江西 · 鄱阳湖', 'POYANG LAKE'],
            'Hengshui Lake, Hebei': ['河北 · 衡水湖', 'HENGSHUI LAKE'],
            'North China Plain': ['华北平原', 'NORTH CHINA PLAIN'],
            'Hubei / Anhui': ['湖北 / 安徽', 'CENTRAL CHINA'],
            'Middle-Lower Yangtze': ['长江中下游', 'LOWER YANGTZE'],
            'Siberia / Mongolia': ['西伯利亚 / 蒙古', 'MONGOLIA'],
            'Northeast China': ['中国东北', 'NE CHINA'],
            'Yangtze / South China': ['长江 / 华南', 'SOUTH CHINA'],
            'Guangdong / SE Asia': ['广东 / 东南亚', 'SE ASIA'],
            'Amur Region / Heilongjiang': ['黑龙江 · 阿穆尔', 'AMUR REGION'],
            'Liaoning Coast': ['辽宁沿海', 'LIAONING COAST'],
            'Yellow River Delta': ['黄河三角洲', 'YRD RESERVE'],
            'Luzon, Philippines': ['菲律宾 · 吕宋岛', 'LUZON ISLAND']
        };
        return dict[loc] || [loc, ''];
    };

    // ECharts 地图：大幅提升对比度（懒加载）
    useEffect(() => {
        if (!chartRef.current) return;

        const initChart = async () => {
            if (chartInstance.current) chartInstance.current.dispose();
            const echarts = await loadEcharts();
            chartInstance.current = echarts.init(chartRef.current);

            await ensureWorldMapRegistered();
            if (!chartInstance.current) return;
            chartInstance.current.setOption({
                backgroundColor: '#FCFBFA',
                geo: {
                    map: WORLD_MAP_NAME, roam: false, silent: true,
                    center: [120, 30],
                    zoom: 4,
                    itemStyle: {
                        areaColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderWidth: 1
                    }
                }
            });

            requestAnimationFrame(() => {
                if (chartInstance.current) updateMigrationView();
            });
        };

        initChart().catch(err => {
            console.warn('❌ StorySection 世界地图加载失败:', err);
        });

        const resize = () => chartInstance.current?.resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [activeBirdKey]);

    const updateMigrationView = () => {
        if (!chartInstance.current) return;

        const allPoints = activeBird.chapters.map((ch, idx) => ({
            name: ch.location,
            value: ch.coords,
            itemStyle: {
                color: idx <= activeChapterIndex ? '#F59E0B' : '#E2E8F0',
                opacity: idx <= activeChapterIndex ? 1 : 0.4
            },
            symbolSize: idx === activeChapterIndex ? 10 : 4
        }));

        const currentPath = activeBird.chapters.slice(0, activeChapterIndex + 1).map(c => c.coords);

        chartInstance.current.setOption({
            geo: { 
                center: activeChapter.coords, 
                zoom: activeChapter.zoom,
                animationDurationUpdate: 3500,
                animationEasingUpdate: 'cubicInOut' 
            },
            series: [
                {
                    type: 'scatter', coordinateSystem: 'geo',
                    data: allPoints, zlevel: 1
                },
                { 
                    type: 'lines', coordinateSystem: 'geo', 
                    data: currentPath.length > 1 ? [{ coords: currentPath }] : [], 
                    polyline: true,
                    lineStyle: { color: '#F59E0B', width: 2, opacity: 0.6, curveness: 0.2 },
                    zlevel: 2,
                    animationDurationUpdate: 3000
                },
                { 
                    type: 'effectScatter', coordinateSystem: 'geo', 
                    data: [{ value: activeChapter.coords }], 
                    rippleEffect: { scale: 6, brushType: 'stroke', color: '#10B981', period: 4 }, 
                    symbolSize: 10, itemStyle: { color: '#10B981' }, zlevel: 3 
                }
            ]
        });
    };

    useEffect(() => { updateMigrationView(); }, [activeChapterIndex]);

    useEffect(() => {
        const handleScroll = () => {
            const chapters = containerRef.current?.querySelectorAll('.story-chapter');
            const trigger = window.innerHeight * 0.4;
            chapters?.forEach((ch, i) => {
                const rect = ch.getBoundingClientRect();
                if (rect.top < trigger && rect.bottom > trigger) setActiveChapterIndex(i);
            });
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeBirdKey]);

    const [locCn, locEn] = getBilingualLoc(activeChapter.location);

    return (
        <section id="story" className="relative bg-[#FCFBFA] min-h-[500vh]" ref={containerRef}>
            
            {/* 1. 全局视口锁定层 */}
            <div className="sticky top-0 w-full h-screen z-0 overflow-hidden pointer-events-none">
                <div ref={chartRef} className="absolute inset-0 w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FCFBFA] via-[#FCFBFA]/50 to-transparent w-full md:w-[60%]"></div>

                {/* 🚀 物理锁定导航针 - 极致幼细 */}
                <div className="absolute left-8 top-0 h-full flex items-center z-[100] pointer-events-auto">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-[1px] h-20 bg-gradient-to-t from-[#F59E0B]/50 to-transparent"></div>
                        {Object.keys(MIGRATION_STORIES).map((key) => {
                            const bird = MIGRATION_STORIES[key];
                            const isActive = activeBirdKey === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setActiveBirdKey(key);
                                        setActiveChapterIndex(0);
                                        if (containerRef.current) {
                                            window.scrollTo({ top: containerRef.current.offsetTop, behavior: 'smooth' });
                                        }
                                    }}
                                    className="group relative flex items-center justify-center h-6 w-6"
                                >
                                    <div className={`transition-all duration-500 rounded-full 
                                        ${isActive ? 'w-2 h-2 bg-[#1F2937] ring-4 ring-amber-500/20' : 'w-1 h-1 bg-gray-300 group-hover:bg-[#F59E0B]'}`} 
                                    />
                                    <div className="absolute left-8 px-3 py-1 bg-[#1F2937] text-white text-[10px] font-bold tracking-widest uppercase rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-x-2 group-hover:translate-x-0">
                                        {bird.name}
                                    </div>
                                </button>
                            );
                        })}
                        <div className="w-[1px] h-20 bg-gradient-to-b from-[#F59E0B]/50 to-transparent"></div>
                    </div>
                </div>

                {/* 🚀 航程志 - 超薄玻璃 HUD */}
                <div className="absolute bottom-10 right-10 z-50 hidden lg:block pointer-events-auto">
                    <div className="glass-dark glow-amber p-8 rounded-[2rem] w-[20rem] transition-all duration-500">
                        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                            <span className="text-lg font-serif font-black tracking-tight text-white">航程志</span>
                            <span className="text-[9px] font-bold text-amber-400 tracking-[0.2em] uppercase">LOG REV. 2025</span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Season</span>
                                <span className="text-sm font-bold text-white">{activeChapter.monthCn}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Weather</span>
                                <span className="text-sm font-bold text-emerald-400">晴朗 · CLEAR</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Location</span>
                                <p className="text-lg font-serif font-bold text-white leading-none mb-1">{locCn}</p>
                                <p className="text-[9px] font-medium text-white/40 tracking-tighter uppercase">{locEn}</p>
                            </div>
                            <div className="col-span-2 pt-2">
                                <div className="flex justify-between items-end mb-1.5 text-[8px] font-bold text-white/40 uppercase">
                                    <span>Progress</span>
                                    <span className="text-amber-400">{Math.round(((activeChapterIndex + 1) / activeBird.chapters.length) * 100)}%</span>
                                </div>
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 ease-out rounded-full" style={{ width: `${((activeChapterIndex + 1) / activeBird.chapters.length) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. 叙事文本层 - 只有这里的文字在动 */}
            <div className="relative z-10 pointer-events-none">
                <div className="max-w-7xl mx-auto px-16 grid grid-cols-12 gap-12">
                    <div className="col-start-3 col-span-11 md:col-start-4 md:col-span-6 lg:col-span-5 pointer-events-auto pt-[25vh]">
                        <div className="space-y-[45vh] pb-[60vh]">
                            {activeBird.chapters.map((chapter, index) => {
                                 const isActive = activeChapterIndex === index;
                                 const [cCn, cEn] = getBilingualLoc(chapter.location);
                                 return (
                                    <div key={chapter.id} className={`story-chapter transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 blur-sm'}`}>
                                        <div className="max-w-[400px]">
                                            <div className="flex items-center gap-4 mb-10">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-amber-600">第 {['一','二','三','四','五'][index]} 章节</span>
                                                    <span className="text-[9px] font-bold text-gray-300 tracking-[0.4em] uppercase mt-0.5">SECTION 0{index + 1}</span>
                                                </div>
                                                <div className="h-px flex-grow bg-gray-100"></div>
                                            </div>
                                            
                                            <div className="mb-12">
                                                <h3 className="text-6xl font-serif font-black text-gray-900 mb-6 leading-[1.1] tracking-tight" style={{ textWrap: 'balance' }}>
                                                    {chapter.title.split('|')[0]}
                                                </h3>
                                                <p className="text-xl text-gray-400 font-serif italic opacity-40">{chapter.title.split('|')[1]}</p>
                                            </div>
                                            
                                            <p className="text-gray-700 leading-[2.1] text-[17px] text-justify font-sans opacity-90 border-l-[1px] border-amber-500/20 pl-10 mb-14">
                                                {chapter.text}
                                            </p>

                                            <div className="glass glow-amber-hover inline-flex flex-col px-10 py-6 rounded-[2.5rem] transition-all duration-500">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow"></div>
                                                    <span className="text-xl font-serif font-bold text-gray-900 leading-none">{cCn}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-400 tracking-[0.25em] uppercase ml-5 italic">{cEn}</span>
                                            </div>
                                        </div>
                                    </div>
                                 );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ==========================================
// Discovery Lab
// ==========================================

const DiscoveryHub = ({ seenBirds }) => {
    return (
        <section id="hub" className="py-48 bg-[#FCFBFA] relative overflow-hidden">
            {/* 背景装饰：实验室坐标网格 */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
                 style={{ backgroundImage: `linear-gradient(#4A4238 1px, transparent 1px), linear-gradient(90deg, #4A4238 1px, transparent 1px)`, backgroundSize: '80px 80px' }}></div>

            <div className="max-w-[1440px] mx-auto px-12 relative z-10">
                
                {/* --- 1. 顶置观测看板 (双语大标题) --- */}
                <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12 border-b border-gray-100 pb-12">
                    <Observer className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="px-4 py-1.5 bg-[#1F2937] rounded-full flex items-center gap-3 shadow-lg">
                                <Radar size={14} className="text-amber-500 animate-pulse" />
                                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.2em]">Lab Control Center</span>
                            </div>
                        </div>
                        
                        {/* 🚀 修复：双语大标题 */}
                        <div className="mb-10">
                            <h2 className="text-6xl font-serif font-black text-[#1F2937] tracking-tighter mb-2">
                                见证者实验室
                            </h2>
                            <p className="text-4xl font-serif italic text-gray-300 leading-none">/ Observer Laboratory</p>
                        </div>

                        <p className="text-gray-500 text-lg font-serif leading-relaxed opacity-90 border-l-4 border-amber-500/20 pl-10">
                            这里是你的私人观测站。通过声音信号辨识生命，在时间长河中观察土地的变迁，并记录下你作为见证者与这些脆弱生命的每一次交集。
                            <span className="block text-xs font-bold text-gray-300 mt-4 uppercase tracking-widest italic">
                                sensing the pulse of migration, witnessing the changing earth.
                            </span>
                        </p>
                    </Observer>

                    {/* 观测记录统计看板 */}
                    <Observer variant="fade-in-right" className="glass lift-hover p-12 rounded-[3.5rem] border border-white/20 flex flex-col min-w-[420px] relative overflow-hidden group">
                         <div className="flex justify-between items-center mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner animate-pulse-glow">
                                <Award size={32} />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Rank / 观测等级</span>
                                <span className="text-sm font-bold text-gray-700 bg-white/60 px-3 py-1 rounded-md border border-white/40">首席观测员 / LEAD OBSERVER</span>
                            </div>
                        </div>
                        <div className="flex items-end gap-3 mb-8">
                            <span className="text-8xl font-serif font-black text-gray-900 leading-none">{seenBirds.size}</span>
                            <div className="flex flex-col mb-1">
                                <span className="text-2xl font-bold text-gray-300 italic">/ {Object.keys(BIRD_DB).length}</span>
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">Verified Signals</span>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-600 transition-all duration-500 ease-out rounded-full animate-pulse-glow"
                                 style={{ width: `${(seenBirds.size / Object.keys(BIRD_DB).length) * 100}%` }}></div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Archive Completion Index: {Math.round((seenBirds.size / Object.keys(BIRD_DB).length) * 100)}%</p>
                    </Observer>
                </div>

                {/* --- 2. 纵向堆叠工作站 --- */}
                <div className="space-y-48">
                    
                    {/* Station 01: 声学站 (双语标题修复) */}
                    <div className="relative">
                         <div className="flex items-center gap-6 mb-12">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-2xl shadow-amber-500/20">
                                <Volume2 size={24} />
                            </div>
                            <div className="h-px flex-grow bg-gradient-to-r from-gray-200 to-transparent"></div>
                            <div className="text-right">
                                {/* 🚀 修复：双语小标题 */}
                                <h3 className="text-2xl font-serif font-black text-gray-900">声学信号实验室</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Station 01 / Acoustic Signal Lab</p>
                            </div>
                        </div>
                        <AcousticStationLab />
                    </div>

                    {/* Station 02: 地理透镜 (双语标题修复) */}
                    <div className="relative">
                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                                <MapPin size={24} />
                            </div>
                            <div className="h-px flex-grow bg-gradient-to-r from-gray-200 to-transparent"></div>
                            <div className="text-right">
                                {/* 🚀 修复：双语小标题 */}
                                <h3 className="text-2xl font-serif font-black text-gray-900">地理时空透镜</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Station 02 / Temporal Habitat Lens</p>
                            </div>
                        </div>
                        <TemporalLensLab />
                    </div>
                </div>
            </div>
        </section>
    );
};

// ==========================================
// 内部组件：Station 01
// ==========================================
const AcousticStationLab = () => {
    const birdsWithSound = useMemo(() => Object.values(BIRD_DB).filter(b => b.sound), []);
    const [currentBird, setCurrentBird] = useState(null);
    const [options, setOptions] = useState([]);
    const [gameState, setGameState] = useState('playing'); 
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const audioRef = useRef(null);

    const startRound = () => {
        const target = birdsWithSound[Math.floor(Math.random() * birdsWithSound.length)];
        const others = birdsWithSound.filter(b => b.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 2);
        setOptions([target, ...others].sort(() => 0.5 - Math.random()));
        setCurrentBird(target);
        setGameState('playing');
        setIsAudioPlaying(false);
    };

    useEffect(() => { startRound(); }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            <Observer variant="fade-in-left" className="lg:col-span-7 glass lift-hover rounded-[4rem] border border-white/20 p-16 flex flex-col items-center justify-center relative min-h-[550px] overflow-hidden group">
                <div className="relative z-10">
                    <button
                        onClick={() => {
                            if (isAudioPlaying) audioRef.current?.pause();
                            else audioRef.current?.play();
                            setIsAudioPlaying(!isAudioPlaying);
                        }}
                        className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isAudioPlaying ? 'bg-amber-500 scale-110 animate-pulse-glow' : 'bg-[#1F2937] hover:scale-105 glow-amber'}`}
                    >
                        {isAudioPlaying ? <Pause size={48} className="text-white" /> : <Play size={48} className="text-white ml-2" />}
                    </button>
                    <audio ref={audioRef} src={currentBird?.sound} onEnded={() => setIsAudioPlaying(false)} />
                </div>
                <div className="mt-16 w-full max-w-xl">
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-4 uppercase tracking-[0.2em]">
                        <span>Capturing Waveform... / 信号采集</span>
                        <span>Gain: +2.0dB</span>
                    </div>
                    <div className="flex gap-1.5 h-16 items-center">
                        {[...Array(40)].map((_, i) => (
                            <div key={i} className={`flex-grow rounded-full transition-all duration-300 ${isAudioPlaying ? 'bg-amber-500' : 'bg-white/40 h-1'}`}
                                 style={{ height: isAudioPlaying ? `${Math.random() * 100}%` : '4px' }}></div>
                        ))}
                    </div>
                </div>
            </Observer>
            <Observer variant="fade-in-right" className="lg:col-span-5 flex flex-col justify-center gap-6">
                <div className="mb-4">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Interpretation / 信号解译</span>
                    <h4 className="text-2xl font-serif font-black text-gray-900 mt-2">辨识采集到的声学特征：</h4>
                </div>
                {options.map((bird) => (
                    <button
                        key={bird.id}
                        disabled={gameState === 'revealed'}
                        onClick={() => { setGameState('revealed'); setIsAudioPlaying(false); audioRef.current?.pause(); }}
                        className={`p-8 rounded-[2.5rem] border-2 text-left flex justify-between items-center transition-all duration-500 lift-hover ${
                            gameState === 'revealed'
                            ? (bird.id === currentBird?.id ? 'glass border-emerald-400 text-white shadow-xl' : 'bg-gray-100 border-transparent opacity-40')
                            : 'glass border-white/40 hover:border-amber-400/50 hover:translate-x-4'
                        }`}
                    >
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight">{bird.cn}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">{bird.en}</span>
                        </div>
                    </button>
                ))}
                {gameState === 'revealed' && (
                    <button onClick={startRound} className="mt-6 w-full py-5 glass-dark text-white rounded-[2rem] font-bold text-sm tracking-widest hover:bg-amber-600 transition-colors animate-reveal uppercase">
                        Next Signal / 下一段信号
                    </button>
                )}
            </Observer>
        </div>
    );
};

// ==========================================
// 内部组件：Station 02 (修复图片链接)
// ==========================================
const TemporalLensLab = () => {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);

    const handleMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        setSliderPos(Math.max(0, Math.min(100, x)));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 relative h-[680px] rounded-[4.5rem] overflow-hidden shadow-2xl border-[12px] border-white group cursor-none bg-gray-900"
                 ref={containerRef} onMouseMove={handleMove} onMouseEnter={() => setIsScanning(true)} onMouseLeave={() => setIsScanning(false)}>
                <div className="absolute inset-0">
                    {/* 修复：更换为稳定的湿地图片链接 */}
                    <img src="https://images.unsplash.com/photo-1444464666117-26f26cde83e7?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-80" alt="Current State" />
                    <div className="absolute top-12 right-12 bg-black/40 backdrop-blur-xl px-6 py-2.5 rounded-2xl text-white text-[10px] font-black tracking-widest border border-white/10 uppercase">Present Status: 2025 // Fragmentation</div>
                </div>
                <div className="absolute inset-0 z-10 border-r border-white/30" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                    <img src="https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="Past State" />
                    <div className="absolute top-12 left-12 bg-emerald-600/60 backdrop-blur-xl px-6 py-2.5 rounded-2xl text-white text-[10px] font-black tracking-widest border border-white/10 uppercase">Archive Data: 1971 // Pristine Wetland</div>
                </div>
                <div className="absolute top-0 bottom-0 z-40 w-1 bg-white flex items-center justify-center pointer-events-none" style={{ left: `${sliderPos}%` }}>
                    <div className="w-20 h-20 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center gap-1 group-hover:scale-110 transition-transform">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div>
                        <span className="text-[8px] font-mono font-black text-gray-900 uppercase">Scanning</span>
                    </div>
                </div>
                {!isScanning && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300 pointer-events-none">
                         <div className="px-8 py-4 bg-white rounded-full flex items-center gap-4 shadow-2xl">
                             <MousePointer2 size={20} className="text-amber-500" />
                             <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Move Mouse to Scan</span>
                         </div>
                    </div>
                )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm flex-grow relative overflow-hidden group/card">
                     <Activity size={80} className="absolute -top-4 -right-4 text-rose-500/5 rotate-12 group-hover/card:scale-125 transition-transform duration-300" />
                     <div className="mb-10">
                        <h4 className="text-xl font-serif font-black text-gray-900 flex items-center gap-3">
                            <Eye size={24} className="text-amber-500" /> 见证者的观察报告
                        </h4>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-9 mt-1">/ Observer's Field Report</p>
                    </div>
                     <div className="space-y-10">
                        <div className="group/stat">
                            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Habitat Loss / 栖息地消逝率</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-7xl font-serif font-black text-rose-500 leading-none group-hover/stat:scale-105 transition-transform">62.4</span>
                                <span className="text-2xl font-bold text-gray-300">%</span>
                            </div>
                        </div>
                        <div className="h-px bg-gray-100"></div>
                        <div className="space-y-4">
                            <p className="text-[15px] text-gray-600 leading-[1.8] font-serif text-justify opacity-90">
                                通过透镜，我们直观地看到了生命驿站的消逝。曾经连绵的湿地被切割成"生态孤岛"，这种破碎化使得候鸟在万里迁徙中越来越难找到安全的落脚点。
                            </p>
                            <p className="text-[10px] text-gray-400 font-serif italic leading-relaxed">Through the lens, we witness the fading of life's vital stops. Fragmented into "ecological islands," these wetlands no longer offer the continuous sanctuary migratory birds desperately need.</p>
                        </div>
                        <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100">
                             <div className="flex items-center gap-3 mb-4 text-amber-600">
                                 <Heart size={18} />
                                 <span className="text-[11px] font-black uppercase tracking-widest">Action / 你的守护</span>
                             </div>
                             <div className="space-y-4">
                                 <p className="text-[13px] font-bold text-[#4A4238] leading-relaxed">记录即是守护。分享这一组数据，让更多人感知候鸟的困境；加入观测志愿者，为科学研究提供宝贵的民间数据支持。</p>
                                 <p className="text-[9px] font-medium text-amber-700/60 leading-tight uppercase tracking-tighter">To witness is to protect. Share this data to amplify their call, join our volunteer network, and provide vital citizen-science data for their survival.</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// Timeline Archive (修复：移出 Modal 渲染)
// ==========================================

const TimelineSection = ({ onSelectEvent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');

    const CATEGORIES = [
        { cn: '全部', en: 'ALL' },
        { cn: '政策', en: 'POLICY' },
        { cn: '行动', en: 'ACTION' },
        { cn: '遗产', en: 'HERITAGE' },
        { cn: '国际', en: 'GLOBAL' }
    ];

    const filteredEvents = useMemo(() => {
        return TIMELINE_DATA.filter(item => {
            const matchesSearch = item.title.includes(searchTerm) || item.year.includes(searchTerm);
            const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory]);

    return (
        <section id="timeline" className="py-56 bg-white relative overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-12 relative z-10">
                
                {/* --- 标题与检索控制台 --- */}
                <div className="flex flex-col lg:flex-row justify-between items-end mb-32 gap-12 border-b border-gray-100 pb-16">
                    <Observer className="max-w-2xl">
                        {/* 深色胶囊装饰条 */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="px-4 py-1.5 bg-[#1F2937] rounded-full flex items-center gap-3 shadow-lg">
                                <Shield size={14} className="text-amber-500 animate-pulse" />
                                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.2em]">Conservation Legacy</span>
                            </div>
                        </div>
        
                        {/* 主标题区 */}
                        <div className="mb-10 leading-tight">
                            <h2 className="text-6xl font-serif font-black text-[#1F2937] tracking-tighter mb-2">
                                保护历程
                            </h2>
                            <p className="text-4xl font-serif italic text-gray-300">/ Legacy Archive</p>
                        </div>

                        {/* 描述文案（主体为大众） */}
                        <p className="text-gray-500 text-lg font-serif leading-relaxed opacity-90 border-l-4 border-amber-500/20 pl-10">
                            见证半个世纪的生存接力。每一条记录不仅是时间坐标，更是我们作为见证者共同挽留天空律动的真实写照。
                        </p>
                    </Observer>

                    {/* 检索控制台 (保持原有搜索与筛选功能) */}
                        <div className="flex flex-col gap-8 w-full lg:w-auto items-end">
                            <div className="relative w-full sm:w-[400px] group">
                                <input 
                                    type="text"
                                    placeholder="检索历史档案记录... SEARCH ARCHIVE"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-[2rem] text-sm text-[#1F2937] font-bold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all shadow-inner"
                                />
                                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-500 transition-colors" />
                            </div>
        
                            <div className="flex bg-gray-50 p-2 rounded-2xl border border-gray-100 shadow-sm">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.en}
                                        onClick={() => setActiveCategory(cat.cn === '全部' ? 'ALL' : cat.cn)}
                                        className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all ${
                                            (activeCategory === cat.cn || (cat.cn === '全部' && activeCategory === 'ALL'))
                                            ? 'bg-white text-amber-600 shadow-md scale-105' 
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        {cat.cn}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                {/* --- 动态时间轴列表 --- */}
                <div className="max-w-6xl mx-auto relative">
                    {/* 中轴线 */}
                    <div className="absolute left-10 md:left-1/2 top-0 bottom-0 w-px bg-gray-100 -translate-x-1/2"></div>

                    {filteredEvents.length > 0 ? (
                        <div className="space-y-40">
                            {filteredEvents.map((item, index) => (
                                <Observer key={item.year} delay={index * 50}>
                                    <div 
                                        onClick={() => onSelectEvent(item)}
                                        className={`relative flex flex-col md:flex-row items-start cursor-pointer group ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                                    >
                                        {/* 时间原点图标 */}
                                        <div className="absolute left-10 md:left-1/2 -translate-x-1/2 mt-2 z-10">
                                            <div className="w-14 h-14 rounded-full glass border-2 border-white/20 shadow-lg flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white group-hover:scale-125 transition-all duration-500">
                                                <Icon name={item.icon} size={20} strokeWidth={2.5} />
                                            </div>
                                        </div>

                                        <div className="hidden md:block md:w-1/2"></div>
                                        <div className={`w-full md:w-1/2 pl-28 md:pl-0 ${index % 2 === 0 ? 'md:pr-28 md:text-right' : 'md:pl-28'}`}>
                                            <div className="glass lift-hover p-14 rounded-[4rem] border border-white/40 hover:border-amber-200/50 transition-all duration-500 relative overflow-hidden group/card">
                                                {/* 年份巨型水印 */}
                                                <span className={`absolute -top-10 font-serif font-black text-gray-100 text-[10rem] -z-10 select-none transition-colors group-hover/card:text-amber-100/30 ${index % 2 === 0 ? '-right-10' : '-left-10'}`}>
                                                    {item.year}
                                                </span>

                                                <div className={`flex items-center gap-5 mb-8 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                                                    <span className="text-4xl font-serif font-black text-amber-500">{item.year}</span>
                                                    <span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span>
                                                    <span className="text-[13px] font-black text-gray-400 uppercase tracking-[0.3em]">{item.categoryEn}</span>
                                                </div>

                                                <h3 className="text-3xl font-bold text-gray-900 mb-8 group-hover/card:text-amber-600 transition-colors duration-300 leading-tight">
                                                    {item.title}
                                                </h3>
                                                <p className="text-lg text-gray-500 leading-relaxed font-serif opacity-80 mb-10 line-clamp-2">
                                                    {item.desc}
                                                </p>

                                                <div className={`flex items-center gap-4 text-xs font-black text-amber-500 uppercase tracking-[0.3em] opacity-0 group-hover/card:opacity-100 translate-y-4 group-hover/card:translate-y-0 transition-all duration-300 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                                                    <span>Open Archival File / 查阅完整档案</span>
                                                    <ArrowRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Observer>
                            ))}
                        </div>
                    ) : (
                        /* 空状态 */
                        <div className="py-60 text-center flex flex-col items-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-100 mb-8 border border-gray-100">
                                <Search size={40} strokeWidth={1} />
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-gray-400">未在档案库中检索到相关历史记录</h4>
                            <p className="text-gray-300 mt-4 text-sm font-mono uppercase tracking-widest italic">No matching record found in conservation archive</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

// ==========================================
// SpeciesGallery
// ==========================================

const SpeciesGallery = ({ onSelectBird }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredBirds = useMemo(() => {
        return Object.values(BIRD_DB).filter(bird => {
            const matchesSearch = 
                bird.cn.includes(searchTerm) || 
                bird.en.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = 
                filterStatus === 'ALL' || bird.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, filterStatus]);

    return (
        <section id="species" className="py-40 bg-[#FCFBFA] relative overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-12 relative z-10">
                
                {/* --- 红色名录：统一标题系统 (字号 6xl) --- */}
                <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12 border-b border-gray-100 pb-12">
                    <Observer className="max-w-2xl">
                        {/* 深色胶囊装饰条 */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="px-4 py-1.5 bg-[#1F2937] rounded-full flex items-center gap-3 shadow-lg">
                                <Bird size={14} className="text-amber-500 animate-pulse" />
                                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.2em]">Red List Archive</span>
                            </div>
                        </div>
        
                        {/* 主标题区 */}
                        <div className="mb-10 leading-tight">
                            <h2 className="text-6xl font-serif font-black text-[#1F2937] tracking-tighter mb-2">
                                红色名录
                            </h2>
                            <p className="text-4xl font-serif italic text-gray-300">/ Lost Colors</p>
                        </div>

                        {/* 描述文案 */}
                        <p className="text-gray-500 text-lg font-serif leading-relaxed opacity-90 border-l-4 border-amber-500/20 pl-10">
                            记录迁飞通道上最脆弱的生命。每一个名字的背后，都是一场跨越半个地球的生存接力，是关于意志与希望的无声史诗。
                        </p>
                    </Observer>

                    {/* 检索交互区：保持在右侧对齐 */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 pointer-events-auto w-full lg:w-auto">
        
                        {/* 搜索框 */}
                        <div className="relative w-full sm:w-80 group">
                            <input 
                                type="text"
                                placeholder="检索物种名称... SEARCH"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-full text-sm text-[#1F2937] font-bold focus:ring-4 focus:ring-amber-500/10 outline-none transition-all shadow-sm"
                            />
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-500 transition-colors" />
                        </div>

                        {/* 状态筛选药丸 */}
                        <div className="flex bg-gray-100/60 p-1.5 rounded-full border border-gray-200/50 backdrop-blur-xl">
                            {[
                                { cn: '全部', en: 'ALL', v: 'ALL' },
                                { cn: '极危', en: 'CR', v: 'CR' },
                                { cn: '濒危', en: 'EN', v: 'EN' }
                            ].map((s) => {
                                const isActive = filterStatus === s.v;
                                return (
                                    <button
                                        key={s.v}
                                        onClick={() => setFilterStatus(s.v)}
                                        className={`flex flex-col items-center px-8 py-2.5 rounded-full transition-all duration-500 ${
                                            isActive 
                                            ? 'bg-[#1F2937] text-white shadow-xl scale-105' 
                                            : 'text-[#1F2937]/50 hover:text-[#1F2937]'
                                        }`}
                                    >
                                        <span className="text-[11px] font-black leading-none mb-1">{s.cn}</span>
                                        <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">{s.en}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- 🚀 画廊网格：保持极致精致的卡片 --- */}
                {filteredBirds.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                        {filteredBirds.map((bird, i) => {
                            const isCR = bird.status === 'CR';
                            return (
                                <Observer key={bird.id} delay={i * 50} variant="fade-in-scale">
                                    <div
                                        onClick={() => onSelectBird(bird.id)}
                                        className="glass lift-hover rounded-[3.5rem] border border-white/40 overflow-hidden transition-all duration-500 cursor-pointer group"
                                    >
                                        <div className="relative aspect-[11/9] overflow-hidden bg-gray-100">
                                            <LazyImage
                                                src={bird.img}
                                                alt={bird.cn}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                skeletonClassName="rounded-none"
                                            />
                                            {/* 琥珀色动态徽章 */}
                                            <div className={`absolute top-6 right-6 px-5 py-2 rounded-full backdrop-blur-xl text-[10px] font-black tracking-[0.1em] text-white shadow-xl border border-white/20 ${
                                                isCR ? 'bg-[#A0522D]/80' : 'bg-[#D9A22E]/80'
                                            }`}>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                                    {isCR ? '极危 · CR' : '濒危 · EN'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-12">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex flex-col">
                                                    <h3 className="text-3xl font-serif font-black text-gray-900 mb-1.5 group-hover:text-amber-500 transition-colors duration-300">
                                                        {bird.cn}
                                                    </h3>
                                                    <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase italic leading-none">
                                                        {bird.en}
                                                    </span>
                                                </div>
                                                <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-gray-300 group-hover:text-amber-500 transition-all duration-500">
                                                    <ArrowRight size={18} className="-rotate-45 group-hover:rotate-0 transition-transform" />
                                                </div>
                                            </div>

                                            <p className="text-gray-500 text-base font-serif leading-[1.8] opacity-80 line-clamp-2 mb-10 max-w-[90%]">
                                                {bird.descCn}
                                            </p>

                                            <div className="flex items-center gap-8 pt-8 border-t border-gray-100">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">种群估算 · POPULATION</span>
                                                    <span className="text-sm font-bold text-gray-700 font-serif">{bird.pop ? bird.pop.toLocaleString() : '未知'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">主要分布 · RANGE</span>
                                                    <span className="text-sm font-bold text-gray-700 font-serif">{bird.range === 'Global' ? '全球性分布' : '东亚迁飞区'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Observer>
                            );
                        })}
                    </div>
                ) : (
                    /* 4. 极致精致的空状态 */
                    <div className="py-40 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-8 border border-gray-100">
                            <Search size={32} strokeWidth={1} />
                        </div>
                        <h4 className="text-2xl font-serif font-bold text-gray-400">未检索到相关物种</h4>
                        <p className="text-gray-300 mt-3 text-base font-serif italic uppercase tracking-widest">No matching specimen found</p>
                        <button 
                            onClick={() => {setSearchTerm(''); setFilterStatus('ALL');}}
                            className="mt-12 px-10 py-3 bg-[#1F2937] text-white text-[10px] font-black tracking-[0.3em] rounded-full hover:bg-amber-600 transition-all shadow-xl uppercase"
                        >
                            重置检索 · RESET
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

// ==========================================
// 新增：呼吁行动板块 (Call to Action)
// ==========================================
const FinalActionSection = ({ onJoin }) => {
    const birdOffset = useParallaxBackground(0.15);
    const featherOffset = useParallaxBackground(0.25);

    return (
        <section className="relative py-32 bg-[#1F2937] overflow-hidden">
            {/* 动态背景纹理 */}
            <div className="absolute inset-0 opacity-10"
                 style={{ backgroundImage: `radial-gradient(#F9F8F4 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
            </div>

            {/* 飞鸟装饰 - 带视差 */}
            <div
                className="absolute top-10 left-10 text-white/5 animate-pulse duration-[5s] parallax-element"
                style={{ transform: `translateY(${birdOffset}px)` }}
            >
                <Bird size={200} strokeWidth={0.5} />
            </div>
            <div
                className="absolute bottom-0 right-0 text-white/5 rotate-180 parallax-element"
                style={{ transform: `translateY(${-featherOffset}px)` }}
            >
                <Feather size={300} strokeWidth={0.5} />
            </div>

            {/* 光晕装饰 - 带视差 */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none parallax-element"
                style={{ transform: `translateY(${featherOffset * 0.5}px)` }}
            ></div>

            <div className="max-w-4xl mx-auto px-12 relative z-10 text-center">
                <Observer>
                    <div className="glass-dark glow-amber inline-flex items-center gap-3 px-5 py-2 rounded-full mb-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow"></div>
                        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.3em]">Join the Network</span>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-serif font-black text-white mb-8 tracking-tight leading-tight">
                        成为它们的<br/>
                        <span className="text-shimmer italic relative inline-block">
                            守望者
                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-500/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </span>
                    </h2>

                    <p className="text-lg md:text-xl text-gray-400 font-serif leading-relaxed mb-12 max-w-2xl mx-auto">
                        候鸟不需要护照，但它们需要安全的落脚点。<br/>
                        你的每一次观测、每一次分享、每一份关注，都在为这条数千公里的生命线注入力量。
                        <span className="block mt-4 text-xs font-sans text-gray-500 uppercase tracking-widest">
                            They don't need passports, but they need sanctuary. Your witness is their shield.
                        </span>
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button
                            onClick={onJoin}
                            className="group relative px-10 py-5 glass text-[#1F2937] rounded-full font-bold text-sm tracking-[0.2em] uppercase overflow-hidden hover:bg-amber-500 hover:text-white transition-all duration-500 glow-amber-hover"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Join Now / 立即加入
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </div>
                </Observer>
            </div>
        </section>
    );
};

// ==========================================
// 页脚
// ==========================================

const Footer = ({ onContactClick, onShowRegister }) => {
    // 平滑滚动至各模块
    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <footer className="relative bg-[#FCFBFA] pt-20 pb-10 overflow-hidden border-t border-gray-100">
            
            {/* 1. 顶部装饰线：极致幼细的琥珀色渐变 */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>

            <div className="max-w-[1440px] mx-auto px-16 relative z-10">
                
                {/* 2. 四列扁平化排版：大幅缩减高度 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    
                    {/* --- A. 身份标识：ChenLong 官方签章 --- */}
                    <div className="space-y-6">
                        <div className="flex flex-col">
                            <h4 className="font-serif text-2xl font-black text-[#1F2937] tracking-tighter">
                                BirdWatch<span className="text-amber-500">.</span>
                            </h4>
                            <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-[0.4em] mt-1">Observer Laboratory</span>
                        </div>
                        <div className="pl-4 border-l-2 border-amber-500/20">
                            <p className="text-[10px] text-gray-400 leading-relaxed font-serif italic">
                                本站由 ChenLong 维护。<br/>
                                致力于东亚澳大利西亚迁飞通道生命律动的信息可视化与观测。
                            </p>
                        </div>
                    </div>

                    {/* --- B. 档案索引：二级页面超链接 --- */}
                    <div className="space-y-6">
                        <h5 className="text-[10px] font-mono font-black text-[#1F2937] uppercase tracking-[0.3em] flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                            档案索引 / Archive Index
                        </h5>
                        <div className="flex flex-col gap-3">
                            {[
                                {cn: '生命之旅', en: 'THE JOURNEY', id: 'story'},
                                {cn: '迁徙轨迹', en: 'PATHWAYS', id: 'map'},
                                {cn: '红色名录', en: 'RED LIST', id: 'species'},
                                {cn: '观测实验室', en: 'LABORATORY', id: 'hub'}
                            ].map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => scrollToSection(link.id)}
                                    className="group text-[12px] font-bold text-gray-400 hover:text-amber-600 transition-colors text-left flex items-center gap-3 lift-hover"
                                >
                                    <span className="w-0 h-px bg-amber-500 group-hover:w-4 transition-all"></span>
                                    {link.cn}
                                    <span className="text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ml-1">/{link.en}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* --- C. 参与协作：外部协议链接 --- */}
                    <div className="space-y-6">
                        <h5 className="text-[10px] font-mono font-black text-[#1F2937] uppercase tracking-[0.3em] flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                            协作协议 / Protocols
                        </h5>
                        <div className="flex flex-col gap-4">
                            <button onClick={onContactClick} className="text-[11px] font-black text-gray-400 hover:text-[#1F2937] transition-colors text-left uppercase tracking-widest border-b border-gray-100 pb-1">
                                联系我们 / Contact ChenLong
                            </button>
                            <button onClick={onShowRegister} className="text-[11px] font-black text-gray-400 hover:text-[#1F2937] transition-colors text-left uppercase tracking-widest border-b border-gray-100 pb-1">
                                志愿者招募 / Volunteer Recruitment / 
                            </button>
                            <a href="https://www.iucnredlist.org/" target="_blank" className="text-[11px] font-black text-gray-400 hover:text-[#1F2937] transition-colors text-left uppercase tracking-widest border-b border-gray-100 pb-1">
                                红色名录 / IUCN Global Database
                            </a>
                        </div>
                    </div>

                    {/* --- D. 数据反馈：情报订阅 --- */}
                    <div className="space-y-6">
                        <h5 className="text-[10px] font-mono font-black text-[#1F2937] uppercase tracking-[0.3em] flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                            观测简报 / Data Feed
                        </h5>
                        <div className="relative group max-w-[240px]">
                            <input 
                                type="email" 
                                placeholder="Observer Email..."
                                className="w-full bg-white/50 glass border border-white/30 rounded-lg py-2 px-3 text-[11px] font-mono focus:outline-none focus:border-amber-500 transition-colors"
                            />
                            <button className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-amber-500 transition-colors">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="flex gap-4 opacity-40 hover:opacity-100 transition-opacity">
                            {['TW', 'IG', 'GH'].map(social => (
                                <span key={social} className="text-[9px] font-mono font-bold text-[#1F2937] cursor-pointer hover:text-amber-600">{social}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. 底部版权声明：精密标注感 */}
                <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* 实时状态模拟 */}
                    <div className="flex items-center gap-8 text-[9px] font-mono text-gray-400 tracking-[0.2em] uppercase">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse-glow"></div>
                            <span>Data link established</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                            <MapPin size={10} className="text-amber-500" />
                            <span>Loc: 31.2°N / 121.4°E</span>
                        </div>
                    </div>

                    {/* 法定版权申明 */}
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-[#1F2937] uppercase tracking-[0.15em]">
                                All Rights Reserved By ChenLong
                            </p>
                            <p className="text-[8px] font-mono text-gray-300 uppercase tracking-widest mt-0.5">
                                Verified Biological Witness Archive // 2025
                            </p>
                        </div>
                        <button 
                            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                            className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#1F2937] hover:text-white transition-all shadow-sm"
                        >
                            <ArrowLeft size={16} className="rotate-90" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. 背景极淡防伪水印 */}
            <div className="absolute -bottom-6 -right-6 opacity-[0.02] select-none pointer-events-none">
                <span className="text-[15vw] font-serif font-black text-[#1F2937] uppercase leading-none">BirdWatch Program</span>
            </div>
        </footer>
    );
};

// ==========================================
// 主程序入口
// ==========================================

function App() {
    const [selectedHabitat, setSelectedHabitat] = useState(null);
    const [selectedBird, setSelectedBird] = useState(null);
    const [seenBirds, setSeenBirds] = useState(new Set());
    const [showRegister, setShowRegister] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // 平滑滚动到锚点
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // 🚀 新增：当选中鸟类详情时，将其存入见证记录
    useEffect(() => {
        if (selectedBird) {
            setSeenBirds(prev => new Set(prev).add(selectedBird));
        }
    }, [selectedBird]);

    // 滚动进度逻辑
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;
            setScrollProgress(Number(scroll));
            setShowScrollTop(totalScroll > 500);
        }
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="antialiased selection:bg-accent/70 selection:text-white pb-0 relative">
            {/* 补充 CSS 动画样式 */}
            <style>{`
                .fade-in-up { opacity: 0; transform: translateY(30px); transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1); will-change: opacity, transform; }
                .fade-in-up.is-visible { opacity: 1; transform: translateY(0); }
                .modal-bg { animation: fadeIn 0.3s ease-out forwards; }
                .modal-content { animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .cursor-wait { cursor: wait; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>

            <style>{`
                /* 鸟群飞行 CSS */
                .bird-anim { position: absolute; opacity: 0; animation: fly 15s linear infinite; pointer-events: none; }
                @keyframes fly { 
                    0% { transform: translateX(-10vw) translateY(20vh) scale(0.5); opacity: 0; }
                    10% { opacity: 0.6; }
                    100% { transform: translateX(110vw) translateY(-20vh) scale(0.8); opacity: 0; }
                }
            `}</style>

            {/* 1. 导航栏 (优化版) */}
            <nav className="sticky top-0 z-50 px-6 md:px-10 py-4 flex justify-between items-center glass border-b border-white/20 transition-all duration-300">
                <BrandLogo />

                <div className="hidden lg:flex items-center gap-10">
                    {NAV_LINKS.map(link => (
                         <button
                            key={link.id}
                            onClick={() => scrollToSection(link.id)}
                            className="group relative h-8 overflow-hidden flex flex-col justify-center items-center w-20"
                         >
                            <span className="absolute text-sm font-bold text-[#5D554A] transition-all duration-500 group-hover:-translate-y-8 group-hover:opacity-0">
                                {link.cn}
                            </span>
                            <span className="absolute translate-y-8 opacity-0 text-[10px] font-serif italic text-[#D9A22E] font-bold tracking-wider transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                                {link.en}
                            </span>
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#D9A22E] transition-all duration-300 group-hover:w-full"></span>
                         </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowRegister(true)}
                        className="hidden md:block px-6 py-2.5 bg-[#4A4238] text-[#F9F8F4] text-[10px] font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#D9A22E] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                        Join Us
                    </button>
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <span className={`block w-5 h-0.5 bg-[#4A4238] transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`block w-5 h-0.5 bg-[#4A4238] transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block w-5 h-0.5 bg-[#4A4238] transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </button>
                </div>

                {/* 顶部阅读进度条 */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-500 to-amber-400" style={{width: `${scrollProgress * 100}%`}}></div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[700] transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-[#3D4A3A]/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                <div className={`absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-8 pt-20">
                        <div className="space-y-6">
                            {NAV_LINKS.map((link, i) => (
                                <button
                                    key={link.id}
                                    onClick={() => {
                                        scrollToSection(link.id);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left py-3 border-b border-gray-100 group"
                                    style={{ transitionDelay: `${i * 50}ms` }}
                                >
                                    <span className="text-2xl font-serif font-black text-gray-900 group-hover:text-amber-500 transition-colors">{link.cn}</span>
                                    <span className="block text-xs font-serif italic text-gray-400 mt-1">{link.en}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                setShowRegister(true);
                                setMobileMenuOpen(false);
                            }}
                            className="mt-10 w-full py-4 bg-amber-500 text-white font-bold rounded-full hover:bg-amber-600 transition-colors"
                        >
                            立即加入
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Hero 区域 (极致纯净社论版) */}
                <section className="relative h-screen w-full bg-[#F9F8F4] overflow-hidden group/hero">

                    {/* 1. 实验室底座系统 (动态微纹理) */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        {/* 精密网格：稍微调淡，增加呼吸感 */}
                        <div className="absolute inset-0 opacity-[0.04]" 
                            style={{ backgroundImage: `radial-gradient(#4A4238 1px, transparent 1px)`, backgroundSize: '80px 80px' }}></div>
        
                        {/* 动态光束 */}
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.015] to-transparent animate-scan" style={{ animationDuration: '12s' }}></div>

                        {/* 航迹流光：使用极细线条 */}
                        <svg className="absolute w-full h-full opacity-20" viewBox="0 0 1440 900">
                            <path d="M-100,600 C 400,700 900,400 1540,600" fill="none" stroke="#D9A22E" strokeWidth="0.5" strokeDasharray="10 20" className="animate-dash-flow" />
                            <circle r="2" fill="#D9A22E">
                                <animateMotion dur="20s" repeatCount="indefinite" path="M-100,600 C 400,700 900,400 1540,600" />
                            </circle>
                        </svg>
                    </div>

                    {/* 2. 精密 HUD 边角系统 (玻璃面板) */}
                    <div className="absolute inset-0 p-16 flex flex-col justify-between pointer-events-none z-20">
                        <div className="flex justify-between items-start">
                            <div className="glass p-4 rounded-2xl space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-glow"></div>
                                    <p className="text-[10px] font-mono font-bold text-[#1F2937] uppercase tracking-[0.4em]">Tracking established</p>
                                </div>
                                <p className="text-[9px] font-mono text-gray-400 uppercase tracking-[0.3em] pl-4">31.2304° N // 121.4737° E</p>
                            </div>
                            <div className="glass p-4 rounded-2xl text-right">
                                <p className="text-[10px] font-mono font-black text-[#1F2937] uppercase tracking-[0.4em]">Archive Rev. 2025</p>
                                <p className="text-[9px] font-mono text-gray-400 uppercase tracking-[0.3em] mt-1">EAAFP Global Link // Active</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="glass p-6 rounded-2xl max-w-[220px] border-l-2 border-amber-500/30">
                                <p className="text-[9px] font-serif italic text-gray-500 leading-relaxed tracking-wide">
                                    "Every flight is a testament to the enduring will of life across the vast, changing blue."
                                </p>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="h-px w-32 bg-gradient-to-r from-transparent to-gray-200"></div>
                                <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-[0.5em]">Scroll to Access</p>
                            </div>
                        </div>
                    </div>

                    {/* 3. 核心排版布局 */}
                    <div className="relative z-10 h-full max-w-[1440px] mx-auto px-16 flex flex-col justify-center">
        
                        {/* 主标题组：利用负空间创造张力 */}
                        <div className="relative">
                            <Observer delay={100}>
                                <div className="relative">
                                    {/* 英文层：极浅色、半透明、巨大 */}
                                    <h2 className="absolute -top-24 left-10 text-[13vw] font-serif italic text-gray-400/10 leading-none select-none -z-10 tracking-tighter whitespace-nowrap">
                                        The Long Flight
                                    </h2>
                    
                                    {/* 中文层：极重、极深、带微弱阴影 */}
                                    <div className="relative space-y-4">
                                        <h1 className="text-[11rem] font-serif font-black text-[#1F2937] tracking-tighter leading-[0.85] drop-shadow-sm">
                                            万里归途
                                        </h1>
                                        <div className="flex items-center gap-6 ml-4">
                                            <div className="h-[2px] w-20 bg-amber-500"></div>
                                            <p className="text-2xl font-serif italic text-gray-300 tracking-widest">A Journey of Survival</p>
                                        </div>
                                    </div>
                                </div>
                            </Observer>

                            {/* 描述旁白：右侧错位对齐 */}
                            <Observer delay={300}>
                                <div className="flex justify-end mt-12 mr-32">
                                    <div className="max-w-md space-y-8 text-right">
                                        <p className="text-[22px] text-[#5D554A] font-serif leading-[1.8] italic opacity-80">
                                            这是一场关于生存的接力，<br/>
                                            我们作为见证者记录律动，<br/>
                                            只为守护那条维系生命的 <span className="text-[#1F2937] font-black not-italic border-b-2 border-amber-500/40">蓝色通道</span>。
                                        </p>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-black text-[#1F2937] uppercase tracking-[0.4em]">50 Million Lives</span>
                                            <span className="text-[9px] font-bold text-amber-600/60 uppercase tracking-[0.3em]">Across 22 Nations</span>
                                        </div>
                                    </div>
                                </div>
                            </Observer>
                        </div>

                        {/* 4. 左下角交互导航 (垂直排版) */}
                        <div className="absolute left-16 bottom-24 flex flex-col items-center gap-10">
                            <button 
                                onClick={() => scrollToSection('story')}
                                className="group flex flex-col items-center gap-8 cursor-pointer"
                            >
                                <div className="relative w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-amber-500 transition-all duration-300">
                                    <div className="absolute inset-0 bg-amber-500/5 rounded-full scale-0 group-hover:scale-125 transition-transform duration-300"></div>
                                    <ArrowLeft size={18} className="rotate-[135deg] text-gray-400 group-hover:text-amber-600 transition-all" />
                                </div>
                                <span className="[writing-mode:vertical-lr] text-[10px] font-black tracking-[0.6em] text-gray-300 uppercase group-hover:text-[#1F2937] transition-colors duration-500">
                                    Explore Archive
                                </span>
                            </button>
                        </div>

                    </div>

                    {/* 5. 装饰元素：全局观测准心 (视差效果) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] h-[85vh] border border-[#4A4238]/5 pointer-events-none z-10">
                        {/* 四角直角边框 */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gray-200"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gray-200"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gray-200"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gray-200"></div>
                    </div>
                </section>

    

            {/* 3. 其他部分 */}
            <StorySection />
            <MigrationMap onNodeClick={setSelectedHabitat} />
            <SpeciesGallery onSelectBird={setSelectedBird} />
            <DataHubSection />
            <DiscoveryHub seenBirds={seenBirds} />
            <TimelineSection onSelectEvent={setSelectedEvent} />
            <FinalActionSection onJoin={() => setShowRegister(true)} />
            <Footer onContactClick={() => setShowContact(true)} onShowRegister={() => setShowRegister(true)} />

            {/* 4. 悬浮返回顶部按钮 */}
            <button 
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 z-50 p-1 rounded-full shadow-2xl bg-white/80 backdrop-blur border border-gray-200 transition-all duration-500 group ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
            >
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-gray-200" />
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" 
                                className="text-[#D9A22E] transition-all duration-100" 
                                strokeDasharray={125.6} 
                                strokeDashoffset={125.6 - (125.6 * scrollProgress)} 
                                strokeLinecap="round"
                        />
                    </svg>
                    <ArrowLeft size={20} className="text-[#4A4238] transform rotate-90 group-hover:-translate-y-1 transition-transform" />
                </div>
            </button>

            {/* 5. 弹窗 */}
            {selectedHabitat && <HabitatDetailModal habitatId={selectedHabitat} onClose={()=>setSelectedHabitat(null)} />}
            {selectedBird && <SpeciesDetailModal birdId={selectedBird} onClose={()=>setSelectedBird(null)} />}
            {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
            {showContact && <ContactModal onClose={() => setShowContact(false)} />}
            {selectedEvent && <TimelineDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
        </div>
    );
}

export default App;