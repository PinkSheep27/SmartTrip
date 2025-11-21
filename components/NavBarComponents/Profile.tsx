"use client";
import React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Profile() {
  const { user } = useUser();

  // You can add an image here later if you want
  // e.g., <img src={user?.picture} alt={user?.name} />
  
  return (
    <span className="px-3 text-gray-700">
      {user?.name || user?.email}
    </span>
  );
}