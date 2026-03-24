import React from 'react';
import { X, Target } from 'lucide-react';
import { HABITAT_DB } from '../../data/habitats';

const HabitatDetailModal = ({ habitatId, onClose }) => {
    const data = HABITAT_DB[habitatId];
    if (!data) return null;

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 modal-bg">
            <div className="absolute inset-0 bg-[#3D4A3A]/70 z-[599]" onClick={onClose} />
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-[0_80px_120px_-40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row modal-content border border-gray-100 z-[601]">
                <div className="w-full md:w-1/2 h-72 md:h-auto relative bg-gray-100 shrink-0">
                    <img src={data.img} alt={data.cn} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/800x600/D4D4D8/465B49?text=Habitat' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                    <button onClick={onClose} className="absolute top-6 left-6 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20 z-30">
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>
                <div className="w-full md:w-1/2 p-10 md:p-14 overflow-y-auto no-scrollbar">
                    <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
                        <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-emerald-600 uppercase">Habitat ID: {habitatId.slice(0, 5).toUpperCase()}</span>
                    </div>
                    <div className="space-y-1 mb-10">
                        <h2 className="text-4xl font-serif font-black text-gray-900 tracking-tight leading-none">{data.cn}</h2>
                        <p className="text-lg font-serif text-gray-400 italic tracking-wide">{data.en}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-10">
                        {data.tags.map((tag, i) => (
                            <span key={i} className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">{tag}</span>
                        ))}
                    </div>
                    <div className="space-y-8">
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4 flex items-center gap-2">
                                <Target size={14} className="text-amber-500" /> 生态价值 | Ecological Value
                            </h3>
                            <p className="text-[15px] font-serif text-gray-600 leading-[1.9] opacity-90">
                                {data.descCn}
                            </p>
                            <p className="text-[11px] text-gray-300 font-sans italic mt-3 tracking-wide">({data.descEn})</p>
                        </section>
                        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                代表物种 | Featured Species
                            </h3>
                            <p className="text-[13px] font-medium text-gray-500">{data.featured.join('、')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HabitatDetailModal;
