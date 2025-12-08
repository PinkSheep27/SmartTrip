'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function ProfileSettings({ user }: { user: any }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  // Initialize state with existing user metadata
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    avatarUrl: user?.user_metadata?.avatar_url || '',
  });

  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  
  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle Text Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // --- THE MAIN SAVE FUNCTION ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: any = {
        email: formData.email,
        data: { // This 'data' object updates the Public User Metadata
          full_name: formData.fullName,
          avatar_url: formData.avatarUrl,
        },
      };

      // Only add password to the update if the user typed one
      if (passwords.new) {
        if (passwords.new !== passwords.confirm) {
          alert("Passwords do not match!");
          setLoading(false);
          return;
        }
        updates.password = passwords.new;
      }

      // 1. Update Supabase Auth
      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      alert('Profile updated successfully!');
      
      // 2. Refresh the router so server components (like Navbar) re-fetch data
      router.refresh(); 
      
      // 3. Reset UI
      setIsEditing(false);
      setIsPasswordOpen(false);
      setPasswords({ new: '', confirm: '' });

    } catch (error: any) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            if(isEditing) setIsPasswordOpen(false); // Close dropdown on cancel
          }}
          className="text-teal-600 font-semibold hover:underline"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* PFP Section */}
        <div className="flex items-center space-x-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
            {/* Display the image from state so it updates while editing */}
            <Image 
              src={formData.avatarUrl || '/default-pfp.png'} 
              alt="Profile" 
              layout="fill" 
              objectFit="cover" 
            />
          </div>
          {isEditing && (
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">Profile Image URL</label>
              <input
                type="text"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border p-2 text-sm"
                placeholder="https://example.com/my-image.jpg"
              />
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="fullName"
              disabled={!isEditing}
              value={formData.fullName}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border p-2 ${!isEditing ? 'bg-gray-100' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              disabled={!isEditing}
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border p-2 ${!isEditing ? 'bg-gray-100' : ''}`}
            />
            {isEditing && <p className="text-xs text-yellow-600 mt-1">Changing email will require re-confirmation.</p>}
          </div>
        </div>

        {/* Password Dropdown (The requested feature) */}
        <div className="border-t pt-4">
            {!isEditing ? (
                 <div className="text-gray-400 italic text-sm">Enable edit mode to change password</div>
            ) : (
                <div className="border rounded-md p-2 bg-gray-50">
                    <button
                        type="button"
                        onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                        className="flex justify-between items-center w-full text-left font-medium text-gray-700 focus:outline-none"
                    >
                        <span>Change Password</span>
                        {/* Little arrow icon */}
                        <span className={`transform transition-transform ${isPasswordOpen ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                    </button>

                    {/* Dropdown Content */}
                    {isPasswordOpen && (
                        <div className="mt-4 space-y-4 animate-fadeIn px-2 pb-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    name="new"
                                    value={passwords.new}
                                    onChange={handlePasswordChange}
                                    className="mt-1 block w-full rounded-md border p-2 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirm"
                                    value={passwords.confirm}
                                    onChange={handlePasswordChange}
                                    className="mt-1 block w-full rounded-md border p-2 bg-white"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}