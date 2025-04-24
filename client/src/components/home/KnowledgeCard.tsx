import React from 'react';
import { useLocation } from 'wouter';
import { KnowledgeContent } from '@shared/schema';
import { formatDate, getContentTypeColor, truncateText } from '@/lib/utils';
import { Play, ArrowRight, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface KnowledgeCardProps {
  item: KnowledgeContent;
}

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ item }) => {
  const [, navigate] = useLocation();
  
  const handleClick = () => {
    navigate(`/knowledge/${item.id}`);
  };

  const isVideo = item.type.toLowerCase() === 'video';

  // Get color theme based on content type
  const getTypeTheme = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return 'from-blue-500 to-indigo-600';
      case 'article':
        return 'from-emerald-500 to-teal-600';
      case 'research':
        return 'from-violet-500 to-purple-600';
      default:
        return 'from-amber-500 to-orange-600';
    }
  };

  const typeTheme = getTypeTheme(item.type);
  
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
    >
      <div className="relative h-40">
        <img 
          src={item.imageUrl || 'https://via.placeholder.com/400x200'} 
          alt={item.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Content type badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs text-white px-3 py-1 rounded-full font-medium bg-gradient-to-r ${typeTheme}`}>
            {item.type}
          </span>
        </div>
        
        {/* Video play button */}
        {isVideo && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="bg-white/80 rounded-full p-3 backdrop-blur-sm shadow-lg">
              <Play className="h-8 w-8 text-blue-600 ml-1" />
            </div>
          </motion.div>
        )}
        
        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-semibold truncate">{item.title}</h3>
        </div>
      </div>
      
      <div className="p-4">
        {/* Summary */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {truncateText(item.summary, 120)}
        </p>
        
        {/* Meta info */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex space-x-4">
            {item.author && (
              <div className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <span>{truncateText(item.author, 15)}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatDate(item.publishedDate)}</span>
            </div>
          </div>
          
          <motion.button 
            whileHover={{ x: 4 }}
            className="text-blue-600 font-medium text-sm flex items-center"
            onClick={handleClick}
          >
            {isVideo ? 'Watch' : 'Read'} 
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default KnowledgeCard;
