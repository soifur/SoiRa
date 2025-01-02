import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { QuizConfiguration, QuizQuestion } from "@/types/quiz";
import { Plus, Trash2 } from "lucide-react";

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
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quiz title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Quiz description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
        <Input
          type="number"
          min="0"
          max="100"
          value={passingScore}
          onChange={(e) => setPassingScore(Number(e.target.value))}
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium">Questions</label>
          <Button type="button" onClick={addQuestion} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>
        </div>

        {questions.map((question, qIndex) => (
          <Card key={question.id} className="p-4 space-y-4">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, e.target.value)}
                  placeholder={`Question ${qIndex + 1}`}
                  required
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(question.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="pl-4 space-y-2">
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Input
                    value={option.text}
                    onChange={(e) =>
                      updateOption(question.id, option.id, e.target.value, option.isCorrect)
                    }
                    placeholder="Option text"
                    className="flex-1"
                    required
                  />
                  <Button
                    type="button"
                    variant={option.isCorrect ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateOption(question.id, option.id, option.text, !option.isCorrect)
                    }
                  >
                    Correct
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(question.id, option.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOption(question.id)}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Option
              </Button>
            </div>
          </Card>
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