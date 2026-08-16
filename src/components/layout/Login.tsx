import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
} from "../../utils/firebase";
import { setUser } from "../../features/userSlice";
import { showToast } from "../../features/configSlice";
import {
    registerUserSession,
    syncUserProfileToFirestore,
} from "../../services/firestoreService";
import { Header } from "./Header";
import { checkValidData } from "../../utils/validate";
import { BACKGROUND_IMAGE, USER_AVATARS } from "../../utils/constant";
import { language } from "../../utils/languageConstant";
import { RootState } from "../../store/appStore";
import { ForgotPasswordModal } from "../modal/ForgotPasswordModal";
import { ResetPasswordModal } from "../modal/ResetPasswordModal";
import { AlertCircle, Eye, EyeOff, UserCheck, KeyRound } from "lucide-react";

export const Login: React.FC = () => {
    const dispatch = useDispatch();
    const langKey = useSelector((state: RootState) => state.config.lang);
    const lang = language[langKey] || language.en;

    const [isSignInForm, setIsSignInForm] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal states
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetCodeForModal, setResetCodeForModal] = useState<string | undefined>(undefined);

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    const toggleSignInForm = () => {
        setIsSignInForm(!isSignInForm);
        setErrorMessage(null);
    };

    const handleGuestLogin = async () => {
        setIsSubmitting(true);
        const guestUser = {
            uid: "guest_demo_user_123",
            email: "guest.reviewer@netflixgpt.demo",
            displayName: "Guest Member",
            photoURL: USER_AVATARS[0].url,
            jwtToken: `demo_jwt_${Date.now()}`,
        };

        try {
            await registerUserSession(guestUser.uid);
            await syncUserProfileToFirestore(guestUser.uid, {
                email: guestUser.email,
                displayName: guestUser.displayName,
                photoURL: guestUser.photoURL,
            });
        } catch {
            // ignore
        }

        dispatch(setUser(guestUser));
        dispatch(
            showToast({
                message: "Welcome to Netflix GPT Demo Mode!",
                type: "success",
            })
        );
        setIsSubmitting(false);
    };

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const email = emailRef.current?.value || "";
        const password = passwordRef.current?.value || "";
        const name = nameRef.current?.value || "";

        const validationError = checkValidData(email, password, name, !isSignInForm);
        setErrorMessage(validationError);

        if (validationError) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            if (!isSignInForm) {
                // Sign Up Flow
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await updateProfile(user, {
                    displayName: name,
                    photoURL: USER_AVATARS[0].url,
                });

                let token: string | null = null;
                if (user.getIdToken) {
                    token = await user.getIdToken();
                }

                // Register session & profile in Firestore
                await registerUserSession(user.uid);
                await syncUserProfileToFirestore(user.uid, {
                    email: user.email,
                    displayName: name || user.displayName,
                    photoURL: USER_AVATARS[0].url,
                    lang: langKey,
                });

                dispatch(
                    setUser({
                        uid: user.uid,
                        email: user.email,
                        displayName: name || user.displayName,
                        photoURL: USER_AVATARS[0].url,
                        jwtToken: token,
                    })
                );
                dispatch(showToast({ message: "Account created successfully!", type: "success" }));
            } else {
                // Sign In Flow
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                let token: string | null = null;
                if (user.getIdToken) {
                    token = await user.getIdToken();
                }

                // Register session & profile in Firestore
                await registerUserSession(user.uid);
                await syncUserProfileToFirestore(user.uid, {
                    email: user.email,
                    displayName: user.displayName || email.split("@")[0],
                    photoURL: user.photoURL || USER_AVATARS[0].url,
                });

                dispatch(
                    setUser({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || email.split("@")[0],
                        photoURL: user.photoURL || USER_AVATARS[0].url,
                        jwtToken: token,
                    })
                );
                dispatch(showToast({ message: "Welcome back!", type: "success" }));
            }
        } catch (error: any) {
            console.warn("Auth error:", error);
            let msg = error.message;
            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/user-not-found" ||
                error.code === "auth/wrong-password"
            ) {
                msg = "Invalid email or password credentials.";
            } else if (error.code === "auth/email-already-in-use") {
                msg = "This email is already registered. Please sign in instead.";
            } else if (error.code === "auth/weak-password") {
                msg = "Password is too weak. Please use at least 6 characters.";
            } else if (error.code === "auth/too-many-requests") {
                msg = "Too many failed attempts. Please try again later or reset your password.";
            } else if (error.code === "auth/invalid-api-key") {
                msg = "Invalid Firebase API key. Please check your configuration.";
            }
            setErrorMessage(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-black flex flex-col justify-between">
            <Header showNavigation={false} />

            {/* Background Image with Dark Vignette Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    className="w-full h-full object-cover brightness-50 scale-105"
                    src={BACKGROUND_IMAGE}
                    alt="Netflix Background"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
            </div>

            {/* Main Authentication Card */}
            <div className="relative z-10 flex items-center justify-center px-4 py-28 sm:py-32">
                <div className="w-full max-w-md bg-black/75 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-12 shadow-2xl text-white space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                            {isSignInForm ? lang.signIn : lang.signUp}
                        </h1>
                        <p className="text-xs text-gray-400">
                            Unlimited movies, TV shows, and AI-powered recommendations.
                        </p>
                    </div>

                    {/* Quick 1-Click Guest Sign-In Button */}
                    <button
                        type="button"
                        onClick={handleGuestLogin}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <UserCheck className="w-4 h-4" />
                        <span>{lang.guestLogin}</span>
                    </button>

                    <div className="relative flex items-center justify-center">
                        <div className="border-t border-white/15 w-full" />
                        <span className="bg-black/60 px-3 text-xs text-gray-400 uppercase font-semibold">
                            {lang.or}
                        </span>
                        <div className="border-t border-white/15 w-full" />
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                        {!isSignInForm && (
                            <div>
                                <input
                                    ref={nameRef}
                                    type="text"
                                    placeholder={lang.namePlaceholder}
                                    className="w-full bg-[#161616]/80 border border-white/20 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                                />
                            </div>
                        )}

                        <div>
                            <input
                                ref={emailRef}
                                type="email"
                                autoComplete="email"
                                placeholder={lang.emailPlaceholder}
                                className="w-full bg-[#161616]/80 border border-white/20 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                            />
                        </div>

                        <div className="relative">
                            <input
                                ref={passwordRef}
                                type={showPassword ? "text" : "password"}
                                placeholder={lang.passwordPlaceholder}
                                className="w-full bg-[#161616]/80 border border-white/20 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Forgot password link */}
                        {isSignInForm && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-xs text-gray-400 hover:text-white hover:underline flex items-center gap-1 transition-colors"
                                >
                                    <KeyRound className="w-3 h-3" />
                                    <span>Forgot password?</span>
                                </button>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-500/20 p-3 rounded-lg animate-in fade-in duration-200">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] text-sm"
                        >
                            {isSubmitting
                                ? "Processing..."
                                : isSignInForm
                                    ? lang.signIn
                                    : lang.signUp}
                        </button>
                    </form>

                    {/* Toggle Form Footer */}
                    <div className="pt-2 text-xs sm:text-sm text-gray-400 text-center">
                        <span>{isSignInForm ? lang.newToNetflix : lang.alreadyRegistered} </span>
                        <button
                            onClick={toggleSignInForm}
                            className="text-white font-bold hover:underline ml-1"
                        >
                            {isSignInForm ? lang.signUpNow : lang.signInNow}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ForgotPasswordModal
                isOpen={showForgotModal}
                onClose={() => setShowForgotModal(false)}
                onOpenResetModal={(code) => {
                    setResetCodeForModal(code);
                    setShowResetModal(true);
                }}
            />

            <ResetPasswordModal
                isOpen={showResetModal}
                initialCode={resetCodeForModal}
                onClose={() => {
                    setShowResetModal(false);
                    setResetCodeForModal(undefined);
                }}
            />

            <div className="relative z-10 text-center text-xs text-gray-500 pb-6">
                Protected by Google reCAPTCHA, Firebase JWT & Cloud Firestore Encryption.
            </div>
        </div>
    );
};

export default Login;
