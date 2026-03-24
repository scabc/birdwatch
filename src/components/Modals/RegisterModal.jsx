import React from 'react';
import { X } from 'lucide-react';

const RegisterModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-bg">
            <div className="absolute inset-0 bg-fg/40 backdrop-blur-sm z-[201]" onClick={onClose} />
            <div className="relative w-full max-w-md bg-card rounded-2xl shadow-soft overflow-hidden p-8 modal-content border border-gray-100">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-fg transition-colors">
                    <X size={24} />
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

export default RegisterModal;
