"use client";

import { useTrip } from "@/context/TripContext";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LoginButton from "../../components/NavBarComponents/LoginButton";
import SignUpButton from "../../components/NavBarComponents/SignUpButton";
import Profile from "../../components/NavBarComponents/Profile";
import LiveCart from "../../components/LiveCartComponents/LiveCart";
import { ShoppingCart } from "lucide-react"; // Removed X import here

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
  
  const [activeDropdown, setActiveDropdown] = useState<'cart' | 'profile' | null>(null);
  
  // Refs to handle clicking outside the cart
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);

  const { activeCartId, setActiveCartId } = useTrip();
  const [trips, setTrips] = useState<any[]>([]);
  const supabase = createClient();

  // Outside click listener for the Cart
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        activeDropdown === 'cart' &&
        cartDropdownRef.current &&
        !cartDropdownRef.current.contains(event.target as Node) &&
        cartButtonRef.current &&
        !cartButtonRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

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
  }, [supabase.auth]);

  useEffect(() => {
    const fetchUserTrips = async () => {
      if (!user) return;

      try {
        const res = await fetch('/api/trips');
        if (!res.ok) throw new Error("Failed to fetch trips");

        const dbTrips = await res.json();

        if (dbTrips && Array.isArray(dbTrips)) {
          const formattedTrips = dbTrips.map((trip: any) => ({
            id: trip.id,
            cartId: trip.cartId || trip.id,
            tripName: trip.name,
            startDate: trip.startDate,
            endDate: trip.endDate,
            approxPrice: 0,
            participants: (trip.contributors || []).map((c: any) => ({ name: c.userName })),
          }));

          setTrips(formattedTrips);

          if (formattedTrips.length > 0 && !activeCartId) {
            setActiveCartId(formattedTrips[0].cartId);
          }
        } else {
          setTrips([]);
        }
      } catch (error) {
        console.error("Failed to fetch trips", error);
        setTrips([]);
      }
    };

    fetchUserTrips();
  }, [user, activeCartId, setActiveCartId]);

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
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-6xl mt-[clamp(0.75rem,2vh,1.5rem)] px-[clamp(1rem,4vw,2rem)]">
      <div className="bg-white shadow-lg rounded-full px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.5rem,1vh,0.75rem)] w-full border border-gray-100 relative">
        <div className="flex items-center justify-between">

          {/* Logo Section */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link href="/">
              <Image
                src={smartTripLogo}
                alt="SmartTrip Logo"
                className="h-[clamp(2rem,4vh,2.5rem)] w-auto cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <ul className="flex items-center space-x-[clamp(1rem,2.5vw,2rem)] text-[clamp(14px,1.2vw,16px)] text-gray-600 font-medium">
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
          <div className="flex items-center gap-[clamp(0.25rem,1vw,0.5rem)] shrink-0">
            {/* Cart Icon */}
            {user && (
              <button
                ref={cartButtonRef}
                onClick={() => setActiveDropdown(prev => prev === 'cart' ? null : 'cart')}
                className={`relative p-[clamp(0.5rem,1vw,0.625rem)] rounded-full transition-all cursor-pointer ${
                  activeDropdown === 'cart'
                    ? "bg-gray-100 text-black"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#94C3D2]"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            )}

            <div className="h-[clamp(1.25rem,2.5vh,1.5rem)] w-px bg-gray-200 mx-[clamp(0.25rem,1vw,0.5rem)] hidden md:block"></div>

            {/* Auth Section */}
            <div className="flex items-center">
              {loading ? (
                <div className="px-4 py-2 text-gray-400 text-[clamp(13px,1.2vw,14px)]">
                  Loading...
                </div>
              ) : !user ? (
                <div className="flex items-center gap-[clamp(0.25rem,1vw,0.5rem)]">
                  <LoginButton />
                  <SignUpButton />
                </div>
              ) : (
                <Profile 
                  user={user} 
                  isOpen={activeDropdown === 'profile'}
                  onToggle={() => setActiveDropdown(prev => prev === 'profile' ? null : 'profile')}
                  onClose={() => setActiveDropdown(prev => prev === 'profile' ? null : prev)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Live Cart Overlay */}
        {user && activeDropdown === 'cart' && (
          <div 
            ref={cartDropdownRef}
            className="absolute top-[calc(100%+0.5rem)] right-0 w-[clamp(20rem,30vw,24rem)] z-50 animate-in fade-in slide-in-from-top-5 duration-200"
          >
            {activeCartId ? (
              <LiveCart
                cartId={activeCartId}
                onSwitchCart={(newCartId) => setActiveCartId(newCartId)}
                trips={trips}
              />
            ) : (
              /* Empty State */
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full flex flex-col items-center justify-center text-center relative">
                
                {/* REMOVED CLOSE BUTTON FROM HERE */}

                <div className="bg-blue-50 p-4 rounded-full mb-4 mt-2">
                  <ShoppingCart className="w-8 h-8 text-blue-500" />
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">No Trips Yet</h3>
                <p className="text-sm text-gray-500 mb-8 px-2">
                  You need a trip to start adding flights and hotels to your itinerary.
                </p>

                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/trips", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: "Trip Itinerary", destination: "TBD" }),
                      });

                      if (res.ok) {
                        const newTripData = await res.json();
                        setTrips([{
                          cartId: newTripData.cart.id,
                          tripName: newTripData.trip.name,
                          startDate: null,
                          endDate: null,
                          approxPrice: 0,
                          participants: [{ name: "Me" }]
                        }]);
                        setActiveCartId(newTripData.cart.id);
                      }
                    } catch (error) {
                      console.error("Failed to create default cart:", error);
                    }
                  }}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> Create "Trip Itinerary"
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;