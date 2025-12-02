"use client";
import React from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient();
    
    // This will redirect the user to Google login
    // Make sure 'Google' is enabled in your Supabase Auth Providers
    await supabase.auth.signInWithOAuth({
      provider: 'google', 
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button 
      onClick={handleLogin}
      className="
        px-5 py-2 text-[#94C3D2] border border-[#94C3D2] rounded-full 
        hover:bg-[#94C3D2] hover:text-white transition-colors
      ">
      Log In
    </button>
  );
}