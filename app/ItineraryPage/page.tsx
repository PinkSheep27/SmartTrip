"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search, Plus, User } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, parseISO, getHours } from "date-fns";

// --- Types ---
type GoogleEvent = {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  attendees?: { email: string; displayName?: string }[];
  creator?: { email: string; displayName?: string };
};

type Trip = {
  id: number;
  name: string;
  contributors: number;
};

// --- Main Page Component ---
export default function ItineraryPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<number>(1);

  // Mock Trips Data for Sidebar
  const trips: Trip[] = [
    { id: 1, name: "NYC Tech Summit", contributors: 4 },
    { id: 2, name: "Tokyo Vacation", contributors: 2 },
    { id: 3, name: "London Holiday", contributors: 5 },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/calendar");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching calendar:", error);
    } finally {
      setLoading(false);
    }
  }

  // Calendar Helpers
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const hours = Array.from({ length: 13 }).map((_, i) => i + 8); // 8 AM to 8 PM

  // Function to place events on the grid
  const getEventStyle = (event: GoogleEvent) => {
    if (!event.start.dateTime || !event.end.dateTime) return {};
    
    const start = parseISO(event.start.dateTime);
    const end = parseISO(event.end.dateTime);
    
    // Calculate grid position based on time
    const startHour = getHours(start) + (start.getMinutes() / 60);
    const endHour = getHours(end) + (end.getMinutes() / 60);
    const duration = endHour - startHour;
    
    // 8 AM is row 1. So if start is 9:30 (9.5), row is (9.5 - 8) * height_multiplier
    const topOffset = (startHour - 8) * 64; // 64px is row height (h-16)
    const height = duration * 64;

    return {
      top: `${topOffset}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-6 flex flex-col md:flex-row gap-8">
      
      {/* --- LEFT SIDEBAR: PLANNED TRIPS --- */}
      <aside className="w-full md:w-1/4 flex flex-col gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Planned Trips</h2>
          
          <div className="space-y-4">
            {trips.map((trip) => (
              <div 
                key={trip.id}
                onClick={() => setSelectedTrip(trip.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                  selectedTrip === trip.id 
                    ? "bg-[#94C3D2]/10 border-[#94C3D2]" 
                    : "bg-gray-50 border-transparent hover:bg-gray-100"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-700">{trip.name}</h3>
                  {selectedTrip === trip.id && <div className="h-2 w-2 bg-[#94C3D2] rounded-full"></div>}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  {Array.from({length: trip.contributors}).map((_, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                      <span>Contributor {i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-6">
             <div className="w-2 h-2 rounded-full bg-gray-800"></div>
             <div className="w-2 h-2 rounded-full bg-gray-300"></div>
             <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
          
          <button className="w-full mt-6 bg-white border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
            Select Trip
          </button>
        </div>

        {/* Suggestion / API Note */}
        <div className="text-xs text-gray-400 px-2 text-center">
          <span className="inline-block -rotate-6 transform">↳</span> 
          Syncs with Google Calendar API using your Supabase session.
        </div>
      </aside>


      {/* --- RIGHT MAIN: CALENDAR --- */}
      <main className="flex-1 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-blue-100 p-3 rounded-2xl">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-gray-800">Trip Itinerary</h1>
               <p className="text-gray-500 text-sm">Collaborative Planning</p>
             </div>
          </div>

          <div className="flex items-center bg-gray-50 rounded-xl p-1 gap-1">
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all">Today</button>
            <button className="px-4 py-2 text-sm font-medium bg-white text-gray-800 shadow-sm rounded-lg">Week</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all">Month</button>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#94C3D2]"
                />
             </div>
             <button className="bg-black text-white p-2 rounded-xl hover:bg-gray-800 transition-colors">
                <Plus className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex min-w-[800px]">
            
            {/* Time Column */}
            <div className="w-16 flex-shrink-0 pt-12 border-r border-gray-100">
              {hours.map((hour) => (
                <div key={hour} className="h-16 text-xs text-gray-400 text-right pr-4 -mt-2">
                  {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
              ))}
            </div>

            {/* Days Columns */}
            <div className="flex-1 grid grid-cols-7 relative">
              {/* Day Headers */}
              {weekDays.map((day, i) => (
                <div key={i} className="text-center pb-4 border-b border-gray-100">
                  <div className="text-xs text-gray-400 font-medium uppercase mb-1">{format(day, "EEE")}</div>
                  <div className={`inline-block w-8 h-8 leading-8 rounded-full text-sm font-bold ${
                    isSameDay(day, currentDate) ? "bg-black text-white" : "text-gray-800"
                  }`}>
                    {format(day, "d")}
                  </div>
                </div>
              ))}

              {/* Grid Lines & Events Container */}
              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className="relative border-r border-gray-50 last:border-r-0 pt-2">
                  {/* Horizontal Guide Lines */}
                  {hours.map((h, i) => (
                    <div key={i} className="h-16 border-b border-gray-50"></div>
                  ))}

                  {/* Events for this Day */}
                  {events
                    .filter(event => 
                      event.start.dateTime && isSameDay(parseISO(event.start.dateTime), day)
                    )
                    .map((event, eventIdx) => {
                      const style = getEventStyle(event);
                      // Visual variation logic based on index
                      const colorClass = eventIdx % 3 === 0 
                        ? "bg-orange-100 border-orange-200 text-orange-800" 
                        : eventIdx % 3 === 1 
                        ? "bg-blue-100 border-blue-200 text-blue-800"
                        : "bg-purple-100 border-purple-200 text-purple-800";

                      return (
                        <div
                          key={event.id}
                          className={`absolute w-[90%] left-[5%] p-2 rounded-xl text-xs border ${colorClass} shadow-sm cursor-pointer hover:scale-105 transition-transform z-10`}
                          style={style}
                        >
                          <div className="flex items-center gap-2 mb-1">
                             <div className="font-bold truncate">{event.summary}</div>
                          </div>
                          
                          {/* Mock "Event from..." Bubble (Figma style) */}
                          <div className="flex items-center gap-1 mt-1 opacity-80">
                             <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[8px] overflow-hidden">
                                {event.creator?.email ? event.creator.email[0].toUpperCase() : <User size={10} />}
                             </div>
                             <span className="truncate text-[10px]">
                                {event.start.dateTime ? format(parseISO(event.start.dateTime), "h:mm a") : ""}
                             </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}