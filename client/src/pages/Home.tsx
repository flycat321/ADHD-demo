import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useStore } from "@/store";
import ProgressBar from "@/components/home/ProgressBar";
import QuickActionCard from "@/components/home/QuickActionCard";
import TaskItem from "@/components/home/TaskItem";
import KnowledgeCard from "@/components/home/KnowledgeCard";
import EventCard from "@/components/home/EventCard";
import { Task, KnowledgeContent, Event } from "@shared/schema";
import { 
  Clock, 
  ClipboardList, 
  BookOpen, 
  Users, 
  Brain, 
  Zap, 
  Sparkles, 
  Trophy, 
  Rocket 
} from "lucide-react";
import { motion } from "framer-motion";

const Home: React.FC = () => {
  const [, navigate] = useLocation();
  const { currentUser, isAuthenticated } = useStore();
  const userId = currentUser?.id || 1; // Default to 1 for demo purposes
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks', { userId }],
    enabled: isAuthenticated || true, // For demo purposes, always fetch
  });

  // Fetch knowledge content
  const { data: knowledgeContent, isLoading: knowledgeLoading } = useQuery<KnowledgeContent[]>({
    queryKey: ['/api/knowledge'],
    enabled: isAuthenticated || true, // For demo purposes, always fetch
  });

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    enabled: isAuthenticated || true, // For demo purposes, always fetch
  });

  // Filter and sort data
  const todaysTasks = tasks?.filter(task => {
    const taskDate = new Date(task.dueDate || new Date());
    const today = new Date();
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  }).sort((a, b) => {
    return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
  }) || [];

  const completedTasks = todaysTasks.filter(task => task.completed).length;
  const totalTasks = todaysTasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const latestKnowledge = knowledgeContent?.slice(0, 2) || [];

  const upcomingEvent = events?.[0];

  // Quick action cards configuration
  const quickActions = [
    {
      title: "Focus Now",
      description: "Start a focused session",
      icon: Zap,
      color: "from-purple-500 to-indigo-600",
      onClick: () => navigate("/focus"),
    },
    {
      title: "Tasks",
      description: "Manage your tasks",
      icon: ClipboardList,
      color: "from-blue-500 to-cyan-400",
      onClick: () => navigate("/focus"),
    },
    {
      title: "Learn",
      description: "ADHD knowledge",
      icon: Brain,
      color: "from-emerald-400 to-teal-500",
      onClick: () => navigate("/knowledge"),
    },
    {
      title: "Community",
      description: "Connect with others",
      icon: Users,
      color: "from-orange-400 to-pink-500",
      onClick: () => navigate("/community"),
    },
  ];

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <div className="pb-6">
      {/* Hero Section with Wave Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-90"></div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="translate-y-1">
            <path fill="#ffffff" fillOpacity="1" d="M0,224L60,197.3C120,171,240,117,360,112C480,107,600,149,720,181.3C840,213,960,235,1080,224C1200,213,1320,171,1380,149.3L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="relative z-10 px-6 pt-10 pb-24">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white"
          >
            <span className="inline-block text-sm font-medium px-3 py-1 rounded-full bg-white/20 mb-2">
              <span className="flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                ADHD Helper
              </span>
            </span>
            <h1 className="text-3xl font-bold">
              {greeting}, {currentUser?.displayName || "Alex"}!
            </h1>
            <p className="mt-2 opacity-90">Let's make today productive and calm</p>
          </motion.div>

          {/* Progress Capsule */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-4"
          >
            <div className="flex items-center justify-between text-white mb-2">
              <div className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                <span className="font-medium">Today's Progress</span>
              </div>
              <span className="text-sm">{completedTasks}/{totalTasks} tasks</span>
            </div>
            <div className="bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-green-300 to-green-500 rounded-full"
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="px-5 -mt-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Rocket className="w-5 h-5 mr-2 text-purple-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-2xl cursor-pointer shadow-sm"
                onClick={action.onClick}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color}`}></div>
                <div className="relative p-5 text-white">
                  <action.icon className="w-8 h-8 mb-2" />
                  <h3 className="font-bold text-lg">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Today's Tasks */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-blue-500" />
              Today's Tasks
            </h2>
            <button
              className="text-blue-600 font-medium text-sm flex items-center"
              onClick={() => navigate("/focus")}
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {tasksLoading ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl animate-pulse">
                <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full mb-2"></div>
                <div className="h-3 w-24 mx-auto bg-gray-200 rounded-full"></div>
              </div>
            ) : todaysTasks.length > 0 ? (
              todaysTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                >
                  <TaskItem task={task} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-3">
                  <ClipboardList className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-gray-600 mb-2">No tasks for today</p>
                <button
                  className="text-blue-600 text-sm font-medium"
                  onClick={() => navigate("/focus")}
                >
                  + Add a task
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Latest Knowledge */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-teal-500" />
              Latest Knowledge
            </h2>
            <button
              className="text-teal-600 font-medium text-sm flex items-center"
              onClick={() => navigate("/knowledge")}
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {knowledgeLoading ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl animate-pulse">
                <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full mb-2"></div>
                <div className="h-3 w-24 mx-auto bg-gray-200 rounded-full"></div>
              </div>
            ) : latestKnowledge.length > 0 ? (
              latestKnowledge.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                >
                  <KnowledgeCard item={item} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 mx-auto bg-teal-50 rounded-full flex items-center justify-center mb-3">
                  <BookOpen className="w-8 h-8 text-teal-400" />
                </div>
                <p className="text-gray-600">No knowledge content available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Community Events */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-pink-500" />
              Community Events
            </h2>
            <button
              className="text-pink-600 font-medium text-sm flex items-center"
              onClick={() => navigate("/community")}
            >
              View All
            </button>
          </div>

          {eventsLoading ? (
            <div className="text-center py-10 bg-gray-50 rounded-2xl animate-pulse">
              <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full mb-2"></div>
              <div className="h-3 w-24 mx-auto bg-gray-200 rounded-full"></div>
            </div>
          ) : upcomingEvent ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <EventCard event={upcomingEvent} />
            </motion.div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 mx-auto bg-pink-50 rounded-full flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-pink-400" />
              </div>
              <p className="text-gray-600 mb-2">No upcoming events</p>
              <button
                className="text-pink-600 text-sm font-medium"
                onClick={() => navigate("/community")}
              >
                Browse community
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;