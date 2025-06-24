import { useRef, useState } from "react";
import Header from "./Header";
import { checkValidData } from "../utils/validate";

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

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
      fullName.current.value
    );
    setErrorMessage(errorMessage);
  };

  return (
    <div>
      <Header />
      <div className="absolute">
        <img
        className="w-full h-full brightness-50"
          src="https://assets.nflxext.com/ffe/siteui/vlv3/8200f588-2e93-4c95-8eab-ebba17821657/web/IN-en-20250616-TRIFECTA-perspective_9cbc87b2-d9bb-4fa8-9f8f-a4fe8fc72545_large.jpg"
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
          <span className="font-bold" onClick={toggleSignInForm}>
            &nbsp;{isSignInForm ? "Sign up now." : "Sign in now."}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
