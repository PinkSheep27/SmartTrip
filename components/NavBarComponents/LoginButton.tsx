"use client";
import React from 'react';
import Link from 'next/link';

export default function LoginButton() {
  return (
    <Link 
      href="/LoginPage"
      className="
        px-5 py-2 text-[#94C3D2] border border-[#94C3D2] rounded-full 
        hover:bg-[#94C3D2] hover:text-white transition-colors
        cursor-pointer
      ">
      Log In
    </Link>
  );
}