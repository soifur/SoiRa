import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Quiz = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateQuiz = () => {
    setIsCreating(true);
    toast({
      title: "Coming soon",
      description: "Quiz creation functionality will be implemented soon.",
    });
  };

  return (
    <div className="container mx-auto max-w-full pt-20 px-4">
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Quiz Management</h1>
            <Button onClick={handleCreateQuiz}>
              <Plus className="mr-2 h-4 w-4" /> Create Quiz
            </Button>
          </div>

          <Card className="p-4">
            <p className="text-muted-foreground">
              No quizzes created yet. Click the button above to create your first quiz.
            </p>
          </Card>
        </div>

        <div className="w-1/2 border-l border-border">
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a quiz to view details
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;