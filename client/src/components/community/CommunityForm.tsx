import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store';
import { apiRequest } from '@/lib/queryClient';
import { InsertCommunityPost } from '@shared/schema';
import { Image, Video, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CommunityForm: React.FC = () => {
  const { currentUser } = useStore();
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async (newPost: InsertCommunityPost) => {
      const res = await apiRequest('POST', '/api/posts', newPost);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setContent('');
      toast({
        title: "Post created",
        description: "Your post has been shared with the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating post",
        description: `${error}`,
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    createPost({
      userId: currentUser?.id || 1, // Default to 1 for demo
      content: content.trim(),
    });
  };
  
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-3 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-200">
            {currentUser?.profileImage ? (
              <img 
                src={currentUser.profileImage} 
                alt="Profile" 
                className="h-full w-full object-cover" 
              />
            ) : (
              <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                {currentUser?.displayName?.[0] || 'U'}
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder="Share something with the community..."
            className="flex-1 bg-neutral-100 rounded-full px-4 py-2 border-none focus:outline-none focus:ring-2 focus:ring-primary"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        <div className="flex justify-between mt-3 pt-3 border-t border-neutral-200">
          <div className="flex space-x-3">
            <button type="button" className="flex items-center text-neutral-600 text-sm">
              <Image className="h-5 w-5 mr-1" />
              Photo
            </button>
            <button type="button" className="flex items-center text-neutral-600 text-sm">
              <Video className="h-5 w-5 mr-1" />
              Video
            </button>
            <button type="button" className="flex items-center text-neutral-600 text-sm">
              <MapPin className="h-5 w-5 mr-1" />
              Location
            </button>
          </div>
          
          <Button 
            type="submit" 
            disabled={!content.trim() || isPending}
            className="bg-primary text-white px-4 py-1 rounded-lg text-sm font-medium"
          >
            {isPending ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommunityForm;
