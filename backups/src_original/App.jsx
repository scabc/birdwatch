import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';

// 检查用户是否偏好减少动画
const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
import { 
  X, Heart, Target, Feather, Leaf, Globe, MapPin, 
  ArrowRight, ArrowLeft, Users, Mail, User, MessageSquare, 
  Activity, PieChart, BarChart3, TrendingDown, TrendingUp, AlertTriangle,
  Info, Fish, Bird, BookOpen, Compass, Radar, Zap, Shield,
  Volume2, Play, Pause, Music, CheckCircle, XCircle, Clock, Award, 
  LayoutGrid, Home, MousePointer2, ChevronDown, Sun, Star, FileText, Flag,
  Search, Quote, Ruler, Utensils, Eye, Target as TargetIcon 
} from 'lucide-react';

// ==========================================
// 核心数据库 (修复版：eBird 高清图源 + 完整双语信息)
// ==========================================

const BIRD_DB = {
    // --- 极危 (CR) ---
    'spoon_sandpiper': { 
        id: 'spoon_sandpiper', cn: '勺嘴鹬', en: "Spoon-billed Sandpiper", status: 'CR', pop: 600, range: 'Global', size: '14-16cm', 
        descCn: "自带“饭勺”的极危萌物。繁殖于俄罗斯楚科奇，越冬于东南亚。全球仅剩约600只。", descEn: "Critically Endangered. Famous for its unique spoon-shaped bill. Breeds in NE Russia.", 
        // eBird CDN
        img: "/birds/Spoon-billed Sandpiper.jpeg", 
        sound: "/sounds/XC1038168 - 勺嘴鹬 - Calidris pygmaea.wav", 
        habit: "在潮间带泥滩上用特殊的勺状嘴扫动觅食。", diet: "小型甲壳类、沙蚕、昆虫幼虫。",
        trendData: [1000, 750, 500, 300, 200, 150], radarData: [95, 80, 60, 85, 70], statsData: [8000, 35, 12] 
    },
    'baers_pochard': { 
        id: 'baers_pochard', cn: '青头潜鸭', en: "Baer's Pochard", status: 'CR', pop: 500, range: 'East Asia', size: '41-46cm', 
        descCn: "全球最濒危的潜鸭。头部有绿色光泽，眼白色。主要繁殖于中国东北，越冬于长江流域。", descEn: "Critically endangered diving duck. Distinctive white eye and green glossy head.", 
        img: "/birds/Aythya_baeri_cropped.jpg",
        sound: "https://xeno-canto.org/177626/download",
        habit: "善于潜水，也能从水面直接起飞，飞行迅速。", diet: "水生植物根茎、种子、水生昆虫。",
        trendData: [2000, 1200, 800, 600, 550, 500], radarData: [90, 40, 50, 95, 30], statsData: [3500, 680, 25] 
    },
    'siberian_crane': { 
        id: 'siberian_crane', cn: '白鹤', en: "Siberian Crane", status: 'CR', pop: 4000, range: 'Global', size: '135cm', 
        descCn: "大型白色涉禽，红脸黑翅。全球99%的种群在中国的鄱阳湖越冬，极度依赖水位变化。", descEn: "Majestic white crane. 99% of the world population winters in Poyang Lake, China.", 
        img: "/birds/Siberian Crane.jpeg",
        sound: "/sounds/XC988396 - 白鹤 - Leucogeranus leucogeranus.mp3",
        habit: "在浅水湿地挖掘苦草块茎，性情机警。", diet: "苦草块茎 (Tubers)、水生植物。",
        trendData: [3000, 3200, 3600, 3800, 4100, 4500], radarData: [90, 20, 95, 60, 50], statsData: [5000, 6000, 30]
    },
    'yellow_bunting': { 
        id: 'yellow_bunting', cn: '黄胸鹀', en: "Yellow-breasted Bunting", status: 'CR', pop: 1000, range: 'Eurasia', size: '15cm', 
        descCn: "俗称“禾花雀”。因被当作野味过度捕猎，短短20年从“无危”跌入“极危”，种群崩溃。", descEn: "Formerly abundant, now Critically Endangered due to massive illegal hunting.", 
        img: "/birds/Yellow-breasted Bunting.jpeg",
        sound: "https://xeno-canto.org/556754/download",
        habit: "喜欢栖息在低山丘陵的灌丛、草甸和农田。", diet: "谷物、草籽、各类昆虫。",
        trendData: [10000, 6000, 3000, 1500, 800, 400], radarData: [40, 100, 30, 50, 60], statsData: [4000, 25, 15]
    },
    'crested_tern': { 
        id: 'crested_tern', cn: '中华凤头燕鸥', en: "Chinese Crested Tern", status: 'CR', pop: 150, range: 'East Asia', size: '40cm', 
        descCn: "“神话之鸟”，曾销声匿迹63年。喙尖端黑色，全球仅存约150只，繁殖于浙江福建海岛。", descEn: "The 'Mythical Bird'. Rediscovered after 63 years. Bill tip is black.", 
        img: "/birds/Chinese Crested Tern.jpeg",
        sound: "/sounds/XC1035870 - 中华凤头燕鸥 - Thalasseus bernsteini.mp3",
        habit: "在无人海岛岩石上集群筑巢，混群于大凤头燕鸥中。", diet: "小型海鱼 (Small fish)。",
        trendData: [20, 30, 50, 80, 120, 150], radarData: [70, 50, 90, 100, 40], statsData: [2000, 280, 10]
    },
    'reed_warbler': { 
        id: 'reed_warbler', cn: '细纹苇莺', en: "Streaked Reed Warbler", status: 'CR', pop: 5000, range: 'East Asia', size: '13cm', 
        descCn: "神秘的小型莺类。繁殖地至今未明，迁徙经过中国东部沿海芦苇荡。", descEn: "A mysterious warbler with unknown breeding grounds. Migrates via China coast.", 
        img: "/birds/Streaked Reed Warbler.jpeg",
        sound: "https://xeno-canto.org/338779/download",
        habit: "极度隐蔽，常躲藏在茂密的芦苇丛或灌丛中。", diet: "小型昆虫、蜘蛛。",
        trendData: [6000, 5800, 5500, 5200, 5000, 4800], radarData: [100, 10, 50, 80, 60], statsData: [3000, 10, 8]
    },

    // --- 濒危 (EN) ---
    'black_spoonbill': { 
        id: 'black_spoonbill', cn: '黑脸琵鹭', en: "Black-faced Spoonbill", status: 'EN', pop: 6162, range: 'East Asia', size: '76cm', 
        descCn: "东亚明星鸟种。长嘴像琵琶，全黑的面部特征明显。主要在台湾、深圳湾等地越冬。", descEn: "Star species. Spoon-shaped bill. Winters in Taiwan and Shenzhen Bay.",
        img: "/birds/Black-faced Spoonbill.jpeg",
        sound: "/sounds/XC134758 - 黑脸琵鹭 - Platalea minor.mp3", 
        habit: "喜群居，在河口浅滩扫动喙部觅食。", diet: "鱼虾、水生昆虫、软体动物。"
    },
    'oriental_stork': { 
        id: 'oriental_stork', cn: '东方白鹳', en: "Oriental Stork", status: 'EN', pop: 3000, range: 'East Asia', size: '115cm', 
        descCn: "体型硕大的涉禽，嘴黑色且粗壮。常在东北的高树或电线杆上筑巢。", descEn: "Large white stork with black bill. Nests on high structures.",
        img: "/birds/Oriental Stork.jpeg",
        sound: "/sounds/XC401954 - 东方白鹳 - Ciconia boyciana.mp3",
        habit: "在开阔湿地涉水，飞行时颈部伸直。", diet: "鱼类、蛙类、小型哺乳动物。"
    },
    'swan_goose': { 
        id: 'swan_goose', cn: '鸿雁', en: "Swan Goose", status: 'EN', pop: 65000, range: 'East Asia', size: '81-94cm', 
        descCn: "家鹅的野生祖先。颈长，嘴黑色与额头成一直线。主要在长江中下游湖泊越冬。", descEn: "Wild ancestor of the domestic goose. Winters in Yangtze lakes.",
        img: "/birds/Swan Goose.jpeg",
        sound: "/sounds/XC575590 - 鸿雁 - Anser cygnoides.mp3",
        habit: "成群活动，飞行时排成“人”字或“一”字。", diet: "水生植物、苔草、贝类。"
    },
    'great_knot': { 
        id: 'great_knot', cn: '大滨鹬', en: "Great Knot", status: 'EN', pop: 290000, range: 'Global', size: '26-28cm', 
        descCn: "中型涉禽，长距离迁徙冠军。严重依赖黄海（特别是鸭绿江口）作为停歇地。", descEn: "Long-distance migrant heavily reliant on the Yellow Sea mudflats.",
        img: "/birds/Great Knot.jpeg",
        sound: "/sounds/XC396375 - 大滨鹬 - Calidris tenuirostris.mp3",
        habit: "在潮间带高密度集群觅食。", diet: "双壳类（蛤蜊）、腹足类动物。"
    },
    'spotted_greenshank': { 
        id: 'spotted_greenshank', cn: '小青脚鹬', en: "Spotted Greenshank", status: 'EN', pop: 1000, range: 'East Asia', size: '29-32cm', 
        descCn: "极其稀有的鹬类，腿呈青色。繁殖于萨哈林岛，迁徙经过江苏条子泥。", descEn: "Very rare wader. Breeds in Sakhalin, migrates via Jiangsu coast.",
        img: "/birds/Spotted Greenshank.webp",
        sound: "/sounds/XC336494 - 小青脚鹬 - Tringa guttifer.mp3",
        habit: "喜欢开阔的泥质滩涂，常混群于其他鹬类中。", diet: "小型鱼类、甲壳类。"
    },
    'whiteeared_heron': { 
        id: 'whiteeared_heron', cn: '海南鳽', en: "White-eared Night Heron", status: 'EN', pop: 1500, range: 'China', size: '54-56cm', 
        descCn: "被誉为“世界上最神秘的鸟”。夜行性，主要分布于中国南方的山地森林溪流。", descEn: "Highly mysterious, nocturnal heron found in S. China forests.",
        img: "/birds/White-eared Night Heron.jpg",
        sound: null, 
        habit: "夜间活动，白天隐蔽于密林中。", diet: "溪流中的鱼、虾、蛙。"
    },
    'silver_oriole': { 
        id: 'silver_oriole', cn: '鹊色鹂', en: "Silver Oriole", status: 'EN', pop: 1000, range: 'Asia', size: '25-28cm', 
        descCn: "羽色银白，背部栗红色，非常美丽。主要分布于中国南方的阔叶林中。", descEn: "Stunning silver-white plumage. Found in broadleaf forests of S. China.",
        img: "/birds/Silver Oriole.jpg",
        sound: "https://xeno-canto.org/179471/download",
        habit: "栖息于高大的乔木冠层，叫声婉转。", diet: "昆虫、浆果、花蜜。"
    },
    'jankowskis_bunting': { 
        id: 'jankowskis_bunting', cn: '栗斑腹鹀', en: "Jankowski's Bunting", status: 'EN', pop: 2500, range: 'East Asia', size: '16cm', 
        descCn: "分布范围极为狭窄，仅见于内蒙古东部及吉林西部的草甸草原。受栖息地丧失威胁严重。", descEn: "Extremely restricted range in NE China grasslands.",
        img: "/birds/Jankowskis Bunting Emberiza jankowskii, female.jpg",
        sound: "https://xeno-canto.org/556754/download",
        habit: "栖息于开阔的灌丛草甸或杏树林。", diet: "草籽、昆虫。"
    },
    'pallas_fisheagle': { 
        id: 'pallas_fisheagle', cn: '玉带海雕', en: "Pallas's Fish-eagle", status: 'EN', pop: 10000, range: 'Central Asia', size: '76-84cm', 
        descCn: "大型猛禽，尾部有宽阔的白色横带（玉带）。主要以鱼为食，常在内陆湖泊活动。", descEn: "Large raptor with a white tail band. Specialist fish eater.",
        img: "/birds/Pallas_s Fish-eagle.jpeg",
        sound: "/sounds/XC883587 - 玉带海雕 - Haliaeetus leucoryphus.mp3",
        habit: "常在湖泊、河流上空盘旋搜索猎物。", diet: "淡水鱼类、水禽。"
    },
    'saker_falcon': { 
        id: 'saker_falcon', cn: '猎隼', en: "Saker Falcon", status: 'EN', pop: 15000, range: 'Eurasia', size: '47-55cm', 
        descCn: "飞行速度极快的猛禽，草原生态系统的顶级掠食者。常被非法捕捉用于驯鹰。", descEn: "Fast-flying raptor. Apex predator of the steppes.",
        img: "/birds/Saker Falcon.jpeg",
        sound: "/sounds/XC412094 - 猎隼 - Falco cherrug.mp3",
        habit: "栖息于开阔的平原、荒漠和高原。", diet: "鼠兔、地松鼠、鸟类。"
    },
    'whiteheaded_duck': { 
        id: 'whiteheaded_duck', cn: '白头硬尾鸭', en: "White-headed Duck", status: 'EN', pop: 10000, range: 'Eurasia', size: '43-48cm', 
        descCn: "尾羽长而硬，常直立于水面。雄鸟头部白色，喙基部肿大呈蓝色，极具辨识度。", descEn: "Stiff tail often held upright. Male has white head and blue bill.",
        img: "/birds/White-headed Duck.jpeg",
        sound: "/sounds/XC462959 - 白头硬尾鸭 - Oxyura leucocephala.mp3",
        habit: "善潜水，不喜欢飞行，受惊时潜入水中。", diet: "水生植物种子、昆虫幼虫。"
    },
    'steppe_eagle': { 
        id: 'steppe_eagle', cn: '草原雕', en: "Steppe Eagle", status: 'EN', pop: 75000, range: 'Eurasia', size: '60-80cm', 
        descCn: "大型猛禽，嘴裂大，几乎达到眼后。主要分布于北方草原，捕食啮齿类动物。", descEn: "Large eagle with a wide gape. Feeds on rodents in steppes.", 
        img: "/birds/Steppe Eagle.jpeg", 
        sound: "/sounds/XC184828 - 草原雕 - Aquila nipalensis.mp3",
        habit: "长时间在草原上空翱翔或在地面站立。", diet: "黄鼠、旱獭、腐肉。"
    },
    'far_eastern_curlew': { 
        id: 'far_eastern_curlew', cn: '大杓鹬', en: "Far Eastern Curlew", status: 'EN', pop: 32000, range: 'Global', size: '63cm', 
        descCn: "体型最大的鸻鹬类，嘴极长并向下弯曲。是澳大利亚最受关注的候鸟之一。", descEn: "Largest wader with a very long, down-curved bill.", 
        img: "/birds/Far Eastern Curlew.jpeg", 
        sound: "/sounds/XC897544 - 大杓鹬 - Numenius madagascariensis.mp3",
        habit: "在泥滩深处探取食物，生性机警。", diet: "蟹类、沙蚕、底栖生物。"
    },
    'scaly_merganser': { 
        id: 'scaly_merganser', cn: '中华秋沙鸭', en: "Scaly-sided Merganser", status: 'EN', pop: 5000, range: 'East Asia', size: '52-62cm', 
        descCn: "第三纪冰川期遗留物种，被誉为“水中大熊猫”。体侧有精美的鱼鳞状斑纹。", descEn: "Relict species from the Ice Age. Flanks have scale-like patterns.", 
        img: "/birds/Scaly-sided Merganser.jpeg", 
        sound: "/sounds/XC435910 - 中华秋沙鸭 - Mergus squamatus.mp3",
        habit: "急流中的潜水高手，在岸边的老树树洞中筑巢。", diet: "鱼类、石蚕幼虫。"
    },
    'great_bustard': { 
        id: 'great_bustard', cn: '大鸨', en: "Great Bustard", status: 'EN', pop: 10000, range: 'Eurasia', size: '90-110cm', 
        descCn: "世界上最重的飞鸟之一。雄鸟胸部有红褐色横斑。栖息于开阔草原。", descEn: "Heaviest flying bird. Males display impressively in grasslands.",
        img: "/sounds/XC721833 - 大鸨 - Otis tarda tarda.mp3",
        sound: "https://xeno-canto.org/458872/download", 
        habit: "在草原上行走，受惊时奔跑起飞。", diet: "嫩草、甲虫、蝗虫、蜥蜴。" 
    },
};

