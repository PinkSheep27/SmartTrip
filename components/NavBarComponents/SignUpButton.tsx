"use client";
import React from 'react';
import Link from 'next/link';

export default function SignUpButton() {
  return (
    <Link 
      href="/SignUpPage" 
      className="
        px-5 py-2 text-[#94C3D2] border border-[#94C3D2] rounded-full 
        hover:bg-[#94C3D2] hover:text-white transition-colors
        cursor-pointer
      "
    >
      Sign Up
    </Link>
  );
}