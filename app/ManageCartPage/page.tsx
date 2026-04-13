'use client';

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTrip } from "@/context/TripContext";
import { Pencil, Save, X, UserPlus, ShoppingCart, Trash2, CreditCard } from "lucide-react";

export default function ManageCartPage() {
  const { activeCartId } = useTrip();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);

  // UI States
  const [isEditingName, setIsEditingName] = useState(false);
  const [tripName, setTripName] = useState("");
  const [emailToAdd, setEmailToAdd] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (!activeCartId) {
      setLoading(false);
      return;
    }

    const fetchCartData = async () => {
      // 1. Fetch Cart and its Items
      const { data: cartData, error: cartError } = await supabase
        .from('carts')
        .select('trip_id, cart_items(*)')
        .eq('id', activeCartId)
        .single();

      if (cartError || !cartData) {
        console.error("Error fetching cart:", cartError);
        setLoading(false);
        return;
      }

      setCartItems(cartData.cart_items || []);

      // 2. Fetch Trip Info
      const { data: tripData } = await supabase
        .from('trips')
        .select('*')
        .eq('id', cartData.trip_id)
        .single();

      if (tripData) {
        setTrip(tripData);
        setTripName(tripData.name);
      }

      // 3. Fetch Participants
      const { data: participantsData } = await supabase
        .from('participants')
        .select('role, users(id, email, name)')
        .eq('trip_id', cartData.trip_id);

      if (participantsData) {
        setParticipants(participantsData);
      }

      setLoading(false);
    };

    fetchCartData();
  }, [activeCartId, supabase]);

  // --- Handlers ---

  const handleSaveName = async () => {
    if (!trip || !tripName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('trips')
        .update({ name: tripName })
        .eq('id', trip.id);

      if (error) throw error;
      
      setTrip({ ...trip, name: tripName });
      setIsEditingName(false);
    } catch (error: any) {
      alert("Error updating name: " + error.message);
    }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailToAdd.trim() || !trip) return;
    setAddLoading(true);

    try {
      // 1. Find user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', emailToAdd)
        .single();

      if (userError || !userData) {
        alert("User not found with that email. They must have an account.");
        setAddLoading(false);
        return;
      }

      // 2. Add to participants table
      const { error: insertError } = await supabase
        .from('participants')
        .insert({
          user_id: userData.id,
          trip_id: trip.id,
          role: 'member'
        });

      if (insertError) {
        if (insertError.code === '23505') alert("User is already in this trip.");
        else throw insertError;
      } else {
        setParticipants([...participants, { role: 'member', users: userData }]);
        setEmailToAdd("");
        alert("User added successfully!");
      }
    } catch (error: any) {
      alert("Error adding participant: " + error.message);
    } finally {
      setAddLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
      if (error) throw error;
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      alert("Error removing item.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#94C3D2] border-t-transparent"></div>
    </div>
  );

  if (!activeCartId || !trip) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <p className="text-gray-500 font-medium">No active cart found. Please select a trip first.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-[clamp(6rem,10vw,8rem)] pb-[clamp(3rem,5vw,5rem)] px-[clamp(1rem,4vw,3rem)] flex justify-center">
      <div className="bg-white rounded-[clamp(1.5rem,4vw,2.5rem)] shadow-2xl p-[clamp(1.5rem,5vw,3rem)] w-full max-w-3xl relative">

        {/* --- TITLE SECTION --- */}
        <div className="flex flex-col items-center mb-[clamp(2rem,4vw,3rem)]">
          <div className="w-[clamp(80px,12vw,100px)] h-[clamp(80px,12vw,100px)] rounded-full bg-[#94C3D2]/20 flex items-center justify-center mb-6 border-4 border-white shadow-md">
            <ShoppingCart className="w-10 h-10 text-[#94C3D2]" />
          </div>

          <div className="flex items-center gap-3 w-full justify-center relative">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="text-[clamp(1.75rem,4.5vw,2.5rem)] font-bold text-center border-b-2 border-[#94C3D2] focus:outline-none w-full max-w-[20rem] pb-1 text-gray-800"
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-2 rounded-full hover:bg-green-50 text-green-600 transition-colors">
                  <Save size={24} />
                </button>
                <button onClick={() => { setIsEditingName(false); setTripName(trip.name); }} className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-[clamp(2rem,5vw,2.5rem)] font-bold text-gray-800 tracking-tight text-center">
                  {trip.name}
                </h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#94C3D2]"
                >
                  <Pencil size={20} />
                </button>
              </>
            )}
          </div>
          <p className="text-gray-500 font-medium mt-2">{trip.destination}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(1.5rem,3vw,2rem)]">
          
          {/* --- LEFT COL: COLLABORATORS --- */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserPlus className="text-[#94C3D2] w-5 h-5" />
              Collaborators
            </h3>
            
            {/* Add user form */}
            <form onSubmit={handleAddParticipant} className="flex gap-2 mb-6">
              <input
                type="email"
                placeholder="Friend's email..."
                value={emailToAdd}
                onChange={(e) => setEmailToAdd(e.target.value)}
                className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded-xl focus:ring-2 focus:ring-[#94C3D2] outline-none text-sm"
                required
              />
              <button 
                type="submit" 
                disabled={addLoading}
                className="bg-[#94C3D2] text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
              >
                Add
              </button>
            </form>

            {/* List of participants */}
            <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {participants.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <div className="truncate">
                    <p className="font-bold text-gray-800 text-sm truncate">{p.users.name || 'Traveler'}</p>
                    <p className="text-xs text-gray-500 truncate">{p.users.email}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#94C3D2] bg-[#94C3D2]/10 px-2 py-1 rounded-full">
                    {p.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* --- RIGHT COL: CART ITEMS --- */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Current Items ({cartItems.length})</h3>
            
            <div className="flex-1 space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2 mb-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-10 text-gray-400 italic text-sm">
                  Cart is empty. Time to plan!
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="group bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-[#94C3D2]/50 transition-colors">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                        {item.category}
                      </span>
                      <p className="font-semibold text-gray-800 text-sm truncate max-w-[180px]">
                        {/* Assuming your JSONB data has a title or name. Adjust based on your data structure */}
                        {item.data?.name || item.data?.title || 'Trip Item'}
                      </p>
                      {item.data?.price && (
                        <p className="text-sm font-bold text-green-600 mt-1">${item.data.price}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* CHECKOUT BUTTON */}
            <button 
              className="w-full mt-auto py-3.5 px-4 bg-[#4B4B4B] text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-black transition-colors shadow-lg"
              onClick={() => alert("Redirecting to checkout/payment...")}
            >
              <CreditCard size={20} />
              Checkout Cart
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}