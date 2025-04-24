import React from "react";
import { Link } from "wouter";
import { Home, BookOpen, Clock, MessageSquare, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  currentPath: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPath }) => {
  const tabs = [
    { path: "/", icon: Home, label: "首页" },
    { path: "/knowledge", icon: BookOpen, label: "知识库" },
    { path: "/focus", icon: Clock, label: "专注" },
    { path: "/community", icon: MessageSquare, label: "社区" },
    { path: "/groups", icon: Users, label: "小圈子" },
    { path: "/profile", icon: User, label: "我的" },
  ];

  const getTabPosition = () => {
    const index = tabs.findIndex((tab) => tab.path === currentPath);
    return index >= 0 ? index : 0;
  };

  return (
    <div className="bg-white border-t border-neutral-100 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative">
      {/* Indicator */}
      <div
        className="absolute top-0 left-0 w-1/6 h-1 bg-primary rounded-full tab-indicator transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(${getTabPosition() * 100}%)` }}
      />

      <div className="flex justify-around">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;
          return (
            <Link 
              key={tab.path} 
              href={tab.path}
              className={cn(
                "flex flex-col items-center py-1 transition-all duration-300",
                isActive 
                  ? "text-primary transform scale-110" 
                  : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <div className={cn(
                "relative p-1 rounded-full transition-all duration-300",
                isActive ? "bg-primary/10" : ""
              )}>
                <tab.icon className={cn(
                  "h-6 w-6 transition-all duration-300",
                  isActive ? "animate-pulse-slow" : ""
                )} />
              </div>
              <span className={cn(
                "text-xs mt-1 font-medium transition-all duration-300",
                isActive ? "transform scale-105" : ""
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
