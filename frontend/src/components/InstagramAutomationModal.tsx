
import { useState } from 'react';
import { X, Instagram } from 'lucide-react';
import api from '../api/client';

interface InstagramAutomationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

export const InstagramAutomationModal: React.FC<InstagramAutomationModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onError,
}) => {
    const [message, setMessage] = useState('');
    const [maxMessages, setMaxMessages] = useState(10);
    const [useRequests, setUseRequests] = useState(true); // Default to true
    const [clearData, setClearData] = useState(false); // Default to false
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await api.post('/automation/instagram/start', {
                message,
                maxMessages,
                useRequests,
                clearData,
            });

            onSuccess(`Instagram automation started! Sending ${maxMessages} messages.`);
            onClose();
        } catch (error) {
            console.error(error);
            onError('Failed to start Instagram automation. Check backend logs.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-tr from-purple-500 to-pink-500 text-white p-2 rounded-lg">
                        <Instagram className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Instagram DM Auto</h2>
                        <p className="text-sm text-slate-500">Automate direct message replies</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Reply Message *
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Hey! Thanks for correcting me..."
                            required
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Max Messages
                        </label>
                        <input
                            type="number"
                            value={maxMessages}
                            onChange={(e) => setMaxMessages(parseInt(e.target.value) || 10)}
                            min="1"
                            max="50"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">Limit to prevent flagging (Max 50 recommended)</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="useRequests"
                            checked={useRequests}
                            onChange={(e) => setUseRequests(e.target.checked)}
                            className="w-4 h-4 text-pink-600 bg-slate-100 border-slate-300 rounded focus:ring-pink-500 focus:ring-2"
                        />
                        <label htmlFor="useRequests" className="text-sm font-medium text-slate-700">
                            Send to Requests (Message Requests tab)
                        </label>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="clearData"
                            checked={clearData}
                            onChange={(e) => setClearData(e.target.checked)}
                            className="w-4 h-4 text-pink-600 bg-slate-100 border-slate-300 rounded focus:ring-pink-500 focus:ring-2"
                        />
                        <label htmlFor="clearData" className="text-sm font-medium text-slate-700">
                            Clear Instagram Data (Force Fresh Login)
                        </label>
                    </div>

                    <div className="bg-pink-50 border border-pink-100 rounded-lg p-3">
                        <p className="text-xs text-pink-800">
                            <strong>Note:</strong> Requires active login in the automation browser.
                            The system will open Instagram and reply to the latest chats.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !message}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/25"
                        >
                            {isSubmitting ? 'Starting...' : 'Start Automation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
