import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface QuizOptionProps {
  value: string;
  isSelected: boolean;
  onClick: () => void;
  type: "radio" | "checkbox";
}

export const QuizOption = ({ value, isSelected, onClick, type }: QuizOptionProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-6 text-left rounded-lg transition-all duration-200 border-2",
        "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary",
        isSelected ? "border-primary bg-accent" : "border-border hover:border-primary"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-medium">{value}</span>
        {isSelected && <Check className="h-5 w-5 text-primary" />}
      </div>
    </button>
  );
};