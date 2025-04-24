import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { KnowledgeContent } from "@shared/schema";
import ArticleCard from "@/components/knowledge/ArticleCard";
import VideoCard from "@/components/knowledge/VideoCard";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Knowledge: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch all knowledge content
  const { data: knowledgeContent, isLoading } = useQuery<KnowledgeContent[]>({
    queryKey: ['/api/knowledge'],
  });

  // Fetch featured content
  const { data: featuredContent } = useQuery<KnowledgeContent[]>({
    queryKey: ['/api/knowledge', { featured: true }],
  });

  // Filter content based on category and search query
  const filteredContent = knowledgeContent?.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.type === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  // Separate articles and videos
  const articles = filteredContent.filter(
    (item) => item.type.toLowerCase() === "article"
  );
  
  const videos = filteredContent.filter(
    (item) => item.type.toLowerCase() === "video"
  );

  const featured = featuredContent?.[0];

  // Categories for the tabs
  const categories = ["All", "Articles", "Videos", "Research", "Strategies"];

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold text-neutral-800">ADHD Knowledge Hub</h1>

      {/* Categories */}
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`${
              selectedCategory === category
                ? "bg-primary text-white"
                : "bg-white text-neutral-600"
            } px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search knowledge base..."
          className="w-full bg-white border border-neutral-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="h-5 w-5 text-neutral-400 absolute left-3 top-3.5" />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading knowledge content...</div>
      ) : (
        <>
          {/* Featured Content */}
          {featured && !searchQuery && selectedCategory === "All" && (
            <div>
              <h2 className="text-lg font-semibold text-neutral-800 mb-3">Featured</h2>
              <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-neutral-800">
                      {featured.title}
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {featured.type}
                    </span>
                  </div>
                  <p className="text-neutral-600 mt-2">{featured.summary}</p>
                  <div className="flex items-center mt-3">
                    {featured.author && (
                      <>
                        <div className="h-8 w-8 rounded-full bg-neutral-200 mr-2"></div>
                        <div>
                          <div className="text-sm font-medium text-neutral-800">
                            {featured.author}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {featured.authorTitle}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <Button className="w-full mt-4 bg-primary text-white font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    Read Full Article
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Articles */}
          {(selectedCategory === "All" || selectedCategory === "Articles") && articles.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-neutral-800 mb-3">
                Recent Articles
              </h2>
              <div className="space-y-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}

          {/* Video Resources */}
          {(selectedCategory === "All" || selectedCategory === "Videos") && videos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-neutral-800 mb-3">
                Video Resources
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredContent.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              No content found for your search criteria.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Knowledge;
