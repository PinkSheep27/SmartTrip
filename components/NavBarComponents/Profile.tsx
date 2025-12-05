"use client";
import React from 'react';
import { User } from '@supabase/supabase-js';

interface ProfileProps {
  user: User | null;
}

export default function Profile({ user }: ProfileProps) {
  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0];

  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-[#94C3D2] text-white flex items-center justify-center font-bold">
        {displayName?.charAt(0).toUpperCase()}
      </div>
      <span className="px-3 text-gray-700 hidden md:block">
        {displayName}
      </span>
    </div>
  );
}