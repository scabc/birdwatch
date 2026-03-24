import React from 'react';
import { X, Target } from 'lucide-react';
import { HABITAT_DB } from '../../data/habitats';

const HabitatDetailModal = ({ habitatId, onClose }) => {
    const data = HABITAT_DB[habitatId];
    if (!data) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-bg">
            <div className="absolute inset-0 bg-[#3D4A3A]/60 z-[201]" onClick={onClose} />
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#FAF8F5] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row modal-content border border-[#3D4A3A]/10">
                <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-100 shrink-0">
                    <img src={data.img} alt={data.cn} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/800x600/D4D4D8/465B49?text=Habitat' }} />
                    <button onClick={onClose} className="absolute top-4 left-4 w-10 h-10 bg-[#3D4A3A]/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#3D4A3A]/70 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                    <div className="space-y-1 mb-6">
                        <h2 className="text-3xl font-bold text-[#3D4A3A]">{data.cn}</h2>
                        <p className="text-xl text-[#6B7561]">{data.en}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {data.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-[#5C7A4A]/10 text-[#5C7A4A] text-xs font-semibold rounded-full border border-[#5C7A4A]/20">{tag}</span>
                        ))}
                    </div>
                    <h3 className="text-lg font-bold text-[#3D4A3A] mb-3">生态价值 | Ecological Value</h3>
                    <p className="text-sm text-[#6B7561] leading-relaxed mb-6">
                        {data.descCn} <span className="block mt-2 text-xs text-[#9BA591] italic">({data.descEn})</span>
                    </p>
                    <div className="bg-white p-4 rounded-xl border border-[#3D4A3A]/10">
                        <h3 className="text-sm font-bold text-[#3D4A3A] mb-2 flex items-center gap-2">
                            <Target size={16} className="text-[#C49A3C]" /> 代表物种 | Featured Species
                        </h3>
                        <p className="text-sm font-medium text-[#6B7561]">{data.featured.join('、')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HabitatDetailModal;
