"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { User as UserIcon, Map, Moon, ChevronDown } from "lucide-react";

interface ProfileProps {
  user: User | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function Profile({ user, isOpen, onToggle, onClose }: ProfileProps) {
  const [isNightMode, setIsNightMode] = useState(false); // Just local state for the UI switch now
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0];
  const avatarUrl = user.user_metadata?.avatar_url;

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const toggleNightMode = () => {
    setIsNightMode(!isNightMode);
    // Dark mode logic removed!
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-[clamp(0.5rem,1vw,0.75rem)] hover:bg-gray-100 p-[clamp(0.25rem,0.5vw,0.4rem)] rounded-full transition-all shrink-0 cursor-pointer"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="h-[clamp(2rem,4vh,2.25rem)] w-[clamp(2rem,4vh,2.25rem)] rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="h-[clamp(2rem,4vh,2.25rem)] w-[clamp(2rem,4vh,2.25rem)] rounded-full bg-[#94C3D2] text-white flex items-center justify-center font-bold text-[clamp(12px,1.2vw,14px)]">
            {displayName?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-gray-700 font-medium hidden md:block text-[clamp(13px,1.2vw,14px)]">
          {displayName}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-[clamp(0.4rem,1vh,0.5rem)] w-[clamp(14rem,20vw,16rem)] bg-white rounded-[clamp(0.75rem,1.5vw,1rem)] shadow-xl border border-gray-100 p-[clamp(0.5rem,1.5vw,0.75rem)] z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="space-y-[clamp(0.2rem,0.4vh,0.25rem)]">
            
            <Link href="/Profile" onClick={onClose} className="flex items-center gap-[clamp(0.5rem,1vw,0.75rem)] px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.5rem,0.8vh,0.6rem)] text-gray-700 hover:bg-gray-50 rounded-[clamp(0.5rem,1vw,0.75rem)] transition-colors">
              <UserIcon className="w-5 h-5 shrink-0 text-gray-500" />
              <span className="font-medium text-[clamp(13px,1.2vw,14px)]">Profile</span>
            </Link>

            <Link href="/ItineraryPage" onClick={onClose} className="flex items-center gap-[clamp(0.5rem,1vw,0.75rem)] px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.5rem,0.8vh,0.6rem)] text-gray-700 hover:bg-gray-50 rounded-[clamp(0.5rem,1vw,0.75rem)] transition-colors">
              <Map className="w-5 h-5 shrink-0 text-gray-500" />
              <span className="font-medium text-[clamp(13px,1.2vw,14px)]">Itinerary</span>
            </Link>

            {/* Night Mode Toggle (UI Only) */}
            <div className="flex items-center justify-between px-[clamp(0.5rem,1vw,0.75rem)] py-[clamp(0.5rem,0.8vh,0.6rem)] text-gray-700">
              <div className="flex items-center gap-[clamp(0.5rem,1vw,0.75rem)]">
                <Moon className="w-5 h-5 shrink-0 text-gray-500" />
                <span className="font-medium text-[clamp(13px,1.2vw,14px)]">Night Mode</span>
              </div>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleNightMode();
                }}
                className={`w-[clamp(2.5rem,4vw,2.75rem)] h-[clamp(1.25rem,2vh,1.5rem)] flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
                  isNightMode ? 'bg-black' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`bg-white w-[clamp(0.9rem,1.5vw,1.1rem)] h-[clamp(0.9rem,1.5vw,1.1rem)] rounded-full shadow-md transform transition-transform duration-300 ${
                    isNightMode ? 'translate-x-[clamp(1.1rem,1.8vw,1.25rem)]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <hr className="my-[clamp(0.4rem,1vh,0.5rem)] border-gray-100" />

            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.4rem,0.8vh,0.5rem)] text-red-500 border border-red-100 rounded-[clamp(0.5rem,1vw,0.75rem)] hover:bg-red-50 transition-colors mt-[clamp(0.25rem,0.5vh,0.4rem)] cursor-pointer">
              <span className="text-[clamp(12px,1.2vw,13px)] font-bold">Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}