
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const getProgressColor = (progress: number) => {
  if (progress < 25) return 'bg-red-500';
  if (progress < 35) return 'bg-orange-500';
  if (progress < 50) return 'bg-yellow-500';
  if (progress < 75) return 'bg-blue-500';
  if (progress < 90) return 'bg-purple-500';
  return 'bg-green-500';
};

interface TaskProgress {
  id: number;
  title: string;
  progress: number;
}

export const DailyProgress = ({ tasks }: { tasks: TaskProgress[] }) => {
  const totalProgress = tasks.length ? 
    Math.round(tasks.reduce((acc, task) => acc + task.progress, 0) / tasks.length) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>今日任务进度</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>总体完成进度</span>
            <span>{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-2.5 bg-gray-200" />
        </div>
        
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{task.title}</span>
                <span>{task.progress}%</span>
              </div>
              <Progress 
                value={task.progress} 
                className={`h-2 bg-gray-200 ${getProgressColor(task.progress)}`} 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
