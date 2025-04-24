import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date);
}

export function formatTime(time: string): string {
  return time;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function calculateTimeLeft(targetDate: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const difference = +new Date(targetDate) - +new Date();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export function getPriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-primary/10 text-primary';
    case 'medium':
      return 'bg-secondary/10 text-secondary';
    case 'low':
      return 'bg-neutral-100 text-neutral-500';
    default:
      return 'bg-neutral-100 text-neutral-500';
  }
}

export function getContentTypeColor(type: string) {
  switch (type.toLowerCase()) {
    case 'article':
      return 'bg-blue-100 text-blue-700';
    case 'video':
      return 'bg-red-100 text-red-700';
    case 'research':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-neutral-100 text-neutral-700';
  }
}

export function formatNumberWithSuffix(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  return (num / 1000000).toFixed(1) + 'M';
}
