"use client";

import React, { useEffect, useState } from 'react';
import { useTrip } from "@/context/TripContext";
import { createClient } from "@/lib/supabase/client";

export default function ManageTripPage() {
  const { activeCartId, setActiveCartId } = useTrip();
  const supabase = createClient();

  const [tripDetails, setTripDetails] = useState<any>(null);
  const [cartItems, setCartItems] = useState({ flights: [] as any[], hotels: [] as any[], experiences: [] as any[] });
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: ''
  });

  // --- NEW: Invite State ---
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const avatarColors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-pink-600', 'bg-indigo-600'];

  const fetchTripData = async () => {
    setIsLoading(true);
    try {
      const tripRes = await fetch('/api/trips');
      if (tripRes.ok) {
        const dbTrips = await tripRes.json();
        const currentTrip = dbTrips.find((t: any) => t.cartId === activeCartId || t.id === activeCartId);
        if (currentTrip) {
          setTripDetails(currentTrip);
          setEditData({
            name: currentTrip.name || currentTrip.tripName || '',
            destination: currentTrip.destination || '',
            startDate: currentTrip.startDate ? new Date(currentTrip.startDate).toISOString().split('T')[0] : '',
            endDate: currentTrip.endDate ? new Date(currentTrip.endDate).toISOString().split('T')[0] : ''
          });
        }
      }

      const { data: items } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", activeCartId);

      if (items) {
        setCartItems({
          flights: items.filter(item => item.category === 'flight'),
          hotels: items.filter(item => item.category === 'hotel'),
          experiences: items.filter(item => !['flight', 'hotel'].includes(item.category))
        });
      }
    } catch (error) {
      console.error("Failed to fetch manage page data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeCartId) {
      fetchTripData();
    }
  }, [activeCartId, supabase]);

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/trips', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tripDetails.id, 
          ...editData
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update trip");
      }
      
      await fetchTripData(); 
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating trip:", error);
      alert(`Error: ${error.message}`); 
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm("Are you sure you want to delete this entire trip? This cannot be undone.")) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/trips?id=${tripDetails.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error("Failed to delete trip");
      
      alert("Trip deleted.");
      setActiveCartId(null); 
      window.location.href = '/'; 
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip.");
      setIsSaving(false);
    }
  };

  async function deleteItem(itemId: number, categoryGroup: 'flights' | 'hotels' | 'experiences') {
    try {
      setCartItems((prevItems) => ({
        ...prevItems,
        [categoryGroup]: prevItems[categoryGroup].filter((item: any) => item.id !== itemId)
      }));

      const res = await fetch(`/api/cart?id=${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete item");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to remove item. Please try again.");
    }
  }

  // --- NEW: Handle Sending Invite ---
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteMessage(null);

    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          tripId: tripDetails.id
        })
      });

      const data = await res.json();

      if (res.ok) {
        setInviteMessage({ type: 'success', text: 'Invite sent successfully!' });
        setInviteEmail('');
        await fetchTripData(); // Refresh to show the pending user
        setTimeout(() => {
          setIsInviteOpen(false);
          setInviteMessage(null);
        }, 2000);
      } else {
        setInviteMessage({ type: 'error', text: data.error || 'Failed to send invite.' });
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      setInviteMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsInviting(false);
    }
  };

  // Dynamically map participants, including pending ones
  const dynamicCollaborators = tripDetails?.participants?.length > 0 
    ? tripDetails.participants.map((p: any, index: number) => {
        const name = p.name || p.userName || 'Unknown';
        const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
        return {
          id: p.id || String(index),
          name: name,
          initials: initials || '?',
          color: avatarColors[index % avatarColors.length],
          status: p.status || 'accepted' // Ensure status is mapped
        };
      })
    : [{ id: 'me', name: 'Me', initials: 'ME', color: 'bg-blue-600', status: 'accepted' }]; 

  const flightSubtotal = cartItems.flights.reduce((sum, item) => sum + (Number(item.data.price) || 0), 0);
  const hotelSubtotal = cartItems.hotels.reduce((sum, item) => sum + (Number(item.data.price) || 0), 0);
  const total = flightSubtotal + hotelSubtotal;
  
  // Only count accepted members for splitting the cost
  const acceptedCount = dynamicCollaborators.filter((c: any) => c.status === 'accepted').length || 1;
  const perPerson = total / acceptedCount;

  const getAddedBy = (itemIndex: number) => dynamicCollaborators[itemIndex % dynamicCollaborators.length];

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-28"><p className="text-gray-500 font-medium">Loading trip details...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pt-28 md:pt-32 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header with Edit Form */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            {isEditing ? (
              <form onSubmit={handleUpdateTrip} className="w-full">
                {/* ... (Your existing edit form code) ... */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800">Edit Trip Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Trip Name</label>
                    <input 
                      type="text" 
                      value={editData.name} 
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Destination</label>
                    <input 
                      type="text" 
                      value={editData.destination} 
                      onChange={(e) => setEditData({...editData, destination: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      value={editData.startDate} 
                      onChange={(e) => setEditData({...editData, startDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                    <input 
                      type="date" 
                      value={editData.endDate} 
                      onChange={(e) => setEditData({...editData, endDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                  <button type="button" onClick={handleDeleteTrip} className="w-full sm:w-auto text-sm font-medium text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg transition-colors border border-red-100 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete Entire Trip
                  </button>
                  
                  <div className="flex w-full sm:w-auto gap-3">
                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSaving} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="w-full">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{tripDetails?.name || tripDetails?.tripName || "Trip Itinerary"}</h1>
                  
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors group"
                    title="Edit Trip Info"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-gray-500 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {tripDetails?.startDate && tripDetails?.endDate 
                    ? `${new Date(tripDetails.startDate).toLocaleDateString()} - ${new Date(tripDetails.endDate).toLocaleDateString()}` 
                    : "Dates TBD"} 
                  • {tripDetails?.destination || "Destination TBD"}
                </p>
              </div>
            )}
          </div>
          
          {/* --- MODIFIED: Collaborators & Invite Section --- */}
          <div className="mt-6 pt-4 border-t border-gray-100 relative">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500 mr-2">Trip Members:</span>
              <div className="flex -space-x-2">
                {dynamicCollaborators.map((user: any) => (
                  <div 
                    key={user.id} 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm relative ${user.color} ${user.status === 'pending' ? 'opacity-50 border-dashed' : ''}`} 
                    title={`${user.name} ${user.status === 'pending' ? '(Pending)' : ''}`}
                  >
                    {user.initials}
                    {user.status === 'pending' && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setIsInviteOpen(!isInviteOpen)}
                className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 text-gray-400 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-colors ml-1 bg-gray-50"
              >
                +
              </button>
            </div>

            {/* Invite Dropdown Form */}
            {isInviteOpen && (
              <div className="absolute left-0 mt-3 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10 animate-in fade-in slide-in-from-top-2">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Invite Collaborator</h3>
                <form onSubmit={handleSendInvite}>
                  <input
                    type="email"
                    placeholder="Enter their email..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  
                  {inviteMessage && (
                    <p className={`text-xs mb-3 font-medium ${inviteMessage.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {inviteMessage.text}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button 
                      type="submit" 
                      disabled={isInviting || !inviteEmail}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isInviting ? 'Sending...' : 'Send Invite'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsInviteOpen(false);
                        setInviteMessage(null);
                        setInviteEmail('');
                      }}
                      className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* ... Rest of the component (grid layout, cart items, summary) ... */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* Flights Section */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Flights
              </h2>
              {cartItems.flights.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-gray-500 text-sm">No flights added yet.</div>
              ) : (
                <div className="space-y-3">
                  {cartItems.flights.map((flight, index) => {
                    const addedBy = getAddedBy(index);
                    return (
                      <div key={flight.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-shadow">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">✈️</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{flight.data.departAirport} ➔ {flight.data.arriveAirport} <span className="text-sm font-normal text-gray-500 ml-2">{flight.data.airline}</span></h3>
                          <p className="text-sm text-gray-500 mt-1">Times TBD</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end mr-4">
                            <span className="font-bold">${flight.data.price}</span>
                            <div className="flex items-center gap-1 mt-1 text-xs" title={`Added by ${addedBy.name}`}>
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] ${addedBy.color}`}>{addedBy.initials}</div>
                              <span className="text-emerald-600 font-medium flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Approved</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteItem(flight.id, 'flights')}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove flight"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Hotels Section */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Stays
              </h2>
              {cartItems.hotels.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-gray-500 text-sm">No stays added yet.</div>
              ) : (
                <div className="space-y-3">
                  {cartItems.hotels.map((hotel, index) => {
                    const addedBy = getAddedBy(index + 1);
                    return (
                      <div key={hotel.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-shadow">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Hotel thumbnail" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{hotel.data.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{hotel.data.nights} night{hotel.data.nights > 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end mr-4">
                            <span className="font-bold">${hotel.data.price}</span>
                            <div className="flex items-center gap-1 mt-1 text-xs" title={`Added by ${addedBy.name}`}>
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] ${addedBy.color}`}>{addedBy.initials}</div>
                              <span className="text-amber-500 font-medium flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full"></span> Awaiting Consensus</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteItem(hotel.id, 'hotels')}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove stay"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Experiences Section */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Experiences & Dining
              </h2>
              {cartItems.experiences.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50">
                   <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">🍽️</div>
                   <h3 className="text-gray-900 font-medium mb-1">No plans yet!</h3>
                   <p className="text-gray-500 text-sm mb-4">Add restaurants, tours, or events to your itinerary.</p>
                   <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                     Explore Destinations
                   </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.experiences.map((exp, index) => {
                    const addedBy = getAddedBy(index + 2);
                    const isDining = exp.category.toLowerCase() === 'restaurant' || exp.category.toLowerCase() === 'dining';
                    
                    let priceDisplay = exp.data?.price ? `$${exp.data.price}` : 'TBD';
                    if (exp.category === "Attraction") priceDisplay = "~$25";
                    if (exp.category === "Restaurant") {
                      if (exp.data.price === "$") priceDisplay = "~$10–$25";
                      else if (exp.data.price === "$$") priceDisplay = "~$25–$50";
                      else if (exp.data.price === "$$$" || exp.data.price === "$$$$") priceDisplay = "~$50–$100+";
                    }

                    return (
                      <div key={exp.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-shadow">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isDining ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {isDining ? '🍽️' : '🎟️'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{exp.data?.name || 'Experience'}</h3>
                          <p className="text-sm text-gray-500 mt-1 capitalize">{exp.category}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end mr-4">
                            <span className="font-bold text-gray-600">{priceDisplay}</span>
                            <div className="flex items-center gap-1 mt-1 text-xs" title={`Added by ${addedBy.name}`}>
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] ${addedBy.color}`}>{addedBy.initials}</div>
                              <span className="text-emerald-600 font-medium flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Planned</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteItem(exp.id, 'experiences')}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove experience"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

          </div>

          {/* Right Column: Sticky Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sticky top-32">
              <h3 className="text-lg font-bold mb-4 border-b border-gray-100 pb-4">Trip Summary</h3>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Flights</span>
                  <span className="font-medium text-gray-900">${flightSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Stays</span>
                  <span className="font-medium text-gray-900">${hotelSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Experiences</span>
                  <span className="font-medium text-gray-900">$0.00</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-bold text-gray-900 text-lg">Total</span>
                  <span className="font-bold text-gray-900 text-2xl">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-blue-600 bg-blue-50 p-2 rounded-lg mt-3">
                  <span className="font-medium">Split between {acceptedCount}</span>
                  <span className="font-bold">${perPerson.toFixed(2)} / pp</span>
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors text-center mb-3">
                Proceed to Checkout
              </button>
              <p className="text-xs text-center text-gray-400">You won't be charged yet. All collaborators must approve before final payment.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}