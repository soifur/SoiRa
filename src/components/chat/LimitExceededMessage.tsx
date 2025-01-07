import { Button } from "@/components/ui/button";

interface LimitExceededMessageProps {
  limitType: string;
  maxUsage: number;
  resetDate?: Date;
  onUpgrade: () => void;
}

export const LimitExceededMessage = ({ 
  limitType, 
  maxUsage, 
  resetDate, 
  onUpgrade 
}: LimitExceededMessageProps) => {
  return (
    <div className="fixed bottom-24 left-0 right-0 p-4 bg-destructive/10 backdrop-blur">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <p className="text-sm text-destructive">
          You have exceeded your {limitType} limit of {maxUsage}.
          {resetDate && ` Access will be restored on ${resetDate.toLocaleDateString()}`}
        </p>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onUpgrade}
        >
          Upgrade Now
        </Button>
      </div>
    </div>
  );
};