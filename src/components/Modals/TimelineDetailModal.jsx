import React from 'react';
import { X } from 'lucide-react';

const TimelineDetailModal = ({ event, onClose }) => {
    if (!event) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 lg:p-20 overflow-hidden">
            <div className="absolute inset-0 bg-[#0C0C0C]/90 backdrop-blur-2xl transition-opacity duration-300" onClick={onClose} />

            <div className="relative w-full max-w-5xl bg-white rounded-[3.5rem] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col modal-content h-[85vh] border border-white/20">

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

                <div className="p-12 pt-16 overflow-y-auto no-scrollbar flex-grow">
                    <div className="mb-20">
                        <h3 className="text-4xl font-serif font-black text-gray-900 mb-2 leading-tight">{event.title}</h3>
                        <p className="text-sm font-bold text-amber-600 uppercase tracking-[0.3em] opacity-60 italic">Historic Record Summary & Witness Testimony</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-20">
                        <div className="md:col-span-5 space-y-12">
                            <div className="bg-[#FBFBFA] p-10 rounded-[3rem] border border-gray-100 relative group overflow-hidden">
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
                                <p className="text-[17px] text-gray-500 italic leading-[1.8] font-serif">"{event.details.insight}"</p>
                            </div>
                        </div>

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

                <div className="p-10 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
                    <div className="flex flex-col">
                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.25em]">End of Official Record // Conservation Archive 2025</p>
                        <p className="text-[8px] font-bold text-gray-300 uppercase mt-1">Witness verified dataset: EAAFP / Ramsar Secretariat</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineDetailModal;
