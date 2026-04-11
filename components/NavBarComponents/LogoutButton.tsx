"use client";
import React from 'react';

export default function LogoutButton() {
  return (
    <a 
      href="/auth/logout" 
      className="px-[clamp(1rem,1.5vw,1.25rem)] py-[clamp(0.5rem,1vh,0.75rem)] text-[clamp(13px,1.2vw,14px)] font-medium text-[#94C3D2] border border-[#94C3D2] rounded-full hover:bg-[#94C3D2] hover:text-white transition-colors cursor-pointer shrink-0 inline-block">
      Log Out
    </a>
  );
}