const CR_BIRD_KEYS = ['spoon_sandpiper', 'baers_pochard', 'yellow_bunting', 'siberian_crane', 'crested_tern', 'reed_warbler'];
const ALL_BIRD_KEYS = Object.keys(BIRD_DB);

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
                text: '飞越数千公里，它们抵达黄渤海的泥质滩涂。这是迁徙途中至关重要的“加油站”。由于填海造陆，这里的补给食堂正在急剧萎缩。' 
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
                text: '曾经消失了63年的“神话之鸟”。在浙江沿海的无人荒岛上，它们在台风与海浪的夹缝中筑巢，每一枚卵都承载着物种的希望。' 
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
                coords: [116.6, 29.1], zoom: 6, themeColor: '#EC4899', 
                text: '全球99%的白鹤最终汇聚于此。在这片中国最大的淡水湖中，白鹤的命运与鄱阳湖的枯荣紧紧捆绑在一起。' 
            }
        ]
    },

    // 4. 青头潜鸭
    'baers_pochard': {
        name: '青头潜鸭', en: "Baer's Pochard",
        chapters: [
            { 
                id: '1', month: 'MAY - JULY', monthCn: '5月 - 7月',
                title: '北方筑巢 | Northern Nests', 
                location: 'Hengshui Lake, Hebei', 
                coords: [115.5, 37.7], zoom: 6, themeColor: '#166534', 
                text: '曾经广泛分布的它们如今已成极危物种。在华北平原残存的芦苇荡中，它们隐秘地筑巢，躲避人类活动的干扰。' 
            },
            { 
                id: '2', month: 'AUGUST - SEPT', monthCn: '8月 - 9月',
                title: '破碎生境 | Fragmented Habitat', 
                location: 'North China Plain', 
                coords: [114.0, 35.0], zoom: 5, themeColor: '#4ADE80', 
                text: '繁殖期后，它们在破碎化的湿地间游荡。由于天然湖泊的丧失，它们常被迫在缺乏隐蔽的鱼塘中栖息，风险极大。' 
            },
            { 
                id: '3', month: 'OCT - NOV', monthCn: '10月 - 11月',
                title: '南迁之路 | Migration Path', 
                location: 'Hubei / Anhui', 
                coords: [114.0, 31.0], zoom: 5, themeColor: '#EAB308', 
                text: '顺着季风南下，寻找未结冰的水域。作为潜鸭，它们需要水质清澈、水草丰富的深水区来潜水觅食。' 
            },
            { 
                id: '4', month: 'DEC - FEB', monthCn: '12月 - 次年2月',
                title: '长江越冬 | Yangtze Winter', 
                location: 'Middle-Lower Yangtze', 
                coords: [114.3, 30.5], zoom: 5, themeColor: '#15803D', 
                text: '最终在长江中下游的湖泊群集结。它们是湿地健康的指示物种，哪里有青头潜鸭，哪里就有优质的水生态。' 
            }
        ]
    },

    // 5. 黄胸鹀 (禾花雀)
    'yellow_bunting': {
        name: '黄胸鹀', en: 'Yellow-breasted Bunting',
        chapters: [
            { 
                id: '1', month: 'MAY - AUGUST', monthCn: '5月 - 8月',
                title: '西伯利亚之歌 | Siberian Song', 
                location: 'Siberia / Mongolia', 
                coords: [110.0, 55.0], zoom: 4, themeColor: '#FACC15', 
                text: '在北方的灌丛草甸上，雄鸟那亮黄色的胸羽在阳光下闪耀。曾经，它们的种群数量庞大，歌声遍布欧亚大陆。' 
            },
            { 
                id: '2', month: 'SEPTEMBER', monthCn: '9月',
                title: '无声迁徙 | Silent Passage', 
                location: 'Northeast China', 
                coords: [125.0, 43.0], zoom: 5, themeColor: '#CA8A04', 
                text: '为了躲避非法的捕鸟网，它们改变了习性，更多在夜间迁徙。这一路充满了不可预知的危险。' 
            },
            { 
                id: '3', month: 'OCTOBER', monthCn: '10月',
                title: '稻田危机 | Field Peril', 
                location: 'Yangtze / South China', 
                coords: [115.0, 30.0], zoom: 5, themeColor: '#A16207', 
                text: '它们喜欢在农田边缘的芦苇丛休息，但这恰恰是捕猎者设伏的地点。曾经的“害鸟”标签，变成了如今的“野味”悲剧。' 
            },
            { 
                id: '4', month: 'NOV - MARCH', monthCn: '11月 - 次年3月',
                title: '隐蔽越冬 | Hidden Winter', 
                location: 'Guangdong / SE Asia', 
                coords: [113.0, 23.0], zoom: 5, themeColor: '#854D0E', 
                text: '幸存者抵达华南或东南亚的越冬地。它们在草丛中极力隐藏自己，短短20年间，它们的数量下降了90%以上。' 
            }
        ]
    },

    // 6. 细纹苇莺
    'reed_warbler': {
        name: '细纹苇莺', en: 'Streaked Reed Warbler',
        chapters: [
            { 
                id: '1', month: 'MAY - AUGUST', monthCn: '5月 - 8月',
                title: '身世之谜 | Breeding Mystery', 
                location: 'Amur Region / Heilongjiang', 
                coords: [132.0, 48.0], zoom: 4, themeColor: '#A8A29E', 
                text: '世界上最神秘的鸟类之一。直到最近，科学家才在中俄边境的黑龙江流域确认了它们极少的繁殖记录。' 
            },
            { 
                id: '2', month: 'SEPTEMBER', monthCn: '9月',
                title: '芦苇依赖 | Reedbed Reliance', 
                location: 'Liaoning Coast', 
                coords: [121.5, 41.0], zoom: 5, themeColor: '#D6D3D1', 
                text: '正如其名，它们极度依赖沿海的大片原始芦苇荡。盘锦红海滩周边的芦苇湿地是它们迁徙途中不可或缺的庇护所。' 
            },
            { 
                id: '3', month: 'OCTOBER', monthCn: '10月',
                title: '栖地丧失 | Habitat Loss', 
                location: 'Yellow River Delta', 
                coords: [119.0, 37.8], zoom: 6, themeColor: '#78716C', 
                text: '然而，沿海芦苇正在被互花米草入侵或被开发取代。这种特化的小鸟面临着“无枝可依”的困境。' 
            },
            { 
                id: '4', month: 'NOV - APRIL', monthCn: '11月 - 次年4月',
                title: '南洋踪迹 | Philippines', 
                location: 'Luzon, Philippines', 
                coords: [121.0, 15.0], zoom: 5, themeColor: '#57534E', 
                text: '飞越茫茫大海，最终在菲律宾的湿地越冬。关于它们的迁徙路线，依然有太多的未解之谜等待探索。' 
            }
        ]
    }
};

