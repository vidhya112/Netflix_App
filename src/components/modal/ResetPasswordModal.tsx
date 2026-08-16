import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { auth, confirmPasswordReset, verifyPasswordResetCode } from "../../utils/firebase";
import { showToast } from "../../features/configSlice";
import { X, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

interface ResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialCode?: string;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
    isOpen,
    onClose,
    initialCode = "",
}) => {
    const dispatch = useDispatch();
    const [code, setCode] = useState(initialCode);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

    useEffect(() => {
        if (initialCode) {
            setCode(initialCode);
            // Optionally verify code early
            verifyPasswordResetCode(auth, initialCode)
                .then((email) => setVerifiedEmail(email))
                .catch(() => {});
        }
    }, [initialCode]);

    if (!isOpen) return null;

    // Calculate password strength
    const calculateStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strength = calculateStrength(newPassword);

    const getStrengthColor = (s: number) => {
        if (s <= 1) return "bg-red-500";
        if (s <= 2) return "bg-amber-500";
        if (s === 3) return "bg-blue-500";
        return "bg-emerald-500";
    };

    const getStrengthLabel = (s: number) => {
        if (!newPassword) return "Enter password";
        if (s <= 1) return "Weak";
        if (s <= 2) return "Fair";
        if (s === 3) return "Good";
        return "Strong";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedCode = code.trim();

        if (!trimmedCode) {
            setErrorMessage("Please enter the password reset code or action link.");
            return;
        }

        if (newPassword.length < 8) {
            setErrorMessage("New password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords do not match. Please verify.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            await confirmPasswordReset(auth, trimmedCode, newPassword);
            setIsSuccess(true);
            dispatch(
                showToast({
                    message: "Password updated successfully! You can now sign in with your new password.",
                    type: "success",
                })
            );
        } catch (error: any) {
            console.warn("Confirm password error:", error);
            let msg = error.message;
            if (error.code === "auth/invalid-action-code") {
                msg = "The password reset code is invalid or has expired.";
            } else if (error.code === "auth/weak-password") {
                msg = "Password should be at least 6 characters.";
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
                    <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Set New Password</h2>
                    <p className="text-xs sm:text-sm text-gray-400">
                        {verifiedEmail
                            ? `Setting new password for ${verifiedEmail}`
                            : "Enter your verification code and choose a strong new password."}
                    </p>
                </div>

                {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Reset Code input */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                                Reset Code / Token
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="e.g. reset_abc123 or action code"
                                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-mono"
                            />
                        </div>

                        {/* New Password input */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter at least 8 characters"
                                    className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-10 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                                />
                                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Password strength meter */}
                            {newPassword && (
                                <div className="mt-2 space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                                        <span>Strength: {getStrengthLabel(strength)}</span>
                                        <span>{strength * 25}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getStrengthColor(strength)} transition-all duration-300`}
                                            style={{ width: `${Math.max(10, strength * 25)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password input */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your new password"
                                    className="w-full bg-black/60 border border-white/15 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                                />
                                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] text-sm"
                        >
                            {isSubmitting ? "Updating Password..." : "Save New Password"}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm space-y-2">
                            <div className="flex items-center gap-2 font-semibold text-emerald-400">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <span>Password Successfully Updated!</span>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed">
                                Your account password has been reset. You can now securely log in with your new credentials.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors"
                        >
                            Proceed to Sign In
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordModal;
