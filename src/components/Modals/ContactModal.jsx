import React from 'react';
import { X } from 'lucide-react';

const ContactModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-bg">
            <div className="absolute inset-0 bg-fg/40 backdrop-blur-sm z-[201]" onClick={onClose} />
            <div className="relative w-full max-w-md bg-card rounded-2xl shadow-soft overflow-hidden p-8 modal-content border border-gray-100">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-fg transition-colors">
                    <X size={24} />
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

export default ContactModal;
