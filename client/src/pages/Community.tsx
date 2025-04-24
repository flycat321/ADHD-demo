import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CommunityPost as PostType, Event, User } from "@shared/schema";
import CommunityForm from "@/components/community/CommunityForm";
import CommunityPostComponent from "@/components/community/CommunityPost";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/home/EventCard";

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("discussions");

  // Fetch community posts
  const { data: posts, isLoading: postsLoading } = useQuery<PostType[]>({
    queryKey: ['/api/posts'],
  });

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  // Fetch users (for post author info)
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Display content based on tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "discussions":
        return (
          <>
            <CommunityForm />
            
            <div className="space-y-4 mt-6">
              {postsLoading ? (
                <div className="text-center py-4">Loading posts...</div>
              ) : posts && posts.length > 0 ? (
                posts.map((post) => (
                  <CommunityPostComponent 
                    key={post.id} 
                    post={post} 
                    author={users?.find(u => u.id === post.userId)}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-neutral-500">
                  No discussions yet. Be the first to post!
                </div>
              )}
              
              {posts && posts.length > 0 && (
                <div className="text-center">
                  <Button 
                    variant="outline"
                    className="text-primary font-medium border border-primary px-5 py-2 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          </>
        );
      
      case "events":
        return (
          <div className="space-y-4 mt-6">
            {eventsLoading ? (
              <div className="text-center py-4">Loading events...</div>
            ) : events && events.length > 0 ? (
              events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="text-center py-4 text-neutral-500">
                No upcoming events scheduled.
              </div>
            )}
          </div>
        );
      
      case "support-groups":
        return (
          <div className="text-center py-8 text-neutral-500">
            Support groups feature coming soon!
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold text-neutral-800">ADHD Community</h1>
      
      {/* Community Tabs */}
      <Tabs defaultValue="discussions" onValueChange={setActiveTab}>
        <TabsList className="flex border-b border-neutral-200 bg-transparent w-full">
          <TabsTrigger 
            value="discussions"
            className="px-4 py-2 font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=inactive]:text-neutral-600"
          >
            Discussions
          </TabsTrigger>
          <TabsTrigger 
            value="events"
            className="px-4 py-2 font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=inactive]:text-neutral-600"
          >
            Events
          </TabsTrigger>
          <TabsTrigger 
            value="support-groups"
            className="px-4 py-2 font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=inactive]:text-neutral-600"
          >
            Support Groups
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="discussions">
          {renderTabContent()}
        </TabsContent>
        
        <TabsContent value="events">
          {renderTabContent()}
        </TabsContent>
        
        <TabsContent value="support-groups">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Community;
