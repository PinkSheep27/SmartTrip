import type { Metadata } from "next";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import "./globals.css";
import NavBar from "@/app/NavBar/NavBar";

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
      <body className="bg-white">
        <Auth0Provider>
          <NavBar />
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}
