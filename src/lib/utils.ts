import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return "";

  const now = new Date();
  const past = new Date(timestamp);
  
  // Сбрасываем время для сравнения дат
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const pastDate = new Date(past.getFullYear(), past.getMonth(), past.getDate());
  
  // Если сегодня
  if (pastDate.getTime() === today.getTime()) {
    const diffHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
      if (diffMinutes === 0) return "Just now";
      return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
    }
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }
  
  // Если вчера
  if (pastDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }
  
  // В пределах последней недели
  const diffDays = Math.floor((today.getTime() - pastDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  }
  
  // В пределах последнего месяца
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  
  // В пределах последнего года
  const diffMonths = pastDate.getMonth() - today.getMonth() + 12 * (pastDate.getFullYear() - today.getFullYear());
  if (diffMonths < 12) {
    const months = Math.abs(diffMonths);
    return months === 1 ? "Last month" : `${months} months ago`;
  }
  
  // Больше года
  const diffYears = pastDate.getFullYear() - today.getFullYear();
  const years = Math.abs(diffYears);
  return years === 1 ? "Last year" : `${years} years ago`;
}
