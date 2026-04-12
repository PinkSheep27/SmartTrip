import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/NavBar/page";
import { TripProvider } from "@/context/TripContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 transition-colors duration-300">
        <TripProvider>
          <Navbar /> 
          {children}
        </TripProvider>
      </body>
    </html>
  )
}