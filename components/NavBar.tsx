"use client";

import React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

//Logo
import smartTripLogo from "../assets/logos/smarttrip-transparent-logo.png";

//outlined favicons for when not hovered over
import flightsIconOutlinedImg from "../assets/favicons/flights-outlined-100px.png";
import hotelsIconOutlinedImg from "../assets/favicons/hotels-outlined-100px.png";
import carsIconOutlinedImg from "../assets/favicons/car-rental-outlined-100px.png";
import experiencesIconOutlinedImg from "../assets/favicons/experiences-outlined-100px.png";

//filled in favicons for when hovered over
import flightsIconFilledImg from "../assets/favicons/flights-filled-in-100px.png";
import hotelsIconFilledImg from "../assets/favicons/hotels-filled-in-100px.png";
import carsIconFilledImg from "../assets/favicons/car-rental-filled-in-100px.png";
import experiencesIconFilledImg from "../assets/favicons/experiences-filled-in-100px.png";

const Navbar: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navLinks = [
    {
      href: "/FlightsPage",
      label: "Flights",
      iconOutlined: flightsIconOutlinedImg,
      iconFilled: flightsIconFilledImg,
    },
    {
      href: "#",
      label: "Hotels",
      iconOutlined: hotelsIconOutlinedImg,
      iconFilled: hotelsIconFilledImg,
    },
    {
      href: "#",
      label: "Cars",
      iconOutlined: carsIconOutlinedImg,
      iconFilled: carsIconFilledImg,
    },
    {
      href: "#",
      label: "Experiences",
      iconOutlined: experiencesIconOutlinedImg,
      iconFilled: experiencesIconFilledImg,
    },
    {
      href: "/DiningPage",
      label: "Dining",
      iconOutlined: experiencesIconOutlinedImg,
      iconFilled: experiencesIconFilledImg,
    },
  ];

  return (
    <div className={`
      fixed top-0 left-1/2 -translate-x-1/2 z-60 w-full max-w-6xl mt-6 px-6
      opacity-100 pointer-events-auto
    `}>
      <div className="bg-white shadow-lg rounded-full px-6 py-3 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Image
                src={smartTripLogo}
                alt="SmartTrip Logo"
                className="h-8 w-auto cursor-pointer"
              />
            </Link>
          </div>
          <ul className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
            {navLinks.map((link) => (
              <li
                key={link.label}
                onMouseEnter={() => setHoveredItem(link.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={link.href}
                  className="flex items-center space-x-1 hover:text-teal-500 transition-colors"
                >
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
          <div className="hidden md:flex items-center space-x-2">
            <a href="#" className="px-5 py-2 text-teal-500 border border-teal-400 rounded-full hover:bg-teal-50 transition-colors">
              Log In
            </a>
            <a href="#" className="px-5 py-2 text-white bg-teal-500 rounded-full hover:bg-teal-600 transition-colors">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
