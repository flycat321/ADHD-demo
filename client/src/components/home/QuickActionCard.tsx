import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickActionCardProps {
  title: string;
  icon: LucideIcon;
  colorClass: string;
  onClick: () => void;
  description?: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  icon: Icon,
  colorClass,
  onClick,
  description
}) => {
  return (
    <motion.div 
      className="relative overflow-hidden rounded-xl shadow-sm cursor-pointer"
      onClick={onClick}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClass}`}></div>
      
      {/* Content */}
      <div className="relative z-10 p-5 text-white">
        <Icon className="h-8 w-8 mb-3" />
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        {description && (
          <p className="text-sm opacity-80">{description}</p>
        )}
        
        {/* Decorative elements */}
        <div className="absolute top-1/2 right-4 w-20 h-20 rounded-full bg-white/10 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 rounded-tl-xl bg-white/5"></div>
      </div>
    </motion.div>
  );
};

export default QuickActionCard;
