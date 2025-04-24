import React from "react";
import { useStore } from "@/store";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ADHDProfile from "@/components/profile/ADHDProfile";
import SettingsSection from "@/components/profile/SettingsSection";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile: React.FC = () => {
  const { currentUser, setCurrentUser } = useStore();
  
  // Default user stats (would come from actual user data in production)
  const userStats = {
    streakDays: 42,
    taskCompletion: 87,
    communityCount: 12,
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // In a real app we would also call an API endpoint to invalidate the session
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-neutral-800">Profile</h1>
        <Button variant="ghost" size="icon" className="text-neutral-500">
          <Settings className="h-6 w-6" />
        </Button>
      </div>

      {/* Profile Info */}
      <ProfileHeader 
        user={currentUser}
        stats={userStats}
      />

      {/* ADHD Profile */}
      <ADHDProfile
        adhd_profile={currentUser?.adhd_profile}
      />

      {/* Settings */}
      <SettingsSection />

      {/* Account Actions */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full bg-white border border-neutral-200 text-neutral-800 font-medium px-4 py-3 rounded-lg flex justify-between items-center"
        >
          <span>Help & Support</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-neutral-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </Button>

        <Button
          variant="outline"
          className="w-full bg-white border border-neutral-200 text-neutral-800 font-medium px-4 py-3 rounded-lg flex justify-between items-center"
        >
          <span>About This App</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-neutral-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </Button>

        <Button
          onClick={handleLogout}
          className="w-full bg-white border border-red-100 text-red-600 font-medium px-4 py-3 rounded-lg"
        >
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
