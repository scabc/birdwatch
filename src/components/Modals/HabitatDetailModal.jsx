import React from 'react';
import { X, Target } from 'lucide-react';
import { HABITAT_DB } from '../../data/habitats';

const HabitatDetailModal = ({ habitatId, onClose }) => {
    const data = HABITAT_DB[habitatId];
    if (!data) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-bg">
            <div className="absolute inset-0 bg-fg/40 backdrop-blur-sm z-[201]" onClick={onClose} />
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-card rounded-3xl shadow-soft overflow-hidden flex flex-col md:flex-row modal-content">
                <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-100 shrink-0">
                    <img src={data.img} alt={data.cn} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/800x600/D4D4D8/465B49?text=Habitat' }} />
                    <button onClick={onClose} className="absolute top-4 left-4 w-10 h-10 bg-fg/30 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-fg/50 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
                    <div className="space-y-1 mb-6">
                        <h2 className="text-3xl font-bold text-fg">{data.cn}</h2>
                        <p className="text-xl text-neutral_sub">{data.en}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {data.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-secondary_accent/10 text-secondary_accent text-xs font-semibold rounded-full border border-secondary_accent/20">{tag}</span>
                        ))}
                    </div>
                    <h3 className="text-lg font-bold text-fg mb-3">生态价值 | Ecological Value</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        {data.descCn} <span className="block mt-2 text-xs text-neutral_sub italic">({data.descEn})</span>
                    </p>
                    <div className="bg-bg p-4 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-bold text-fg mb-2 flex items-center gap-2">
                            <Target size={16} className="text-accent" /> 代表物种 | Featured Species
                        </h3>
                        <p className="text-sm font-medium text-gray-600">{data.featured.join('、')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HabitatDetailModal;
