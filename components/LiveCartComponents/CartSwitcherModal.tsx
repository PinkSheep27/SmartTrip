"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, ChevronLeft, ChevronRight, X } from "lucide-react";

export type TripSummary = {
  cartId: number;
  tripName: string;
  startDate: string | null;
  endDate: string | null;
  approxPrice: number;
  participants: { name: string; avatarUrl?: string }[];
};

interface CartSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCart: (cartId: number) => void;
  onCreateCart: () => void;
  trips: TripSummary[];
}

export default function CartSwitcherModal({
  isOpen,
  onClose,
  onSelectCart,
  onCreateCart,
  trips,
}: CartSwitcherModalProps) {
  // We need to wait for the component to mount before using createPortal (Next.js rule)
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setMounted(true);

    // Prevent scrolling on the main page when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const TRIPS_PER_PAGE = 9;
  const totalPages = Math.ceil(trips.length / TRIPS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * TRIPS_PER_PAGE;
  const visibleTrips = trips.slice(startIndex, startIndex + TRIPS_PER_PAGE);

  // If not open or not mounted yet, render nothing
  if (!isOpen || !mounted) return null;

  // This is the actual modal content
  const modalContent = (
    // ADD THE ID HERE: id="cart-switcher-modal"
    <div id="cart-switcher-modal" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-gray-600/50 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* The Centered Box - Fluid max height and width */}
      <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 bg-white border-b border-gray-100 shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Your Trips</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Grid Content - This section scrolls if there are too many items on small screens */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">

            {/* Create a Cart Button - Always First on Page 1 */}
            {currentPage === 1 && (
              <button
                onClick={onCreateCart}
                className="flex flex-col items-center justify-center p-6 min-h-[8rem] rounded-xl border-2 border-dashed border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2" />
                <span className="font-semibold text-gray-600 group-hover:text-blue-600">Create a Cart</span>
              </button>
            )}

            {/* Trip Cards */}
            {visibleTrips.map((trip) => (
              <button
                key={trip.cartId}
                onClick={() => {
                  onSelectCart(trip.cartId);
                  onClose();
                }}
                className="flex flex-col justify-between p-5 min-h-[8rem] rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all text-left group"
              >
                <div className="flex justify-between items-start w-full">
                  <div className="max-w-[70%]">
                    <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-blue-600 transition-colors">
                      {trip.tripName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "Dates TBD"}
                    </p>
                  </div>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md text-sm">
                    ~${trip.approxPrice.toFixed(0)}
                  </span>
                </div>

                <div className="flex -space-x-2 overflow-hidden mt-4 pt-4 w-full border-t border-gray-50">
                  {trip.participants.slice(0, 3).map((p, i) => (
                    <div
                      key={i}
                      className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-blue-100 items-center justify-center text-xs font-bold text-blue-800"
                      title={p.name || "Unknown User"}
                    >
                      {(p.name || "?").charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {trip.participants.length > 3 && (
                    <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 items-center justify-center text-xs font-bold text-gray-600">
                      +{trip.participants.length - 3}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 bg-white border-t border-gray-100 shrink-0">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-sm text-gray-500 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Here is the magic: Render the modal directly into the document body
  return createPortal(modalContent, document.body);
}