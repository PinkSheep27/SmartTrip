"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Search,
  MapPin,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  getHours,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  subDays,
} from "date-fns";
import { createClient } from "@/lib/supabase/client";

// --- Types ---
type TripEvent = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
};

type Contributor = {
  userName: string;
  userEmail: string;
  role: string;
};

type Trip = {
  id: number;
  name: string;
  destination: string;
  contributors: Contributor[];
};

type CalendarView = "day" | "week" | "month";

export default function ItineraryPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("week");

  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [events, setEvents] = useState<TripEvent[]>([]);

  // NEW: State for Trip Carousel
  const [tripIndex, setTripIndex] = useState(0);

  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // 1. Fetch Trips
  useEffect(() => {
    async function fetchTrips() {
      try {
        const res = await fetch("/api/trips");
        if (res.ok) {
          const data = await res.json();
          setMyTrips(data);
          if (data.length > 0) setSelectedTripId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoadingTrips(false);
      }
    }
    fetchTrips();
  }, []);

  // 2. Fetch Events
  useEffect(() => {
    async function fetchInternalEvents() {
      if (!selectedTripId) return;
      setLoadingEvents(true);
      try {
        const res = await fetch(`/api/events?tripId=${selectedTripId}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchInternalEvents();
  }, [selectedTripId]);

  // --- TRIP NAVIGATION LOGIC ---
  const nextTrip = () => {
    if (myTrips.length === 0) return;
    const newIndex = (tripIndex + 1) % myTrips.length;
    setTripIndex(newIndex);
    setSelectedTripId(myTrips[newIndex].id);
  };

  const prevTrip = () => {
    if (myTrips.length === 0) return;
    const newIndex = tripIndex === 0 ? myTrips.length - 1 : tripIndex - 1;
    setTripIndex(newIndex);
    setSelectedTripId(myTrips[newIndex].id);
  };

  // --- DATE NAVIGATION LOGIC ---
  const handlePrev = () => {
    if (view === "day") setCurrentDate(subDays(currentDate, 1));
    if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (view === "day") setCurrentDate(addDays(currentDate, 1));
    if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
  };

  // --- CALENDAR HELPERS ---
  const hours = Array.from({ length: 13 }).map((_, i) => i + 8);

  const getDaysToShow = () => {
    if (view === "day") return [currentDate];
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }
    if (view === "month") {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const startWeek = startOfWeek(start, { weekStartsOn: 1 });
      const endWeek = addDays(startOfWeek(end, { weekStartsOn: 1 }), 6);
      return eachDayOfInterval({ start: startWeek, end: endWeek });
    }
    return [];
  };

  const calendarDays = getDaysToShow();

  const getEventStyle = (event: TripEvent) => {
    if (!event.startTime || !event.endTime) return {};
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    const startHour = getHours(start) + start.getMinutes() / 60;
    const endHour = getHours(end) + end.getMinutes() / 60;
    const duration = endHour - startHour;

    const topOffset = (startHour - 8) * 64;
    const height = Math.max(duration * 64, 40);

    return { top: `${topOffset}px`, height: `${height}px` };
  };

  const currentTrip = myTrips[tripIndex];

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-6">
      {/* CENTERING WRAPPER: Changed 'items-center' back to 'items-start' for top alignment */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start justify-center">
        {/* SIDEBAR: PLANNED TRIPS CAROUSEL */}
        <aside className="w-full md:w-1/4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex flex-col items-center text-center h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2 border-b border-gray-100 w-full pb-4">
              <MapPin className="w-5 h-5 text-blue-500" />
              Planned Trips
            </h2>

            {loadingTrips ? (
              <div className="text-center text-gray-400 py-10">Loading...</div>
            ) : myTrips.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                No trips found.
              </div>
            ) : (
              <div className="w-full">
                {/* Single Trip Card */}
                <div
                  className={`group p-5 rounded-2xl border-2 transition-all bg-[#94C3D2]/10 border-[#94C3D2] shadow-sm mb-6`}
                >
                  <div className="flex flex-col items-center gap-1 mb-3">
                    <h3 className="font-bold text-xl text-gray-800">
                      {currentTrip.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {currentTrip.destination}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#94C3D2]/20 w-full">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">
                      Shared With
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {currentTrip.contributors.map((user, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-[#94C3D2]/30 shadow-sm"
                          title={user.userEmail}
                        >
                          <div className="w-5 h-5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-700">
                            {user.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-600 font-medium max-w-[80px] truncate">
                            {user.userName}
                          </span>
                        </div>
                      ))}
                      {currentTrip.contributors.length === 0 && (
                        <span className="text-xs text-gray-400 italic">
                          Just you
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={prevTrip}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex gap-1.5">
                    {myTrips.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          idx === tripIndex ? "bg-blue-500 w-3" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextTrip}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CALENDAR AREA */}
        <main className="flex-1 w-full bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col">
          {/* HEADER */}
          <div className="p-8 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              {/* 1. LARGE INTERACTIVE CALENDAR ICON */}
              <div className="relative group cursor-pointer bg-blue-100 p-3 rounded-2xl hover:bg-blue-200 transition-colors hidden md:block">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                <input
                  type="date"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.valueAsDate)
                      setCurrentDate(e.target.valueAsDate);
                  }}
                  onClick={(e) => {
                    try {
                      (e.target as HTMLInputElement).showPicker();
                    } catch (error) {
                      console.warn("Browser does not support showPicker()");
                    }
                  }}
                />
              </div>

              <div>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Date & Year Text */}
                  <div className="flex items-baseline gap-2">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {view === "day"
                        ? format(currentDate, "MMM d")
                        : format(currentDate, "MMMM")}
                    </h1>
                    <span className="text-2xl font-bold text-gray-800">
                      {currentDate.getFullYear()}
                    </span>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
                    <button
                      onClick={handlePrev}
                      className="p-1.5 hover:bg-white rounded-md transition-colors text-gray-600"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="w-px bg-gray-200 my-1 mx-1"></div>
                    <button
                      onClick={handleNext}
                      className="p-1.5 hover:bg-white rounded-md transition-colors text-gray-600"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
              {["day", "week", "month"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v as CalendarView)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                    view === v
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {v === "day" ? "Today" : v}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden xl:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#94C3D2]"
                />
              </div>
            </div>
          </div>

          {/* CALENDAR BODY */}
          <div className="flex-1 overflow-auto p-6 custom-scrollbar">
            {view === "month" ? (
              <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden min-w-[800px]">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <div
                      key={day}
                      className="bg-gray-50 p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      {day}
                    </div>
                  )
                )}
                {calendarDays.map((day, i) => {
                  const dayEvents = events.filter((e) =>
                    isSameDay(new Date(e.startTime), day)
                  );
                  return (
                    <div
                      key={i}
                      className={`min-h-[120px] bg-white p-2 flex flex-col gap-1 hover:bg-gray-50 transition-colors ${
                        !isSameMonth(day, currentDate) ? "bg-gray-50/50" : ""
                      }`}
                    >
                      <div
                        className={`text-right mb-1 ${
                          isSameDay(day, new Date())
                            ? "text-blue-600 font-bold bg-blue-50 w-7 h-7 rounded-full flex items-center justify-center ml-auto"
                            : "text-gray-600 p-1"
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                      {dayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md truncate font-medium border-l-2 border-blue-500 hover:shadow-sm cursor-pointer transition-shadow"
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-w-[600px]">
                <div className="w-16 flex-shrink-0 pt-12 border-r border-gray-100">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-16 text-xs text-gray-400 text-right pr-4 -mt-2"
                    >
                      {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </div>
                  ))}
                </div>

                <div
                  className={`flex-1 grid ${
                    view === "day" ? "grid-cols-1" : "grid-cols-7"
                  } relative`}
                >
                  {calendarDays.map((day, i) => (
                    <div
                      key={i}
                      className="text-center pb-4 border-b border-gray-100"
                    >
                      <div className="text-xs text-gray-400 font-medium uppercase mb-1">
                        {format(day, "EEE")}
                      </div>
                      <div
                        className={`inline-block w-8 h-8 leading-8 rounded-full text-sm font-bold ${
                          isSameDay(day, new Date())
                            ? "bg-black text-white"
                            : "text-gray-800"
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                  ))}

                  {calendarDays.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="relative border-r border-gray-50 last:border-r-0 pt-2 bg-white"
                    >
                      {hours.map((h, i) => (
                        <div
                          key={i}
                          className="h-16 border-b border-gray-50"
                        ></div>
                      ))}

                      {events
                        .filter((event) =>
                          isSameDay(new Date(event.startTime), day)
                        )
                        .map((event, eventIdx) => {
                          const style = getEventStyle(event);
                          const colors = [
                            "bg-emerald-100 border-emerald-200 text-emerald-800",
                            "bg-indigo-100 border-indigo-200 text-indigo-800",
                            "bg-amber-100 border-amber-200 text-amber-800",
                          ];
                          const colorClass = colors[event.id % colors.length];

                          return (
                            <div
                              key={event.id}
                              className={`absolute w-[90%] left-[5%] p-2 rounded-xl text-xs border ${colorClass} shadow-sm cursor-pointer z-10 hover:scale-105 transition-transform flex flex-col justify-between`}
                              style={style}
                            >
                              <div className="font-bold truncate">
                                {event.title}
                              </div>
                              <div className="flex items-center gap-1 opacity-80 mt-1">
                                <Users size={10} />
                                <span className="truncate text-[10px]">
                                  Group Event
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
