import React from 'react';
import { X } from 'lucide-react';

const RegisterModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-bg">
            <div className="absolute inset-0 bg-[#3D4A3A]/60 z-[201]" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_80px_100px_-40px_rgba(0,0,0,0.4)] overflow-hidden p-10 modal-content border border-gray-100">
                <button onClick={onClose} className="absolute top-6 right-6 w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all">
                    <X size={20} strokeWidth={1.5} />
                </button>
                <div className="text-center mb-10 pt-4">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                        <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-amber-600 uppercase">Join BirdWatch</span>
                    </div>
                    <h2 className="text-3xl font-serif font-black text-gray-900 tracking-tight mb-2">加入 BirdWatch</h2>
                    <p className="text-sm text-gray-400">注册成为志愿者，共同守护迁徙候鸟</p>
                </div>
                <form className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">用户名</label>
                        <input type="text" placeholder="Your Name" className="w-full px-5 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 text-sm transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">电子邮箱</label>
                        <input type="email" placeholder="email@example.com" className="w-full px-5 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-50 text-sm transition-all" />
                    </div>
                    <button type="button" className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-md shadow-amber-100 mt-6">
                        立即注册
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterModal;
