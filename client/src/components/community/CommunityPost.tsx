import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CommunityPost as PostType, User } from '@shared/schema';
import { formatDate } from '@/lib/utils';
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreVertical 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommunityPostProps {
  post: PostType;
  author?: User;
}

const CommunityPost: React.FC<CommunityPostProps> = ({ post, author }) => {
  const queryClient = useQueryClient();
  
  const { mutate: likePost } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/posts/${post.id}/like`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    }
  });
  
  const handleLike = () => {
    likePost();
  };
  
  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
      {/* Post Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-200 mr-3">
            {author?.profileImage ? (
              <img 
                src={author.profileImage} 
                alt="Profile" 
                className="h-full w-full object-cover" 
              />
            ) : (
              <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                {author?.displayName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-neutral-800">
              {author?.displayName || 'Anonymous User'}
            </div>
            <div className="text-xs text-neutral-500">
              {formatDate(post.createdAt)}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-neutral-400">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Post Content */}
      <div className="px-3 pb-3">
        <p className="text-neutral-800">{post.content}</p>
        
        {/* Optional Content Box */}
        {post.content.toLowerCase().includes('tip:') && (
          <div className="rounded-lg bg-neutral-50 p-3 mt-3 text-sm border border-neutral-200">
            <p className="font-medium text-neutral-800">
              Tip: Micro-tasking for ADHD
            </p>
            <p className="text-neutral-600 mt-1">
              Breaking down tasks into smaller steps can reduce the activation energy needed to start and make progress more visible.
            </p>
          </div>
        )}
      </div>
      
      {/* Post Stats */}
      <div className="px-3 py-2 border-t border-b border-neutral-200 flex justify-between text-sm text-neutral-500">
        <div>{post.likes} Likes</div>
        <div>{post.commentCount} Comments</div>
      </div>
      
      {/* Post Actions */}
      <div className="px-3 py-2 flex justify-around">
        <Button 
          variant="ghost"
          className="flex items-center text-neutral-600"
          onClick={handleLike}
        >
          <ThumbsUp className="h-5 w-5 mr-1" />
          Like
        </Button>
        
        <Button variant="ghost" className="flex items-center text-neutral-600">
          <MessageCircle className="h-5 w-5 mr-1" />
          Comment
        </Button>
        
        <Button variant="ghost" className="flex items-center text-neutral-600">
          <Share2 className="h-5 w-5 mr-1" />
          Share
        </Button>
        
        <Button variant="ghost" className="flex items-center text-neutral-600">
          <Bookmark className="h-5 w-5 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default CommunityPost;
