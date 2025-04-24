import React from "react";
import { Settings, Bell, BrainCircuit } from "lucide-react";

const StatusBar: React.FC = () => {
  return (
    <div className="gradient-bg py-3 px-4 flex justify-between items-center shadow-md relative">
      <div className="flex items-center space-x-2">
        <BrainCircuit className="h-5 w-5 text-white animate-pulse-slow" />
        <span className="text-white font-medium text-lg">专注生活</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Bell className="h-5 w-5 text-white hover:text-white/80 transition-colors cursor-pointer" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            2
          </span>
        </div>
        <Settings className="h-5 w-5 text-white hover:text-white/80 transition-colors cursor-pointer" />
      </div>
    </div>
  );
};

export default StatusBar;
