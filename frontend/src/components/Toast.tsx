import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                {type === 'success' ? (
                    <CheckCircle className="size-5 flex-shrink-0" />
                ) : (
                    <XCircle className="size-5 flex-shrink-0" />
                )}
                <p className="text-sm font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="ml-2 text-current opacity-60 hover:opacity-100 transition-opacity"
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
};