const TIMELINE_DATA = [
    { 
        year: '1971', category: '政策', categoryEn: 'POLICY', title: '拉姆萨尔公约诞生', 
        desc: '在伊朗拉姆萨尔签署，这是人类历史上第一个专门保护单一生态系统的全球条约。', icon: 'FileText',
        details: {
            background: '1971年2月2日，18国代表在里海之滨签署协议。它终结了湿地被视为“无用荒地”的历史，确立了湿地作为“地球之肾”和候鸟生命线的国际法律地位。',
            impact: '截至2025年，全球已有172个缔约方，指定了超过2,500处国际重要湿地（Ramsar Sites），保护面积超过2.5亿公顷。',
            insight: '它提出了“明智利用 (Wise Use)”原则：保护不是封锁自然，而是尊重自然的节律。',
            metrics: [{ l: '缔约方', v: '172' }, { l: '保护地面积', v: '2.5亿 ha' }, { l: '全球覆盖', v: '90%' }]
        }
    },
    { 
        year: '1981', category: '国际', categoryEn: 'GLOBAL', title: '首个跨国候鸟协定', 
        desc: '中日签署《保护候鸟及其栖息环境协定》，开启了迁飞区跨国协作的先河。', icon: 'Globe',
        details: {
            background: '1981年3月，两国政府意识到丹顶鹤、白鹤等候鸟在两地间往返，必须共同行动。这是中国签署的首个双边候鸟保护条约，列出了227种受保护候鸟名单。',
            impact: '该协定直接推动了后续中国建立扎龙、盐城等首批国家级湿地保护区，建立了跨越国界的环志科研网络。',
            insight: '候鸟不持护照，它们的生存完全取决于人类能否跨越边界握手。',
            metrics: [{ l: '保护物种', v: '227种' }, { l: '科研环志', v: '40k+' }, { l: '合作机构', v: '15+' }]
        }
    },
    { 
        year: '1996', category: '国际', categoryEn: 'GLOBAL', title: '亚洲-太平洋迁飞策略', 
        desc: '《亚太地区迁徙水鸟保护战略》发布，这是今日 EAAFP 迁飞区伙伴关系的基石。', icon: 'Flag',
        details: {
            background: '在布里斯班，多国专家意识到单一站点保护无效。1996年启动的这项战略首次将“迁飞区”作为一个整体生态系统进行审视，连接了从北极到澳洲的22个国家。',
            impact: '它促成了40个合作伙伴（政府、NGO、企业）的结盟，建立起覆盖5,000万候鸟、穿越22个国家的观测点网络。',
            insight: '迁飞区是一条由无数颗“珍珠”串成的项链，任何一处的断裂都会导致整条链条崩溃。',
            metrics: [{ l: '连接国家', v: '22' }, { l: '伙伴数量', v: '40' }, { l: '受惠候鸟', v: '5,000万' }]
        }
    },
    { 
        year: '2008', category: '行动', categoryEn: 'ACTION', title: '勺嘴鹬“诺亚方舟”计划', 
        desc: '针对极危物种勺嘴鹬启动人工辅助孵化工程，利用“Headstarting”技术跑赢灭绝。', icon: 'Heart',
        details: {
            background: '当时全球种群仅剩不足200对。科学家在俄罗斯楚科奇采集受威胁的卵进行人工孵化，并将雏鸟喂养至离巢状态放归。',
            impact: '人工干预使雏鸟存活率从野外的15%提升至75%。多只放归个体已成功返回繁殖地并被观测者记录。',
            insight: '每一枚卵的孵化，都是在为这个物种的灭绝时钟争取额外的秒数。',
            metrics: [{ l: '孵化存活率', v: '75%' }, { l: '放归数量', v: '200+' }, { l: '种群降幅', v: '减缓20%' }]
        }
    },
    { 
        year: '2017', category: '政策', categoryEn: 'POLICY', title: '滨海围填海最严禁令', 
        desc: '中国颁布全面停止围填海的紧急通知，为迁徙廊道保留了最后的泥滩“加油站”。', icon: 'Shield',
        details: {
            background: '长期以来，滩涂被视为廉价土地资源。2017年国务院发布《关于加强滨海湿地保护严格管制围填海的通知》，除国家战略外一律严禁。',
            impact: '这一政策让黄渤海区域数万公顷的泥质滩涂免于消失，直接拯救了大滨鹬和黑脸琵鹭的核心停歇地。',
            insight: '土地的价值不应仅由建筑面积衡量，更应由它所承载的生命脉动衡量。',
            metrics: [{ l: '围填海减幅', v: '80%' }, { l: '修复岸线', v: '1,200km' }, { l: '管控等级', v: '最高级' }]
        }
    },
    { 
        year: '2019', category: '遗产', categoryEn: 'HERITAGE', title: '黄海候鸟栖息地申遗成功', 
        desc: '中国首处、世界第二处潮间带湿地世界遗产，标志着迁飞区核心节点获得全球最高保护。', icon: 'Award',
        details: {
            background: '在第43届世界遗产大会上，江苏盐城等核心滩涂入选。这是全球最重要的候鸟迁徙枢纽，支撑着超过400种候鸟。',
            impact: '一期申遗地覆盖18.8万公顷，二期（2024年）再次扩充5处节点。它确保了这一大片“超级食堂”在法律上不可侵犯。',
            insight: '申遗不是终点，而是我们向未来世代许下的“永久不开发”承诺。',
            metrics: [{ l: '遗产面积', v: '29万 ha' }, { l: '支持物种', v: '415种' }, { l: '候鸟流量', v: '300万+' }]
        }
    },
    { 
        year: '2023', category: '行动', categoryEn: 'ACTION', title: '区域迁飞区融资倡议', 
        desc: '亚行（ADB）发起 Regional Flyway Initiative，计划动员30亿美元用于沿线保护。', icon: 'Zap',
        details: {
            background: '保护需要真实的投入。亚行联合多方计划在未来十年为11个国家的147个关键湿地提供融资，用于湿地修复和社区生计转型。',
            impact: '这是目前全球针对单一迁飞区规模最大的资金动员计划。2025年已启动菲律宾等节点的首批专项资助。',
            insight: '当经济发展开始为自然保护买单，我们才真正开启了生态转型的进程。',
            metrics: [{ l: '计划投资', v: '30亿美元' }, { l: '覆盖站点', v: '147个' }, { l: '受惠人口', v: '2亿' }]
        }
    }
];

