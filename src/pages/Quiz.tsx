import { useParams } from "react-router-dom";
import { QuizConfigurationForm } from "@/components/quiz/QuizConfigurationForm";
import { QuizList } from "@/components/quiz/QuizList";
import { useQuizConfigurations } from "@/hooks/useQuizConfigurations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const Quiz = () => {
  const { botId } = useParams();
  const {
    configurations,
    isLoading,
    saveConfiguration,
    deleteConfiguration,
    refreshConfigurations,
  } = useQuizConfigurations(botId || "");

  if (!botId) {
    return <div className="container mt-20">Please select a bot first.</div>;
  }

  return (
    <div className="container mt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quiz Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <QuizConfigurationForm
              botId={botId}
              onSave={async (config) => {
                await saveConfiguration(config);
                refreshConfigurations();
              }}
              onCancel={() => {
                // Dialog will close automatically
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <QuizList
        configurations={configurations}
        isLoading={isLoading}
        onDelete={async (id) => {
          await deleteConfiguration(id);
          refreshConfigurations();
        }}
      />
    </div>
  );
};

export default Quiz;