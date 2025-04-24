import React from 'react';
import { useLocation } from 'wouter';
import { Task } from '@shared/schema';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [, navigate] = useLocation();
  
  const handleChangeTask = () => {
    // Navigate to a task selection view or show a modal
    navigate('/focus/select-task');
  };
  
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-800 mb-3">Current Focus Task</h2>
      
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-neutral-800">{task.title}</h3>
            <p className="text-sm text-neutral-600 mt-1">
              {task.description || 'No description provided.'}
            </p>
          </div>
          <div className="text-sm px-2 py-1 bg-secondary/10 text-secondary rounded-lg">
            {task.category || 'Task'}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-between items-center">
          <div className="text-sm text-neutral-500">
            <span>Estimated: 45 min</span>
            <span className="mx-2">•</span>
            <span>Priority: {task.priority}</span>
          </div>
          <Button 
            variant="ghost"
            className="text-primary font-medium text-sm"
            onClick={handleChangeTask}
          >
            Change Task
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
