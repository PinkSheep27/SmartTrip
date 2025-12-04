"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LoginButton from "../../components/NavBarComponents/LoginButton";
import SignUpButton from "../../components/NavBarComponents/SignUpButton";
import LiveCart from "../../components/LiveCartComponents/LiveCart";
import { ShoppingCart, X } from "lucide-react";

import smartTripLogo from "../../assets/logos/smarttrip-transparent-logo.png";
import flightsIconOutlinedImg from "../../assets/favicons/flights-outlined-100px.png";
import hotelsIconOutlinedImg from "../../assets/favicons/hotels-outlined-100px.png";
import carsIconOutlinedImg from "../../assets/favicons/car-rental-outlined-100px.png";
import experiencesIconOutlinedImg from "../../assets/favicons/experiences-outlined-100px.png";
import diningIconOutlinedImg from "../../assets/favicons/dining-outlined-100px.png";
import flightsIconFilledImg from "../../assets/favicons/flights-filled-in-100px.png";
import hotelsIconFilledImg from "../../assets/favicons/hotels-filled-in-100px.png";
import carsIconFilledImg from "../../assets/favicons/car-rental-filled-in-100px.png";
import experiencesIconFilledImg from "../../assets/favicons/experiences-filled-in-100px.png";
import diningIconFilledImg from "../../assets/favicons/dining-filled-in-100px.png";

const Navbar: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { href: "/FlightsPage", label: "Flights", iconOutlined: flightsIconOutlinedImg, iconFilled: flightsIconFilledImg },
    { href: "/HotelsPage", label: "Hotels", iconOutlined: hotelsIconOutlinedImg, iconFilled: hotelsIconFilledImg },
    { href: "#", label: "Cars", iconOutlined: carsIconOutlinedImg, iconFilled: carsIconFilledImg },
    { href: "#", label: "Experiences", iconOutlined: experiencesIconOutlinedImg, iconFilled: experiencesIconFilledImg },
    { href: "/DiningPage", label: "Dining", iconOutlined: diningIconOutlinedImg, iconFilled: diningIconFilledImg },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-6xl mt-6 px-6">
      <div className="bg-white shadow-lg rounded-full px-6 py-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Image src={smartTripLogo} alt="SmartTrip Logo" className="h-10 w-auto cursor-pointer" />
            </Link>
          </div>

          <ul className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
            {navLinks.map((link) => (
              <li
                key={link.label}
                onMouseEnter={() => setHoveredItem(link.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link href={link.href} className="flex items-center space-x-1 hover:text-teal-500 transition-colors">
                  <Image
                    src={hoveredItem === link.label ? link.iconFilled : link.iconOutlined}
                    alt={link.label}
                    className="h-5 w-5"
                    width={20}
                    height={20}
                  />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center space-x-4">
            {user && (
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className={`relative p-2 rounded-full transition-all ${isCartOpen ? 'bg-gray-100 rotate-90' : 'hover:bg-gray-50'}`}
              >
                {isCartOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <ShoppingCart className="w-6 h-6 text-gray-600" />
                )}
              </button>
            )}

            <div className="hidden md:flex items-center space-x-2">
              {loading ? (
                <div className="px-5 py-2 text-gray-500">...</div>
              ) : !user ? (
                <>
                  <LoginButton />
                  <SignUpButton />
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-full hover:bg-red-50"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {user && isCartOpen && (
          <div className="absolute top-24 right-0 w-96 z-50 animate-in fade-in slide-in-from-top-5 duration-200">
            {/* Hardcoded cartId={1} for now - update when you have real trips */}
            <LiveCart cartId={1} onClose={() => setIsCartOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;