// --- 核心：栖息地数据库 (100% 匹配 MAP_NODES，修复二级界面缺失问题) ---
const HABITAT_DB = {
    // 境外
    'siberia': { cn: '西伯利亚', en: 'Siberia', tags: ['繁殖地', 'Breeding'], featured: ['勺嘴鹬', '大滨鹬'], descCn: '广阔的北极苔原，是无数候鸟的出生地。', descEn: 'Vast arctic tundra breeding grounds.', img: 'public/habitats/西伯利亚.jpg' },
    'alaska': { cn: '阿拉斯加', en: 'Alaska', tags: ['北极育雏'], featured: ['斑尾塍鹬'], descCn: '连接东西半球的枢纽。', descEn: 'Hub connecting East and West.', img: 'public/habitats/阿拉斯加.jpg' },
    'khanka': { cn: '兴凯湖', en: 'Lake Khanka', tags: ['中俄界湖', 'Cranes'], featured: ['丹顶鹤', '白枕鹤'], descCn: '中俄边界的巨大淡水湖，是鹤类迁徙的重要“跳板”。', descEn: 'Major stopover on RU-CN border.', img: 'public/habitats/兴凯湖.jpg' },
    'australia': { cn: '澳大利亚', en: 'Australia', tags: ['终点站', 'Terminal'], featured: ['大杓鹬'], descCn: 'EAAF 迁徙的南端终点。', descEn: 'Southern terminus of the flyway.', img: 'public/habitats/澳大利亚.webp' },
    'seasia': { cn: '东南亚', en: 'SE Asia', tags: ['越冬地'], featured: ['勺嘴鹬'], descCn: '泰国、缅甸等地的滩涂。', descEn: 'Critical wintering ground.', img: 'public/habitats/泰国湾.jpeg' },
    'newzealand': { cn: '新西兰', en: 'New Zealand', tags: ['最南端'], featured: ['斑尾塍鹬'], descCn: '迁飞通道的最南端，斑尾塍鹬的终极目的地。', descEn: 'Southernmost reach.', img: 'public/habitats/新西兰.jpg' },

    // 北方
    'yalu': { cn: '鸭绿江口', en: 'Yalu River Estuary', tags: ['关键停歇地', 'Key Stopover'], featured: ['大滨鹬', '黑脸琵鹭'], descCn: '位于辽宁丹东，候鸟飞越黄海后的第一个落脚点。', descEn: 'Last critical stopover before Siberia.', img: 'public/habitats/鸭绿江.jpg' },
    'beidaihe': { cn: '北戴河', en: 'Beidaihe', tags: ['观鸟麦加', 'Bottleneck'], featured: ['丹顶鹤', '遗鸥'], descCn: '中国最早的观鸟胜地，著名的“北戴河迁徙瓶颈”。', descEn: 'Famous migratory bottleneck.', img: 'public/habitats/北戴河.jpeg' },
    'bohai': { cn: '渤海湾', en: 'Bohai Bay', tags: ['能量补给', 'Refueling'], featured: ['红腹滨鹬', '大滨鹬'], descCn: '泥质滩涂盛产蛤类，为红腹滨鹬等长距离迁徙鸟类提供至关重要的能量补给。', descEn: 'Vital refueling stop with rich benthos.', img: 'public/habitats/曹妃甸.jpg' },
    'yellowriver': { cn: '黄河三角洲', en: 'Yellow River Delta', tags: ['新生湿地', 'Nature Reserve'], featured: ['东方白鹳', '大天鹅'], descCn: '共和国最年轻的土地，暖温带最广阔的湿地生态系统。', descEn: 'Youngest wetland ecosystem in China.', img: "public/habitats/黄河三角洲.png" },
      
    // 华东/沿海
    'lianyungang': { cn: '连云港', en: 'Lianyungang', tags: ['临洪河口', 'Stopover'], featured: ['半蹼鹬', '翘嘴鹬'], descCn: '位于江苏最北端，连接渤海湾与长三角的重要驿站。', descEn: 'Connecting Bohai and Yangtze.', img: 'public/habitats/连云港.webp' },
    'yancheng': { cn: '盐城条子泥', en: 'Yancheng Wetlands', tags: ['世界遗产', 'World Heritage'], featured: ['勺嘴鹬', '丹顶鹤'], descCn: '黄（渤）海候鸟栖息地核心区，拥有全球也是最大的丹顶鹤越冬地。', descEn: 'Critical bottleneck for migration.', img: 'public/habitats/盐城.png' },
    'chongming': { cn: '崇明东滩', en: 'Chongming Dongtan', tags: ['长江门户', 'Yangtze Mouth'], featured: ['震旦鸦雀', '小天鹅'], descCn: '长江入海口的绿色屏障，亚太迁飞区的重要驿站。', descEn: 'Important wetland at Yangtze mouth.', img: 'public/habitats/崇明.jpg' },
    'hangzhou': { cn: '杭州湾', en: 'Hangzhou Bay', tags: ['湿地恢复', 'Restoration'], featured: ['黑嘴鸥', '卷羽鹈鹕'], descCn: '位于跨海大桥旁，是人工湿地修复与鸟类保护结合的典范。', descEn: 'Model for wetland restoration.', img: 'public/habitats/杭州湾.jpg' },
    'minjiang': { cn: '闽江口', en: 'Minjiang Estuary', tags: ['神话之鸟', 'Terns'], featured: ['中华凤头燕鸥', '黑脸琵鹭'], descCn: '福建沿海最重要湿地，是极度濒危的中华凤头燕鸥的重要繁殖与停歇地。', descEn: 'Key site for Chinese Crested Tern.', img: 'public/habitats/闽江河口.jpg' },

    // 华南/内陆
    'shenzhen': { cn: '深圳湾', en: 'Shenzhen Bay', tags: ['城中湿地', 'Urban Wetland'], featured: ['黑脸琵鹭', '反嘴鹬'], descCn: '位于繁华都市中心的红树林湿地，也是黑脸琵鹭全球第三大越冬地。', descEn: 'Mangroves inside the metropolis.', img: 'public/habitats/深圳湾.jpg' },
    'zhanjiang': { cn: '湛江雷州', en: 'Zhanjiang', tags: ['勺嘴鹬越冬', 'Wintering'], featured: ['勺嘴鹬', '红嘴鸥'], descCn: '雷州半岛的红树林与滩涂，是极危物种勺嘴鹬在中国的核心越冬地之一。', descEn: 'Core wintering site for Spoonies.', img: 'public/habitats/湛江.jpg' },
    'poyang': { cn: '鄱阳湖', en: 'Poyang Lake', tags: ['第一淡水湖', 'Wintering'], featured: ['白鹤', '鸿雁'], descCn: '中国“一湖清水”，承载了全球99%的白鹤种群越冬。', descEn: 'Hosts 99% of Siberian Cranes.', img: 'public/habitats/鄱阳湖.jpeg' },
    'dongting': { cn: '洞庭湖', en: 'Dongting Lake', tags: ['长江之肾', 'Inland'], featured: ['小白额雁', '麋鹿'], descCn: '重要的长江通江湖泊，与鄱阳湖共同构成了长江中下游的水鸟越冬要塞。', descEn: 'Major wintering site for geese.', img: 'public/habitats/洞庭湖.jpg' },
    'qinghai': { cn: '青海湖', en: 'Qinghai Lake', tags: ['高原明珠', 'Plateau'], featured: ['斑头雁', '黑颈鹤'], descCn: '中国最大咸水湖，是中亚迁飞路线（Central Asian Flyway）上斑头雁的关键繁殖地。', descEn: 'Key breeding ground on the plateau.', img: 'public/habitats/青海湖.webp' },
};

// --- 地图节点坐标 (修复了阿拉斯加坐标，避免跨亚欧错误) ---
const MAP_NODES = [
    // --- 境外 (showInGlobal: true) ---
    { id: 'siberia', cn: '西伯利亚', en: 'Siberia', value: [125.0, 62.0], type: 'breeding', highlight: true, showInGlobal: true },
    // 修正：阿拉斯加经度设为 200，确保跨太平洋连线不经过欧洲
    { id: 'alaska', cn: '阿拉斯加', en: 'Alaska', value: [200.0, 62.0], type: 'breeding', highlight: true, showInGlobal: true }, 
    { id: 'khanka', cn: '兴凯湖', en: 'Khanka', value: [132.5, 45.0], type: 'stopover', showInGlobal: true }, 
    { id: 'australia', cn: '澳大利亚', en: 'Australia', value: [135.0, -25.0], type: 'wintering', highlight: true, showInGlobal: true },
    { id: 'newzealand', cn: '新西兰', en: 'New Zealand', value: [175.0, -40.0], type: 'wintering', showInGlobal: true }, 
    { id: 'seasia', cn: '东南亚', en: 'SE Asia', value: [102.0, 13.0], type: 'wintering', showInGlobal: true },

    // --- 中国北方 ---
    { id: 'yalu', cn: '鸭绿江口', en: 'Yalu River', value: [124.3, 39.8], type: 'stopover', highlight: true, showInGlobal: true },
    { id: 'beidaihe', cn: '北戴河', en: 'Beidaihe', value: [119.5, 39.8], type: 'stopover', showInGlobal: false }, 
    { id: 'bohai', cn: '渤海湾', en: 'Bohai Bay', value: [118.5, 39.0], type: 'stopover', showInGlobal: false },
    { id: 'yellowriver', cn: '黄河三角洲', en: 'Yellow River', value: [119.1, 37.8], type: 'stopover', highlight: true, showInGlobal: true },

    // --- 中国华东 ---
    { id: 'lianyungang', cn: '连云港', en: 'Lianyungang', value: [119.2, 34.6], type: 'stopover', showInGlobal: false }, 
    { id: 'yancheng', cn: '盐城', en: 'Yancheng', value: [120.9, 33.6], type: 'stopover', highlight: true, showInGlobal: true },
    { id: 'chongming', cn: '崇明东滩', en: 'Chongming', value: [121.9, 31.5], type: 'stopover', showInGlobal: false },
    { id: 'hangzhou', cn: '杭州湾', en: 'Hangzhou Bay', value: [121.2, 30.3], type: 'stopover', showInGlobal: false },

    // --- 中国华南/东南 ---
    { id: 'minjiang', cn: '闽江口', en: 'Minjiang', value: [119.6, 26.1], type: 'stopover', showInGlobal: false }, 
    { id: 'shenzhen', cn: '深圳湾', en: 'Shenzhen', value: [114.0, 22.5], type: 'wintering', showInGlobal: false }, 
    { id: 'zhanjiang', cn: '湛江雷州', en: 'Zhanjiang', value: [110.3, 21.2], type: 'wintering', showInGlobal: false }, 

    // --- 中国内陆/高原 ---
    { id: 'poyang', cn: '鄱阳湖', en: 'Poyang Lake', value: [116.6, 29.1], type: 'wintering', highlight: true, showInGlobal: true },
    { id: 'dongting', cn: '洞庭湖', en: 'Dongting Lake', value: [112.9, 29.3], type: 'wintering', showInGlobal: false }, 
    { id: 'qinghai', cn: '青海湖', en: 'Qinghai Lake', value: [100.2, 36.8], type: 'breeding', highlight: true, showInGlobal: true } 
];

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

