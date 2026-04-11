import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/app/NavBar/page";
import { TripProvider } from "@/context/TripContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white">
        <TripProvider>
          <NavBar />
          {children}
        </TripProvider>
      </body>
    </html>
  );
}