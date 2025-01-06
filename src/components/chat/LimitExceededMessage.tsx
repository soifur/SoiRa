import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const LimitExceededMessage = () => {
  return (
    <Alert variant="destructive" className="fixed bottom-4 right-4 w-auto max-w-md">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Usage Limit Exceeded</AlertTitle>
      <AlertDescription>
        You have reached your usage limit. Please upgrade your plan to continue using the service.
      </AlertDescription>
    </Alert>
  );
};