const Icon = ({ name, size = 20, className, style }) => {
    const icons = { 
        X, Heart, Target, Feather, Leaf, Globe, MapPin, ArrowRight, ArrowLeft, 
        Users, Mail, User, MessageSquare, BarChart3, PieChart, Activity, 
        TrendingDown, TrendingUp, AlertTriangle, Info, Fish, Bird, BookOpen, 
        Compass, Radar, Zap, Shield, Volume2, Play, Pause, Music, 
        CheckCircle, XCircle, Clock, Award, LayoutGrid, Home, MousePointer2, 
        ChevronDown, Sun, Star, FileText, Flag,
        Search // <-- 补上这里
    };
    const LucideIcon = icons[name];
    if (!LucideIcon) return null;
    return <LucideIcon size={size} className={className} style={style} />;
};

const Observer = ({ children, className = "", delay = 0 }) => {
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

    return <div ref={ref} className={`fade-in-up ${className}`}>{children}</div>;
};

const InteractiveTitle = ({ text, className }) => (
    <span className={`inline-block ${className}`}>
        {text.split('').map((char, index) => (
            <span key={index} className="inline-block transition-transform duration-300 hover:-translate-y-2 hover:text-accent hover:rotate-2 cursor-default">{char === ' ' ? '\u00A0' : char}</span>
        ))}
    </span>
);

// ==========================================
// 详情二级界面
// ==========================================

