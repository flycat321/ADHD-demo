import React from 'react';
import { useLocation } from 'wouter';
import { KnowledgeContent } from '@shared/schema';
import { formatDate, getContentTypeColor } from '@/lib/utils';

interface ArticleCardProps {
  article: KnowledgeContent;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const [, navigate] = useLocation();
  
  const handleClick = () => {
    navigate(`/knowledge/${article.id}`);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-3 flex shadow-sm">
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-20 h-20 rounded object-cover"
        />
      )}
      <div className="ml-3 flex-1">
        <div className="flex justify-between">
          <h3 className="font-medium text-neutral-800">{article.title}</h3>
          <span className={`text-xs ${getContentTypeColor(article.type)} px-2 py-0.5 rounded-full h-fit`}>
            {article.type}
          </span>
        </div>
        <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
          {article.summary}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-neutral-500">
            {formatDate(article.publishedDate)}
          </span>
          <button
            className="text-primary text-sm font-medium"
            onClick={handleClick}
          >
            Read
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
