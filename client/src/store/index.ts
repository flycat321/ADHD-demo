import { create } from 'zustand';
import { createContext, useContext, ReactNode } from 'react';
import { Task, User, KnowledgeContent, CommunityPost, Event, FocusSession } from '@shared/schema';

interface AppState {
  // User state
  currentUser: User | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: User | null) => void;
  
  // Focus timer state
  timerDuration: number;
  timerRemaining: number;
  timerActive: boolean;
  currentTask: Task | null;
  setTimerDuration: (duration: number) => void;
  setTimerRemaining: (remaining: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setCurrentTask: (task: Task | null) => void;
  
  // App state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const useStoreImpl = create<AppState>((set) => ({
  // User state
  currentUser: null,
  isAuthenticated: false,
  setCurrentUser: (user) => set({ 
    currentUser: user,
    isAuthenticated: !!user 
  }),
  
  // Focus timer state
  timerDuration: 25 * 60, // 25 minutes in seconds
  timerRemaining: 25 * 60,
  timerActive: false,
  currentTask: null,
  setTimerDuration: (duration) => set({ 
    timerDuration: duration,
    timerRemaining: duration
  }),
  setTimerRemaining: (remaining) => set({ timerRemaining: remaining }),
  startTimer: () => set({ timerActive: true }),
  pauseTimer: () => set({ timerActive: false }),
  resetTimer: () => set(state => ({ 
    timerRemaining: state.timerDuration,
    timerActive: false 
  })),
  setCurrentTask: (task) => set({ currentTask: task }),
  
  // App state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

// Export the store hook directly
export const useStore = useStoreImpl;
