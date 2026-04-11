"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface TripContextType {
  activeCartId: number | null;
  setActiveCartId: (id: number | null) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [activeCartId, setActiveCartId] = useState<number | null>(null);

  return (
    <TripContext.Provider value={{ activeCartId, setActiveCartId }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
}