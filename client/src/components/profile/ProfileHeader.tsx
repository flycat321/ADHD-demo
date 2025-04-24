import React from 'react';
import { User } from '@shared/schema';
import { Pencil } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ProfileStats {
  streakDays: number;
  taskCompletion: number;
  communityCount: number;
}

interface ProfileHeaderProps {
  user?: User | null;
  stats: ProfileStats;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, stats }) => {
  const displayName = user?.displayName || 'Alex Johnson';
  const profileImage = user?.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg';
  const joinedDate = user?.joinedDate ? formatDate(user.joinedDate) : 'March 2023';
  
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm text-center">
      <div className="relative w-24 h-24 mx-auto mb-4">
        <img 
          src={profileImage} 
          alt="Profile" 
          className="rounded-full w-full h-full object-cover"
        />
        <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 shadow-lg">
          <Pencil className="h-4 w-4" />
        </button>
      </div>
      <h2 className="text-xl font-semibold text-neutral-800">{displayName}</h2>
      <p className="text-neutral-600 mt-1">加入时间 {joinedDate}</p>
      
      <div className="flex justify-center space-x-6 mt-4">
        <div className="text-center">
          <div className="text-xl font-semibold text-neutral-800">{stats.streakDays}</div>
          <div className="text-xs text-neutral-500">连续天数</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-neutral-800">{stats.taskCompletion}%</div>
          <div className="text-xs text-neutral-500">任务完成率</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-neutral-800">{stats.communityCount}</div>
          <div className="text-xs text-neutral-500">社区数量</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
