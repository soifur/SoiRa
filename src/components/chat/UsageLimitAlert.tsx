import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UsageLimitAlertProps {
  usageInfo: {
    currentUsage: number;
    limit: number;
    resetPeriod: string;
    limitType: string;
  };
}

export const UsageLimitAlert = ({ usageInfo }: UsageLimitAlertProps) => {
  const navigate = useNavigate();
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Usage Limit Exceeded</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          You've reached your {usageInfo.resetPeriod} limit of {usageInfo.limit} {usageInfo.limitType}.
          Current usage: {usageInfo.currentUsage} {usageInfo.limitType}.
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/upgrade')}
          className="w-fit"
        >
          Upgrade Now
        </Button>
      </AlertDescription>
    </Alert>
  );
};