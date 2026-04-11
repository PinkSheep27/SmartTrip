"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
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
      flex flex-col items-center bg-white shadow-lg
      w-[clamp(28rem,50vw,38rem)]
      max-h-[90vh] overflow-y-auto
      p-[clamp(1rem,4vw,3rem)]
      rounded-2xl"
      >
        <h2 className="
        font-bold 
        text-[clamp(24px,3vw,32px)] mb-[clamp(18px,2vh,24px)]"
        >
          Login Into Your Account
        </h2>
        
        {error && (
          <div className="
          w-full bg-red-100 border border-red-400 text-red-700 rounded relative
          px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.5rem,1.5vh,1rem)]
          mb-[clamp(1rem,2vh,2rem)]"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="
        w-full
        space-y-[clamp(1rem,2vh,1.5rem)]
        " 
        onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="email@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
            w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black
            px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.5rem,1.5vh,1rem)]
            text-base"
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
            w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black
            px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.5rem,1.5vh,1rem)]
            text-base"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="
            w-full bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition cursor-pointer disabled:opacity-50
            py-[clamp(0.5rem,1.5vh,1rem)]"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center">
            Don't have an Account?&nbsp;
            <a href="/SignUpPage" className="text-[#94C3D2] underline underline-offset-4 hover:text-[#51B0CE]">Sign Up</a> 
            &nbsp;Today!
          </p>

          <div className="
          flex items-center
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
            onClick={handleGoogleLogin}
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
        </form>
      </div>
    </div>
  );
}

export default LoginForm;