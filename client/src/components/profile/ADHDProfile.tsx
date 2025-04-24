import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ADHDProfileProps {
  adhd_profile?: any;
}

const ADHDProfile: React.FC<ADHDProfileProps> = ({ adhd_profile }) => {
  // Default values if profile is not available
  const attentionRegulation = adhd_profile?.attentionRegulation || 60;
  const executiveFunction = adhd_profile?.executiveFunction || 80;
  const hyperactivity = adhd_profile?.hyperactivity || 40;
  
  // Map percentage to severity label
  const getSeverityLabel = (percent: number) => {
    if (percent < 30) return 'Mild';
    if (percent < 70) return 'Moderate';
    return 'Significant';
  };
  
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-800 mb-3">My ADHD Profile</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-neutral-700">Attention Regulation</span>
            <span className="text-sm text-neutral-500">{getSeverityLabel(attentionRegulation)}</span>
          </div>
          <Progress 
            value={attentionRegulation} 
            className="w-full bg-neutral-200 rounded-full h-2.5"
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-neutral-700">Executive Function</span>
            <span className="text-sm text-neutral-500">{getSeverityLabel(executiveFunction)}</span>
          </div>
          <Progress 
            value={executiveFunction} 
            className="w-full bg-neutral-200 rounded-full h-2.5"
          />
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-neutral-700">Hyperactivity</span>
            <span className="text-sm text-neutral-500">{getSeverityLabel(hyperactivity)}</span>
          </div>
          <Progress 
            value={hyperactivity} 
            className="w-full bg-neutral-200 rounded-full h-2.5"
          />
        </div>
      </div>
      
      <div className="mt-4 text-sm">
        <p className="text-neutral-600">
          Your profile indicates challenges primarily with task initiation and organization. 
          Personalized tools have been tailored to address these specific needs.
        </p>
      </div>
      
      <Button 
        variant="outline"
        className="mt-4 w-full border border-primary text-primary font-medium px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors"
      >
        Update Assessment
      </Button>
    </div>
  );
};

export default ADHDProfile;
