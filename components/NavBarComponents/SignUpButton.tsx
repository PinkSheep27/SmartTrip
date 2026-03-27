"use client";
import React from 'react';
import Link from 'next/link';

export default function SignUpButton() {
  return (
    <Link 
      href="/SignUpPage" 
      className="px-[clamp(0.5rem,1.5vw,1.25rem)] py-[clamp(0.35rem,1vh,0.75rem)] text-[clamp(11px,1.2vw,14px)] font-bold text-[#94C3D2] border border-[#94C3D2] rounded-full hover:bg-[#94C3D2] hover:text-white transition-colors cursor-pointer shrink-0"
    >
      Sign Up
    </Link>
  );
}