const SpeciesDetailModal = ({ birdId, onClose }) => {
    const data = BIRD_DB[birdId];
    if (!data) return null;

    const audioRef = useRef(null);
    const imageContainerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

    // 🚀 核心修复：处理数据库内容，确保不出现中英混杂
    const getCleanRange = (range) => {
        const mapping = {
            'Global': '全球性分布',
            'East Asia': '东亚迁飞区',
            'Eurasia': '欧亚大陆',
            'China': '中国特有种',
            'Central Asia': '中亚地区'
        };
        return mapping[range] || range;
    };

    const handleMouseMove = (e) => {
        if (!imageContainerRef.current) return;
        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePos({ x, y });
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const isCR = data.status === 'CR';
    const themeColor = isCR ? '#A0522D' : '#D9A22E';

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 md:p-16 lg:p-24 overflow-hidden">
            {/* 1. 环境背景遮罩 */}
            <div className="absolute inset-0 bg-[#0C0C0C]/80 backdrop-blur-3xl transition-opacity duration-300" onClick={onClose}></div>
            
            {/* 🚀 物理尺寸优化：缩小 max-w 和 h */}
            <div className="relative w-full max-w-5xl h-[82vh] bg-white rounded-[3rem] shadow-[0_80px_150px_-40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row modal-content border border-white/10">
                
                {/* 左侧轨道：观测窗口 */}
                <div 
                    ref={imageContainerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setMousePos({ x: 50, y: 50 })}
                    className="w-full lg:w-[45%] h-[35vh] lg:h-full relative overflow-hidden group bg-[#151515] cursor-crosshair border-r border-gray-50"
                >
                    <img 
                        src={data.img} 
                        alt={data.cn} 
                        className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.25]" 
                        style={{ transformOrigin: `${mousePos.x}% ${mousePos.y}%` }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>

                    {/* 关闭按钮 - 缩小尺寸 */}
                    <button onClick={onClose} className="absolute top-8 left-8 w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 z-30">
                        <X size={20} strokeWidth={1.5} />
                    </button>

                    {/* 音频控件 - 极简排版 */}
                    {data.sound && (
                        <div className="absolute bottom-8 left-8 z-30">
                            <button onClick={() => {if(isPlaying){audioRef.current.pause();setIsPlaying(false)}else{audioRef.current.play();setIsPlaying(true)}}} 
                                className={`flex items-center gap-4 px-6 py-3.5 rounded-full shadow-2xl transition-all duration-300 ${isPlaying ? 'bg-[#10B981] text-white' : 'bg-white/95 text-gray-800 hover:bg-white'}`}>
                                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                <div className="flex flex-col items-start leading-none pr-1">
                                    <span className="text-[9px] font-black tracking-widest uppercase mb-1">{isPlaying ? 'Echoing' : 'Listen'}</span>
                                    <span className="text-[7px] opacity-50 font-bold uppercase tracking-tighter">Recording</span>
                                </div>
                            </button>
                            <audio ref={audioRef} src={data.sound} onEnded={() => setIsPlaying(false)} />
                        </div>
                    )}
                </div>

                {/* 🚀 右侧轨道：纯净档案 (去除中英混杂) */}
                <div className="w-full lg:w-[55%] h-full p-10 md:p-14 overflow-y-auto no-scrollbar bg-white flex flex-col relative text-[#1F2937]">
                    
                    {/* 1. 档案顶栏 */}
                    <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-3 bg-amber-500 rounded-full"></div>
                            <span className="text-[9px] font-mono font-bold tracking-[0.4em] text-amber-600 uppercase">SPECIMEN ID: {birdId.slice(0,5).toUpperCase()}</span>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest text-white`} style={{backgroundColor: themeColor}}>
                            {isCR ? '极危 · CR' : '濒危 · EN'}
                        </div>
                    </div>

                    {/* 2. 标题区 (精致比例) */}
                    <div className="mb-12">
                        <h2 className="text-5xl font-serif font-black tracking-tighter text-gray-900 mb-4 leading-none">{data.cn}</h2>
                        <div className="space-y-1">
                            <p className="text-lg font-serif text-gray-400 italic tracking-wide lowercase opacity-80">{data.en}</p>
                            <p className="text-[9px] font-mono font-bold text-gray-300 uppercase tracking-[0.2em]">{data.en.replace(/ /g, '_').toUpperCase()}_SPECIES</p>
                        </div>
                    </div>

                    {/* 3. 科学参数 (严格水平网格) */}
                    <div className="grid grid-cols-4 gap-0 mb-12 border-y border-gray-100 py-8">
                         {[
                             { icon: Ruler, l: '体型', e: 'SIZE', v: data.size },
                             { icon: Zap, l: '翼展', e: 'SPAN', v: '115-130cm' },
                             { icon: Users, l: '种群', e: 'POP.', v: data.pop.toLocaleString() },
                             { icon: TrendingDown, l: '趋势', e: 'TREND', v: '持续下降' }
                         ].map((s, i) => (
                             <div key={i} className={`flex flex-col px-4 gap-2 ${i < 3 ? 'border-r border-gray-100' : ''}`}>
                                 <div className="flex items-center gap-2 text-amber-600/40">
                                     <s.icon size={12} strokeWidth={2} />
                                     <span className="text-[8px] font-black tracking-widest uppercase">{s.e}</span>
                                 </div>
                                 <div className="flex flex-col leading-tight">
                                     <span className="text-[10px] font-bold text-gray-400 mb-0.5">{s.l}</span>
                                     <span className="text-sm font-serif font-bold text-gray-800">{s.v}</span>
                                 </div>
                             </div>
                         ))}
                    </div>

                    {/* 4. 深度信息流 (纯净排版) */}
                    <div className="space-y-10 mb-16">
                        {/* 习性 */}
                        <section className="group/sec">
                            <div className="flex items-center gap-3 mb-4 text-gray-300 group-hover/sec:text-amber-600 transition-colors">
                                <Bird size={16} strokeWidth={1.5} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Habit · 生存习性</h3>
                            </div>
                            <div className="pl-7 border-l border-gray-100 group-hover/sec:border-amber-200 transition-colors">
                                <p className="text-[15px] font-serif text-gray-600 leading-[1.8] text-justify opacity-90">
                                    {data.habit || '该物种常年栖息于滨海湿地或芦苇丛中。其生存状况反映了迁飞区微生态的健康状态。'}
                                </p>
                                <p className="text-[10px] text-gray-300 font-sans italic mt-3 tracking-wide">
                                    The species primarily inhabits coastal wetlands, reflecting the overall health of the ecosystem.
                                </p>
                            </div>
                        </section>

                        {/* 分布与食性 */}
                        <section className="group/sec">
                            <div className="flex items-center gap-3 mb-4 text-gray-300 group-hover/sec:text-emerald-600 transition-colors">
                                <Globe size={16} strokeWidth={1.5} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Distribution · 分布与食性</h3>
                            </div>
                            <div className="pl-7 border-l border-gray-100 group-hover/sec:border-emerald-200 transition-colors">
                                <p className="text-[15px] font-serif text-gray-600 leading-[1.8] text-justify opacity-90">
                                    核心分布于<span className="text-gray-900 font-bold mx-1">{getCleanRange(data.range)}</span>。
                                    {data.diet ? `主要取食来源包括${data.diet.split('(')[0]}。这种特化的食性使其对特定生境表现出极强的依赖性。` : '其食谱极度依赖特定的底栖生物或昆虫种群。'}
                                </p>
                                <p className="text-[10px] text-gray-300 font-sans italic mt-3 tracking-wide">
                                    Mainly distributed across {data.range}. Diet consists primarily of specialized prey found in tidal flats.
                                </p>
                            </div>
                        </section>

                        {/* 生存威胁 */}
                        <section>
                            <div className="flex items-center gap-3 mb-6 text-red-600/50">
                                <AlertTriangle size={16} strokeWidth={1.5} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Threats · 生存威胁</h3>
                            </div>
                            <div className="flex flex-wrap gap-2 pl-7 border-l border-gray-100">
                                {[
                                    {cn: '栖息地丧失', en: 'HABITAT LOSS'},
                                    {cn: '人为干扰', en: 'DISTURBANCE'},
                                    {cn: '非法捕猎', en: 'POACHING'}
                                ].map(t => (
                                    <div key={t.en} className="px-4 py-2 bg-red-50/50 border border-red-100 rounded-xl flex flex-col items-center">
                                        <span className="text-[10px] font-bold text-red-600">{t.cn}</span>
                                        <span className="text-[7px] font-black text-red-400 tracking-tighter mt-0.5">{t.en}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* 5. 引用注脚卡片 */}
                    <div className="mt-auto pt-10 border-t border-gray-50">
                        <div className="relative p-8 bg-gray-50 rounded-[2.5rem] overflow-hidden">
                            <Quote size={32} className="text-amber-500/10 absolute top-6 left-6" />
                            <p className="relative z-10 text-[15px] font-serif text-gray-500 leading-relaxed italic opacity-80 pl-6">
                                “{data.descCn}”
                            </p>
                        </div>
                        <div className="flex justify-between items-center mt-6 px-4">
                            <p className="text-[8px] font-mono text-gray-300 tracking-[0.25em] uppercase">Red List Record 2025 // Verification Report</p>
                            <Target size={16} className="text-gray-100" strokeWidth={1} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const HabitatDetailModal = ({ habitatId, onClose }) => {
    const data = HABITAT_DB[habitatId];
    if (!data) return null;
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 modal-bg">
            <div className="absolute inset-0 bg-fg/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-card rounded-3xl shadow-soft overflow-hidden flex flex-col md:flex-row modal-content">
                <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-100 shrink-0">
                    <img src={data.img} alt={data.cn} className="w-full h-full object-cover" onError={(e) => {e.target.src='https://placehold.co/800x600/D4D4D8/465B49?text=Habitat'}} />
                    <button onClick={onClose} className="absolute top-4 left-4 w-10 h-10 bg-fg/30 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-fg/50 transition-colors">
                        <Icon name="X" size={20}/>
                    </button>
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                    <div className="space-y-1 mb-6">
                        <h2 className="text-3xl font-bold text-fg">{data.cn}</h2>
                        <p className="text-xl text-neutral_sub">{data.en}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {data.tags.map((tag,i)=>(<span key={i} className="px-3 py-1 bg-secondary_accent/10 text-secondary_accent text-xs font-semibold rounded-full border border-secondary_accent/20">{tag}</span>))}
                    </div>
                    <h3 className="text-lg font-bold text-fg mb-3">生态价值 | Ecological Value</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        {data.descCn} <span className="block mt-2 text-xs text-neutral_sub italic">({data.descEn})</span>
                    </p>
                    <div className="bg-bg p-4 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-bold text-fg mb-2 flex items-center gap-2">
                             <Icon name="Target" size={16} className="text-accent" /> 代表物种 | Featured Species
                        </h3>
                        <p className="text-sm font-medium text-gray-600">{data.featured.join('、')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TimelineDetailModal = ({ event, onClose }) => {
    if (!event) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 lg:p-20 overflow-hidden">
            {/* 深色极简遮罩 */}
            <div className="absolute inset-0 bg-[#0C0C0C]/90 backdrop-blur-2xl transition-opacity duration-300" onClick={onClose}></div>
            
            <div className="relative w-full max-w-5xl bg-white rounded-[3.5rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col modal-content h-[85vh] border border-white/20">
                
                {/* 1. 档案头部：双语标签与ID */}
                <div className="p-12 pb-0 flex justify-between items-start relative z-10 shrink-0">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="px-5 py-2 bg-[#4A4238] text-[#F9F8F4] text-[10px] font-black tracking-[0.2em] rounded-full uppercase">
                                Archive / {event.categoryEn}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-gray-300 uppercase tracking-widest">Record. No: {event.year}-LGCY</span>
                        </div>
                        <h2 className="text-7xl font-serif font-black text-gray-900 leading-none">{event.year}</h2>
                        <div className="h-1.5 w-32 bg-amber-500 rounded-full"></div>
                    </div>
                    <button onClick={onClose} className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm group">
                        <X size={24} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* 2. 核心内容：左右叙事架构 */}
                <div className="p-12 pt-16 overflow-y-auto no-scrollbar flex-grow">
                    <div className="mb-20">
                        <h3 className="text-4xl font-serif font-black text-gray-900 mb-2 leading-tight">{event.title}</h3>
                        <p className="text-sm font-bold text-amber-600 uppercase tracking-[0.3em] opacity-60 italic">Historic Record Summary & Witness Testimony</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-20">
                        {/* 左：核心数据指标 (Metrics) */}
                        <div className="md:col-span-5 space-y-12">
                            <div className="bg-[#FBFBFA] p-10 rounded-[3rem] border border-gray-100 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-gray-900">
                                    <Icon name={event.icon} size={120} />
                                </div>
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-10 border-b border-gray-200 pb-4">Witness Metrics / 见证者数据</h4>
                                <div className="space-y-10">
                                    {event.details.metrics.map((m, i) => (
                                        <div key={i} className="flex flex-col">
                                            <span className="text-[13px] font-bold text-gray-400 mb-2">{m.l}</span>
                                            <span className="text-5xl font-serif font-black text-amber-600 tracking-tighter">{m.v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="pl-8 border-l-4 border-emerald-500/20 py-4">
                                <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest block mb-4">Core Insight / 核心观察</span>
                                <p className="text-[17px] text-gray-500 italic leading-[1.8] font-serif">“{event.details.insight}”</p>
                            </div>
                        </div>

                        {/* 右：长篇叙事 (Narrative) */}
                        <div className="md:col-span-7 space-y-16">
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-900"></div>
                                    <h4 className="text-lg font-bold text-gray-900 uppercase tracking-wide">背景与初衷 / Background</h4>
                                </div>
                                <p className="text-[16px] text-gray-600 leading-[2.1] font-serif text-justify pl-6 border-l border-gray-100">{event.details.background}</p>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-900"></div>
                                    <h4 className="text-lg font-bold text-gray-900 uppercase tracking-wide">深远影响 / Impact</h4>
                                </div>
                                <p className="text-[16px] text-gray-600 leading-[2.1] font-serif text-justify pl-6 border-l border-gray-100">{event.details.impact}</p>
                            </section>
                        </div>
                    </div>
                </div>

                {/* 3. 档案页脚：双语申明 */}
                <div className="p-10 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                    <div className="flex flex-col">
                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.25em]">End of Official Record // Conservation Archive 2025</p>
                        <p className="text-[8px] font-bold text-gray-300 uppercase mt-1">Witness verified dataset: EAAFP / Ramsar Secretariat</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="flex -space-x-2">
                             {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"></div>)}
                         </div>
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Global Consensus</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RegisterModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 modal-bg">
            <div className="absolute inset-0 bg-fg/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-card rounded-2xl shadow-soft overflow-hidden p-8 modal-content border border-gray-100">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-fg transition-colors">
                    <Icon name="X" size={24}/>
                </button>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-fg">加入 BirdWatch</h2>
                    <p className="text-sm text-gray-500 mt-2">注册成为志愿者，共同守护迁徙候鸟</p>
                </div>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-fg mb-1">用户名</label>
                        <input type="text" placeholder="Your Name" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent text-sm bg-bg" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-fg mb-1">电子邮箱</label>
                        <input type="email" placeholder="email@example.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent text-sm bg-bg" />
                    </div>
                    <button type="button" className="w-full py-3 bg-accent text-white font-bold rounded-lg hover:bg-[#C99529] transition-colors shadow-md mt-4">
                        立即注册
                    </button>
                </form>
            </div>
        </div>
    );
};

const ContactModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 modal-bg">
            <div className="absolute inset-0 bg-fg/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-card rounded-2xl shadow-soft overflow-hidden p-8 modal-content border border-gray-100">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-fg transition-colors">
                    <Icon name="X" size={24}/>
                </button>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-fg">联系我们</h2>
                    <p className="text-sm text-gray-500 mt-2">有问题或建议？随时告诉我们</p>
                </div>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-fg mb-1">你的邮箱</label>
                        <input type="email" placeholder="email@example.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-secondary_accent text-sm bg-bg" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-fg mb-1">留言内容</label>
                        <textarea rows="4" placeholder="写下你的想法..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-secondary_accent text-sm resize-none bg-bg"></textarea>
                    </div>
                    <button type="button" className="w-full py-3 bg-secondary_accent text-white font-bold rounded-lg hover:opacity-90 transition-colors shadow-md mt-4">
                        发送消息
                    </button>
                </form>
            </div>
        </div>
    );
};

const BrandLogo = ({ className }) => (
    <div 
        className={`flex items-center gap-3 group cursor-pointer ${className}`} 
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
    >
        {/* 图标容器：双层圆环设计 */}
        <div className="relative w-11 h-11 flex items-center justify-center">
            {/* 外环：悬停时旋转 */}
            <div className="absolute inset-0 rounded-full border border-[#4A4238]/20 group-hover:border-[#D9A22E] group-hover:rotate-180 transition-all duration-300 ease-out"></div>
            {/* 内圆：实色背景 */}
            <div className="absolute inset-1 rounded-full bg-[#4A4238] flex items-center justify-center shadow-md group-hover:bg-[#D9A22E] transition-colors duration-500">
                <Icon name="Bird" size={20} className="text-[#F9F8F4]" />
            </div>
        </div>
        
        {/* 文字部分 */}
        <div className="flex flex-col">
            <h1 className="font-serif text-xl font-bold text-[#4A4238] leading-none tracking-tight group-hover:text-[#D9A22E] transition-colors duration-300">
                BirdWatch<span className="text-[#D9A22E] group-hover:text-[#4A4238]">.</span>
            </h1>
            <div className="flex items-center gap-1 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-sans font-bold tracking-[0.2em] uppercase text-[#4A4238]">Conservation</span>
                <span className="w-1 h-1 rounded-full bg-[#D9A22E]"></span>
            </div>
        </div>
    </div>
);


// ==========================================
//  MigrationMap
// ==========================================

const MigrationMap = ({ onNodeClick }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [season, setSeason] = useState('autumn'); 
    const [viewMode, setViewMode] = useState('global');

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
        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
            console.log('✅ ECharts 实例已初始化');
            chartInstance.current.on('click', (params) => {
                if (params.seriesType === 'effectScatter' && params.data.dataId) onNodeClick(params.data.dataId);
            });
        }
        
        const renderChart = () => {
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
                    map: 'world', roam: true, scaleLimit: { min: 1.0, max: 15 },
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

        if (!echarts.getMap('world')) {
            console.log('📥 从 CDN 加载世界地图...');
            fetch('https://cdn.jsdelivr.net/npm/echarts@4.9.0/map/json/world.json')
                .then(res => res.json())
                .then(json => {
                    echarts.registerMap('world', json); 
                    console.log('✅ 世界地图已注册');
                    renderChart();
                })
                .catch(err => {
                    console.warn('❌ CDN 地图加载失败:', err);
                    renderChart();
                });
        } else { 
            console.log('✅ 世界地图已存在，直接渲染');
            renderChart(); 
        }
        
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
            <div className="max-w-[1440px] mx-auto px-12">
                
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
                        
                        {/* 🚀 控制台：中英顺序修正 */}
                        <div className="absolute top-8 left-8 flex flex-col gap-4 z-20 pointer-events-auto">
                            <div className="flex bg-white/70 backdrop-blur-xl p-1.5 rounded-2xl border border-white shadow-xl">
                                <button onClick={() => setSeason('spring')} className={`px-6 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all ${season === 'spring' ? 'bg-[#10B981] text-white' : 'text-gray-400 hover:text-gray-700'}`}>春季 · SPRING</button>
                                <button onClick={() => setSeason('autumn')} className={`px-6 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all ${season === 'autumn' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-gray-700'}`}>秋季 · AUTUMN</button>
                            </div>
                            <div className="flex bg-white/70 backdrop-blur-xl p-1.5 rounded-2xl border border-white shadow-xl w-fit">
                                <button onClick={() => setViewMode('global')} className={`px-6 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all ${viewMode === 'global' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-700'}`}>全球 · GLOBAL</button>
                                <button onClick={() => setViewMode('china')} className={`px-6 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all ${viewMode === 'china' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-700'}`}>区域 · REGIONAL</button>
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

    // 3. ECharts 初始化 (物理修复：确保高度与位移滑行)
    useEffect(() => {
        const renderCharts = () => {
            if (!lineChartRef.current || !radarChartRef.current) return;

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
        const resize = () => { lineInstance.current?.resize(); radarInstance.current?.resize(); };
        window.addEventListener('resize', resize);
        const timer = setTimeout(resize, 200); // 🚀 确保 Grid 布局稳定后捕获高度
        return () => { window.removeEventListener('resize', resize); clearTimeout(timer); };
    }, [currentBirdData]);

    return (
        <section id="data-hub" className="py-40 bg-[#FCFBFA] relative overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-12">
                
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
                                    className={`relative p-8 rounded-[2.5rem] text-left transition-all duration-500 group border overflow-hidden flex flex-col gap-1 ${
                                        isActive 
                                        ? 'bg-white border-amber-200 shadow-[0_30px_60px_-15px_rgba(245,158,11,0.15)] scale-[1.03]' 
                                        : 'bg-white/40 border-transparent hover:bg-white hover:border-gray-100'
                                    }`}
                                >
                                    <div className={`absolute left-0 top-1/4 bottom-1/4 w-1.5 rounded-r-full transition-all duration-500 ${isActive ? 'bg-amber-500' : 'bg-transparent'}`}></div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] mb-2 ${isActive ? 'text-amber-600' : 'text-gray-300'}`}>Sentinel Ref.</span>
                                    <div className={`text-2xl font-serif font-bold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{bird.cn}</div>
                                    <div className={`text-[10px] font-bold tracking-widest uppercase italic ${isActive ? 'text-amber-600/60' : 'text-gray-300'}`}>{bird.en}</div>
                                </button>
                            )
                        })}
                    </div>

                    {/* 右侧：精密数据矩阵 */}
                    <div className="w-full lg:w-3/4 flex flex-col gap-10">
                        
                        {/* A. 顶层：风险仪表与生理指标 (严格对齐) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            
                            {/* 1. 风险指数测量仪 (5/12 宽度) */}
                            <Observer className="md:col-span-5 bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm flex flex-col justify-between h-[400px] relative overflow-hidden">
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
                                    <div className="w-full h-[3px] bg-gray-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-300 ease-out" style={{width: `${riskScore}%`}}></div>
                                    </div>
                                </div>
                            </Observer>

                            {/* 2. 生理指标库 (7/12 宽度) - 彻底修复拥挤问题 */}
                            <Observer className="md:col-span-7 bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm flex flex-col h-[400px] group">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-1 h-3 bg-amber-500 rounded-full"></div>
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
                            <Observer className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm h-[420px] relative">
                                <span className="absolute top-10 left-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Population Dynamics / 种群趋势</span>
                                <div ref={lineChartRef} className="w-full h-full pt-8"></div>
                            </Observer>

                            {/* 4. 多维威胁矩阵 */}
                            <Observer className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm h-[420px] relative">
                                <span className="absolute top-10 left-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Stress Matrix / 威胁矩阵</span>
                                <div ref={radarChartRef} className="w-full h-full pt-4"></div>
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

    // ECharts 地图：大幅提升对比度
    useEffect(() => {
        if (!chartRef.current) return;
        if (chartInstance.current) chartInstance.current.dispose();
        chartInstance.current = echarts.init(chartRef.current);
        
        chartInstance.current.setOption({
            backgroundColor: '#FCFBFA',
            geo: {
                map: 'world', roam: false, silent: true,
                center: [120, 30],
                zoom: 4,
                itemStyle: { 
                    areaColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderWidth: 1 
                }
            }
        });

        if (!echarts.getMap('world')) {
            fetch('https://cdn.jsdelivr.net/npm/echarts@4.9.0/map/json/world.json')
                .then(res => res.json()).then(mapJson => {
                    echarts.registerMap('world', mapJson);
                    // 延迟确保地图注册完成
                    setTimeout(() => {
                        if (chartInstance.current) updateMigrationView();
                    }, 50);
                });
        } else {
            // 地图已注册，延迟调用确保实例准备好
            setTimeout(() => {
                if (chartInstance.current) updateMigrationView();
            }, 50);
        }

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
                <div className="absolute inset-0 w-full h-full" />
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
                                        window.scrollTo({ top: containerRef.current.offsetTop, behavior: 'smooth' });
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
                    <div className="bg-white/40 backdrop-blur-2xl px-8 py-6 rounded-[2rem] border border-white/60 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] w-[20rem]">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100/50 pb-4">
                            <span className="text-lg font-serif font-black tracking-tight text-gray-800">航程志</span>
                            <span className="text-[9px] font-bold text-amber-600 tracking-[0.2em] uppercase">LOG REV. 2025</span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Season</span>
                                <span className="text-sm font-bold text-gray-800">{activeChapter.monthCn}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weather</span>
                                <span className="text-sm font-bold text-emerald-600">晴朗 · CLEAR</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</span>
                                <p className="text-lg font-serif font-bold text-gray-800 leading-none mb-1">{locCn}</p>
                                <p className="text-[9px] font-medium text-gray-400 tracking-tighter uppercase">{locEn}</p>
                            </div>
                            <div className="col-span-2 pt-2">
                                <div className="flex justify-between items-end mb-1.5 text-[8px] font-bold text-gray-400 uppercase">
                                    <span>Progress</span>
                                    <span className="text-amber-600">{Math.round(((activeChapterIndex + 1) / activeBird.chapters.length) * 100)}%</span>
                                </div>
                                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 transition-all duration-300 ease-out" style={{ width: `${((activeChapterIndex + 1) / activeBird.chapters.length) * 100}%` }}></div>
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

                                            <div className="inline-flex flex-col px-10 py-6 bg-white shadow-xl rounded-[2.5rem] border border-gray-50">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
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
                    <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.08)] flex flex-col min-w-[420px] relative overflow-hidden group">
                         <div className="flex justify-between items-center mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
                                <Award size={32} />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Rank / 观测等级</span>
                                <span className="text-sm font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">首席观测员 / LEAD OBSERVER</span>
                            </div>
                        </div>
                        <div className="flex items-end gap-3 mb-8">
                            <span className="text-8xl font-serif font-black text-gray-900 leading-none">{seenBirds.size}</span>
                            <div className="flex flex-col mb-1">
                                <span className="text-2xl font-bold text-gray-300 italic">/ {Object.keys(BIRD_DB).length}</span>
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">Verified Signals</span>
                            </div>
                        </div>
                        <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-600 transition-all duration-300 ease-out" 
                                 style={{ width: `${(seenBirds.size / Object.keys(BIRD_DB).length) * 100}%` }}></div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Archive Completion Index: {Math.round((seenBirds.size / Object.keys(BIRD_DB).length) * 100)}%</p>
                    </div>
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
            <div className="lg:col-span-7 bg-white rounded-[4rem] border border-gray-100 shadow-xl p-16 flex flex-col items-center justify-center relative min-h-[550px] overflow-hidden group">
                <div className="relative z-10">
                    <button 
                        onClick={() => {
                            if(isAudioPlaying) audioRef.current.pause();
                            else audioRef.current.play();
                            setIsAudioPlaying(!isAudioPlaying);
                        }}
                        className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isAudioPlaying ? 'bg-amber-500 scale-110' : 'bg-[#1F2937] hover:scale-105'}`}
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
                            <div key={i} className={`flex-grow rounded-full transition-all duration-300 ${isAudioPlaying ? 'bg-amber-500' : 'bg-gray-100 h-1'}`}
                                 style={{ height: isAudioPlaying ? `${Math.random() * 100}%` : '4px' }}></div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-5 flex flex-col justify-center gap-6">
                <div className="mb-4">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Interpretation / 信号解译</span>
                    <h4 className="text-2xl font-serif font-black text-gray-900 mt-2">辨识采集到的声学特征：</h4>
                </div>
                {options.map((bird) => (
                    <button
                        key={bird.id}
                        disabled={gameState === 'revealed'}
                        onClick={() => { setGameState('revealed'); setIsAudioPlaying(false); audioRef.current?.pause(); }}
                        className={`p-8 rounded-[2.5rem] border-2 text-left flex justify-between items-center transition-all duration-500 ${
                            gameState === 'revealed'
                            ? (bird.id === currentBird?.id ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl' : 'bg-gray-100 border-transparent opacity-40')
                            : 'bg-white border-gray-100 hover:border-amber-400 hover:translate-x-4'
                        }`}
                    >
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight">{bird.cn}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">{bird.en}</span>
                        </div>
                    </button>
                ))}
                {gameState === 'revealed' && (
                    <button onClick={startRound} className="mt-6 w-full py-5 bg-gray-900 text-white rounded-[2rem] font-bold text-sm tracking-widest hover:bg-amber-600 transition-colors animate-reveal uppercase">
                        Next Signal / 下一段信号
                    </button>
                )}
            </div>
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
                                通过透镜，我们直观地看到了生命驿站的消逝。曾经连绵的湿地被切割成“生态孤岛”，这种破碎化使得候鸟在万里迁徙中越来越难找到安全的落脚点。
                            </p>
                            <p className="text-[10px] text-gray-400 font-serif italic leading-relaxed">Through the lens, we witness the fading of life’s vital stops. Fragmented into "ecological islands," these wetlands no longer offer the continuous sanctuary migratory birds desperately need.</p>
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
                                            <div className="w-14 h-14 rounded-full bg-white border-4 border-gray-50 shadow-md flex items-center justify-center text-amber-500 group-hover:bg-amber-600 group-hover:text-white group-hover:scale-125 transition-all duration-500">
                                                <Icon name={item.icon} size={20} strokeWidth={2.5} />
                                            </div>
                                        </div>

                                        <div className="hidden md:block md:w-1/2"></div>
                                        <div className={`w-full md:w-1/2 pl-28 md:pl-0 ${index % 2 === 0 ? 'md:pr-28 md:text-right' : 'md:pl-28'}`}>
                                            <div className="bg-white p-14 rounded-[4rem] border border-gray-50 hover:border-amber-200 hover:shadow-[0_80px_150px_-50px_rgba(245,158,11,0.15)] transition-all duration-300 relative overflow-hidden group/card">
                                                {/* 年份巨型水印 */}
                                                <span className={`absolute -top-10 font-serif font-black text-gray-50 text-[10rem] -z-10 select-none transition-colors group-hover/card:text-amber-50/50 ${index % 2 === 0 ? '-right-10' : '-left-10'}`}>
                                                    {item.year}
                                                </span>
                                                
                                                <div className={`flex items-center gap-5 mb-8 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                                                    <span className="text-4xl font-serif font-black text-amber-600">{item.year}</span>
                                                    <span className="w-2.5 h-2.5 rounded-full bg-gray-100"></span>
                                                    <span className="text-[13px] font-black text-gray-300 uppercase tracking-[0.3em]">{item.categoryEn}</span>
                                                </div>

                                                <h3 className="text-3xl font-bold text-gray-900 mb-8 group-hover/card:text-amber-600 transition-colors leading-tight">
                                                    {item.title}
                                                </h3>
                                                <p className="text-lg text-gray-500 leading-relaxed font-serif opacity-80 mb-10 line-clamp-2">
                                                    {item.desc}
                                                </p>
                                                
                                                <div className={`flex items-center gap-4 text-xs font-black text-amber-600 uppercase tracking-[0.3em] opacity-0 group-hover/card:opacity-100 translate-y-4 group-hover/card:translate-y-0 transition-all duration-300 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
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
                                <Observer key={bird.id} delay={i * 50}>
                                    <div 
                                        onClick={() => onSelectBird(bird.id)}
                                        className="group cursor-pointer bg-white rounded-[3.5rem] border border-gray-50 overflow-hidden transition-all duration-300 hover:-translate-y-4 hover:shadow-[0_60px_100px_-40px_rgba(0,0,0,0.1)]"
                                    >
                                        <div className="relative aspect-[11/9] overflow-hidden bg-gray-100">
                                            <img 
                                                src={bird.img} 
                                                alt={bird.cn}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                onError={(e) => { e.target.src=`https://placehold.co/600x450/FBFBFA/A1A1AA?text=${bird.cn}`; }}
                                            />
                                            {/* 琥珀色动态徽章 */}
                                            <div className={`absolute top-6 right-6 px-5 py-2 rounded-full backdrop-blur-md text-[10px] font-black tracking-[0.1em] text-white shadow-xl ${
                                                isCR ? 'bg-[#A0522D]/90' : 'bg-[#D9A22E]/90'
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
                                                    <h3 className="text-3xl font-serif font-black text-gray-900 mb-1.5 group-hover:text-amber-600 transition-colors">
                                                        {bird.cn}
                                                    </h3>
                                                    <span className="text-[10px] font-bold text-gray-300 tracking-[0.2em] uppercase italic leading-none">
                                                        {bird.en}
                                                    </span>
                                                </div>
                                                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200 group-hover:bg-amber-50 group-hover:text-amber-500 transition-all duration-500">
                                                    <ArrowRight size={18} className="-rotate-45 group-hover:rotate-0 transition-transform" />
                                                </div>
                                            </div>
                                            
                                            <p className="text-gray-500 text-base font-serif leading-[1.8] opacity-80 line-clamp-2 mb-10 max-w-[90%]">
                                                {bird.descCn}
                                            </p>

                                            <div className="flex items-center gap-8 pt-8 border-t border-gray-50">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5">种群估算 · POPULATION</span>
                                                    <span className="text-sm font-bold text-gray-700 font-serif">{bird.pop ? bird.pop.toLocaleString() : '未知'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5">主要分布 · RANGE</span>
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
    return (
        <section className="relative py-32 bg-[#1F2937] overflow-hidden">
            {/* 动态背景纹理 */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: `radial-gradient(#F9F8F4 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
            </div>
            
            {/* 飞鸟装饰 */}
            <div className="absolute top-10 left-10 text-white/5 animate-pulse duration-[5s]">
                <Bird size={200} strokeWidth={0.5} />
            </div>
            <div className="absolute bottom-0 right-0 text-white/5 rotate-180">
                <Feather size={300} strokeWidth={0.5} />
            </div>

            <div className="max-w-4xl mx-auto px-12 relative z-10 text-center">
                <Observer>
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.3em]">Join the Network</span>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-serif font-black text-white mb-8 tracking-tight leading-tight">
                        成为它们的<br/>
                        <span className="text-amber-500 italic relative inline-block">
                            守望者
                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-amber-500/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </span>
                    </h2>

                    <p className="text-lg md:text-xl text-gray-400 font-serif leading-relaxed mb-12 max-w-2xl mx-auto">
                        候鸟不需要护照，但它们需要安全的落脚点。<br/>
                        你的每一次观测、每一次分享、每一份关注，都在为这条数千公里的生命线注入力量。
                        <span className="block mt-4 text-xs font-sans text-gray-600 uppercase tracking-widest">
                            They don't need passports, but they need sanctuary. Your witness is their shield.
                        </span>
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button 
                            onClick={onJoin}
                            className="group relative px-10 py-5 bg-white text-[#1F2937] rounded-full font-bold text-sm tracking-[0.2em] uppercase overflow-hidden hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-[0_20px_50px_-10px_rgba(255,255,255,0.1)]"
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
                                    className="group text-[12px] font-bold text-gray-400 hover:text-amber-600 transition-colors text-left flex items-center gap-3"
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
                                className="w-full bg-transparent border-b border-gray-200 py-2 text-[11px] font-mono focus:outline-none focus:border-amber-500 transition-colors"
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
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
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
            <nav className="sticky top-0 z-50 px-6 md:px-10 py-4 flex justify-between items-center bg-[#F9F8F4]/90 backdrop-blur-md border-b border-[#4A4238]/5 transition-all duration-300">
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
                        className="px-6 py-2.5 bg-[#4A4238] text-[#F9F8F4] text-[10px] font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#D9A22E] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                        Join Us
                    </button>
                </div>
                
                {/* 顶部阅读进度条 */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-[#D9A22E]" style={{width: `${scrollProgress * 100}%`}}></div>
            </nav>

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

                    {/* 2. 精密 HUD 边角系统 (取代黑色装饰条) */}
                    <div className="absolute inset-0 p-16 flex flex-col justify-between pointer-events-none z-20">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse"></div>
                                    <p className="text-[10px] font-mono font-bold text-[#1F2937] uppercase tracking-[0.4em]">Tracking established</p>
                                </div>
                                <p className="text-[9px] font-mono text-gray-400 uppercase tracking-[0.3em] pl-4">31.2304° N // 121.4737° E</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-mono font-black text-[#1F2937] uppercase tracking-[0.4em]">Archive Rev. 2025</p>
                                <p className="text-[9px] font-mono text-gray-400 uppercase tracking-[0.3em] mt-1">EAAFP Global Link // Active</p>
                            </div>
                        </div>
        
                        <div className="flex justify-between items-end">
                            <div className="max-w-[200px] border-l border-gray-200 pl-6">
                                <p className="text-[9px] font-serif italic text-gray-400 leading-relaxed tracking-wide">
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