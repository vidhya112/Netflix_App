import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { auth, onAuthStateChanged } from "../../utils/firebase";
import { setUser } from "../../features/userSlice";
import { RootState } from "../../store/appStore";
import { Browse } from "./Browse";
import { Login } from "./Login";
import { ResetPasswordModal } from "../modal/ResetPasswordModal";
import { useFirestoreWatchlist } from "../../hooks/useFirestoreWatchlist";
import { USER_AVATARS } from "../../utils/constant";

export const Body: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const [urlResetCode, setUrlResetCode] = useState<string | null>(null);

    // Keep Cloud Firestore watchlist in real-time sync
    useFirestoreWatchlist();

    // Check for Firebase password reset query parameters (e.g. ?mode=resetPassword&oobCode=XYZ)
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const mode = params.get("mode");
            const oobCode = params.get("oobCode");
            if ((mode === "resetPassword" || mode === "action") && oobCode) {
                setUrlResetCode(oobCode);
            }
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        try {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (firebaseUser) {
                    let token: string | null = null;
                    if (firebaseUser.getIdToken) {
                        try {
                            token = await firebaseUser.getIdToken();
                        } catch {
                            // ignore
                        }
                    }

                    dispatch(
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL:
                                firebaseUser.photoURL && !firebaseUser.photoURL.includes("nflxso.net")
                                    ? firebaseUser.photoURL
                                    : USER_AVATARS[0].url,
                            jwtToken: token,
                        })
                    );
                }
            });

            return () => unsubscribe();
        } catch (err) {
            console.warn("Auth listener error:", err);
        }
    }, [dispatch]);

    return (
        <div className="w-full min-h-screen bg-[#141414] text-white">
            {user ? <Browse /> : <Login />}

            {/* In-app Password Reset Modal from email action links */}
            {urlResetCode && (
                <ResetPasswordModal
                    isOpen={Boolean(urlResetCode)}
                    initialCode={urlResetCode}
                    onClose={() => {
                        setUrlResetCode(null);
                        // Clean URL without page refresh
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }}
                />
            )}
        </div>
    );
};

export default Body;
