"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShoppingCart, Plane, Hotel, Trash2 } from "lucide-react"; // Removed X import here
import CartSwitcherModal from "./CartSwitcherModal";
import Link from "next/link";

type CartItem = {
  id: number;
  category: string;
  data: any;
};

export default function LiveCart({
  cartId,
  onSwitchCart,
  trips,
}: {
  cartId: number;
  onSwitchCart: (newCartId: number) => void;
  trips: any[];
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", cartId);

      if (data) setItems(data);
    };

    fetchItems();

    const channel = supabase
      .channel("realtime-cart")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `cart_id=eq.${cartId}`,
        },
        (payload) => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cartId, supabase]);

  async function deleteItem(itemId: number) {
    try {
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

      const res = await fetch(`/api/cart?id=${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete item");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to remove item.");
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-full max-h-[80vh] overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
        <button
          onClick={() => setIsSwitcherOpen(true)}
          className="text-xl font-bold flex items-center gap-2 text-gray-800 hover:text-blue-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          Trip Itinerary
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md ml-2">
            Switch
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 px-2 py-1 rounded-full border border-green-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase text-green-700 tracking-wider">
              Live
            </span>
          </div>
          {/* REMOVED CLOSE BUTTON FROM HERE */}
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {items.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p>Cart is empty</p>
            <p className="text-xs mt-1">
              Add items to see them appear instantly!
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all group"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                {item.category === "flight" ? (
                  <Plane className="w-4 h-4 text-blue-500" />
                ) : (
                  <Hotel className="w-4 h-4 text-orange-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {item.category === "flight"
                    ? item.data.airline
                    : item.data.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {/* Updated display logic for hotels */}
                  {item.category === "flight"
                    ? `${item.data.departAirport} → ${item.data.arriveAirport}`
                    : item.category === "hotel" && item.data.nights
                      ? `${item.data.nights} night${item.data.nights > 1 ? "s" : ""
                      }`
                      : item.category}
                </p>
              </div>

              <div className="font-bold text-gray-900 text-sm">
                {item.category === "Attraction"
                  ? "~$25"
                  : item.category === "Restaurant"
                    ? item.data.price === "$"
                      ? "~$10–$25"
                      : item.data.price === "$$"
                        ? "~$25–$50"
                        : "~$50–$100"
                    : ""}
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t border-gray-100 p-4 mt-auto">
          {/* Subtotal row (keep your existing one) */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Subtotal</span>
            <span className="text-xl font-bold text-gray-900">$850.00</span>
          </div>

          {/* NEW: The Manage Trip Button */}
          <Link
            href="/ManagePage"
            className="w-full flex items-center justify-center py-3 px-4 mb-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            Manage Trip
          </Link>

          <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors">
            Checkout
          </button>
        </div>
      )}
      <CartSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onSelectCart={(newCartId) => {
          onSwitchCart(newCartId);
        }}
        onCreateCart={() => {
          console.log("Create new cart clicked");
        }}
        trips={trips}
      />
    </div>
  );
}