"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

import mainBackground from "@/assets/backgrounds/Main-Background.png";
import smartTripLogo from "@/assets/logos/smarttrip-transparent-logo.png";

const HomePage: React.FC = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollButton(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const handleScrollClick = () => {
    window.scrollTo({
      top: window.innerHeight / 2,
      behavior: "smooth"
    });
  };

  return (
    <>
      <div 
        className={`
          fixed inset-0 z-40 
          ${scrolled ? 'pointer-events-none' : ''} 
        `}
      >
        
        <Image
          src={mainBackground}
          alt="Travel background"
          layout="fill"
          objectFit="contain"  
          objectPosition="bottom" 
          priority
          className={`
            transition-transform duration-1000 ease-in-out
            ${scrolled ? 'scale-110' : 'scale-100'} 
          `}
        />
      </div>

      
      <div 
        className={`
          fixed inset-0 z-50 
          transition-opacity duration-1000 ease-in-out 
          ${scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'} 
        `}
      >
        
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={smartTripLogo}
            alt="SmartTrip Logo"
            width={500}
            height={100}
            className="w-2/3 max-w-xl"
          />
        </div>

        
        <div 
          className={`
            absolute bottom-16 left-1/2 -translate-x-1/2 
            transition-opacity duration-500
            ${showScrollButton ? 'opacity-100' : 'opacity-0'} 
          `}
        >
          <div 
            className="flex flex-col items-center gap-3 cursor-pointer group pointer-events-auto" // Added pointer-events-auto here
            onClick={handleScrollClick}
          >
            
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:animate-none animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            <span className="bg-white/90 px-5 py-2 rounded-full shadow-xl font-medium text-gray-700">
              Scroll Down
            </span>
          </div>
        </div>
      </div>

      <div className={`
          min-h-screen bg-white relative z-10
          transition-opacity duration-1000 ease-in-out 
          ${scrolled ? 'opacity-100' : 'opacity-0'} 
        `}
      > 
        <main className="max-w-6xl mx-auto mt-10 p-8">
          {/* Add pt-20 or similar top padding if NavBar overlap is an issue */}
          <div className="bg-white rounded-lg shadow-md p-8"> 
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to SmartTrip
            </h1>
            <p className="text-gray-600 text-lg">Plan Smarter, Relax Better.</p>
            
            {/* Placeholder */}
            <div className="h-screen py-10">
              <h2 className="text-2xl font-bold">Your Content Starts Here</h2>
              <p>Add your other page components and sections below.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default HomePage;