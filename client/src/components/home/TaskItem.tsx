import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Task } from '@shared/schema';
import { Checkbox } from '@/components/ui/checkbox';
import { getPriorityColor } from '@/lib/utils';
import { Clock, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const queryClient = useQueryClient();
  
  const { mutate: updateTask } = useMutation({
    mutationFn: async (updates: Partial<Task>) => {
      const res = await apiRequest('PATCH', `/api/tasks/${task.id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });

  const handleCheckboxChange = (checked: boolean) => {
    updateTask({ completed: checked });
  };

  // Priority colors for modern design
  const getPriorityStyles = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-gradient-to-r from-red-400 to-pink-500';
      case 'medium':
        return 'bg-gradient-to-r from-amber-400 to-orange-500';
      case 'low':
        return 'bg-gradient-to-r from-emerald-400 to-teal-500';
      default:
        return 'bg-gradient-to-r from-blue-400 to-indigo-500';
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center">
        <div className="relative">
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleCheckboxChange}
            className="h-5 w-5 rounded-md border-2 transition-all duration-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          {task.completed && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 z-10 flex items-center justify-center"
            >
              <span className="w-full h-0.5 bg-gray-300 absolute top-1/2 left-0 transform -translate-y-1/2"></span>
            </motion.div>
          )}
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex justify-between">
            <span className={`font-medium text-gray-900 ${task.completed ? 'line-through text-gray-400' : ''} transition-all duration-300`}>
              {task.title}
            </span>
            <div className="flex items-center space-x-2">
              <span className={`text-xs text-white px-2 py-0.5 rounded-full ${getPriorityStyles(task.priority)}`}>
                {task.priority}
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {task.scheduledTime && (
            <div className={`flex items-center mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              <span>{task.scheduledTime}</span>
            </div>
          )}
          
          {task.description && (
            <p className={`mt-1 text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;
