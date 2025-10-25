import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Image from "next/image";

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
import NavBar from "@/components/NavBar";

type layoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Smart Trip",
  description: `SmartTrip is your central command for travel, 
    bringing every step of the planning 
    process into one seamless platform.`,
};

export default function RootLayout({ children }: layoutProps) {
  return (
    <html lang="en">
      <body className="bg-[#94C3D2]">
        <NavBar></NavBar>
        {children}
      </body>
    </html>
  );
}
