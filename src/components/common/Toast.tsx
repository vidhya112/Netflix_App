import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import { hideToast } from "../../features/configSlice";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const Toast: React.FC = () => {
    const dispatch = useDispatch();
    const toast = useSelector((state: RootState) => state.config.toast);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => {
            dispatch(hideToast());
        }, 3500);
        return () => clearTimeout(timer);
    }, [toast, dispatch]);

    if (!toast) return null;

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
        warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1e1e1e]/95 backdrop-blur-md border border-white/10 text-white px-5 py-3.5 rounded-xl shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-5 duration-300">
            {icons[toast.type || "info"]}
            <span className="text-sm font-medium pr-2">{toast.message}</span>
            <button
                onClick={() => dispatch(hideToast())}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
