import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuizConfiguration, QuizQuestion } from "@/types/quiz";
import { QuestionForm } from "./QuestionForm";
import { QuizMetadata } from "./QuizMetadata";

interface QuizConfigurationFormProps {
  botId: string;
  onSave: (config: Omit<QuizConfiguration, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const QuizConfigurationForm = ({
  botId,
  onSave,
  onCancel,
}: QuizConfigurationFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passingScore, setPassingScore] = useState(75);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        text: "",
        options: [
          {
            id: crypto.randomUUID(),
            text: "",
            isCorrect: false,
          },
        ],
      },
    ]);
  };

  const updateQuestion = (questionId: string, text: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, text } : q
      )
    );
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...q.options,
                {
                  id: crypto.randomUUID(),
                  text: "",
                  isCorrect: false,
                },
              ],
            }
          : q
      )
    );
  };

  const updateOption = (
    questionId: string,
    optionId: string,
    text: string,
    isCorrect: boolean
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) =>
                o.id === optionId ? { ...o, text, isCorrect } : o
              ),
            }
          : q
      )
    );
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.filter((o) => o.id !== optionId),
            }
          : q
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      botId,
      title,
      description,
      passingScore,
      questions,
      branchingLogic: {},
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <QuizMetadata
        title={title}
        description={description}
        passingScore={passingScore}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onPassingScoreChange={setPassingScore}
      />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium">Questions</label>
          <Button type="button" onClick={addQuestion} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>
        </div>

        {questions.map((question, qIndex) => (
          <QuestionForm
            key={question.id}
            question={question}
            questionIndex={qIndex}
            onQuestionUpdate={updateQuestion}
            onQuestionRemove={removeQuestion}
            onOptionAdd={addOption}
            onOptionUpdate={updateOption}
            onOptionRemove={removeOption}
          />
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Quiz</Button>
      </div>
    </form>
  );
};