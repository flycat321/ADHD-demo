import React from 'react';
import { useLocation } from 'wouter';
import { KnowledgeContent } from '@shared/schema';
import { formatNumberWithSuffix } from '@/lib/utils';
import { Play } from 'lucide-react';

interface VideoCardProps {
  video: KnowledgeContent;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [, navigate] = useLocation();
  
  const handleClick = () => {
    navigate(`/knowledge/${video.id}`);
  };

  return (
    <div 
      className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative">
        <img
          src={video.imageUrl}
          alt={video.title}
          className="w-full h-32 object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 rounded-full p-1.5">
            <Play className="h-6 w-6 text-primary" />
          </div>
        </div>
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {video.duration}
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="font-medium text-sm text-neutral-800 line-clamp-2">
          {video.title}
        </h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-neutral-500">
            {formatNumberWithSuffix(video.viewCount || 0)} views
          </span>
          <span className="text-xs text-neutral-500">
            {new Date(video.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
