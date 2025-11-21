"use client";
import React from 'react';

export default function LogoutButton() {
  return (
    <a 
      href="/auth/logout" 
      className="
        px-5 py-2 text-[#94C3D2] border border-[#94C3D2] rounded-full 
        hover:bg-[#94C3D2] hover:text-white transition-colors
      ">
      Log Out
    </a>
  );
}