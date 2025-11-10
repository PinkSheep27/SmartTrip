"use client";

import { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="absolute inset-0 flex items-start justify-center pt-44">
      <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6">Login Into Your Account</h2>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="email@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            className="w-full bg-black text-white rounded-lg py-2 font-medium hover:bg-gray-800 transition cursor-pointer"
          >
            Login
          </button>

          <p className="text-center">
            Don't have an Account?&nbsp;
            <a href="/SignUpPage" className="text-[#94C3D2] underline underline-offset-4 hover:text-[#51B0CE]">Sign Up</a> 
            Today!
          </p>

          {/* Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-sm text-gray-400">or continue with</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Google button */}
          <button
            type="button"
            className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition cursor-pointer"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="google icon"
              className="w-5 h-5 mr-2"
            />
            <span className="font-medium">Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
