import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { auth, sendPasswordResetEmail } from "../../utils/firebase";
import { showToast } from "../../features/configSlice";
import { X, Mail, AlertCircle, CheckCircle2, ArrowRight, KeyRound } from "lucide-react";

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenResetModal?: (code?: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
    isOpen,
    onClose,
    onOpenResetModal,
}) => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setErrorMessage("Please enter your registered email address.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const res = await sendPasswordResetEmail(auth, trimmedEmail);
            setIsSuccess(true);
            dispatch(
                showToast({
                    message: "Password reset instructions sent successfully!",
                    type: "success",
                })
            );

            if (res?.resetCode) {
                setGeneratedCode(res.resetCode);
            }
        } catch (error: any) {
            console.warn("Reset email error:", error);
            let msg = error.message;
            if (error.code === "auth/user-not-found") {
                msg = "No account found with this email address.";
            } else if (error.code === "auth/invalid-email") {
                msg = "The email address format is invalid.";
            } else if (error.code === "auth/too-many-requests") {
                msg = "Too many reset attempts. Please wait a few minutes and try again.";
            }
            setErrorMessage(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-md bg-[#181818] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-white space-y-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-2">
                        <KeyRound className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Forgot Password?</h2>
                    <p className="text-xs sm:text-sm text-gray-400">
                        Enter the email associated with your Netflix account and we'll help you reset it.
                    </p>
                </div>

                {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrorMessage(null);
                                    }}
                                    placeholder="name@example.com"
                                    className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                                    autoFocus
                                />
                                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-500/20 p-3 rounded-lg animate-in fade-in duration-200">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] text-sm flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <span>Sending Instructions...</span>
                            ) : (
                                <>
                                    <span>Send Reset Link</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm space-y-2">
                            <div className="flex items-center gap-2 font-semibold text-emerald-400">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <span>Reset Instructions Sent!</span>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed">
                                We've dispatched password reset instructions to <strong className="text-white">{email}</strong>. Please check your inbox and follow the link to set a new password.
                            </p>
                        </div>

                        {generatedCode && onOpenResetModal && (
                            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs space-y-3">
                                <div className="text-blue-300 font-semibold">Demo Quick-Reset Code:</div>
                                <div className="font-mono bg-black/60 px-3 py-2 rounded-lg border border-white/10 text-white text-center select-all">
                                    {generatedCode}
                                </div>
                                <button
                                    onClick={() => {
                                        onClose();
                                        onOpenResetModal(generatedCode);
                                    }}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors"
                                >
                                    Proceed to Reset Password
                                </button>
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors"
                        >
                            Back to Sign In
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
