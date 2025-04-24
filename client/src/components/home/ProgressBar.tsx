import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  label?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, className }) => {
  // Cap progress between 0 and 100
  const safeProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className="w-full">
      <div className="flex items-center space-x-3">
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${className || 'bg-gradient-to-r from-blue-400 to-indigo-500'} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${safeProgress}%` }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut" 
            }}
          />
        </div>
        {typeof progress === 'number' && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px] text-right"
          >
            {safeProgress}%
          </motion.span>
        )}
      </div>
      
      {label && (
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{label}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
