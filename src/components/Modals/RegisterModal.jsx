import React from 'react';
import { X } from 'lucide-react';

const RegisterModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-bg">
            <div className="absolute inset-0 bg-[#3D4A3A]/60 z-[201]" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#FAF8F5] rounded-2xl shadow-2xl overflow-hidden p-8 modal-content border border-[#3D4A3A]/10">
                <button onClick={onClose} className="absolute top-4 right-4 text-[#6B7561] hover:text-[#3D4A3A] transition-colors">
                    <X size={24} />
                </button>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#3D4A3A]">加入 BirdWatch</h2>
                    <p className="text-sm text-[#6B7561] mt-2">注册成为志愿者，共同守护迁徙候鸟</p>
                </div>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#3D4A3A] mb-1">用户名</label>
                        <input type="text" placeholder="Your Name" className="w-full px-4 py-2 border border-[#3D4A3A]/10 rounded-lg focus:outline-none focus:border-[#C49A3C] text-sm bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#3D4A3A] mb-1">电子邮箱</label>
                        <input type="email" placeholder="email@example.com" className="w-full px-4 py-2 border border-[#3D4A3A]/10 rounded-lg focus:outline-none focus:border-[#C49A3C] text-sm bg-white" />
                    </div>
                    <button type="button" className="w-full py-3 bg-[#C49A3C] text-white font-bold rounded-lg hover:bg-[#9A7A2E] transition-colors shadow-md mt-4">
                        立即注册
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterModal;
