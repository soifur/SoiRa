import { cn } from "@/lib/utils";
import React from "react";

interface QuizOptionProps {
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

export const QuizOption = ({ children, isSelected, onClick }: QuizOptionProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-lg text-base transition-all duration-200 border-2",
        "hover:border-primary/50 hover:bg-primary/5",
        isSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/50 text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
};