"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      if (data?.session) {
        router.push("/");
      } else {
        alert("Please check your email for a confirmation link!");
      }
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar.events.readonly',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  return (
    <div className="absolute inset-0 flex items-start justify-center pt-44">
      <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Sign Up For An Account</h2>
        
        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="space-y-4 w-full" onSubmit={handleEmailSignUp}>
          <input
            type="email"
            placeholder="email@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            required
            minLength={6}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-black text-white rounded-lg w-full font-medium py-2 hover:bg-gray-800 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign up with email"}
          </button>
        </form>

        <div className="flex items-center my-4 w-full">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-sm text-gray-400">or continue with</span>
          <hr className="flex-grow border-gray-300" />
        </div>
        
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition cursor-pointer"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="google icon"
            className="w-5 h-5 mr-2"
          />
          <span className="font-medium">Google</span>
        </button>
      </div>
    </div>
  );
}

export default SignUpForm;