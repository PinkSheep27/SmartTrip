"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LoginButton from "../../components/NavBarComponents/LoginButton";
import SignUpButton from "../../components/NavBarComponents/SignUpButton";
import Profile from "../../components/NavBarComponents/Profile";
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    {
      href: "/FlightsPage",
      label: "Flights",
      iconOutlined: flightsIconOutlinedImg,
      iconFilled: flightsIconFilledImg,
    },
    {
      href: "/HotelsPage",
      label: "Hotels",
      iconOutlined: hotelsIconOutlinedImg,
      iconFilled: hotelsIconFilledImg,
    },
    {
      href: "/ExperiencePage",
      label: "Experiences",
      iconOutlined: experiencesIconOutlinedImg,
      iconFilled: experiencesIconFilledImg,
    },
    {
      href: "/DiningPage",
      label: "Dining",
      iconOutlined: diningIconOutlinedImg,
      iconFilled: diningIconFilledImg,
    },
  ];

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-6xl mt-6 px-6">
      <div className="bg-white shadow-lg rounded-full px-6 py-3 w-full border border-gray-100">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Image
                src={smartTripLogo}
                alt="SmartTrip Logo"
                className="h-10 w-auto cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <ul className="hidden lg:flex items-center space-x-8 text-gray-600 font-medium">
            {navLinks.map((link) => (
              <li
                key={link.label}
                onMouseEnter={() => setHoveredItem(link.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={link.href}
                  className="flex items-center space-x-1.5 hover:text-[#94C3D2] transition-colors"
                >
                  <Image
                    src={
                      hoveredItem === link.label
                        ? link.iconFilled
                        : link.iconOutlined
                    }
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

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Icon - Always visible if user is logged in */}
            {user && (
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className={`relative p-2.5 rounded-full transition-all cursor-pointer ${
                  isCartOpen
                    ? "bg-gray-100 text-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#94C3D2]"
                }`}
              >
                {isCartOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
              </button>
            )}

            <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

            {/* Auth Section */}
            <div className="flex items-center">
              {loading ? (
                <div className="px-4 py-2 text-gray-400 text-sm">
                  Loading...
                </div>
              ) : !user ? (
                <div className="flex items-center gap-2">
                  <LoginButton />
                  <SignUpButton />
                </div>
              ) : (
                /* Profile Component now handles the dropdown logic */
                <Profile user={user} />
              )}
            </div>
          </div>
        </div>

        {/* Live Cart Overlay */}
        {user && isCartOpen && (
          <div className="absolute top-20 right-0 w-96 z-50 animate-in fade-in slide-in-from-top-5 duration-200">
            <LiveCart cartId={1} onClose={() => setIsCartOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
