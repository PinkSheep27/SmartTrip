"use client"

import { useState } from "react";

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-md w-full max-w-xl">
      <h2 className="text-2xl font-bold mb-4">Sign Up For An Account</h2>
      <div className="text-sm text-gray-600 mb-2">
        Enter your email to sign up for Smart Trip
      </div>
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
        <button className="bg-black text-white rounded-lg w-full font-medium py-2 hover:bg-gray-800 transition">
          Sign up with email
        </button>
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-sm text-gray-400">or continue with</span>
          <hr className="flex-grow border-gray-300" />
        </div>
        <button
          type="button"
          className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
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
  );
}

export default SignUpForm;
