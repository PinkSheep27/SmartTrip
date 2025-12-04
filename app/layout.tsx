import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/app/NavBar/page";

type layoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "SmartTrip",
  description: `SmartTrip is your central command for travel, 
    bringing every step of the planning 
    process into one seamless platform.`,
};

export default function RootLayout({ children }: layoutProps) {
  return (
    <html lang="en">
      <body className="bg-white">
        <NavBar />
        {children}
      </body>
    </html>
  );
}