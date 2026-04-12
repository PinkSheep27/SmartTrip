'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Ensure this path matches your setup
import { useRouter } from "next/navigation";
import { Pencil, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // Form Data (Removed avatarUrl from editable state)
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  // Separate state for the readonly image to ensure it doesn't get messed up
  const [displayImage, setDisplayImage] = useState("");

  const [passwords, setPasswords] = useState({ new: "", confirm: "" });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      // 1. Get Auth User
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/LoginPage");
        return;
      }

      // 2. Get Public User Details (Optional: only if you sync to a 'users' table)
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

      // 3. Logic to determine display name & image
      const emailName = authUser.email?.split('@')[0] || "Traveler";
      const displayName = authUser.user_metadata?.full_name || dbUser?.name || emailName;

      // STRICTLY use the metadata image (same as Navbar)
      const avatarUrl = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || "";

      // 4. Get Trips
      let userTrips: any[] = [];
      if (dbUser) {
        const { data: fetchedTrips } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', dbUser.id);
        userTrips = fetchedTrips || [];
      }

      setUser({ ...authUser, ...dbUser });
      setFormData({
        name: displayName,
        email: authUser.email || ""
      });
      setDisplayImage(avatarUrl);
      setTrips(userTrips);
      setLoading(false);
    };

    getData();
  }, [router, supabase]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const handleSave = async () => {
    try {
      const updates: any = {
        data: {
          full_name: formData.name,
          // We do NOT update avatar_url here, keeping it synced with provider
        }
      };

      // If user entered a password, add it to updates
      if (passwords.new) {
        if (passwords.new !== passwords.confirm) {
          alert("New passwords do not match!");
          return;
        }
        updates.password = passwords.new;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      alert("Profile updated!");

      // Update local state to reflect changes immediately
      setUser((prev: any) => ({ ...prev, name: formData.name }));
      setIsEditing(false);
      setIsPasswordOpen(false);
      setPasswords({ new: "", confirm: "" });

      router.refresh(); // Refresh server components (Navbar)

    } catch (error: any) {
      console.error(error);
      alert("Error updating profile: " + error.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#94C3D2] border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-[clamp(6rem,10vw,8rem)] pb-[clamp(3rem,5vw,5rem)] px-[clamp(1rem,4vw,3rem)] flex justify-center">
      <div className="bg-white rounded-[clamp(1.5rem,4vw,2.5rem)] shadow-2xl p-[clamp(1.5rem,5vw,4rem)] w-full max-w-2xl relative">

        {/* Edit Buttons */}
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-[clamp(1.5rem,3vw,2rem)] right-[clamp(1.5rem,3vw,2rem)] p-[clamp(0.4rem,1vw,0.75rem)] rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            title="Edit Profile"
          >
            <Pencil className="w-[clamp(1.25rem,2vw,1.5rem)] h-[clamp(1.25rem,2vw,1.5rem)]" />
          </button>
        ) : (
          <div className="absolute top-[clamp(1.5rem,3vw,2rem)] right-[clamp(1.5rem,3vw,2rem)] flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setIsPasswordOpen(false);
                setPasswords({ new: "", confirm: "" });
                const emailName = user?.email?.split('@')[0] || "Traveler";
                const originalName = user?.user_metadata?.full_name || user?.name || emailName;
                setFormData(prev => ({
                  ...prev,
                  name: originalName
                }));
              }}
              className="p-[clamp(0.4rem,1vw,0.75rem)] rounded-full hover:bg-red-50 text-red-500 transition-colors"
            >
              <X className="w-[clamp(1.25rem,2vw,1.5rem)] h-[clamp(1.25rem,2vw,1.5rem)]" />
            </button>
            <button
              onClick={handleSave}
              className="p-[clamp(0.4rem,1vw,0.75rem)] rounded-full hover:bg-green-50 text-green-600 transition-colors"
            >
              <Save className="w-[clamp(1.25rem,2vw,1.5rem)] h-[clamp(1.25rem,2vw,1.5rem)]" />
            </button>
          </div>
        )}

        <div className="flex flex-col items-center">

          {/* --- PFP SECTION (READ ONLY) --- */}
          <div className="relative mb-[clamp(1.5rem,3vw,2rem)] mt-4 sm:mt-0">
            <div className="w-[clamp(100px,15vw,160px)] h-[clamp(100px,15vw,160px)] rounded-full bg-[#94C3D2] flex items-center justify-center shadow-lg border-4 border-white overflow-hidden relative">
              {displayImage ? (
                <Image
                  src={displayImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-[clamp(2.5rem,6vw,4rem)] text-white font-bold drop-shadow-md">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>
          </div>

          {/* --- NAME SECTION --- */}
          <div className="mb-[clamp(2rem,4vw,3rem)] text-center w-full">
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-[clamp(1.75rem,4.5vw,2.5rem)] font-bold text-center border-b-2 border-[#94C3D2] focus:outline-none w-full max-w-[20rem] mx-auto pb-1 text-gray-800"
                placeholder="Enter Name"
                autoFocus
              />
            ) : (
              <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold text-gray-800 tracking-tight">
                {formData.name}
              </h1>
            )}
          </div>

          <div className="w-full space-y-[clamp(1rem,2vw,1.5rem)] mb-[clamp(2rem,4vw,3rem)]">
            {/* Email (Read Only) */}
            <div>
              <label className="block text-[clamp(0.7rem,1.5vw,0.75rem)] uppercase tracking-wider text-gray-500 mb-2 font-semibold ml-1">Email</label>
              <div className="w-full bg-[#94C3D2]/20 px-[clamp(1rem,2vw,1.25rem)] py-[clamp(0.75rem,1.5vw,1rem)] rounded-xl text-gray-700 font-medium text-[clamp(0.875rem,2vw,1rem)]">
                {formData.email}
              </div>
            </div>

            {/* --- PASSWORD SECTION (DROPDOWN) --- */}
            <div className="border-t border-gray-100 pt-[clamp(1rem,2vw,1.5rem)]">
              {!isEditing ? (
                <div className="text-center text-gray-400 text-[clamp(0.8rem,1.5vw,0.875rem)] italic">
                  Enable edit mode to change password
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 transition-all">
                  <button
                    onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                    className="w-full px-[clamp(1rem,2vw,1.25rem)] py-[clamp(0.75rem,1.5vw,1rem)] flex justify-between items-center text-gray-700 font-medium hover:bg-gray-100 text-[clamp(0.875rem,2vw,1rem)]"
                  >
                    <span>Change Password</span>
                    {isPasswordOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {/* Collapsible Content */}
                  {isPasswordOpen && (
                    <div className="px-[clamp(1rem,2vw,1.25rem)] pb-[clamp(1rem,2vw,1.25rem)] pt-2 space-y-[clamp(0.5rem,1vw,0.75rem)] bg-white">
                      <input
                        type="password"
                        placeholder="New Password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] rounded-lg focus:ring-2 focus:ring-[#94C3D2] outline-none text-[clamp(0.875rem,2vw,1rem)]"
                      />
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.5rem,1vw,0.75rem)] rounded-lg focus:ring-2 focus:ring-[#94C3D2] outline-none text-[clamp(0.875rem,2vw,1rem)]"
                      />
                      <p className="text-[clamp(0.7rem,1.5vw,0.75rem)] text-green-600 text-center mt-2">
                        Password will be updated when you click the main Save button above.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* --- STATS & TRIPS --- */}
          <div className="w-full mb-[clamp(2rem,4vw,3rem)]">
            <h3 className="text-[clamp(1.1rem,2.5vw,1.25rem)] font-bold text-gray-800 mb-[clamp(0.75rem,2vw,1rem)] flex items-center gap-2">
              My Stats
            </h3>
            <div className="grid grid-cols-2 gap-[clamp(0.75rem,2vw,1rem)]">
              <div className="bg-blue-50 p-[clamp(1rem,2vw,1.25rem)] rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
                <p className="text-blue-600 font-bold text-[clamp(1.5rem,4vw,2.25rem)] mb-1">{trips.length}</p>
                <p className="text-[clamp(0.8rem,1.5vw,0.875rem)] text-gray-600 font-medium">Trips Planned</p>
              </div>
              <div className="bg-green-50 p-[clamp(1rem,2vw,1.25rem)] rounded-2xl border border-green-100 hover:shadow-md transition-shadow flex flex-col justify-end">
                <p className="text-green-600 font-bold text-[clamp(1.1rem,2vw,1.25rem)] mb-2">Active</p>
                <p className="text-[clamp(0.8rem,1.5vw,0.875rem)] text-gray-600 font-medium">Account Status</p>
              </div>
            </div>
          </div>

          <div className="w-full border-t border-gray-200 pt-[clamp(1.5rem,3vw,2rem)]">
            <h3 className="text-[clamp(1.1rem,2.5vw,1.25rem)] font-bold text-gray-800 mb-[clamp(0.75rem,2vw,1rem)]">My Trips</h3>

            <div className="space-y-[clamp(0.5rem,1vw,0.75rem)] max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {trips.length === 0 ? (
                <div className="text-center py-[clamp(2rem,4vw,2.5rem)] text-gray-400 italic bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-[clamp(0.875rem,2vw,1rem)]">
                  <p>You haven't planned any trips yet.</p>
                </div>
              ) : (
                trips.map((trip) => (
                  <div key={trip.id} className="group p-[clamp(0.75rem,2vw,1rem)] bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-[#94C3D2]/50 transition-all cursor-pointer">
                    <div className="flex justify-between items-center gap-4">
                      <div className="truncate">
                        <h4 className="font-bold text-gray-800 group-hover:text-[#94C3D2] transition-colors text-[clamp(1rem,2vw,1.125rem)] truncate">
                          {trip.name}
                        </h4>
                        <p className="text-[clamp(0.8rem,1.5vw,0.875rem)] text-gray-500 font-medium truncate">{trip.destination}</p>
                      </div>
                      <span className={`text-[clamp(0.65rem,1vw,0.75rem)] px-[clamp(0.5rem,1vw,0.75rem)] py-1 rounded-full font-bold uppercase tracking-wider whitespace-nowrap ${trip.startDate ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {trip.startDate ? "Upcoming" : "Draft"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-[clamp(2.5rem,5vw,3rem)] text-center">
            <p className="text-gray-400 text-[clamp(0.65rem,1.5vw,0.75rem)] font-bold uppercase tracking-widest mb-[clamp(0.25rem,1vw,0.5rem)]">Date Joined</p>
            <div className="inline-block bg-[#94C3D2] text-white px-[clamp(1.25rem,3vw,1.5rem)] py-[clamp(0.4rem,1vw,0.5rem)] rounded-full font-semibold shadow-sm text-[clamp(0.875rem,2vw,1rem)]">
              {formatDate(user?.created_at || user?.createdAt)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}