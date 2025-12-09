"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { User as UserIcon, Map, Moon, LogOut, ChevronDown } from "lucide-react";

interface ProfileProps {
  user: User | null;
}

export default function Profile({ user }: ProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false); // UI State only
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  if (!user) return null;

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0];
  const avatarUrl = user.user_metadata?.avatar_url;

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const toggleNightMode = () => {
    setIsNightMode(!isNightMode);
    // TODO: Add your actual dark mode logic here
    // e.g. document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-full transition-all"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="h-9 w-9 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-[#94C3D2] text-white flex items-center justify-center font-bold text-sm">
            {displayName?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-gray-700 font-medium hidden md:block">
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="space-y-1">
            
            {/* Profile Link */}
            <Link
              href="/Profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <UserIcon className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Profile</span>
            </Link>

            {/* Itinerary Link */}
            <Link
              href="/ItineraryPage" // Assuming you will create this page
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <Map className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Itinerary</span>
            </Link>

            {/* Night Mode Toggle */}
            <div className="flex items-center justify-between px-3 py-2.5 text-gray-700">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Night Mode</span>
              </div>
              
              {/* Custom Toggle Switch */}
              <button
                onClick={toggleNightMode}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  isNightMode ? 'bg-black' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    isNightMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <hr className="my-2 border-gray-100" />

            {/* Log Out Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors mt-2"
            >
              <span className="text-sm font-bold">Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}