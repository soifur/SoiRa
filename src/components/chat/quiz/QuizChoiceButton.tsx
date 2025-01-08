import React from 'react';
import { cn } from "@/lib/utils";

interface QuizChoiceButtonProps {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const QuizChoiceButton = ({ selected, onClick, children }: QuizChoiceButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-lg text-lg font-medium transition-all duration-200",
        "bg-gradient-to-r from-violet-200 to-pink-200 hover:from-violet-300 hover:to-pink-300",
        "dark:from-violet-900 dark:to-pink-900 dark:hover:from-violet-800 dark:hover:to-pink-800",
        selected && "ring-2 ring-violet-500 dark:ring-violet-400",
        "transform hover:scale-[1.02] active:scale-[0.98]"
      )}
    >
      {children}
    </button>
  );
};