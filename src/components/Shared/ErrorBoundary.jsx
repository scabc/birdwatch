import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[50vh] flex items-center justify-center bg-[#FCFBFA]">
                    <div className="text-center p-12 bg-white rounded-[3rem] shadow-xl max-w-md mx-4">
                        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertTriangle size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                            页面出现异常
                        </h2>
                        <p className="text-gray-500 font-serif mb-8">
                            部分内容加载失败，请尝试刷新页面
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-[#1F2937] text-white rounded-full font-bold text-sm hover:bg-amber-600 transition-colors"
                        >
                            <RefreshCw size={16} />
                            重试
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
