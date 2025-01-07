import React from 'react';
import { cn } from "@/lib/utils";

interface QuizButtonProps {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const QuizButton = ({ selected, onClick, children }: QuizButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-xl text-lg font-medium transition-all duration-200",
        "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-2",
        "hover:bg-white/70 dark:hover:bg-gray-700/70",
        selected ? "border-violet-500 dark:border-violet-400 text-violet-700 dark:text-violet-300" : "border-violet-200 dark:border-violet-800",
        "transform hover:scale-[1.02] active:scale-[0.98]"
      )}
    >
      {children}
    </button>
  );
};