"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import mainBackground from "@/assets/backgrounds/Main-Background.png";
import smartTripLogo from "@/assets/logos/smarttrip-transparent-logo.png";
import { header } from "framer-motion/client";

const leftCardData = {
  "Why SmartTrip?" : "Stop juggling dozens of tabs and endless spreadsheets. SmartTrip is your central command for travel, bringing every step of the planning process into one seamless platform.",
  "Find Everything in One Place" : "Compare flights, hotels, car rentals, and discover dining and experiences on a single, interactive map. No more cross-referencing multiple sites for the best deal.",
  "Plan Smarter, Not Harder" : "Instantly sort options by price, rating, or region to find exactly what you’re looking for. Our powerful filters cut through the noise, saving you time and stress.",
  "Travel Better, Together" : "From building a shared itinerary in real-time to splitting payments effortlessly, we make group travel finally feel like a vacation."
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
      if (window.scrollY > 300) {
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
      <div className="absolute inset-0 flex items-start justify-center pt-44 z-20">
            <Image
              src={smartTripLogo}
              alt="SmartTrip Logo"
              width={500}
              height={100}
              className="w-2/3 max-w-[50rem]"
            />
      </div>

      <div 
        className={`
          fixed inset-0 z-10 
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
            ${scrolled ? 'scale-106' : 'scale-101'} 
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
        <div 
          className={`
            absolute bottom-16 left-1/2 -translate-x-1/2 
            transition-opacity duration-500
            ${showScrollButton ? 'opacity-100' : 'opacity-0'} 
          `}
        >
          <div 
            className="flex flex-col items-center gap-3 cursor-pointer group pointer-events-auto"
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
          min-h-screen relative z-30
          transition-opacity duration-1000 ease-in-out 
          ${scrolled ? 'opacity-100' : 'opacity-0'} 
        `}
      > 
        <main className="
          relative top-50 max-w-3/5 mx-auto 
          text-white flex justify-between gap-8 mt-[50vh]
          ">
            <div className="
              relative 
              bg-[#94C3D2]/80 rounded-lg shadow-xl 
              pt-10 pl-20 pr-20 pb-10 max-w-7/15
              overflow-auto text-left
              min-h-75 
            ">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
            
                  className="pb-10" 
                >
                  <h1 className="text-blue-500 text-4xl font-bold mb-6">
                    {currentHeader}
                  </h1>
                  <p className="text-gray-100 text-lg">
                    {currentText}
                  </p>
                </motion.div>
              </AnimatePresence>

                <button
                  type="button"
                  onClick={goBack}
                  className="
                    absolute top-1/2 -translate-y-1/2 left-4 
                    w-12 h-12 bg-white rounded-full 
                    flex items-center justify-center 
                    shadow-xl cursor-pointer"
                  aria-label="Previous slide"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="
                    absolute top-1/2 -translate-y-1/2 right-4 
                    w-12 h-12 bg-white/90 rounded-full 
                    flex items-center justify-center 
                    shadow-xl cursor-pointer"
                  aria-label="Next Slide"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

              <div className="
                absolute flex justify-center
                bottom-10 left-0 right-0
                space-x-2
                pointer-events-none "
              >
                {headers.map((header, index) => (
                  <div
                    key={header}
                    className={`
                      w-3 h-3 rounded-full transition-colors duration-500
                      ${currentIndex === index ? 'bg-gray-400' : 'bg-white'}
                    `}
                  />
                ))}
              </div>
            </div>
    
            <div className="
              bg-[#94C3D2]/80 rounded-lg shadow-xl 
              p-10 max-w-7/15
              overflow-auto text-left
              min-h-75
            "> 
              <h1 className="text-blue-500 text-4xl font-bold mb-6">
                Collaborative Planning
              </h1>
              <p className="text-gray-100 text-lg">
                Planning for trips is, most of the time, a hassle; especially when you’re 
                planning with multiple people who have different ideas of a fun trip. 
                That’s where SmartTrip comes in. We get rid of the hassle having to message 
                a friend and then waiting a week for them to reply by directly allowing 
                multiple people to add to a shared cart.
              </p>
            </div>
        </main>
      </div>
    </>
  );
};

export default HomePage;