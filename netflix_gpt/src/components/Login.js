import { useState } from "react";
import Header from "./Header";

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState("");
  const toggleSignInForm = () => {
    setIsSignInForm(!isSignInForm);
  };
  return (
    <div>
      <Header />
      <div className="absolute">
        <img
          src="https://assets.nflxext.com/ffe/siteui/vlv3/8200f588-2e93-4c95-8eab-ebba17821657/web/IN-en-20250616-TRIFECTA-perspective_9cbc87b2-d9bb-4fa8-9f8f-a4fe8fc72545_large.jpg"
          alt="background-img"
        />
      </div>
      <form className="w-3/12 absolute p-14 bg-black my-36 mx-auto right-0 left-0">
        <h1 className="text-white text-3xl font-bold pb-4">
          {isSignInForm ? "Sign In" : "Sign Up"}
        </h1>
        {!isSignInForm && (
          <input
            type="text"
            placeholder="Enter Full Name"
            className="p-3 my-4 w-full bg-black border border-gray-500  rounded-sm"
          />
        )}
        <input
          type="text"
          placeholder="Email Address"
          className="p-3 my-4 w-full bg-black border border-gray-500  rounded-sm"
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 my-4 w-full bg-black border border-gray-500 rounded-sm"
        />
        <button className="p-2 my-2 bg-red-700 text-white font-bold rounded-md w-full">
          {isSignInForm ? "Sign-In" : "Sign-Up"}
        </button>
        <p className="py-5 text-gray-400 ">
          New to Netflix?
          <span className="text-white font-bold" onClick={toggleSignInForm}>
            Sign up now.
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
