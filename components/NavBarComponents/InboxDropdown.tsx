"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InboxDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Fetch immediately, and then poll every 15 seconds for new invites
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); 
    return () => clearInterval(interval);
  }, []);

  const handleInviteResponse = async (notificationId: number, action: 'accept' | 'decline') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/invites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, action })
      });

      if (res.ok) {
        await fetchNotifications(); // Refresh the list
        router.refresh(); // Refresh Next.js so the new trip shows up in their trips list!
      } else {
        alert(`Failed to ${action} invite.`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="relative">
      {/* Inbox Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Inbox</h3>
            {unreadCount > 0 && <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{unreadCount} New</span>}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No notifications yet.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <li key={notif.id} className={`p-4 transition-colors ${notif.status === 'unread' ? 'bg-blue-50/30' : 'bg-white'}`}>
                    <p className="text-sm text-gray-800 font-medium">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                    
                    {/* Action Buttons (Only show if it's an invite that hasn't been actioned yet) */}
                    {notif.type === 'trip_invite' && notif.status !== 'actioned' && (
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => handleInviteResponse(notif.id, 'accept')}
                          disabled={isLoading}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleInviteResponse(notif.id, 'decline')}
                          disabled={isLoading}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    
                    {/* Status Badge if they already actioned it */}
                    {notif.type === 'trip_invite' && notif.status === 'actioned' && (
                      <span className="inline-block mt-2 text-xs font-medium text-gray-400 italic">Responded</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}