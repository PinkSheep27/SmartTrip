"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/LoginPage");
        return;
      }

      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      setUser({ ...user, ...dbUser });
      setLoading(false);
    };

    getUserData();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <div className="text-lg text-gray-900">{user?.email}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Name</label>
            <div className="text-lg text-gray-900">{user?.name || "No name set"}</div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h2 className="text-xl font-bold mb-4">My Stats</h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-blue-50 p-4 rounded-xl">
                 <p className="text-blue-600 font-bold text-xl">0</p>
                 <p className="text-sm text-gray-600">Trips Planned</p>
               </div>
               <div className="bg-green-50 p-4 rounded-xl">
                 <p className="text-green-600 font-bold text-xl">Active</p>
                 <p className="text-sm text-gray-600">Account Status</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}