import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { setUser } from "../../features/userSlice";
import { RootState } from "../../store/appStore";
import { Browse } from "./Browse";
import { Login } from "./Login";
import { USER_AVATARS } from "../../utils/constant";

export const Body: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                dispatch(
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL:
                            firebaseUser.photoURL && !firebaseUser.photoURL.includes("nflxso.net")
                                ? firebaseUser.photoURL
                                : USER_AVATARS[0].url,
                    })
                );
            }
        });

        return () => unsubscribe();
    }, [dispatch]);

    return (
        <div className="w-full min-h-screen bg-[#141414] text-white">
            {user ? <Browse /> : <Login />}
        </div>
    );
};

export default Body;
