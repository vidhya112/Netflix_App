import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import { setSessions } from "../../features/userSlice";
import { showToast } from "../../features/configSlice";
import {
    fetchUserSessions,
    revokeUserSession,
    revokeAllOtherSessions,
} from "../../services/firestoreService";
import { UserSession } from "../../types/user.types";
import {
    X,
    Laptop,
    Smartphone,
    Globe,
    ShieldAlert,
    CheckCircle2,
    LogOut,
    RefreshCw,
} from "lucide-react";

interface SessionManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SessionManagerModal: React.FC<SessionManagerModalProps> = ({
    isOpen,
    onClose,
}) => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const sessions = useSelector((state: RootState) => state.user.sessions);

    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadSessions = React.useCallback(async () => {
        if (!user || !user.uid) return;
        setIsLoading(true);
        try {
            const list = await fetchUserSessions(user.uid);
            dispatch(setSessions(list));
        } catch (error) {
            console.error("Failed to load sessions:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user, dispatch]);

    useEffect(() => {
        let isMounted = true;
        if (isOpen && user?.uid) {
            fetchUserSessions(user.uid)
                .then((list) => {
                    if (isMounted) dispatch(setSessions(list));
                })
                .catch((err) => console.error(err));
        }
        return () => {
            isMounted = false;
        };
    }, [isOpen, user?.uid, dispatch]);

    if (!isOpen) return null;

    const handleRevokeSingle = async (session: UserSession) => {
        if (!user?.uid) return;
        setActionLoading(session.id);
        try {
            await revokeUserSession(user.uid, session.id);
            dispatch(
                showToast({
                    message: `Session terminated: ${session.deviceName}`,
                    type: "info",
                })
            );
            await loadSessions();
        } catch {
            dispatch(showToast({ message: "Failed to revoke session", type: "error" }));
        } finally {
            setActionLoading(null);
        }
    };

    const handleRevokeAllOther = async () => {
        if (!user?.uid) return;
        setActionLoading("all_other");
        try {
            await revokeAllOtherSessions(user.uid);
            dispatch(
                showToast({
                    message: "Successfully signed out all other devices.",
                    type: "success",
                })
            );
            await loadSessions();
        } catch {
            dispatch(showToast({ message: "Failed to sign out other devices", type: "error" }));
        } finally {
            setActionLoading(null);
        }
    };

    const getDeviceIcon = (session: UserSession) => {
        const lower = session.os.toLowerCase();
        if (lower.includes("android") || lower.includes("ios") || lower.includes("iphone")) {
            return <Smartphone className="w-5 h-5 text-purple-400" />;
        }
        if (lower.includes("win") || lower.includes("mac") || lower.includes("linux")) {
            return <Laptop className="w-5 h-5 text-blue-400" />;
        }
        return <Globe className="w-5 h-5 text-emerald-400" />;
    };

    const otherActiveSessionsCount = sessions.filter(
        (s) => !s.isCurrentSession && s.status === "active"
    ).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-xl bg-[#181818] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-white/10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                                Security & Active Sessions
                            </h2>
                        </div>
                        <p className="text-xs text-gray-400">
                            Manage devices and browsers currently logged into this Netflix account.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body & Session List */}
                <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                            Logged-In Devices ({sessions.length})
                        </span>
                        <button
                            onClick={loadSessions}
                            disabled={isLoading}
                            className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                            <span>Refresh</span>
                        </button>
                    </div>

                    {sessions.length === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-500">
                            No active sessions found.
                        </div>
                    ) : (
                        sessions.map((session) => {
                            const isCurrent = session.isCurrentSession;
                            const isRevoked = session.status === "revoked";

                            return (
                                <div
                                    key={session.id}
                                    className={`p-4 rounded-xl border transition-all ${
                                        isCurrent
                                            ? "bg-red-950/20 border-red-500/30"
                                            : isRevoked
                                            ? "bg-white/[0.02] border-white/5 opacity-60"
                                            : "bg-white/[0.04] border-white/10 hover:border-white/20"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                                                {getDeviceIcon(session)}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-semibold text-white">
                                                        {session.deviceName}
                                                    </span>
                                                    {isCurrent && (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Current Device
                                                        </span>
                                                    )}
                                                    {isRevoked && (
                                                        <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-[10px] font-semibold border border-gray-500/30">
                                                            Revoked
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-400 flex items-center gap-3">
                                                    <span>Browser: {session.browser}</span>
                                                    <span>•</span>
                                                    <span>Last Active: {new Date(session.lastActive).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {!isCurrent && !isRevoked && (
                                            <button
                                                onClick={() => handleRevokeSingle(session)}
                                                disabled={actionLoading === session.id}
                                                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                                            >
                                                {actionLoading === session.id ? "Revoking..." : "Revoke"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <button
                        onClick={handleRevokeAllOther}
                        disabled={otherActiveSessionsCount === 0 || actionLoading === "all_other"}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of All Other Devices ({otherActiveSessionsCount})</span>
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionManagerModal;
