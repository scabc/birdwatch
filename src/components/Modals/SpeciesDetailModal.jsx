import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Ruler, Zap, Users, TrendingDown, Bird, Globe, AlertTriangle } from 'lucide-react';
import { BIRD_DB } from '../../data/birds';

const SpeciesDetailModal = ({ birdId, onClose }) => {
    const data = BIRD_DB[birdId];
    const audioRef = useRef(null);
    const imageContainerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

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

    if (!data) return null;

    const isCR = data.status === 'CR';
    const themeColor = isCR ? '#A64B2A' : '#C49A3C';

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 md:p-16 lg:p-24 overflow-hidden">
            <div className="absolute inset-0 bg-[#3D4A3A]/70 transition-opacity duration-300" onClick={onClose} />

            <div className="relative w-full max-w-5xl h-[82vh] bg-white rounded-[3rem] shadow-[0_80px_150px_-40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row modal-content border border-white/10">

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

                    <button onClick={onClose} className="absolute top-8 left-8 w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 z-30">
                        <X size={20} strokeWidth={1.5} />
                    </button>

                    {data.sound && (
                        <div className="absolute bottom-8 left-8 z-30">
                            <button onClick={() => {
                                if (isPlaying) audioRef.current?.pause();
                                else audioRef.current?.play();
                                setIsPlaying(!isPlaying);
                            }}
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

                <div className="w-full lg:w-[55%] h-full p-10 md:p-14 overflow-y-auto no-scrollbar bg-white flex flex-col relative text-[#1F2937]">

                    <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-3 bg-amber-500 rounded-full"></div>
                            <span className="text-[9px] font-mono font-bold tracking-[0.4em] text-amber-600 uppercase">SPECIMEN ID: {birdId.slice(0, 5).toUpperCase()}</span>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest text-white ${isCR ? 'animate-pulse-cr' : ''}`} style={{ backgroundColor: themeColor }}>
                            {isCR ? '极危 · CR' : '濒危 · EN'}
                        </div>
                    </div>

                    <div className="mb-12">
                        <h2 className="text-5xl font-serif font-black tracking-tighter text-gray-900 mb-4 leading-none">{data.cn}</h2>
                        <div className="space-y-1">
                            <p className="text-lg font-serif text-gray-400 italic tracking-wide lowercase opacity-80">{data.en}</p>
                            <p className="text-[9px] font-mono font-bold text-gray-300 uppercase tracking-[0.2em]">{data.en.replace(/ /g, '_').toUpperCase()}_SPECIES</p>
                        </div>
                    </div>

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

                    <div className="space-y-10 mb-16">
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

                        <section>
                            <div className="flex items-center gap-3 mb-6 text-red-600/50">
                                <AlertTriangle size={16} strokeWidth={1.5} />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Threats · 生存威胁</h3>
                            </div>
                            <div className="flex flex-wrap gap-2 pl-7 border-l border-gray-100">
                                {[
                                    { cn: '栖息地丧失', en: 'HABITAT LOSS' },
                                    { cn: '人为干扰', en: 'DISTURBANCE' },
                                    { cn: '非法捕猎', en: 'POACHING' }
                                ].map(t => (
                                    <div key={t.en} className="px-4 py-2 bg-red-50/50 border border-red-100 rounded-xl flex flex-col items-center">
                                        <span className="text-[10px] font-bold text-red-600">{t.cn}</span>
                                        <span className="text-[7px] font-black text-red-400 tracking-tighter mt-0.5">{t.en}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="mt-auto pt-10 border-t border-gray-50">
                        <div className="relative p-8 bg-gray-50 rounded-[2.5rem] overflow-hidden">
                            <p className="relative z-10 text-[15px] font-serif text-gray-500 leading-relaxed italic opacity-80 pl-6">
                                "{data.descCn}"
                            </p>
                        </div>
                        <div className="flex justify-between items-center mt-6 px-4">
                            <p className="text-[8px] font-mono text-gray-300 tracking-[0.25em] uppercase">Red List Record 2025 // Verification Report</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpeciesDetailModal;
