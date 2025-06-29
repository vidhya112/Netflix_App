import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import Header from "./Header";
import { checkValidData } from "../../utils/validate";
import { auth } from "../../utils/firebase";
import { addUser } from "../../features/userSlice";
import { BACKGROUND_IMAGE } from "../../utils/constant";

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const dispatch = useDispatch();

  const email = useRef(null);
  const password = useRef(null);
  const fullName = useRef(null);

  const toggleSignInForm = () => {
    setIsSignInForm(!isSignInForm);
  };

  const handleClick = () => {
    const errorMessage = checkValidData(
      email.current.value,
      password.current.value,
      fullName.current?.value
    );
    setErrorMessage(errorMessage);

    if (errorMessage) return;

    if (!isSignInForm) {
      createUserWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        .then((userCredential) => {
          const user = userCredential.user;
          updateProfile(user, {
            displayName: fullName.current?.value,
          })
            .then(() => {
              const { uid, email, displayName } = auth.currentUser;
              dispatch(
                addUser({ uid: uid, email: email, displayName: displayName })
              );
            })
            .catch((error) => {
              setErrorMessage(errorMessage);
            });
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    } else {
      signInWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        .then((userCredential) => {
          const user = userCredential.user;
          console.log(user);
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    }
  };

  return (
    <div>
      <Header />
      <div className="absolute w-screen h-screen overflow-hidden">
        <img
          className="w-full h-full brightness-50"
          src={BACKGROUND_IMAGE}
          alt="background-img"
        />
      </div>
      <form
        onClick={(e) => e.preventDefault()}
        className="w-3/12 absolute p-14 bg-black bg-opacity-80 my-36 mx-auto right-0 left-0 text-white"
      >
        <h1 className="text-3xl font-bold pb-4">
          {isSignInForm ? "Sign In" : "Sign Up"}
        </h1>
        {!isSignInForm && (
          <input
            type="text"
            ref={fullName}
            placeholder="Enter Full Name"
            className="p-3 my-4 w-full bg-black border border-gray-500  rounded-sm"
          />
        )}
        <input
          type="text"
          ref={email}
          placeholder="Email Address"
          className="p-3 my-4 w-full bg-black border border-gray-500  rounded-sm"
        />
        <input
          type="password"
          ref={password}
          placeholder="Password"
          className="p-3 my-4 w-full bg-black border border-gray-500 rounded-sm"
        />
        <p className="text-red-600">{errorMessage}</p>
        <button
          className="p-2 my-2 bg-red-700  font-bold rounded-md w-full"
          onClick={handleClick}
        >
          {isSignInForm ? "Sign-In" : "Sign-Up"}
        </button>
        <p className="py-5 text-gray-400 ">
          {isSignInForm ? "New to Netflix?" : "Already registered?"}
          <span className="text-white font-bold" onClick={toggleSignInForm}>
            &nbsp;{isSignInForm ? "Sign up now." : "Sign in now."}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
