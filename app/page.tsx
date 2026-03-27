"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import LiveCart from "@/components/LiveCartComponents/LiveCart";

import mainBackground from "@/assets/backgrounds/Main-Background.png";
import smartTripLogo from "@/assets/logos/smarttrip-transparent-logo.png";

const leftCardData = {
  "Why SmartTrip?": "Stop juggling dozens of tabs and endless spreadsheets. SmartTrip is your central command for travel, bringing every step of the planning process into one seamless platform.",
  "Find Everything in One Place": "Compare flights, hotels, car rentals, and discover dining and experiences on a single, interactive map. No more cross-referencing multiple sites for the best deal.",
  "Plan Smarter, Not Harder": "Instantly sort options by price, rating, or region to find exactly what you’re looking for. Our powerful filters cut through the noise, saving you time and stress.",
  "Travel Better, Together": "From building a shared itinerary in real-time to splitting payments effortlessly, we make group travel finally feel like a vacation."
}

const headers = Object.keys(leftCardData);
type ContentKey = keyof typeof leftCardData;

const HomePage: React.FC = () => {
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const currentHeader = headers[currentIndex] as ContentKey;
  const currentText = leftCardData[currentHeader];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollButton(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentIndex == headers.length - 1) setCurrentIndex(0);
      else setCurrentIndex(currentIndex + 1);
    }, 5000);
    return () => {
      clearInterval(timer);
    }
  }, [currentIndex, headers.length])

  const handleScrollClick = () => {
    window.scrollTo({
      top: 200,
      behavior: "smooth"
    });
  };

  const goNext = () => {
    if (currentIndex == headers.length - 1) setCurrentIndex(0);
    if (currentIndex < headers.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goBack = () => {
    if (currentIndex == 0) setCurrentIndex(headers.length - 1);
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <>
      {/* Hero Logo - Now uses vw so it physically shrinks on narrow screens */}
      <div className="absolute inset-0 flex items-start justify-center pt-[clamp(6rem,15vh,12rem)] z-20 pointer-events-none">
        <Image
          src={smartTripLogo}
          alt="SmartTrip Logo"
          width={500}
          height={100}
          className="w-[clamp(20rem,75vw,55rem)] h-auto"
        />
      </div>

      {/* Background Image */}
      <div className={`fixed inset-0 z-10 ${scrolled ? 'pointer-events-none' : ''}`}>
        <Image
          src={mainBackground}
          alt="Travel background"
          layout="fill"
          objectFit="contain"
          objectPosition="bottom"
          priority
          className={`transition-transform duration-1000 ease-in-out ${scrolled ? 'scale-106' : 'scale-101'}`}
        />
      </div>

      {/* Scroll Down Button Section */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-1000 ease-in-out ${scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className={`absolute bottom-[clamp(2rem,8vh,4rem)] left-1/2 -translate-x-1/2 transition-opacity duration-500 ${showScrollButton ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col items-center gap-[clamp(0.5rem,1vh,0.75rem)] cursor-pointer group pointer-events-auto" onClick={handleScrollClick}>
            <div className="w-[clamp(2.5rem,4vw,3rem)] h-[clamp(2.5rem,4vw,3rem)] bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:animate-none animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span className="bg-white/90 px-[clamp(0.75rem,2vw,1.25rem)] py-[clamp(0.25rem,1vh,0.5rem)] rounded-full shadow-xl font-medium text-gray-700 text-[clamp(11px,1.2vw,14px)]">
              Scroll Down
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`min-h-screen relative z-30 transition-opacity duration-1000 ease-in-out ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
        <main className="relative mx-auto w-[clamp(40%,80vw,1000px)] text-white flex flex-col md:flex-row justify-between gap-[clamp(1rem,3vw,2rem)] mt-[clamp(50vh,60vh,70vh)]">
          
          {/* Carousel Card - Increased internal horizontal padding to protect text from buttons */}
          <div className="relative bg-[#94C3D2]/90 rounded-[clamp(1rem,2vw,1.5rem)] shadow-xl w-full md:flex-1 min-h-[clamp(18rem,35vh,24rem)] flex flex-col justify-center px-[clamp(3rem,5vw,4.5rem)] py-[clamp(2rem,4vh,3rem)] backdrop-blur-sm border border-white/20 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="pb-[clamp(1rem,3vh,2rem)]"
              >
                <h1 className="text-white text-[clamp(1.5rem,3vw,2.25rem)] font-bold mb-[clamp(0.75rem,2vh,1.5rem)] drop-shadow-md leading-tight">
                  {currentHeader}
                </h1>
                <p className="text-gray-50 text-[clamp(0.95rem,1.5vw,1.125rem)] leading-relaxed font-medium">
                  {currentText}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons - Scaled down for mobile */}
            <button
              type="button"
              onClick={goBack}
              className="absolute top-1/2 -translate-y-1/2 left-[clamp(0.5rem,1.5vw,1rem)] w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)] bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 cursor-pointer z-10"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[50%] w-[50%] text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute top-1/2 -translate-y-1/2 right-[clamp(0.5rem,1.5vw,1rem)] w-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)] bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 cursor-pointer z-10"
              aria-label="Next Slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[50%] w-[50%] text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Carousel Indicators */}
            <div className="absolute flex justify-center bottom-[clamp(1rem,2vh,1.5rem)] left-0 right-0 space-x-2 pointer-events-none z-10">
              {headers.map((header, index) => (
                <div
                  key={header}
                  className={`w-[clamp(6px,1vw,10px)] h-[clamp(6px,1vw,10px)] rounded-full transition-all duration-500 ${currentIndex === index ? 'bg-white scale-125' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </div>

          {/* Collaborative Planning Card */}
          <div className="bg-[#94C3D2]/90 rounded-[clamp(1rem,2vw,1.5rem)] shadow-xl w-full md:flex-1 min-h-[clamp(18rem,35vh,24rem)] flex flex-col justify-center px-[clamp(2rem,4vw,3.5rem)] py-[clamp(2rem,4vh,3rem)] backdrop-blur-sm border border-white/20">
            <h1 className="text-white text-[clamp(1.5rem,3vw,2.25rem)] font-bold mb-[clamp(0.75rem,2vh,1.5rem)] drop-shadow-md leading-tight">
              Collaborative Planning
            </h1>
            <p className="text-gray-50 text-[clamp(0.95rem,1.5vw,1.125rem)] leading-relaxed font-medium">
              Planning for trips is, most of the time, a hassle; especially when you’re
              planning with multiple people who have different ideas of a fun trip.
              That’s where SmartTrip comes in. We get rid of the hassle having to message
              a friend and then waiting a week for them to reply by directly allowing
              multiple people to add to a shared cart.
            </p>
          </div>
        </main>
        
        {/* Mission Statement Section */}
        <div className="relative mx-auto w-[clamp(40%,80vw,1000px)] text-white flex justify-center mt-[clamp(1.5rem,4vh,3rem)] mb-[clamp(2rem,8vh,6rem)]">
          <div className="bg-[#94C3D2]/90 rounded-[clamp(1rem,2vw,1.5rem)] shadow-xl p-[clamp(2rem,5vw,4rem)] w-full text-center min-h-[clamp(15rem,25vh,20rem)] flex flex-col justify-center backdrop-blur-sm border border-white/20">
            <h1 className="text-white text-[clamp(1.75rem,4vw,2.5rem)] font-bold mb-[clamp(1rem,2vh,1.5rem)] drop-shadow-md leading-tight">
              Mission Statement
            </h1>
            <p className="text-gray-50 text-[clamp(1rem,1.5vw,1.125rem)] leading-relaxed font-medium max-w-4xl mx-auto">
              At SmartTrip, our mission is to revolutionize the way the world travels together.
              We believe that while the journey is better shared, the planning process shouldn't drive
              you apart. For too long, group trips have been stifled by the chaos of scattered spreadsheets
              and endless message threads. We exist to bridge the gap between a dream vacation and a booked
              itinerary by creating a unified, democratic space for discovery and coordination.
              By removing the friction of split payments and streamlining communication, we empower you to
              focus less on the logistics and more on the memories you’re about to create.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;