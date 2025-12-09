"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShoppingCart, Plane, Hotel, X, Trash2 } from "lucide-react";

type CartItem = {
  id: number;
  category: string;
  data: any;
};

export default function LiveCart({
  cartId,
  onClose,
}: {
  cartId: number;
  onClose?: () => void;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
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
  }, [cartId]);

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
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          Trip Itinerary
        </h2>

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
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
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
                  {item.category === 'flight' 
                    ? `${item.data.departAirport} → ${item.data.arriveAirport}`
                    : (item.category === 'hotel' && item.data.nights)
                      ? `${item.data.nights} night${item.data.nights > 1 ? 's' : ''}`
                      : item.category}
                </p>
              </div>

              <div className="font-bold text-gray-900 text-sm">
                {item.category === "Attraction"
                  ? "~$25"
                  : item.category === "Restaurant"
                  ? "~$50–$100"
                  : `$${item.data.price}`}
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
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium">
              Total
              <span className="text-gray-600 text-xs">
                {" "}
                (Excluding Dining and Experience)
              </span>
            </span>
            <span className="text-xl font-bold text-gray-900">
              $
              {items
                .reduce((acc, item) => acc + (Number(item.data.price) || 0), 0)
                .toFixed(2)}
            </span>
          </div>
          <button className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95">
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}
