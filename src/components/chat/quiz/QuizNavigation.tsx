import { Button } from "@/components/ui/button";

interface QuizNavigationProps {
  currentSection: number;
  totalSections: number;
  onNext: () => void;
  onPrevious: () => void;
}

export const QuizNavigation = ({ 
  currentSection, 
  totalSections, 
  onNext, 
  onPrevious 
}: QuizNavigationProps) => {
  return (
    <div className="flex justify-end space-x-4">
      {currentSection > 0 && (
        <Button
          variant="outline"
          onClick={onPrevious}
          className="px-6 py-2"
        >
          Previous
        </Button>
      )}
      <Button 
        onClick={onNext}
        className="px-6 py-2 bg-primary hover:bg-primary/90"
      >
        {currentSection < totalSections - 1 ? 'Next' : "Let's Start"}
      </Button>
    </div>
  );
};