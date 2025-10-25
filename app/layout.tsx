import type { Metadata } from "next";
import "./globals.css";

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
