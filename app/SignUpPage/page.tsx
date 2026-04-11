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
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  return (
    <div className="
      absolute inset-0 flex items-start justify-center 
      pt-[clamp(8rem,10vh,10rem)]"
    >
      <div className="
        flex flex-col items-center bg-white shadow-md 
        w-[clamp(28rem,50vw,38rem)] 
        max-h-[90vh] overflow-y-auto 
        p-[clamp(1rem,4vw,3rem)] 
        rounded-2xl"
      >
        <h2 className="
          font-bold 
          text-[clamp(24px,3vw,32px)] mb-[clamp(18px,2vh,24px)]"
        >
          Sign Up For An Account
        </h2>
        
        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 rounded relative 
            px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.5rem,1.5vh,1rem)] 
            mb-[clamp(1rem,2vh,2rem)]"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="w-full 
          space-y-[clamp(1rem,2vh,1.5rem)]" 
          onSubmit={handleEmailSignUp}
        >
          <input
            type="email"
            placeholder="email@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black
              text-[16px]
              px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.5rem,1.5vh,1rem)]"
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black
              text-[16px]
              px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.5rem,1.5vh,1rem)]"
            required
            minLength={6}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="
              bg-black text-white rounded-lg w-full font-medium hover:bg-gray-800 transition cursor-pointer disabled:opacity-50
              py-[clamp(0.5rem,1.5vh,1rem)]"
          >
            {loading ? "Signing up..." : "Sign up with email"}
          </button>
          <p className="text-center">
            Have an account?&nbsp;
            <a href="/LoginPage" className="text-[#94C3D2] underline underline-offset-4 hover:text-[#51B0CE]">Sign In</a> 
            &nbsp;Now!
          </p>
        </form>

        <div className="flex items-center w-full 
          my-[clamp(1rem,2vh,1.5rem)]"
        >
          <hr className="flex-grow border-gray-300" />
          <span className="text-sm text-gray-400 
            px-[clamp(0.5rem,1.5vw,1rem)]"
          >
            or continue with
          </span>
          <hr className="flex-grow border-gray-300" />
        </div>
        
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="
            w-full flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer
            py-[clamp(0.5rem,1.5vh,1rem)]"
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