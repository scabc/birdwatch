import React from 'react';
import { Bird } from 'lucide-react';

const BrandLogo = ({ className }) => (
    <div
        className={`flex items-center gap-3 group cursor-pointer ${className}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
        <div className="relative w-11 h-11 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#4A4238]/20 group-hover:border-[#D9A22E] group-hover:rotate-180 transition-all duration-300 ease-out"></div>
            <div className="absolute inset-1 rounded-full bg-[#4A4238] flex items-center justify-center shadow-md group-hover:bg-[#D9A22E] transition-colors duration-500">
                <Bird size={20} className="text-[#F9F8F4]" />
            </div>
        </div>

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

export default BrandLogo;
